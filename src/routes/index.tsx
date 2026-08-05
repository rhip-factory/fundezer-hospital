import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, HeartHandshake, Wallet, TrendingUp, ArrowRight, ShieldAlert } from "lucide-react";
import { PortalLayout, StatusBadge, RiskPill } from "@/components/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { usePortalState } from "@/lib/store";
import { naira } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FundEzer Hospital Portal" },
      {
        name: "description",
        content:
          "Overview of pending patient applications, active sponsorship campaigns and payments received at your hospital.",
      },
      { property: "og:title", content: "Dashboard — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Track applications, campaign funding and hospital payments in one place.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { applications, campaigns } = usePortalState();
  const pending = applications.filter((a) => a.status === "pending");
  const active = campaigns.filter((c) => c.status === "active");
  const raised = campaigns.reduce((s, c) => s + c.raised, 0);
  const received = campaigns
    .flatMap((c) => c.payments)
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);

  const stats = [
    { label: "Pending reviews", value: String(pending.length), icon: ClipboardList, hint: "Awaiting hospital assessment" },
    { label: "Active campaigns", value: String(active.length), icon: HeartHandshake, hint: "Currently raising funds" },
    { label: "Funds Needed", value: naira(raised), icon: TrendingUp, hint: "Across all campaigns" },
    { label: "Funds Raised", value: naira(received), icon: Wallet, hint: "Released on milestones" },
  ];

  return (
    <PortalLayout title="Dashboard" subtitle="Alliance Hospital · Abuja pilot">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-elevated p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-3 text-2xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Applications awaiting review</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/applications">
                View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 && (
              <p className="text-sm text-muted-foreground">No applications waiting on you. Nice work.</p>
            )}
            {pending.map((a) => (
              <Link
                key={a.id}
                to="/applications/$id"
                params={{ id: a.id }}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-4 transition-colors hover:bg-secondary"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{a.patient.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {a.condition} · submitted {a.submitted}
                  </p>
                </div>
                <RiskPill score={a.riskScore} />
                <StatusBadge status={a.status} />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fraud screening</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {applications
              .filter((a) => a.riskFlags.length > 0)
              .map((a) => (
                <div key={a.id} className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <span className="text-sm font-semibold">{a.patient.name}</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {a.riskFlags.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            <p className="text-xs text-muted-foreground">
              Every application is screened for duplicate stories, images, IDs and document manipulation before
              publication.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Campaign progress</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link to="/campaigns">
              All campaigns <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {campaigns.map((c) => {
            const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
            return (
              <Link
                key={c.id}
                to="/campaigns/$id"
                params={{ id: c.id }}
                className="rounded-xl border border-border p-4 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{c.patientName}</p>
                  <StatusBadge status={c.status} />
                </div>
                <p className="text-sm text-muted-foreground">{c.condition}</p>
                <Progress value={pct} className="mt-3" />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>
                    {naira(c.raised)} of {naira(c.goal)}
                  </span>
                  <span>
                    {pct}% · {c.donors} donors
                  </span>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
