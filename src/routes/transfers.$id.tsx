import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Info } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout } from "@/components/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TransferStatusBadge, TransferTimeline, UrgencyBadge } from "@/components/transfer-bits";
import { isTerminal, transferStatusLabel } from "@/lib/transfers";
import {
  cancelTransfer,
  simulateAdvance,
  simulateReject,
  usePortalState,
  useTransferState,
} from "@/lib/store";
import { naira } from "@/lib/mock-data";

export const Route = createFileRoute("/transfers/$id")({
  head: () => ({
    meta: [
      { title: "Transfer detail — FundEzer Hospital Portal" },
      {
        name: "description",
        content:
          "Patient transfer request detail with required service, urgency and full status timeline.",
      },
      { property: "og:title", content: "Transfer detail — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Follow a patient transfer request from submission to completed treatment.",
      },
    ],
  }),
  component: TransferDetail,
});

function TransferDetail() {
  const { id } = Route.useParams();
  const { transfers } = useTransferState();
  const { campaigns } = usePortalState();
  const t = transfers.find((x) => x.id === id);

  if (!t) {
    return (
      <PortalLayout title="Transfer not found">
        <Link to="/transfers" className="text-sm text-primary underline">
          Back to transfer requests
        </Link>
      </PortalLayout>
    );
  }

  const campaign = campaigns.find((c) => c.id === t.campaignId);

  return (
    <PortalLayout
      title={t.id}
      subtitle={`${t.patientName} · ${t.requiredService}`}
      actions={<TransferStatusBadge status={t.status} />}
    >
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link to="/transfers">
          <ArrowLeft className="mr-1 h-4 w-4" /> All transfer requests
        </Link>
      </Button>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Request details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Transfer ID" value={t.id} />
              <Row label="Patient" value={t.patientName} />
              <Row
                label="Campaign"
                value={campaign ? `${campaign.id} · ${campaign.condition}` : t.campaignId}
              />
              <Row label="Current hospital" value={t.currentHospital} />
              <Row label="Current treatment phase" value={t.treatmentPhase} />
              <Row label="Required service" value={t.requiredService} />
              <Row label="Submitted" value={t.submitted} />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Urgency</span>
                <UrgencyBadge urgency={t.urgency} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Current status</span>
                <TransferStatusBadge status={t.status} />
              </div>
              {t.receivingHospital && (
                <Row label="Receiving hospital" value={t.receivingHospital} />
              )}
              <Separator />
              <div>
                <p className="text-muted-foreground">Reason for transfer</p>
                <p className="mt-1">{t.reason}</p>
              </div>
              {t.extra && (
                <div>
                  <p className="text-muted-foreground">Additional information</p>
                  <p className="mt-1">{t.extra}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {campaign && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Campaign continuity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  A transfer never creates a new campaign — the patient keeps the same campaign,
                  donors, donations and funding progress.
                </p>
                <Row label="Funds raised" value={naira(campaign.raised)} />
                <Row label="Goal" value={naira(campaign.goal)} />
                <Row label="Donors" value={String(campaign.donors)} />
                <Button asChild variant="outline" size="sm">
                  <Link to="/campaigns/$id" params={{ id: campaign.id }}>
                    Open campaign
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <TransferTimeline transfer={t} />
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary-soft">
            <CardContent className="space-y-3 pt-6 text-sm">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 text-accent-foreground" />
                <p className="font-medium text-accent-foreground">
                  FundEzer Admin is reviewing this transfer request. Your hospital cannot approve its
                  own transfer.
                </p>
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">
                Prototype demo controls — these simulate the FundEzer Admin and receiving-hospital
                response so stakeholders can see the full journey.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isTerminal(t.status)}
                  onClick={async () => {
                    try {
                      await simulateAdvance(t.dbId);
                      toast.success("Admin update applied.");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Update failed.");
                    }
                  }}
                >
                  Simulate next admin update
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isTerminal(t.status)}
                  onClick={async () => {
                    try {
                      await simulateReject(t.dbId);
                      toast.error("Request rejected by FundEzer Admin.");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Update failed.");
                    }
                  }}
                >
                  Simulate rejection
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isTerminal(t.status)}
                  onClick={async () => {
                    try {
                      await cancelTransfer(t.dbId);
                      toast.success("Transfer request cancelled.");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Update failed.");
                    }
                  }}
                >
                  Cancel request
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {transferStatusLabel[t.status]}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}
