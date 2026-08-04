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
