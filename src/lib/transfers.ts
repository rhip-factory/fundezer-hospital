/* ---------------------------------------------------------------------------
 * Transfer & capability domain types shared by the UI and the data layer.
 * Pure module: no state, no side effects. Live state lives in ./store.
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
  /** Display reference, e.g. FT-000124 (also the route param). */
  id: string;
  /** Database id used for mutations. */
  dbId: string;
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

export const transfersForCampaign = (transfers: TransferRequest[], campaignId: string) =>
  transfers.filter((t) => t.campaignId === campaignId);

export const isTerminal = (s: TransferStatus) =>
  s === "completed" || s === "rejected" || s === "cancelled";
