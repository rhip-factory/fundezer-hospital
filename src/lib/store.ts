import { useSyncExternalStore } from "react";
import type { Application, Campaign, Payment, PaymentStatus } from "./mock-data";
import type { Capability, CapabilityStatus, TransferRequest, Urgency } from "./transfers";
import {
  emptyPortalPayload,
  getPortalData,
  requestFunds as requestFundsServer,
  setPaymentStatus as setPaymentStatusServer,
  withdrawFundRequest as withdrawFundRequestServer,
  updateApplication as updateApplicationServer,
  approveApplication as approveApplicationServer,
  updateCampaign as updateCampaignServer,
  postCampaignUpdate as postCampaignUpdateServer,
  saveCapabilities as saveCapabilitiesServer,
  createTransferRequest as createTransferServer,
  cancelTransfer as cancelTransferServer,
  advanceTransfer as advanceTransferServer,
  rejectTransfer as rejectTransferServer,
  type PortalPayload,
} from "./data.functions";

/* ---------------------------------------------------------------------------
 * Single source of truth for the portal: everything comes from the shared
 * FundEzer backend through server functions that run as the signed-in user,
 * so RLS decides what this hospital can see and change.
 * ------------------------------------------------------------------------- */

let state: PortalPayload = { ...emptyPortalPayload };
let hydrated = false;

/** True once the first backend load has finished (signed-in or not). */
export function usePortalHydrated() {
  return useSyncExternalStore(subscribe, () => hydrated, () => hydrated);
}

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function usePortalState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Transfer & capability slice of the same store (kept for existing screens). */
export function useTransferState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function hydrateFromServer() {
  try {
    // Skip the authenticated call entirely when there is no session —
    // otherwise the server rejects with 401 before RLS is ever consulted.
    const { supabase } = await import("@/integrations/supabase/client");
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      state = await getPortalData();
    } else {
      state = { ...emptyPortalPayload };
    }
  } catch {
    state = { ...emptyPortalPayload };
  }
  hydrated = true;
  emit();
}

export function resetToSignedOut() {
  state = { ...emptyPortalPayload };
  hydrated = true;
  emit();
}

const refresh = () => hydrateFromServer();

export async function updateApplication(id: string, patch: Partial<Application>) {
  await updateApplicationServer({
    data: {
      id,
      patch: {
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.rejectionReason ? { rejectionReason: patch.rejectionReason } : {}),
        ...(patch.assessment ? { assessment: patch.assessment } : {}),
      },
    },
  });
  await refresh();
}

/** Approves an application and creates its campaign in the backend. */
export async function approveApplication(applicationId: string, goal: number) {
  const { campaignId } = await approveApplicationServer({ data: { applicationId, goal } });
  await refresh();
  return campaignId;
}

/* -------------------------------- campaigns ------------------------------ */

export async function updateCampaign(id: string, patch: Partial<Campaign>) {
  if (patch.updates && patch.updates.length > 0) {
    const latest = patch.updates[0];
    if (latest?.note) await postCampaignUpdateServer({ data: { campaignId: id, note: latest.note } });
  }
  if (patch.status || patch.treatmentStage !== undefined) {
    await updateCampaignServer({
      data: {
        id,
        patch: {
          ...(patch.status ? { status: patch.status } : {}),
          ...(patch.treatmentStage !== undefined ? { treatmentStage: patch.treatmentStage } : {}),
        },
      },
    });
  }
  await refresh();
}

/* ------------------------------ fund requests ---------------------------- */

export async function requestFunds(
  campaignId: string,
  payload: {
    milestone: string;
    amount: number;
    stage?: string | undefined;
    note?: string | undefined;
    document?: string | undefined;
  },
): Promise<Payment> {
  const payment = await requestFundsServer({
    data: {
      campaignId,
      milestone: payload.milestone,
      amount: payload.amount,
      ...(payload.stage ? { stage: payload.stage } : {}),
      ...(payload.note ? { note: payload.note } : {}),
      ...(payload.document ? { document: payload.document } : {}),
    },
  });
  await refresh();
  return payment;
}

export async function setPaymentStatus(
  _campaignId: string,
  paymentId: string,
  status: PaymentStatus,
  reason?: string,
) {
  await setPaymentStatusServer({ data: { paymentId, status, ...(reason ? { reason } : {}) } });
  await refresh();
}

export async function withdrawFundRequest(_campaignId: string, paymentId: string) {
  await withdrawFundRequestServer({ data: { paymentId } });
  await refresh();
}

/* ------------------------------ capabilities ----------------------------- */

export async function saveCapabilities(next: Capability[]) {
  await saveCapabilitiesServer({
    data: {
      items: next.map((c) => ({
        id: c.id,
        group: c.group,
        status: c.status as CapabilityStatus,
      })),
    },
  });
  await refresh();
}

/* -------------------------------- transfers ------------------------------ */

export async function createTransferRequest(input: {
  campaignId: string;
  treatmentPhase: string;
  serviceId: string;
  reason: string;
  urgency: Urgency;
  extra?: string | undefined;
}): Promise<TransferRequest | undefined> {
  const { referenceCode } = await createTransferServer({
    data: {
      campaignId: input.campaignId,
      treatmentPhase: input.treatmentPhase,
      serviceId: input.serviceId,
      reason: input.reason,
      urgency: input.urgency,
      ...(input.extra ? { extra: input.extra } : {}),
    },
  });
  await refresh();
  return state.transfers.find((t) => t.id === referenceCode);
}

export async function cancelTransfer(dbId: string) {
  await cancelTransferServer({ data: { id: dbId } });
  await refresh();
}

/** Demo stand-in for the FundEzer Admin decision (never the hospital itself). */
export async function simulateAdvance(dbId: string) {
  await advanceTransferServer({ data: { id: dbId } });
  await refresh();
}

export async function simulateReject(dbId: string, reason = "FundEzer Admin declined this transfer.") {
  await rejectTransferServer({ data: { id: dbId, reason } });
  await refresh();
}
