import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Share2, QrCode, Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout, StatusBadge } from "@/components/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { campaignWallet, naira } from "@/lib/mock-data";
import { RequestFundsDialog } from "@/components/request-funds-dialog";
import { updateCampaign, usePortalState, useTransferState } from "@/lib/store";
import { RequestTransferDialog } from "@/components/request-transfer-dialog";
import { TransferStatusBadge, TransferTimeline, UrgencyBadge } from "@/components/transfer-bits";
import { isTerminal, transferStatusLabel } from "@/lib/transfers";

const fallbackStages = ["Campaign live", "Investigations", "Procedure", "Recovery", "Completed"];

export const Route = createFileRoute("/campaigns/$id")({
  head: () => ({
    meta: [
      { title: "Campaign detail — FundEzer Hospital Portal" },
      {
        name: "description",
        content: "Wallet balance, donations, treatment updates and milestone payments for a campaign.",
      },
      { property: "og:title", content: "Campaign detail — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Manage treatment progress and milestone payouts for a verified campaign.",
      },
    ],
  }),
  component: CampaignDetail,
});

function CampaignDetail() {
  const { id } = Route.useParams();
  const { campaigns } = usePortalState();
  const { transfers } = useTransferState();
  const c = campaigns.find((x) => x.id === id);
  const campaignTransfers = transfers.filter((t) => t.campaignId === id);
  const activeTransfer = campaignTransfers.find((t) => !isTerminal(t.status));
  const [note, setNote] = useState("");

  if (!c) {
    return (
      <PortalLayout title="Campaign not found">
        <Link to="/campaigns" className="text-sm text-primary underline">
          Back to campaigns
        </Link>
      </PortalLayout>
    );
  }

  const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
  const { paid, reserved, available } = campaignWallet(c);
  // Treatment journey comes from the patient's recorded journey stages when the
  // backend has them; otherwise fall back to the campaign's funding stage.
  const journeySteps =
    c.journey.length > 0
      ? c.journey.map((j) => ({ label: j.stage, done: j.status === "Completed", current: j.status === "In Progress" }))
      : fallbackStages.map((label, i) => ({ label, done: i <= c.treatmentStage, current: i === c.treatmentStage }));

  const postUpdate = async () => {
    if (!note.trim()) {
      toast.error("Write an update before posting.");
      return;
    }
    try {
      await updateCampaign(c.id, {
        updates: [{ date: "4 Aug 2026", note }, ...c.updates],
        treatmentStage: Math.min(stages.length - 1, c.treatmentStage + 1),
      });
      setNote("");
      toast.success("Treatment update posted — donors notified.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post update.");
    }
  };

  return (
    <PortalLayout
      title={c.patientName}
      subtitle={`${c.id} · ${c.condition}`}
      actions={<StatusBadge status={c.status} />}
    >
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/campaigns">
          <ArrowLeft className="mr-1 h-4 w-4" /> All campaigns
        </Link>
      </Button>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Raised so far</p>
                  <p className="text-3xl font-extrabold">{naira(c.raised)}</p>
                  <p className="text-sm text-muted-foreground">
                    of {naira(c.goal)} goal · {c.donors} donors
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toast.success("Campaign link copied.")}>
                    <Share2 className="mr-1 h-4 w-4" /> Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toast.success("QR code downloaded.")}>
                    <QrCode className="mr-1 h-4 w-4" /> QR code
                  </Button>
                </div>
              </div>
              <Progress value={pct} className="mt-4" />
              <p className="mt-2 text-xs text-muted-foreground">{pct}% funded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Treatment progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {journeySteps.map((s) => (
                  <span
                    key={s.label}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-medium " +
                      (s.done || s.current
                        ? "border-primary/30 bg-primary-soft text-accent-foreground"
                        : "border-border text-muted-foreground")
                    }
                  >
                    {s.done && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
                    {s.label}
                  </span>
                ))}
              </div>
              {campaignTransfers.length > 0 && (
                <div className="rounded-lg border border-primary/30 bg-primary-soft p-3">
                  <p className="text-xs font-semibold text-accent-foreground">
                    Treatment journey includes a transfer
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    {[
                      "Diagnosis",
                      "Treatment",
                      "Transfer required",
                      activeTransfer && activeTransfer.status === "rejected"
                        ? "Transfer rejected"
                        : "Transfer approved",
                      "New hospital",
                      "Treatment continues",
                      "Treatment completed",
                    ].map((step, i, arr) => (
                      <span key={step} className="flex items-center gap-2">
                        <span className="rounded-full border border-primary/30 bg-background px-2.5 py-1 font-medium">
                          {step}
                        </span>
                        {i < arr.length - 1 && <span className="text-muted-foreground">→</span>}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    The campaign, donors, donations and funding progress stay with the patient —
                    only the hospital assignment changes.
                  </p>
                </div>
              )}
              <Separator />
              <div className="space-y-3">
                {c.updates.map((u) => (
                  <div key={u.date + u.note} className="rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">{u.date}</p>
                    <p className="mt-1 text-sm">{u.note}</p>
                  </div>
                ))}
              </div>
              {c.status === "active" && (
                <div className="space-y-2">
                  <Textarea
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Post a treatment update for donors and the patient"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={postUpdate}>
                      Post update
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.success("Progress image uploaded.")}
                    >
                      <Upload className="mr-1 h-4 w-4" /> Upload progress image
                    </Button>
                    {pct >= 100 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                          try {
                            await updateCampaign(c.id, { status: "completed", treatmentStage: stages.length - 1 });
                            toast.success("Campaign closed.");
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Failed to close campaign.");
                          }
                        }}
                      >
                        Close campaign
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent donations</CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border p-0">
              {c.donations.length === 0 && (
                <p className="p-5 text-sm text-muted-foreground">No donations yet.</p>
              )}
              {c.donations.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <div>
                    <p className="text-sm font-medium">{d.donor}</p>
                    <p className="text-xs text-muted-foreground">{d.date}</p>
                  </div>
                  <p className="text-sm font-semibold">{naira(d.amount)}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaign wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Campaign goal" value={naira(c.goal)} />
              <Row label="Funds raised" value={naira(c.raised)} />
              <Row label="Payments made" value={naira(paid)} />
              <Row label="Reserved by requests" value={naira(reserved)} />
              <Separator />
              <Row label="Available balance" value={naira(available)} strong />
              <Row label="Remaining to goal" value={naira(Math.max(0, c.goal - c.raised))} />
              <p className="text-xs text-muted-foreground">
                Funds are held in the campaign wallet and released directly to the hospital on approved treatment
                milestones.
              </p>
              <RequestFundsDialog campaign={c} available={available} stages={stages} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient transfer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {campaignTransfers.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No transfer requested. Raise a request if this patient needs a service your
                  hospital cannot currently deliver.
                </p>
              )}
              {campaignTransfers.map((t) => (
                <div key={t.id} className="space-y-3 rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{t.id}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.requiredService} · {t.submitted}
                      </p>
                    </div>
                    <UrgencyBadge urgency={t.urgency} />
                  </div>
                  <TransferStatusBadge status={t.status} />
                  <TransferTimeline transfer={t} />
                  <p className="text-xs text-muted-foreground">
                    Current status: {transferStatusLabel[t.status]} — FundEzer Admin decides
                    transfer approvals.
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to="/transfers/$id" params={{ id: t.id }}>
                      View transfer status
                    </Link>
                  </Button>
                </div>
              ))}
              {c.status === "active" && !activeTransfer && (
                <RequestTransferDialog campaign={c} phases={stages} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Milestone payments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {c.payments.length === 0 && (
                <p className="text-sm text-muted-foreground">No milestone payments released yet.</p>
              )}
              {c.payments.map((p) => (
                <div key={p.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{p.milestone}</p>
                    <StatusBadge status={p.status} />
                  </div>
                  <p className="mt-1 text-sm font-semibold">{naira(p.amount)}</p>
                  <p className="text-xs text-muted-foreground">{p.date}</p>
                  {p.note && <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>}
                  {p.document && (
                    <p className="mt-1 text-xs text-muted-foreground">Attached: {p.document}</p>
                  )}
                  {p.declineReason && (
                    <p className="mt-1 text-xs text-destructive">Declined: {p.declineReason}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={strong ? "text-base font-bold" : "font-medium"}>{value}</span>
    </div>
  );
}
