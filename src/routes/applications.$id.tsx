import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  FileText,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  XCircle,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { PortalLayout, StatusBadge, RiskPill } from "@/components/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  costLabels,
  costTotals,
  emptyCosts,
  naira,
  recommendedGoal,
  type Assessment,
  type CostEstimate,
  type Urgency,
} from "@/lib/mock-data";
import { addCampaign, updateApplication, usePortalState } from "@/lib/store";

export const Route = createFileRoute("/applications/$id")({
  head: () => ({
    meta: [
      { title: "Application review — FundEzer Hospital Portal" },
      {
        name: "description",
        content:
          "Review a patient's story, documents and identity, then submit a treatment assessment and cost estimate.",
      },
      { property: "og:title", content: "Application review — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Assess a patient application and approve a verified sponsorship campaign.",
      },
    ],
  }),
  component: ApplicationDetail,
  notFoundComponent: () => (
    <PortalLayout title="Application not found">
      <p className="text-sm text-muted-foreground">
        This application no longer exists.{" "}
        <Link to="/applications" className="text-primary underline">
          Back to applications
        </Link>
      </p>
    </PortalLayout>
  ),
});

function ApplicationDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { applications } = usePortalState();
  const app = applications.find((a) => a.id === id);

  const [form, setForm] = useState<Assessment>({
    diagnosis: "",
    investigation: "",
    procedure: "",
    admission: "",
    rehabilitation: "",
    urgency: "urgent",
    recovery: "",
    costs: structuredClone(emptyCosts),
  });
  const [rejectReason, setRejectReason] = useState("");

  if (!app) {
    return (
      <PortalLayout title="Application not found">
        <p className="text-sm text-muted-foreground">
          <Link to="/applications" className="text-primary underline">
            Back to applications
          </Link>
        </p>
      </PortalLayout>
    );
  }

  const assessment = app.assessment ?? form;
  const [minTotal, maxTotal] = costTotals(assessment.costs);
  const goal = recommendedGoal(maxTotal);
  const submitted = Boolean(app.assessment);

  const setCost = (key: keyof CostEstimate, idx: 0 | 1, value: string) =>
    setForm((f) => {
      const next = structuredClone(f.costs);
      next[key][idx] = Number(value.replace(/\D/g, "")) || 0;
      return { ...f, costs: next };
    });

  const submitAssessment = () => {
    if (!form.diagnosis.trim() || maxTotal === 0) {
      toast.error("Add a diagnosis and at least one cost estimate before submitting.");
      return;
    }
    updateApplication(app.id, { assessment: form, status: "assessed" });
    toast.success("Assessment submitted — AI treatment plan generated.");
  };

  const approve = () => {
    const campaignId = "CMP-" + Math.floor(120 + Math.random() * 60);
    addCampaign({
      id: campaignId,
      patientName: app.patient.name,
      condition: app.condition,
      goal,
      raised: 0,
      donors: 0,
      status: "active",
      created: "4 Aug 2026",
      treatmentStage: 0,
      donations: [],
      updates: [{ date: "4 Aug 2026", note: "Campaign published and verified by Alliance Hospital." }],
      payments: [],
    });
    updateApplication(app.id, { status: "approved", campaignId });
    toast.success("Campaign approved and published.");
    navigate({ to: "/campaigns/$id", params: { id: campaignId } });
  };

  const reject = () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }
    updateApplication(app.id, { status: "rejected", rejectionReason: rejectReason });
    toast.success("Application rejected. The patient has been notified.");
  };

  return (
    <PortalLayout
      title={app.patient.name}
      subtitle={`${app.id} · ${app.condition}`}
      actions={
        <div className="flex items-center gap-2">
          <RiskPill score={app.riskScore} />
          <StatusBadge status={app.status} />
        </div>
      }
    >
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/applications">
          <ArrowLeft className="mr-1 h-4 w-4" /> All applications
        </Link>
      </Button>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Tabs defaultValue="story">
            <TabsList>
              <TabsTrigger value="story">Patient story</TabsTrigger>
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="fraud">Fraud screening</TabsTrigger>
            </TabsList>

            <TabsContent value="story">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="h-4 w-4 text-primary" /> AI-assisted patient story
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{app.story}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="identity">
              <Card>
                <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
                  {[
                    ["Full name", app.patient.name],
                    ["Age / gender", `${app.patient.age} · ${app.patient.gender}`],
                    ["Phone", app.patient.phone],
                    ["Email", app.patient.email],
                    ["NIN", app.patient.nin],
                    ["Address", app.patient.address],
                    ["Next of kin", app.patient.nextOfKin],
                    ["Emergency contact", app.patient.emergencyContact],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k}</p>
                      <p className="mt-1 text-sm font-medium">{v}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents">
              <Card>
                <CardContent className="divide-y divide-border p-0">
                  {app.documents.map((d) => (
                    <div key={d.name} className="flex items-center gap-3 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-soft text-accent-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{d.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.kind} · uploaded {d.uploaded}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fraud">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-semibold">Risk score {app.riskScore}/100</p>
                      <p className="text-xs text-muted-foreground">
                        Duplicate stories, images, IDs, metadata and document forgery checks completed.
                      </p>
                    </div>
                  </div>
                  <Separator />
                  {app.riskFlags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No flags raised on this application.</p>
                  ) : (
                    <ul className="space-y-2 text-sm">
                      {app.riskFlags.map((f) => (
                        <li key={f} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hospital assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="PRELIMINARY DIAGNOSTICS">
                  <Input
                    value={assessment.diagnosis}
                    disabled={submitted}
                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                    placeholder="Confirmed clinical diagnosis"
                  />
                </Field>
                <Field label="Recommended investigation">
                  <Input
                    value={assessment.investigation}
                    disabled={submitted}
                    onChange={(e) => setForm({ ...form, investigation: e.target.value })}
                    placeholder="Labs, imaging, workup"
                  />
                </Field>
                <Field label="Recommended procedure">
                  <Input
                    value={assessment.procedure}
                    disabled={submitted}
                    onChange={(e) => setForm({ ...form, procedure: e.target.value })}
                    placeholder="Surgery or treatment plan"
                  />
                </Field>
                <Field label="Expected admission">
                  <Input
                    value={assessment.admission}
                    disabled={submitted}
                    onChange={(e) => setForm({ ...form, admission: e.target.value })}
                    placeholder="e.g. 6 days"
                  />
                </Field>
                <Field label="Urgency">
                  <Select
                    value={assessment.urgency}
                    disabled={submitted}
                    onValueChange={(v) => setForm({ ...form, urgency: v as Urgency })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Expected recovery">
                  <Input
                    value={assessment.recovery}
                    disabled={submitted}
                    onChange={(e) => setForm({ ...form, recovery: e.target.value })}
                    placeholder="e.g. 12 weeks"
                  />
                </Field>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-semibold">Cost estimate</p>
                <p className="text-xs text-muted-foreground">
                  Enter a minimum and maximum for each line item in naira.
                </p>
                <div className="mt-4 space-y-3">
                  {(Object.keys(costLabels) as (keyof CostEstimate)[]).map((k) => (
                    <div key={k} className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_140px_140px]">
                      <Label className="text-sm font-normal">{costLabels[k]}</Label>
                      <Input
                        inputMode="numeric"
                        disabled={submitted}
                        value={assessment.costs[k][0] ? assessment.costs[k][0].toLocaleString() : ""}
                        onChange={(e) => setCost(k, 0, e.target.value)}
                        placeholder="Min"
                      />
                      <Input
                        inputMode="numeric"
                        disabled={submitted}
                        value={assessment.costs[k][1] ? assessment.costs[k][1].toLocaleString() : ""}
                        onChange={(e) => setCost(k, 1, e.target.value)}
                        placeholder="Max"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-6 rounded-xl bg-secondary p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Minimum total</p>
                    <p className="text-lg font-bold">{naira(minTotal)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Maximum total</p>
                    <p className="text-lg font-bold">{naira(maxTotal)}</p>
                  </div>
                </div>
              </div>

              {!submitted && (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={submitAssessment}>Submit assessment</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      updateApplication(app.id, { status: "info-requested" });
                      toast.success("Additional information requested from the patient.");
                    }}
                  >
                    <MessageSquare className="mr-1 h-4 w-4" /> Request more information
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" /> AI preliminary treatment plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {!submitted ? (
                <p className="text-muted-foreground">
                  Submit the hospital assessment to generate the diagnosis summary, investigations, timeline,
                  medication schedule and expected milestones.
                </p>
              ) : (
                <>
                  <PlanRow label="Diagnosis summary" value={assessment.diagnosis} />
                  <PlanRow label="Investigations" value={assessment.investigation || "Standard pre-treatment workup"} />
                  <PlanRow
                    label="Estimated timeline"
                    value={`${assessment.admission || "Admission TBC"} admission · recovery ${assessment.recovery || "TBC"}`}
                  />
                  <PlanRow
                    label="Medication schedule"
                    value="Pre-treatment stabilisation, in-treatment therapy, 3-month post-treatment course"
                  />
                  <PlanRow
                    label="Expected milestones"
                    value="Investigations complete → procedure → discharge → follow-up review"
                  />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">AI campaign recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl brand-gradient p-5 text-primary-foreground">
                <p className="text-xs opacity-80">Recommended campaign goal</p>
                <p className="mt-1 text-3xl font-extrabold">{submitted ? naira(goal) : "—"}</p>
                <p className="mt-2 text-xs opacity-85">
                  Maximum estimate {submitted ? naira(maxTotal) : "—"} plus a 20% contingency buffer.
                </p>
              </div>

              {app.status === "approved" ? (
                <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm">
                  <p className="font-semibold text-success">Campaign published</p>
                  {app.campaignId && (
                    <Link
                      to="/campaigns/$id"
                      params={{ id: app.campaignId }}
                      className="text-primary underline"
                    >
                      Open {app.campaignId}
                    </Link>
                  )}
                </div>
              ) : app.status === "rejected" ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <p className="font-semibold text-destructive">Rejected</p>
                  <p className="mt-1 text-muted-foreground">{app.rejectionReason}</p>
                </div>
              ) : (
                <>
                  <Button className="w-full" disabled={!submitted} onClick={approve}>
                    <CheckCircle2 className="mr-1 h-4 w-4" /> Approve & publish campaign
                  </Button>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Reason (required to reject)</Label>
                    <Textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Explain why this application cannot proceed"
                      rows={3}
                    />
                    <Button variant="outline" className="w-full" onClick={reject}>
                      <XCircle className="mr-1 h-4 w-4" /> Reject application
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1">{value}</p>
    </div>
  );
}
