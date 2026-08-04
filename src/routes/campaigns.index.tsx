import { createFileRoute, Link } from "@tanstack/react-router";
import { PortalLayout, StatusBadge } from "@/components/portal-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { usePortalState } from "@/lib/store";
import { naira } from "@/lib/mock-data";

export const Route = createFileRoute("/campaigns/")({
  head: () => ({
    meta: [
      { title: "Campaigns — FundEzer Hospital Portal" },
      {
        name: "description",
        content: "Track funding progress for every verified campaign published by your hospital.",
      },
      { property: "og:title", content: "Campaigns — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Monitor donations, treatment progress and payouts for hospital-verified campaigns.",
      },
    ],
  }),
  component: Campaigns,
});

function Campaigns() {
  const { campaigns } = usePortalState();
  return (
    <PortalLayout title="Campaigns" subtitle="Verified sponsorship campaigns from your hospital">
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((c) => {
          const pct = Math.min(100, Math.round((c.raised / c.goal) * 100));
          return (
            <Link key={c.id} to="/campaigns/$id" params={{ id: c.id }}>
              <Card className="h-full transition-shadow hover:shadow-lg">
                <CardContent className="space-y-3 pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{c.patientName}</p>
                      <p className="text-sm text-muted-foreground">{c.condition}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                  <Progress value={pct} />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{naira(c.raised)}</span>
                    <span className="text-muted-foreground">of {naira(c.goal)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pct}% funded</span>
                    <span>
                      {c.donors} donors · {c.id}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PortalLayout>
  );
}
