import { useSyncExternalStore } from "react";
import {
  applications as seedApps,
  campaigns as seedCampaigns,
  type Application,
  type Campaign,
} from "./mock-data";

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

export function updateApplication(id: string, patch: Partial<Application>) {
  state = {
    ...state,
    applications: state.applications.map((a) => (a.id === id ? { ...a, ...patch } : a)),
  };
  emit();
}

export function addCampaign(c: Campaign) {
  state = { ...state, campaigns: [c, ...state.campaigns] };
  emit();
}

export function updateCampaign(id: string, patch: Partial<Campaign>) {
  state = {
    ...state,
    campaigns: state.campaigns.map((c) => (c.id === id ? { ...c, ...patch } : c)),
  };
  emit();
}

export function requestFunds(
  campaignId: string,
  payload: { milestone: string; amount: number; stage?: string; note?: string; document?: string },
) {
  const payment: Payment = {
    id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
    milestone: payload.milestone,
    amount: payload.amount,
    date: today(),
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
  return payment;
}

export function setPaymentStatus(
  campaignId: string,
  paymentId: string,
  status: PaymentStatus,
  reason?: string,
) {
  state = {
    ...state,
    campaigns: state.campaigns.map((c) =>
      c.id === campaignId
        ? {
            ...c,
            payments: c.payments.map((p) =>
              p.id === paymentId
                ? { ...p, status, declineReason: reason, date: status === "paid" ? today() : p.date }
                : p,
            ),
          }
        : c,
    ),
  };
  emit();
}

export function withdrawFundRequest(campaignId: string, paymentId: string) {
  state = {
    ...state,
    campaigns: state.campaigns.map((c) =>
      c.id === campaignId ? { ...c, payments: c.payments.filter((p) => p.id !== paymentId) } : c,
    ),
  };
  emit();
}
