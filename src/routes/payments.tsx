import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PortalLayout, StatusBadge } from "@/components/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setPaymentStatus, usePortalState, withdrawFundRequest } from "@/lib/store";
import { toast } from "sonner";
import { campaignWallet, naira } from "@/lib/mock-data";

const periods = [
  { key: "30", label: "Last 30 days" },
  { key: "90", label: "Last 90 days" },
  { key: "365", label: "Last 12 months" },
  { key: "all", label: "All time" },
] as const;

const parseDate = (s: string) => {
  const d = new Date(s.replace(/^Due\s+/i, ""));
  return isNaN(d.getTime()) ? null : d;
};

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments & wallet — FundEzer Hospital Portal" },
      {
        name: "description",
        content: "Milestone payments released to your hospital from campaign wallets, with pending payouts.",
      },
      { property: "og:title", content: "Payments & wallet — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "See paid and scheduled milestone payouts across all campaigns.",
      },
    ],
  }),
  component: Payments,
});

function Payments() {
  const { campaigns } = usePortalState();
  const rows = campaigns.flatMap((c) =>
    c.payments.map((p) => ({ ...p, campaign: c.id, patient: c.patientName })),
  );
  const paid = rows.filter((r) => r.status === "paid").reduce((s, r) => s + r.amount, 0);
  const scheduled = rows
    .filter((r) => r.status === "scheduled" || r.status === "approved" || r.status === "requested")
    .reduce((s, r) => s + r.amount, 0);
  const requests = rows.filter(
    (r) => r.status === "requested" || r.status === "approved" || r.status === "declined",
  );
  const held = campaigns.reduce((s, c) => s + campaignWallet(c).available, 0);

  const [period, setPeriod] = useState<(typeof periods)[number]["key"]>("all");

  const paidRows = rows.filter((r) => r.status === "paid");

  const periodRows = useMemo(() => {
    if (period === "all") return paidRows;
    const days = Number(period);
    const cutoff = Date.now() - days * 86400000;
    return paidRows.filter((r) => {
      const d = parseDate(r.date);
      return d ? d.getTime() >= cutoff : false;
    });
  }, [paidRows, period]);

  const periodTotal = periodRows.reduce((s, r) => s + r.amount, 0);

  const perPatient = useMemo(() => {
    const map = new Map<string, { patient: string; total: number; count: number }>();
    for (const r of periodRows) {
      const e = map.get(r.patient) ?? { patient: r.patient, total: 0, count: 0 };
      e.total += r.amount;
      e.count += 1;
      map.set(r.patient, e);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [periodRows]);

  return (
    <PortalLayout title="Payments & wallet" subtitle="Closed-loop payouts from campaign wallets">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total bills paid to date", naira(paid)],
          ["Pending Payments", naira(scheduled)],
          ["Available Campaign Funds", naira(held)],
        ].map(([label, value]) => (
          <div key={label} className="card-elevated p-5">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base">Total bills paid per period</CardTitle>
          <div className="flex flex-wrap gap-2">
            {periods.map((p) => (
              <Button
                key={p.key}
                size="sm"
                variant={period === p.key ? "default" : "outline"}
                onClick={() => setPeriod(p.key)}
              >
                {p.label}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-extrabold">{naira(periodTotal)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {periodRows.length} milestone payment{periodRows.length === 1 ? "" : "s"} settled in this period.
          </p>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Total bills paid per patient</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {perPatient.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">No payments settled in this period.</p>
          )}
          {perPatient.map((p) => (
            <div key={p.patient} className="flex flex-wrap items-center gap-4 p-5">
              <p className="min-w-44 flex-1 font-semibold">{p.patient}</p>
              <p className="min-w-32 text-sm text-muted-foreground">
                {p.count} payment{p.count === 1 ? "" : "s"}
              </p>
              <p className="min-w-28 font-semibold">{naira(p.total)}</p>
            </div>
          ))}
        </CardContent>
      </Card>


      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Fund requests</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {requests.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">No open fund requests.</p>
          )}
          {requests.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-44 flex-1">
                <p className="font-semibold">{r.milestone}</p>
                <p className="text-sm text-muted-foreground">
                  {r.patient} · {r.campaign} · {r.date}
                </p>
                {r.document && (
                  <p className="text-xs text-muted-foreground">Attached: {r.document}</p>
                )}
                {r.declineReason && (
                  <p className="text-xs text-destructive">Declined: {r.declineReason}</p>
                )}
              </div>
              <p className="min-w-28 font-semibold">{naira(r.amount)}</p>
              <StatusBadge status={r.status} />
              <div className="flex flex-wrap gap-2">
                {r.status === "requested" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await setPaymentStatus(r.campaign, r.id, "approved");
                          toast.success("Fund request approved.");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to approve request.");
                        }
                      }}
                    >
                      Mark approved
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          await setPaymentStatus(r.campaign, r.id, "declined", "Supporting bill required.");
                          toast.success("Fund request declined.");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to decline request.");
                        }
                      }}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await withdrawFundRequest(r.campaign, r.id);
                          toast.success("Fund request withdrawn.");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to withdraw request.");
                        }
                      }}
                    >
                      Withdraw
                    </Button>
                  </>
                )}
                {r.status === "approved" && (
                  <Button
                    size="sm"
                    onClick={async () => {
                      try {
                        await setPaymentStatus(r.campaign, r.id, "paid");
                        toast.success("Payment released to the hospital.");
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Failed to mark paid.");
                      }
                    }}
                  >
                    Mark paid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Milestone payment history</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 p-5">
              <div className="min-w-44 flex-1">
                <p className="font-semibold">{r.milestone}</p>
                <p className="text-sm text-muted-foreground">
                  {r.patient} · {r.campaign}
                </p>
              </div>
              <p className="min-w-32 text-sm text-muted-foreground">{r.date}</p>
              <p className="min-w-28 font-semibold">{naira(r.amount)}</p>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
