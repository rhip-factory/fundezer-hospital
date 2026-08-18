import { useSyncExternalStore } from "react";
import { HOSPITAL, today } from "./mock-data";

/* ---------------------------------------------------------------------------
 * Frontend-only prototype state: hospital capabilities + patient transfers.
 * No backend, no persistence — everything lives in this module.
 * ------------------------------------------------------------------------- */

export type CapabilityStatus = "available" | "temporarily-unavailable" | "not-available";

export type Capability = {
  id: string;
  name: string;
  group: "service" | "equipment";
  status: CapabilityStatus;
};

export const capabilityStatusLabel: Record<CapabilityStatus, string> = {
  available: "Available",
  "temporarily-unavailable": "Temporarily Unavailable",
  "not-available": "Not Available",
};

export type Urgency = "routine" | "urgent" | "critical";

export const urgencyLabel: Record<Urgency, string> = {
  routine: "Routine",
  urgent: "Urgent",
  critical: "Critical",
};

export type TransferStatus =
  | "submitted"
  | "under-review"
  | "receiving-hospital-pending"
  | "accepted"
  | "patient-notified"
  | "transfer-scheduled"
  | "treatment-commenced"
  | "completed"
  | "rejected"
  | "cancelled";

export const TRANSFER_FLOW: TransferStatus[] = [
  "submitted",
  "under-review",
  "receiving-hospital-pending",
  "accepted",
  "patient-notified",
  "transfer-scheduled",
  "treatment-commenced",
  "completed",
];

export const transferStatusLabel: Record<TransferStatus, string> = {
  submitted: "Request Submitted",
  "under-review": "Under Review",
  "receiving-hospital-pending": "Receiving Hospital Pending",
  accepted: "Accepted",
  "patient-notified": "Patient Notified",
  "transfer-scheduled": "Transfer Scheduled",
  "treatment-commenced": "Treatment Commenced",
  completed: "Completed",
  rejected: "Rejected",
  cancelled: "Cancelled",
};

export type TransferEvent = { status: TransferStatus; date: string; note?: string | undefined };

export type TransferRequest = {
  id: string;
  campaignId: string;
  patientName: string;
  currentHospital: string;
  treatmentPhase: string;
  requiredService: string;
  reason: string;
  urgency: Urgency;
  extra?: string | undefined;
  submitted: string;
  status: TransferStatus;
  receivingHospital?: string | undefined;
  history: TransferEvent[];
};

export const CAPABILITY_SERVICES = [
  "CT Scan",
  "MRI",
  "Surgery",
  "Dialysis",
  "Radiotherapy",
  "Chemotherapy",
  "Physiotherapy",
  "ICU",
  "Cardiology",
  "Paediatrics",
];

const seedCapabilities: Capability[] = [
  ...CAPABILITY_SERVICES.map((name, i) => ({
    id: "svc-" + i,
    name,
    group: "service" as const,
    status:
      name === "Radiotherapy"
        ? ("not-available" as CapabilityStatus)
        : name === "Dialysis"
          ? ("temporarily-unavailable" as CapabilityStatus)
          : ("available" as CapabilityStatus),
  })),
  ...[
    "CT Scanner",
    "MRI Machine",
    "Dialysis Machines",
    "Operating Theatre",
    "Radiotherapy Equipment",
    "ICU Beds",
  ].map((name, i) => ({
    id: "eqp-" + i,
    name,
    group: "equipment" as const,
    status:
      name === "Radiotherapy Equipment"
        ? ("not-available" as CapabilityStatus)
        : name === "Dialysis Machines"
          ? ("temporarily-unavailable" as CapabilityStatus)
          : ("available" as CapabilityStatus),
  })),
];

const seedTransfers: TransferRequest[] = [
  {
    id: "FT-000123",
    campaignId: "CMP-118",
    patientName: "Samuel Eze",
    currentHospital: HOSPITAL.name,
    treatmentPhase: "Procedure",
    requiredService: "Physiotherapy",
    reason:
      "Specialist orthopaedic rehabilitation is required to complete post-operative recovery; our physiotherapy suite is fully booked for six weeks.",
    urgency: "routine",
    submitted: "15 Aug 2026",
    status: "under-review",
    history: [
      { status: "submitted", date: "15 Aug 2026", note: "Submitted to FundEzer Admin." },
      { status: "under-review", date: "16 Aug 2026", note: "FundEzer Admin is reviewing the request." },
    ],
  },
  {
    id: "FT-000122",
    campaignId: "CMP-105",
    patientName: "Daniel Okoro",
    currentHospital: HOSPITAL.name,
    treatmentPhase: "Investigations",
    requiredService: "CT Scan",
    reason: "Our CT scanner is out of service pending part replacement.",
    urgency: "urgent",
    submitted: "9 Aug 2026",
    status: "transfer-scheduled",
    receivingHospital: "Garki General Hospital",
    history: [
      { status: "submitted", date: "9 Aug 2026" },
      { status: "under-review", date: "9 Aug 2026", note: "FundEzer Admin reviewing." },
      { status: "receiving-hospital-pending", date: "10 Aug 2026", note: "Referred to Garki General Hospital." },
      { status: "accepted", date: "11 Aug 2026", note: "Receiving hospital accepted the patient." },
      { status: "patient-notified", date: "11 Aug 2026" },
      { status: "transfer-scheduled", date: "12 Aug 2026", note: "Scheduled for 20 Aug 2026." },
    ],
  },
];

type State = { capabilities: Capability[]; transfers: TransferRequest[] };

let state: State = {
  capabilities: structuredClone(seedCapabilities),
  transfers: structuredClone(seedTransfers),
};

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => state;

export function useTransferState() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function setCapabilityStatus(id: string, status: CapabilityStatus) {
  state = {
    ...state,
    capabilities: state.capabilities.map((c) => (c.id === id ? { ...c, status } : c)),
  };
  emit();
}

export function saveCapabilities(next: Capability[]) {
  state = { ...state, capabilities: next.map((c) => ({ ...c })) };
  emit();
}

let counter = 124;

export function createTransferRequest(input: {
  campaignId: string;
  patientName: string;
  treatmentPhase: string;
  requiredService: string;
  reason: string;
  urgency: Urgency;
  extra?: string | undefined;
}): TransferRequest {
  const id = "FT-" + String(counter++).padStart(6, "0");
  const date = today();
  const transfer: TransferRequest = {
    id,
    ...input,
    currentHospital: HOSPITAL.name,
    submitted: date,
    status: "submitted",
    history: [{ status: "submitted", date, note: "Submitted to FundEzer Admin for review." }],
  };
  state = { ...state, transfers: [transfer, ...state.transfers] };
  emit();
  return transfer;
}

/** Prototype-only: simulates the FundEzer Admin / receiving-hospital response. */
export function simulateAdvance(id: string) {
  const t = state.transfers.find((x) => x.id === id);
  if (!t) return;
  const i = TRANSFER_FLOW.indexOf(t.status);
  if (i < 0 || i >= TRANSFER_FLOW.length - 1) return;
  const next = TRANSFER_FLOW[i + 1]!;
  applyStatus(id, next, "Simulated FundEzer Admin update (prototype).");
}

export function simulateReject(id: string, reason = "Simulated FundEzer Admin decision (prototype).") {
  applyStatus(id, "rejected", reason);
}

export function cancelTransfer(id: string) {
  applyStatus(id, "cancelled", "Cancelled by the requesting hospital.");
}

function applyStatus(id: string, status: TransferStatus, note?: string) {
  const date = today();
  state = {
    ...state,
    transfers: state.transfers.map((t) =>
      t.id === id
        ? {
            ...t,
            status,
            receivingHospital:
              status === "receiving-hospital-pending" && !t.receivingHospital
                ? "Garki General Hospital"
                : t.receivingHospital,
            history: [...t.history, { status, date, note }],
          }
        : t,
    ),
  };
  emit();
}

export const transfersForCampaign = (transfers: TransferRequest[], campaignId: string) =>
  transfers.filter((t) => t.campaignId === campaignId);

export const isTerminal = (s: TransferStatus) =>
  s === "completed" || s === "rejected" || s === "cancelled";
