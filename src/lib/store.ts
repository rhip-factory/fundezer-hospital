import { useSyncExternalStore } from "react";
import {
  applications as seedApps,
  campaigns as seedCampaigns,
  type Application,
  type Campaign,
  type Payment,
  type PaymentStatus,
} from "./mock-data";
import {
  getAllData,
  requestFunds as requestFundsServer,
  setPaymentStatus as setPaymentStatusServer,
  withdrawFundRequest as withdrawFundRequestServer,
  updateApplication as updateApplicationServer,
  updateCampaign as updateCampaignServer,
  addCampaign as addCampaignServer,
} from "./data.functions";

type State = { applications: Application[]; campaigns: Campaign[] };

let state: State = {
  applications: structuredClone(seedApps),
  campaigns: structuredClone(seedCampaigns),
};

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

export async function hydrateFromServer() {
  const data = await getAllData();
  state = {
    applications: data.applications,
    campaigns: data.campaigns,
  };
  emit();
}

export async function updateApplication(id: string, patch: Partial<Application>) {
  const prev = state;
  state = {
    ...state,
    applications: state.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  };
  emit();
  try {
    await updateApplicationServer({
      data: {
        id,
        patch: {
          status: patch.status,
          rejectionReason: patch.rejectionReason,
          assessment: patch.assessment,
          campaignId: patch.campaignId,
        },
      },
    });
  } catch (err) {
    state = prev;
    emit();
    throw err;
  }
}

export async function addCampaign(c: Campaign) {
  const prev = state;
  state = { ...state, campaigns: [c, ...state.campaigns] };
  emit();
  try {
    await addCampaignServer({
      data: {
        id: c.id,
        patientName: c.patientName,
        condition: c.condition,
        goal: c.goal,
        raised: c.raised,
        donors: c.donors,
        status: c.status,
        created: c.created,
        treatmentStage: c.treatmentStage,
        applicationId: undefined,
      },
    });
  } catch (err) {
    state = prev;
    emit();
    throw err;
  }
}

export async function updateCampaign(id: string, patch: Partial<Campaign>) {
  const prev = state;
  state = {
    ...state,
    campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  };
  emit();
  try {
    await updateCampaignServer({
      data: {
        id,
        patch: {
          status: patch.status,
          treatmentStage: patch.treatmentStage,
          updates: patch.updates,
        },
      },
    });
  } catch (err) {
    state = prev;
    emit();
    throw err;
  }
}

export async function requestFunds(
  campaignId: string,
  payload: {
    milestone: string;
    amount: number;
    stage?: string | undefined;
    note?: string | undefined;
    document?: string | undefined;
  },
) {
  const prev = state;
  const payment: Payment = {
    id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
    milestone: payload.milestone,
    amount: payload.amount,
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
    status: "requested",
    stage: payload.stage,
    note: payload.note,
    document: payload.document,
  };
  state = {
    ...state,
    campaigns: state.campaigns.map((c) =>
      c.id === campaignId ? { ...c, payments: [payment, ...c.payments] } : c,
    ),
  };
  emit();
  try {
    await requestFundsServer({
      data: {
        campaignId,
        milestone: payload.milestone,
        amount: payload.amount,
        stage: payload.stage,
        note: payload.note,
        document: payload.document,
      },
    });
  } catch (err) {
    state = prev;
    emit();
    throw err;
  }
  return payment;
}

export async function setPaymentStatus(
  campaignId: string,
  paymentId: string,
  status: PaymentStatus,
  reason?: string,
) {
  const prev = state;
  state = {
    ...state,
    campaigns: state.campaigns.map((c) =>
      c.id === campaignId
        ? {
            ...c,
            payments: c.payments.map((p) =>
              p.id === paymentId
                ? {
                    ...p,
                    status,
                    declineReason: reason,
                    date: status === "paid" ? new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : p.date,
                  }
                : p,
            ),
          }
        : c,
    ),
  };
  emit();
  try {
    await setPaymentStatusServer({
      data: { campaignId, paymentId, status, reason },
    });
  } catch (err) {
    state = prev;
    emit();
    throw err;
  }
}

export async function withdrawFundRequest(campaignId: string, paymentId: string) {
  const prev = state;
  state = {
    ...state,
    campaigns: state.campaigns.map((c) =>
      c.id === campaignId ? { ...c, payments: c.payments.filter((p) => p.id !== paymentId) } : c,
    ),
  };
  emit();
  try {
    await withdrawFundRequestServer({
      data: { campaignId, paymentId },
    });
  } catch (err) {
    state = prev;
    emit();
    throw err;
  }
}
