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
  payments: { milestone: string; amount: number; date: string; status: "paid" | "scheduled" }[];
};

export const HOSPITAL = {
  name: "NNPC Multispecialty Hospital",
  city: "Abuja pilot",
  verified: true,
  reviewer: "Dr. Amaka Eze",
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
  diagnosis: "Preliminary diagnostics",
  investigation: "Recommended investigation",
  procedure: "Recommended procedure",
  admission: "Expected admission",
  rehabilitation: "Expected rehabilitation",
  recovery: "Expected recovery",
  other: "Other Costs",
};

const docs = (extra: PatientDoc[] = []): PatientDoc[] => [
  { name: "Diagnosis summary.pdf", kind: "Diagnosis", uploaded: "12 Jul 2026" },
  { name: "Lab results — full blood count.pdf", kind: "Lab report", uploaded: "12 Jul 2026" },
  { name: "Prescription sheet.pdf", kind: "Prescription", uploaded: "12 Jul 2026" },
  { name: "Chest scan.jpg", kind: "Scan", uploaded: "13 Jul 2026" },
  { name: "National ID card.jpg", kind: "Government ID", uploaded: "13 Jul 2026" },
  ...extra,
];

export const applications: Application[] = [
  {
    id: "APP-2041",
    patient: {
      name: "Blessing Okonkwo",
      age: 34,
      gender: "Female",
      phone: "+234 803 442 1187",
      email: "blessing.okonkwo@mail.com",
      nin: "•••• •••• 4471",
      address: "12 Jabi Close, Jabi, Abuja",
      nextOfKin: "Chidi Okonkwo (husband)",
      emergencyContact: "+234 806 221 9042",
    },
    condition: "Stage 2 breast cancer",
    submitted: "14 Jul 2026",
    status: "pending",
    riskScore: 12,
    riskFlags: [],
    story:
      "I was diagnosed with stage 2 breast cancer in March 2026 at a routine screening. I am a mother of three and I run a small tailoring shop in Jabi. Since the diagnosis I have not been able to work full days, and the income that fed my family has almost stopped. My doctors say surgery followed by chemotherapy gives me a strong chance of full recovery, but the cost is far beyond what my family can raise. Every week we wait, the treatment window narrows. With support I can finish treatment, return to my shop, and raise my children.",
    documents: docs([{ name: "Referral letter.pdf", kind: "Referral", uploaded: "14 Jul 2026" }]),
  },
  {
    id: "APP-2039",
    patient: {
      name: "Ibrahim Musa",
      age: 51,
      gender: "Male",
      phone: "+234 809 771 3320",
      email: "ibrahim.musa@mail.com",
      nin: "•••• •••• 9018",
      address: "5 Kubwa Road, Kubwa, Abuja",
      nextOfKin: "Halima Musa (wife)",
      emergencyContact: "+234 805 110 6633",
    },
    condition: "End-stage kidney disease",
    submitted: "13 Jul 2026",
    status: "pending",
    riskScore: 64,
    riskFlags: ["Phone number seen on 2 other applications", "Image metadata missing on 1 scan"],
    story:
      "For two years I have lived with failing kidneys. I am a driver, and dialysis three times a week means I can no longer keep steady work. My wife sells foodstuff to cover our costs but the sessions alone take more than she earns. The doctors have placed me on the transplant pathway, and they say the outcome is good if we do not delay. I am asking for help so that I can be there for my children.",
    documents: docs(),
  },
  {
    id: "APP-2036",
    patient: {
      name: "Grace Adeyemi",
      age: 8,
      gender: "Female",
      phone: "+234 812 664 5521",
      email: "tunde.adeyemi@mail.com",
      nin: "•••• •••• 2204",
      address: "27 Wuse II, Abuja",
      nextOfKin: "Tunde Adeyemi (father)",
      emergencyContact: "+234 812 664 5521",
    },
    condition: "Congenital heart defect (VSD)",
    submitted: "10 Jul 2026",
    status: "info-requested",
    riskScore: 8,
    riskFlags: [],
    story:
      "Grace is eight years old and was born with a hole in her heart. She tires after a few minutes of play and has missed most of this school term. Her cardiologist says corrective surgery now would let her grow up like any other child. We have spent our savings on tests and medication and cannot reach the surgery cost on our own.",
    documents: docs([{ name: "Echocardiogram report.pdf", kind: "Scan", uploaded: "10 Jul 2026" }]),
  },
  {
    id: "APP-2030",
    patient: {
      name: "Samuel Eze",
      age: 27,
      gender: "Male",
      phone: "+234 807 900 2214",
      email: "samuel.eze@mail.com",
      nin: "•••• •••• 7756",
      address: "9 Gwarinpa Estate, Abuja",
      nextOfKin: "Ngozi Eze (mother)",
      emergencyContact: "+234 803 445 0091",
    },
    condition: "Compound tibia fracture",
    submitted: "6 Jul 2026",
    status: "approved",
    riskScore: 15,
    riskFlags: [],
    story:
      "A commercial bike accident in June left my right leg broken in two places. I work as a warehouse loader, and I have not earned since. The surgeons say a plate and screws plus physiotherapy will get me walking again in a few months. Without the surgery I risk permanent disability.",
    documents: docs(),
    campaignId: "CMP-118",
    assessment: {
      diagnosis: "Compound fracture of right tibia with soft tissue injury",
      investigation: "X-ray right leg (AP/lateral), full blood count, clotting profile",
      procedure: "Open reduction and internal fixation with plate and screws",
      admission: "6 days",
      rehabilitation: "3 months physiotherapy; weight-bearing from week 6",
      urgency: "urgent",
      recovery: "12–16 weeks with physiotherapy",
      costs: {
        diagnosis: [100000, 155000],
        investigation: [80000, 120000],
        procedure: [1350000, 1820000],
        admission: [180000, 260000],
        rehabilitation: [200000, 320000],
        recovery: [90000, 140000],
        other: [50000, 85000],
      },
    },
  },
];

export const campaigns: Campaign[] = [
  {
    id: "CMP-118",
    patientName: "Samuel Eze",
    condition: "Compound tibia fracture",
    goal: 3600000,
    raised: 2415000,
    donors: 87,
    status: "active",
    created: "7 Jul 2026",
    treatmentStage: 2,
    donations: [
      { donor: "Anonymous", amount: 250000, date: "2 Aug 2026" },
      { donor: "Chinelo A.", amount: 50000, date: "1 Aug 2026" },
      { donor: "Zenith Staff Circle", amount: 400000, date: "30 Jul 2026" },
      { donor: "Anonymous", amount: 15000, date: "29 Jul 2026" },
      { donor: "Musa B.", amount: 100000, date: "27 Jul 2026" },
    ],
    updates: [
      { date: "28 Jul 2026", note: "Surgery completed successfully; patient stable on ward 3." },
      { date: "20 Jul 2026", note: "Pre-operative investigations concluded, surgery scheduled." },
    ],
    payments: [
      { milestone: "Investigations & admission", amount: 420000, date: "18 Jul 2026", status: "paid" },
      { milestone: "Surgical procedure", amount: 1400000, date: "27 Jul 2026", status: "paid" },
      { milestone: "Post-operative care & physiotherapy", amount: 780000, date: "Due 20 Aug 2026", status: "scheduled" },
    ],
  },
  {
    id: "CMP-112",
    patientName: "Fatima Bello",
    condition: "Cataract surgery (both eyes)",
    goal: 980000,
    raised: 980000,
    donors: 54,
    status: "completed",
    created: "12 Jun 2026",
    treatmentStage: 4,
    donations: [
      { donor: "Anonymous", amount: 300000, date: "24 Jun 2026" },
      { donor: "Hope Foundation", amount: 500000, date: "20 Jun 2026" },
    ],
    updates: [
      { date: "9 Jul 2026", note: "Discharged with full vision restored in both eyes." },
      { date: "1 Jul 2026", note: "Second eye operated, recovery on track." },
    ],
    payments: [
      { milestone: "Pre-op assessment", amount: 180000, date: "22 Jun 2026", status: "paid" },
      { milestone: "Bilateral surgery", amount: 640000, date: "30 Jun 2026", status: "paid" },
      { milestone: "Follow-up review", amount: 160000, date: "8 Jul 2026", status: "paid" },
    ],
  },
  {
    id: "CMP-105",
    patientName: "Daniel Okoro",
    condition: "Appendectomy",
    goal: 720000,
    raised: 318000,
    donors: 23,
    status: "active",
    created: "26 Jun 2026",
    treatmentStage: 1,
    donations: [
      { donor: "Anonymous", amount: 20000, date: "3 Aug 2026" },
      { donor: "Ayo T.", amount: 75000, date: "31 Jul 2026" },
    ],
    updates: [{ date: "27 Jun 2026", note: "Campaign published and verified by Alliance Hospital." }],
    payments: [{ milestone: "Admission deposit", amount: 200000, date: "1 Jul 2026", status: "paid" }],
  },
];

export const naira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });

export const costTotals = (c: CostEstimate) =>
  (Object.keys(c) as (keyof CostEstimate)[]).reduce(
    (acc, k) => [acc[0] + (c[k][0] || 0), acc[1] + (c[k][1] || 0)] as [number, number],
    [0, 0] as [number, number],
  );

export const recommendedGoal = (max: number) => Math.round((max * 1.2) / 10000) * 10000;
