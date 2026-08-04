import { createFileRoute } from "@tanstack/react-router";
import { PortalLayout, StatusBadge } from "@/components/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortalState } from "@/lib/store";
import { naira } from "@/lib/mock-data";

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
  const scheduled = rows.filter((r) => r.status === "scheduled").reduce((s, r) => s + r.amount, 0);
  const held = campaigns.reduce(
    (s, c) => s + (c.raised - c.payments.filter((p) => p.status === "paid").reduce((x, p) => x + p.amount, 0)),
    0,
  );

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
        <CardHeader>
          <CardTitle className="text-base">Milestone payment history</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border p-0">
          {rows.map((r, i) => (
            <div key={i} className="flex flex-wrap items-center gap-4 p-5">
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
