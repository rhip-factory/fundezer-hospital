import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Json } from "@/integrations/supabase/types";
import type { Application, Assessment, Campaign, Payment, PaymentStatus } from "./mock-data";
import type {
  Capability,
  CapabilityStatus,
  TransferRequest,
  TransferStatus,
  Urgency as TransferUrgency,
} from "./transfers";

/* ---------------------------------------------------------------------------
 * Server functions for the FundEzer hospital portal.
 * Every call runs as the signed-in user, so the shared FundEzer RLS policies
 * decide what the hospital can read and write. The portal never filters for
 * security in the browser.
 * ------------------------------------------------------------------------- */

type Tables = Database["public"]["Tables"];
type ApplicationRow = Tables["applications"]["Row"];
type CampaignRow = Tables["campaigns"]["Row"];
type PatientRow = Tables["patients"]["Row"];
type DonationRow = Tables["donations"]["Row"];
type CampaignUpdateRow = Tables["campaign_updates"]["Row"];
type FundRequestRow = Tables["fund_requests"]["Row"];
type TransferRow = Tables["transfers"]["Row"];
type TransferEventRow = Tables["transfer_events"]["Row"];
type DocumentRow = Tables["documents"]["Row"];
type JourneyRow = Tables["treatment_journeys"]["Row"];
type AppStatus = Database["public"]["Enums"]["application_status"];
type CampaignStatusDb = Database["public"]["Enums"]["campaign_status"];
type TransferStatusDb = Database["public"]["Enums"]["transfer_status"];
type UrgencyDb = Database["public"]["Enums"]["urgency_level"];
type TreatmentStageDb = Database["public"]["Enums"]["treatment_stage"];
type CapabilityStatusDb = Database["public"]["Enums"]["capability_status"];

const fmt = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

const todayIso = () => new Date().toISOString();

/* ----------------------------- status mapping ---------------------------- */

const appStatusToUi: Record<AppStatus, Application["status"]> = {
  Submitted: "pending",
  "Under Review": "pending",
  "Information Requested": "info-requested",
  Verified: "assessed",
  Approved: "approved",
  Rejected: "rejected",
  Withdrawn: "rejected",
};

const appStatusToDb: Record<Application["status"], AppStatus> = {
  pending: "Under Review",
  "info-requested": "Information Requested",
  assessed: "Verified",
  approved: "Approved",
  rejected: "Rejected",
};

const campaignStatusToUi = (status: CampaignStatusDb): Campaign["status"] =>
  status === "Completed" ? "completed" : "active";

const campaignStatusToDb: Record<Campaign["status"], CampaignStatusDb> = {
  active: "Active",
  completed: "Completed",
};

const transferStatusToUi: Record<TransferStatusDb, TransferStatus> = {
  Submitted: "submitted",
  "Under Review": "under-review",
  "Receiving Hospital Pending": "receiving-hospital-pending",
  Accepted: "accepted",
  "Patient Notified": "patient-notified",
  "Transfer Scheduled": "transfer-scheduled",
  "Treatment Commenced": "treatment-commenced",
  Completed: "completed",
  Rejected: "rejected",
  Cancelled: "cancelled",
};

const transferStatusToDb = Object.fromEntries(
  Object.entries(transferStatusToUi).map(([db, ui]) => [ui, db as TransferStatusDb]),
) as Record<TransferStatus, TransferStatusDb>;

const TRANSFER_FLOW_DB: TransferStatusDb[] = [
  "Submitted",
  "Under Review",
  "Receiving Hospital Pending",
  "Accepted",
  "Patient Notified",
  "Transfer Scheduled",
  "Treatment Commenced",
  "Completed",
];

const urgencyToUi = (u: UrgencyDb): TransferUrgency =>
  u === "Critical" ? "critical" : u === "High" ? "urgent" : "routine";

const urgencyToDb: Record<TransferUrgency, UrgencyDb> = {
  routine: "Low",
  urgent: "High",
  critical: "Critical",
};

const capabilityStatusToUi: Record<CapabilityStatusDb, CapabilityStatus> = {
  Available: "available",
  "Temporarily Unavailable": "temporarily-unavailable",
  "Not Available": "not-available",
};

const capabilityStatusToDb: Record<CapabilityStatus, CapabilityStatusDb> = {
  available: "Available",
  "temporarily-unavailable": "Temporarily Unavailable",
  "not-available": "Not Available",
};

const TREATMENT_STAGES: TreatmentStageDb[] = [
  "Diagnosis",
  "Treatment Planning",
  "Funding",
  "Admission",
  "Treatment",
  "Post-Treatment",
  "Recovery",
  "Discharged",
];

const toTreatmentStage = (value: string): TreatmentStageDb =>
  TREATMENT_STAGES.find((s) => s.toLowerCase() === value.toLowerCase()) ?? "Treatment";

/* ------------------------------- mappers -------------------------------- */

const patientAge = (p: PatientRow | undefined) => {
  if (!p?.date_of_birth) {
    const band = p?.age_band ?? "";
    const digits = band.match(/\d+/);
    return digits ? Number(digits[0]) : 0;
  }
  const dob = new Date(p.date_of_birth);
  return Math.max(0, Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000)));
};

function mapApplication(
  row: ApplicationRow,
  patient: PatientRow | undefined,
  documents: DocumentRow[],
  campaignId: string | undefined,
): Application {
  const mapped: Application = {
    id: row.id,
    patient: {
      name: patient?.full_name ?? patient?.display_name ?? "Patient",
      age: patientAge(patient),
      gender: patient?.gender ?? "—",
      phone: patient?.phone ?? "—",
      email: patient?.email ?? "—",
      nin: patient?.reference_code ?? "—",
      address: [patient?.city, patient?.state].filter(Boolean).join(", ") || "—",
      nextOfKin: "—",
      emergencyContact: patient?.phone ?? "—",
    },
    condition: patient?.condition ?? row.title,
    submitted: fmt(row.submitted_at),
    status: appStatusToUi[row.status],
    riskScore: row.risk_score,
    riskFlags: Array.isArray(row.risk_flags) ? (row.risk_flags as string[]) : [],
    story: row.description ?? patient?.medical_summary ?? "",
    documents: documents.map((d) => ({
      name: d.title,
      kind: d.document_type,
      uploaded: fmt(d.created_at),
    })),
  };
  if (row.assessment) mapped.assessment = row.assessment as unknown as Assessment;
  if (row.rejection_reason) mapped.rejectionReason = row.rejection_reason;
  if (campaignId) mapped.campaignId = campaignId;
  return mapped;
}

const mapPayment = (row: FundRequestRow): Payment => {
  const mapped: Payment = {
    id: row.id,
    milestone: row.milestone,
    amount: Number(row.amount),
    date: row.status === "scheduled" ? `Due ${fmt(row.requested_on)}` : fmt(row.requested_on),
    status: row.status as PaymentStatus,
  };
  if (row.note) mapped.note = row.note;
  if (row.stage) mapped.stage = row.stage;
  if (row.document) mapped.document = row.document;
  if (row.decline_reason) mapped.declineReason = row.decline_reason;
  return mapped;
};

function mapCampaign(
  row: CampaignRow,
  patient: PatientRow | undefined,
  donations: DonationRow[],
  updates: CampaignUpdateRow[],
  fundRequests: FundRequestRow[],
  journeys: JourneyRow[],
): Campaign {
  const paidDonations = donations.filter((d) => d.payment_status === "Paid");
  return {
    id: row.id,
    patientName: patient?.display_name ?? patient?.full_name ?? row.title,
    condition: patient?.condition ?? row.title,
    goal: Number(row.target),
    raised: paidDonations.reduce((sum, d) => sum + Number(d.amount), 0),
    donors: new Set(paidDonations.map((d) => d.donor_user_id ?? d.id)).size,
    status: campaignStatusToUi(row.status),
    created: fmt(row.created_at),
    treatmentStage: row.treatment_stage,
    donations: paidDonations.map((d) => ({
      donor: d.is_anonymous ? "Anonymous" : (d.donor_name ?? "Anonymous"),
      amount: Number(d.amount),
      date: fmt(d.created_at),
    })),
    updates: updates.map((u) => ({ date: fmt(u.created_at), note: u.content })),
    payments: fundRequests.map(mapPayment),
    journey: journeys
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((j) => ({ stage: j.stage, status: j.stage_status })),
  };
}

function mapTransfer(
  row: TransferRow,
  patientName: string,
  hospitalName: string,
  serviceName: string,
  receivingHospitalName: string | undefined,
  events: TransferEventRow[],
): TransferRequest {
  const mapped: TransferRequest = {
    id: row.reference_code,
    dbId: row.id,
    campaignId: row.campaign_id ?? "",
    patientName,
    currentHospital: hospitalName,
    treatmentPhase: row.treatment_phase ?? "Treatment",
    requiredService: serviceName,
    reason: row.reason,
    urgency: urgencyToUi(row.urgency),
    submitted: fmt(row.requested_at),
    status: transferStatusToUi[row.status],
    history: events
      .slice()
      .sort((a, b) => a.occurred_at.localeCompare(b.occurred_at))
      .map((e) => {
        const event: TransferRequest["history"][number] = {
          status: transferStatusToUi[e.status],
          date: fmt(e.occurred_at),
        };
        if (e.note) event.note = e.note;
        return event;
      }),
  };
  if (receivingHospitalName) mapped.receivingHospital = receivingHospitalName;
  return mapped;
}

/* ---------------------------- read: portal data -------------------------- */

export type PortalHospital = {
  id: string;
  name: string;
  city: string;
  state: string;
  verified: boolean;
  beds: number;
  accreditation: string | null;
  email: string | null;
  phone: string | null;
};

export type PortalService = { id: string; name: string };

export type PortalPayload = {
  signedIn: boolean;
  reviewerName: string;
  reviewerRole: string;
  hospital: PortalHospital | null;
  applications: Application[];
  campaigns: Campaign[];
  capabilities: Capability[];
  transfers: TransferRequest[];
  services: PortalService[];
};

export const emptyPortalPayload: PortalPayload = {
  signedIn: false,
  reviewerName: "",
  reviewerRole: "",
  hospital: null,
  applications: [],
  campaigns: [],
  capabilities: [],
  transfers: [],
  services: [],
};

export const getPortalData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PortalPayload> => {
    const { supabase, userId } = context;

    const [{ data: profile }, { data: memberships }] = await Promise.all([
      supabase.from("profiles").select("full_name, email").eq("user_id", userId).maybeSingle(),
      supabase
        .from("hospital_users")
        .select("hospital_id, role, job_title, status")
        .eq("user_id", userId)
        .eq("status", "active"),
    ]);

    const membership = (memberships ?? []).find((m) => m.role === "hospital_reviewer") ?? (memberships ?? [])[0];
    const reviewerName = profile?.full_name ?? profile?.email ?? "Hospital user";

    if (!membership) {
      return {
        ...emptyPortalPayload,
        signedIn: true,
        reviewerName,
        reviewerRole: "No hospital assigned",
      };
    }

    const hospitalId = membership.hospital_id;

    const [
      { data: hospitalRow },
      { data: serviceRows },
      { data: applicationRows },
      { data: campaignRows },
      { data: capabilityRows },
      { data: equipmentRows },
      { data: transferRows },
    ] = await Promise.all([
      supabase.from("hospitals").select("*").eq("id", hospitalId).maybeSingle(),
      supabase.from("services").select("id, name").eq("is_active", true).order("name"),
      supabase
        .from("applications")
        .select("*")
        .eq("hospital_id", hospitalId)
        .order("submitted_at", { ascending: false }),
      supabase
        .from("campaigns")
        .select("*")
        .eq("hospital_id", hospitalId)
        .order("created_at", { ascending: false }),
      supabase.from("hospital_capabilities").select("*").eq("hospital_id", hospitalId),
      supabase.from("hospital_equipment").select("*").eq("hospital_id", hospitalId).order("name"),
      supabase
        .from("transfers")
        .select("*")
        .eq("originating_hospital_id", hospitalId)
        .order("requested_at", { ascending: false }),
    ]);

    const applications = applicationRows ?? [];
    const campaigns = campaignRows ?? [];
    const transfers = transferRows ?? [];
    const services = serviceRows ?? [];
    const campaignIds = campaigns.map((c) => c.id);
    const applicationIds = applications.map((a) => a.id);
    const patientIds = Array.from(
      new Set([
        ...applications.map((a) => a.patient_id),
        ...campaigns.map((c) => c.patient_id),
        ...transfers.map((t) => t.patient_id),
      ]),
    );

    const [
      { data: patientRows },
      { data: donationRows },
      { data: updateRows },
      { data: fundRequestRows },
      { data: documentRows },
      { data: eventRows },
      { data: journeyRows },
    ] = await Promise.all([
      patientIds.length
        ? supabase.from("patients").select("*").in("id", patientIds)
        : Promise.resolve({ data: [] as PatientRow[] }),
      campaignIds.length
        ? supabase.from("donations").select("*").in("campaign_id", campaignIds)
        : Promise.resolve({ data: [] as DonationRow[] }),
      campaignIds.length
        ? supabase
            .from("campaign_updates")
            .select("*")
            .in("campaign_id", campaignIds)
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [] as CampaignUpdateRow[] }),
      campaignIds.length
        ? supabase
            .from("fund_requests")
            .select("*")
            .in("campaign_id", campaignIds)
            .order("requested_on", { ascending: false })
        : Promise.resolve({ data: [] as FundRequestRow[] }),
      applicationIds.length
        ? supabase.from("documents").select("*").in("application_id", applicationIds)
        : Promise.resolve({ data: [] as DocumentRow[] }),
      transfers.length
        ? supabase
            .from("transfer_events")
            .select("*")
            .in(
              "transfer_id",
              transfers.map((t) => t.id),
            )
        : Promise.resolve({ data: [] as TransferEventRow[] }),
      campaignIds.length
        ? supabase
            .from("treatment_journeys")
            .select("*")
            .in("campaign_id", campaignIds)
            .order("position")
        : Promise.resolve({ data: [] as JourneyRow[] }),
    ]);

    const patientById = new Map((patientRows ?? []).map((p) => [p.id, p]));
    const serviceById = new Map(services.map((s) => [s.id, s.name]));
    const campaignByApplication = new Map(
      campaigns.filter((c) => c.application_id).map((c) => [c.application_id as string, c.id]),
    );

    // Receiving hospital names sit outside this hospital's RLS scope; resolve just
    // the names of hospitals already referenced by this hospital's own transfers.
    const receivingIds = Array.from(
      new Set(transfers.map((t) => t.receiving_hospital_id).filter((v): v is string => Boolean(v))),
    );
    const receivingNames = new Map<string, string>();
    if (receivingIds.length) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows } = await supabaseAdmin.from("hospitals").select("id, name").in("id", receivingIds);
      (rows ?? []).forEach((r) => receivingNames.set(r.id, r.name));
    }

    const hospital: PortalHospital | null = hospitalRow
      ? {
          id: hospitalRow.id,
          name: hospitalRow.name,
          city: hospitalRow.city,
          state: hospitalRow.state,
          verified: hospitalRow.verification === "Verified",
          beds: hospitalRow.beds,
          accreditation: hospitalRow.accreditation,
          email: hospitalRow.email,
          phone: hospitalRow.phone,
        }
      : null;

    const capabilities: Capability[] = [
      ...(capabilityRows ?? [])
        .map((row) => ({
          id: row.id,
          name: serviceById.get(row.service_id) ?? "Service",
          group: "service" as const,
          status: capabilityStatusToUi[row.status],
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
      ...(equipmentRows ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        group: "equipment" as const,
        status: row.is_operational
          ? ("available" as CapabilityStatus)
          : (row.condition ?? "").toLowerCase().includes("not available")
            ? ("not-available" as CapabilityStatus)
            : ("temporarily-unavailable" as CapabilityStatus),
      })),
    ];

    return {
      signedIn: true,
      reviewerName,
      reviewerRole: membership.job_title ?? "Hospital reviewer",
      hospital,
      services: services.map((s) => ({ id: s.id, name: s.name })),
      applications: applications.map((row) =>
        mapApplication(
          row,
          patientById.get(row.patient_id),
          (documentRows ?? []).filter((d) => d.application_id === row.id),
          campaignByApplication.get(row.id),
        ),
      ),
      campaigns: campaigns.map((row) =>
        mapCampaign(
          row,
          patientById.get(row.patient_id),
          (donationRows ?? []).filter((d) => d.campaign_id === row.id),
          (updateRows ?? []).filter((u) => u.campaign_id === row.id),
          (fundRequestRows ?? []).filter((f) => f.campaign_id === row.id),
          (journeyRows ?? []).filter((j) => j.campaign_id === row.id),
        ),
      ),
      capabilities,
      transfers: transfers.map((row) =>
        mapTransfer(
          row,
          patientById.get(row.patient_id)?.display_name ?? "Patient",
          hospital?.name ?? "Your hospital",
          (row.service_id ? serviceById.get(row.service_id) : undefined) ?? "Specialist service",
          row.receiving_hospital_id ? receivingNames.get(row.receiving_hospital_id) : undefined,
          (eventRows ?? []).filter((e) => e.transfer_id === row.id),
        ),
      ),
    };
  });

/* ------------------------------- sign-up -------------------------------- */

export const listSignUpHospitals = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("hospitals")
    .select("id, name, city")
    .eq("status", "active")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const signUpAsReviewer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
      fullName: z.string().min(2),
      hospitalId: z.string().uuid(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createError || !created.user) {
      throw new Error(createError?.message ?? "Failed to create the hospital account.");
    }
    const userId = created.user.id;

    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      user_id: userId,
      full_name: data.fullName,
      email: data.email,
    });
    const { error: memberError } = await supabaseAdmin.from("hospital_users").insert({
      hospital_id: data.hospitalId,
      user_id: userId,
      role: "hospital_reviewer",
      job_title: "Hospital reviewer",
      status: "active",
    });
    if (profileError || memberError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new Error(profileError?.message ?? memberError?.message ?? "Failed to set up the account.");
    }
    // Finance membership lets the portal show campaign wallet figures; optional.
    await supabaseAdmin.from("hospital_users").insert({
      hospital_id: data.hospitalId,
      user_id: userId,
      role: "hospital_finance",
      job_title: "Hospital finance",
      status: "active",
    });

    return { userId };
  });

/* ---------------------------- applications ------------------------------ */

const applicationStatusSchema = z.enum(["pending", "info-requested", "assessed", "approved", "rejected"]);

export const updateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string(),
      patch: z.object({
        status: applicationStatusSchema.optional(),
        rejectionReason: z.string().optional(),
        assessment: z.any().optional(),
      }),
    }),
  )
  .handler(async ({ data, context }) => {
    const update: Tables["applications"]["Update"] = { status_changed_at: todayIso() };
    if (data.patch.status) update.status = appStatusToDb[data.patch.status];
    if (data.patch.rejectionReason) update.rejection_reason = data.patch.rejectionReason;
    if (data.patch.assessment) {
      update.assessment = data.patch.assessment as Json;
      update.reviewed_by = context.userId;
      update.reviewed_at = todayIso();
    }
    const { error } = await context.supabase.from("applications").update(update).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const approveApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ applicationId: z.string(), goal: z.number().positive() }))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: application, error: readError } = await supabase
      .from("applications")
      .select("id, patient_id, hospital_id, cause_id, title")
      .eq("id", data.applicationId)
      .maybeSingle();
    if (readError) throw new Error(readError.message);
    if (!application) throw new Error("Application not found.");

    const { data: campaign, error: insertError } = await supabase
      .from("campaigns")
      .insert({
        application_id: application.id,
        patient_id: application.patient_id,
        hospital_id: application.hospital_id,
        cause_id: application.cause_id,
        title: application.title,
        target: data.goal,
        status: "Active",
        treatment_stage: 0,
      })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);

    const { error: statusError } = await supabase
      .from("applications")
      .update({ status: "Approved", decided_at: todayIso(), status_changed_at: todayIso() })
      .eq("id", application.id);
    if (statusError) throw new Error(statusError.message);

    return { campaignId: campaign.id };
  });

/* ------------------------------ campaigns ------------------------------- */

export const updateCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string(),
      patch: z.object({
        status: z.enum(["active", "completed"]).optional(),
        treatmentStage: z.number().int().min(0).optional(),
      }),
    }),
  )
  .handler(async ({ data, context }) => {
    const update: Tables["campaigns"]["Update"] = {};
    if (data.patch.status) update.status = campaignStatusToDb[data.patch.status];
    if (data.patch.treatmentStage !== undefined) update.treatment_stage = data.patch.treatmentStage;
    const { error } = await context.supabase.from("campaigns").update(update).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const postCampaignUpdate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ campaignId: z.string(), note: z.string().min(3) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("campaign_updates").insert({
      campaign_id: data.campaignId,
      author_user_id: context.userId,
      content: data.note,
      status: "Pending Approval",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* --------------------------- fund requests ------------------------------ */

const paymentStatusSchema = z.enum(["requested", "approved", "scheduled", "paid", "declined"]);

export const requestFunds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      campaignId: z.string(),
      milestone: z.string().min(3),
      amount: z.number().positive(),
      stage: z.string().optional(),
      note: z.string().optional(),
      document: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("fund_requests")
      .insert({
        campaign_id: data.campaignId,
        milestone: data.milestone,
        amount: data.amount,
        stage: data.stage ?? null,
        note: data.note ?? null,
        document: data.document ?? null,
        status: "requested",
        requested_by: context.userId,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPayment(row);
  });

export const setPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      paymentId: z.string(),
      status: paymentStatusSchema,
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const update: Tables["fund_requests"]["Update"] = { status: data.status };
    if (data.reason) update.decline_reason = data.reason;
    const { error } = await context.supabase.from("fund_requests").update(update).eq("id", data.paymentId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const withdrawFundRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ paymentId: z.string() }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("fund_requests")
      .delete()
      .eq("id", data.paymentId)
      .eq("status", "requested");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ----------------------------- capabilities ----------------------------- */

export const saveCapabilities = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      items: z.array(
        z.object({
          id: z.string().uuid(),
          group: z.enum(["service", "equipment"]),
          status: z.enum(["available", "temporarily-unavailable", "not-available"]),
        }),
      ),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    for (const item of data.items) {
      if (item.group === "service") {
        const { error } = await supabase
          .from("hospital_capabilities")
          .update({ status: capabilityStatusToDb[item.status] })
          .eq("id", item.id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("hospital_equipment")
          .update({
            is_operational: item.status === "available",
            condition:
              item.status === "available"
                ? "Operational"
                : item.status === "temporarily-unavailable"
                  ? "Temporarily unavailable"
                  : "Not available",
          })
          .eq("id", item.id);
        if (error) throw new Error(error.message);
      }
    }
    return { ok: true };
  });

/* ------------------------------- transfers ------------------------------ */

async function nextReferenceCode(): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("transfers")
    .select("reference_code")
    .like("reference_code", "FT-%")
    .order("reference_code", { ascending: false })
    .limit(1);
  const last = data?.[0]?.reference_code ?? "FT-000000";
  const n = Number(last.replace(/\D/g, "")) + 1;
  return "FT-" + String(n).padStart(6, "0");
}

export const createTransferRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      campaignId: z.string().uuid(),
      treatmentPhase: z.string().min(2),
      serviceId: z.string().uuid(),
      reason: z.string().min(10),
      urgency: z.enum(["routine", "urgent", "critical"]),
      extra: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("id, patient_id, hospital_id")
      .eq("id", data.campaignId)
      .maybeSingle();
    if (campaignError) throw new Error(campaignError.message);
    if (!campaign?.hospital_id) throw new Error("Campaign not found for your hospital.");

    const reason = data.extra?.trim()
      ? `${data.reason}\n\nAdditional information: ${data.extra.trim()}`
      : data.reason;

    const reference = await nextReferenceCode();
    const { data: transfer, error } = await supabase
      .from("transfers")
      .insert({
        reference_code: reference,
        patient_id: campaign.patient_id,
        campaign_id: campaign.id,
        originating_hospital_id: campaign.hospital_id,
        service_id: data.serviceId,
        reason,
        urgency: urgencyToDb[data.urgency],
        treatment_phase: toTreatmentStage(data.treatmentPhase),
        status: "Submitted",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const { error: eventError } = await supabase.from("transfer_events").insert({
      transfer_id: transfer.id,
      status: "Submitted",
      actor_user_id: userId,
      actor_label: "Requesting hospital",
      note: "Submitted to FundEzer Admin for review.",
    });
    if (eventError) throw new Error(eventError.message);

    return { referenceCode: transfer.reference_code, id: transfer.id };
  });

export const cancelTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("transfers")
      .update({ status: "Cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    const { error: eventError } = await supabase.from("transfer_events").insert({
      transfer_id: data.id,
      status: "Cancelled",
      actor_user_id: userId,
      actor_label: "Requesting hospital",
      note: "Cancelled by the requesting hospital.",
    });
    if (eventError) throw new Error(eventError.message);
    return { ok: true };
  });

/**
 * Demo-only stand-in for the FundEzer Admin portal: the requesting hospital can
 * never approve its own transfer, so these decisions are written as admin
 * actions after checking the caller really is a reviewer at the originating
 * hospital.
 */
async function adminTransferDecision(
  context: { supabase: ReturnType<typeof Object> extends never ? never : any; userId: string },
  transferId: string,
  next: TransferStatusDb,
  note: string,
) {
  const { data: transfer, error } = await context.supabase
    .from("transfers")
    .select("*")
    .eq("id", transferId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!transfer) throw new Error("Transfer not found.");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const update: Tables["transfers"]["Update"] = {
    status: next,
    admin_decision: note,
    admin_decision_at: todayIso(),
  };

  if (next === "Receiving Hospital Pending" && !transfer.receiving_hospital_id) {
    const { data: candidates } = await supabaseAdmin
      .from("hospital_capabilities")
      .select("hospital_id, status, service_id")
      .eq("service_id", transfer.service_id)
      .eq("status", "Available")
      .neq("hospital_id", transfer.originating_hospital_id)
      .limit(1);
    let receiving = candidates?.[0]?.hospital_id;
    if (!receiving) {
      const { data: fallback } = await supabaseAdmin
        .from("hospitals")
        .select("id")
        .neq("id", transfer.originating_hospital_id)
        .eq("status", "active")
        .limit(1);
      receiving = fallback?.[0]?.id;
    }
    if (receiving && receiving !== transfer.originating_hospital_id) {
      update.receiving_hospital_id = receiving;
    }
  }

  if (next === "Transfer Scheduled") {
    update.scheduled_for = new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString();
  }

  if (next === "Completed") {
    update.completed_at = todayIso();
  }

  const { error: updateError } = await supabaseAdmin.from("transfers").update(update).eq("id", transferId);
  if (updateError) throw new Error(updateError.message);

  const { error: eventError } = await supabaseAdmin.from("transfer_events").insert({
    transfer_id: transferId,
    status: next,
    actor_label: "FundEzer Admin",
    note,
  });
  if (eventError) throw new Error(eventError.message);

  const receivingHospitalId = update.receiving_hospital_id ?? transfer.receiving_hospital_id;
  if (next === "Completed" && receivingHospitalId) {
    const startedOn = new Date().toISOString().slice(0, 10);
    await supabaseAdmin
      .from("patient_hospital_history")
      .update({ ended_on: startedOn })
      .eq("patient_id", transfer.patient_id)
      .is("ended_on", null);
    await supabaseAdmin.from("patient_hospital_history").insert({
      patient_id: transfer.patient_id,
      hospital_id: receivingHospitalId,
      transfer_id: transferId,
      treatment_phase: transfer.treatment_phase,
      reason: "Transferred for specialist treatment",
      started_on: startedOn,
    });
    await supabaseAdmin
      .from("patients")
      .update({ current_hospital_id: receivingHospitalId, status: "Transferred" })
      .eq("id", transfer.patient_id);
  }

  return { ok: true };
}

export const advanceTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { data: transfer, error } = await context.supabase
      .from("transfers")
      .select("status")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!transfer) throw new Error("Transfer not found.");
    const index = TRANSFER_FLOW_DB.indexOf(transfer.status);
    if (index < 0 || index >= TRANSFER_FLOW_DB.length - 1) {
      throw new Error("This transfer has reached the end of the workflow.");
    }
    const next = TRANSFER_FLOW_DB[index + 1]!;
    return adminTransferDecision(context, data.id, next, "FundEzer Admin update.");
  });

export const rejectTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ id: z.string().uuid(), reason: z.string().optional() }))
  .handler(async ({ data, context }) =>
    adminTransferDecision(
      context,
      data.id,
      "Rejected",
      data.reason?.trim() || "Rejected after FundEzer Admin review.",
    ),
  );

export { transferStatusToDb, transferStatusToUi };
