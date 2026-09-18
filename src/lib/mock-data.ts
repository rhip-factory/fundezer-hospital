export type Urgency = "routine" | "urgent" | "emergency";

export type CostEstimate = {
  diagnosis: [number, number];
  investigation: [number, number];
  procedure: [number, number];
  admission: [number, number];
  rehabilitation: [number, number];
  recovery: [number, number];
  other: [number, number];
};

export type Assessment = {
  diagnosis: string;
  investigation: string;
  procedure: string;
  admission: string;
  rehabilitation: string;
  urgency: Urgency;
  recovery: string;
  costs: CostEstimate;
};

export type PatientDoc = { name: string; kind: string; uploaded: string };

export type Application = {
  id: string;
  patient: {
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    nin: string;
    address: string;
    nextOfKin: string;
    emergencyContact: string;
  };
  condition: string;
  submitted: string;
  status: "pending" | "info-requested" | "assessed" | "approved" | "rejected";
  riskScore: number;
  riskFlags: string[];
  story: string;
  documents: PatientDoc[];
  assessment?: Assessment;
  rejectionReason?: string;
  campaignId?: string;
};

export type Donation = { donor: string; amount: number; date: string };

export type PaymentStatus = "requested" | "approved" | "scheduled" | "paid" | "declined";

export type Payment = {
  id: string;
  milestone: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  note?: string | undefined;
  stage?: string | undefined;
  document?: string | undefined;
  declineReason?: string | undefined;
};

export type JourneyStep = { stage: string; status: string; hospital?: string | undefined };

export type Campaign = {
  id: string;
  patientName: string;
  condition: string;
  goal: number;
  raised: number;
  donors: number;
  status: "active" | "completed";
  created: string;
  treatmentStage: number;
  donations: Donation[];
  updates: { date: string; note: string }[];
  payments: Payment[];
  journey: JourneyStep[];
};

export const emptyCosts: CostEstimate = {
  diagnosis: [0, 0],
  investigation: [0, 0],
  procedure: [0, 0],
  admission: [0, 0],
  rehabilitation: [0, 0],
  recovery: [0, 0],
  other: [0, 0],
};

export const costLabels: Record<keyof CostEstimate, string> = {
  diagnosis: "Preliminary diagnosis",
  investigation: "Recommended investigation",
  procedure: "Recommended procedure",
  admission: "Expected admission",
  rehabilitation: "Expected rehabilitation",
  recovery: "Expected recovery",
  other: "Other Costs",
};


export const naira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const costTotals = (c: CostEstimate) =>
  (Object.keys(c) as (keyof CostEstimate)[]).reduce(
    (acc, k) => [acc[0] + (c[k][0] || 0), acc[1] + (c[k][1] || 0)] as [number, number],
    [0, 0] as [number, number],
  );

export const recommendedGoal = (max: number) => Math.round((max * 1.2) / 10000) * 10000;

export const RESERVED_STATUSES: PaymentStatus[] = ["requested", "approved", "scheduled"];

export const campaignWallet = (c: Campaign) => {
  const paid = c.payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const reserved = c.payments
    .filter((p) => RESERVED_STATUSES.includes(p.status))
    .reduce((s, p) => s + p.amount, 0);
  return { paid, reserved, available: Math.max(0, c.raised - paid - reserved) };
};

export const today = () =>
  new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
