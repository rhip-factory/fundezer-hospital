import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Json } from "@/integrations/supabase/types";
import type { Application, Assessment, Payment } from "./mock-data";

// Server functions for the FundEzer hospital portal.
// Reads use the publishable (anon) client because the demo data is public.
// Writes require an authenticated reviewer/admin session.
// The sign-up helper creates a new hospital reviewer so the demo can be used without an existing account.

async function createPublishableClient() {
  const { createClient } = await import("@supabase/supabase-js");
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

export const signUpAsReviewer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (createError || !user.user) {
      throw new Error(createError?.message ?? "Failed to create reviewer account.");
    }
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
      user_id: user.user.id,
      role: "hospital_reviewer",
    });
    if (roleError) {
      // Roll back the user so the demo state stays clean.
      await supabaseAdmin.auth.admin.deleteUser(user.user.id);
      throw new Error(roleError.message);
    }
    return { userId: user.user.id };
  });

const applicationStatusSchema = z.enum(["pending", "info-requested", "assessed", "approved", "rejected"]);
const paymentStatusSchema = z.enum(["requested", "approved", "scheduled", "paid", "declined"]);

export const getAllData = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = await createPublishableClient();
  const [{ data: applications }, { data: campaigns }, { data: donations }, { data: payments }] = await Promise.all([
    supabase.from("applications").select("*"),
    supabase.from("campaigns").select("*"),
    supabase.from("donations").select("*"),
    supabase.from("payments").select("*"),
  ]);

  return {
    applications: (applications ?? []).map(mapApplication),
    campaigns: (campaigns ?? []).map((c) => mapCampaign(c, donations ?? [], payments ?? [])),
  };
});

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
    const supabase = context.supabase;
    const id = "PAY-" + Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        id,
        campaign_id: data.campaignId,
        milestone: data.milestone,
        amount: data.amount,
        payment_date: today,
        status: "requested",
        note: data.note ?? null,
        stage: data.stage ?? null,
        document: data.document ?? null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return mapPayment(payment);
  });

export const setPaymentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      campaignId: z.string(),
      paymentId: z.string(),
      status: paymentStatusSchema,
      reason: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const update: { status: string; payment_date?: string; decline_reason?: string } = { status: data.status };
    if (data.status === "paid") update.payment_date = today;
    if (data.reason) update.decline_reason = data.reason;

    const { error } = await supabase
      .from("payments")
      .update(update)
      .eq("id", data.paymentId)
      .eq("campaign_id", data.campaignId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const withdrawFundRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      campaignId: z.string(),
      paymentId: z.string(),
    }),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("id", data.paymentId)
      .eq("campaign_id", data.campaignId)
      .eq("status", "requested");

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string(),
      patch: z.object({
        status: applicationStatusSchema.optional(),
        rejectionReason: z.string().optional(),
        assessment: z.any().optional(),
        campaignId: z.string().optional().nullable(),
      }),
    }),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const update: {
      status?: string;
      rejection_reason?: string;
      assessment?: Json;
      campaign_id?: string | null;
    } = {};
    if (data.patch.status) update.status = data.patch.status;
    if (data.patch.rejectionReason) update.rejection_reason = data.patch.rejectionReason;
    if (data.patch.assessment) update.assessment = data.patch.assessment;
    if (data.patch.campaignId !== undefined) update.campaign_id = data.patch.campaignId;

    const { error } = await supabase.from("applications").update(update).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string(),
      patch: z.object({
        status: z.enum(["active", "completed"]).optional(),
        treatmentStage: z.number().optional(),
        updates: z.array(z.object({ date: z.string(), note: z.string() })).optional(),
      }),
    }),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const update: {
      status?: string;
      treatment_stage?: number;
      updates?: { date: string; note: string }[];
    } = {};
    if (data.patch.status) update.status = data.patch.status;
    if (data.patch.treatmentStage !== undefined) update.treatment_stage = data.patch.treatmentStage;
    if (data.patch.updates) update.updates = data.patch.updates;

    const { error } = await supabase.from("campaigns").update(update).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const addCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      id: z.string(),
      patientName: z.string(),
      condition: z.string(),
      goal: z.number(),
      raised: z.number().default(0),
      donors: z.number().default(0),
      status: z.enum(["active", "completed"]).default("active"),
      created: z.string(),
      treatmentStage: z.number().default(0),
      applicationId: z.string().optional(),
    }),
  )
  .handler(async ({ data, context }) => {
    const supabase = context.supabase;
    const { error } = await supabase.from("campaigns").insert({
      id: data.id,
      patient_name: data.patientName,
      condition: data.condition,
      goal: data.goal,
      raised: data.raised,
      donors: data.donors,
      status: data.status,
      created: data.created,
      treatment_stage: data.treatmentStage,
      application_id: data.applicationId ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

function mapApplication(row: Database["public"]["Tables"]["applications"]["Row"]) {
  const assessment = row.assessment as
    | {
        diagnosis: string;
        investigation: string;
        procedure: string;
        admission: string;
        rehabilitation: string;
        urgency: string;
        recovery: string;
        costs: Record<string, [number, number]>;
      }
    | undefined;

  const mapped: Omit<Application, "assessment" | "rejectionReason" | "campaignId"> & {
    assessment?: Assessment;
    rejectionReason?: string;
    campaignId?: string;
  } = {
    id: row.id,
    patient: {
      name: row.patient_name,
      age: row.patient_age ?? 0,
      gender: row.patient_gender ?? "",
      phone: row.patient_phone ?? "",
      email: row.patient_email ?? "",
      nin: row.patient_nin ?? "",
      address: row.patient_address ?? "",
      nextOfKin: row.patient_next_of_kin ?? "",
      emergencyContact: row.patient_emergency_contact ?? "",
    },
    condition: row.condition,
    submitted: row.submitted ?? "",
    status: row.status as "pending" | "info-requested" | "assessed" | "approved" | "rejected",
    riskScore: row.risk_score ?? 0,
    riskFlags: (row.risk_flags as string[]) ?? [],
    story: row.story ?? "",
    documents: (row.documents as { name: string; kind: string; uploaded: string }[]) ?? [],
  };

  if (assessment) {
    mapped.assessment = assessment as Assessment;
  }
  if (row.rejection_reason) mapped.rejectionReason = row.rejection_reason;
  if (row.campaign_id) mapped.campaignId = row.campaign_id;

  return mapped as Application;
}

function mapCampaign(
  row: Database["public"]["Tables"]["campaigns"]["Row"],
  allDonations: Database["public"]["Tables"]["donations"]["Row"][],
  allPayments: Database["public"]["Tables"]["payments"]["Row"][],
) {
  return {
    id: row.id,
    patientName: row.patient_name,
    condition: row.condition,
    goal: row.goal,
    raised: row.raised,
    donors: row.donors,
    status: row.status as "active" | "completed",
    created: row.created ?? "",
    treatmentStage: row.treatment_stage,
    donations: allDonations
      .filter((d) => d.campaign_id === row.id)
      .map((d) => ({ donor: d.donor, amount: d.amount, date: d.donation_date ?? "" })),
    updates: (row.updates as { date: string; note: string }[]) ?? [],
    payments: allPayments.filter((p) => p.campaign_id === row.id).map(mapPayment),
  };
}

function mapPayment(row: Database["public"]["Tables"]["payments"]["Row"]) {
  const mapped: Omit<Payment, "note" | "stage" | "document" | "declineReason"> & {
    note?: string;
    stage?: string;
    document?: string;
    declineReason?: string;
  } = {
    id: row.id,
    milestone: row.milestone,
    amount: row.amount,
    date: row.payment_date ?? "",
    status: row.status as "requested" | "approved" | "scheduled" | "paid" | "declined",
  };

  if (row.note) mapped.note = row.note;
  if (row.stage) mapped.stage = row.stage;
  if (row.document) mapped.document = row.document;
  if (row.decline_reason) mapped.declineReason = row.decline_reason;

  return mapped as Payment;
}
