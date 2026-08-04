import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PortalLayout, StatusBadge } from "@/components/portal-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { usePortalState } from "@/lib/store";
import { naira } from "@/lib/mock-data";

export const Route = createFileRoute("/patients")({
  head: () => ({
    meta: [
      { title: "Patients — FundEzer Hospital Portal" },
      {
        name: "description",
        content: "Every patient who applied for sponsorship through your hospital, with campaign status.",
      },
      { property: "og:title", content: "Patients — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Search patients by name, condition or application status.",
      },
    ],
  }),
  component: Patients,
});

function Patients() {
  const { applications, campaigns } = usePortalState();
  const [q, setQ] = useState("");

  const rows = applications.filter(
    (a) =>
      a.patient.name.toLowerCase().includes(q.toLowerCase()) ||
      a.condition.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <PortalLayout title="Patients" subtitle="Sponsorship applicants attached to Alliance Hospital">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search patients or conditions"
          className="pl-9"
        />
      </div>

      <Card className="mt-5">
        <CardContent className="divide-y divide-border p-0">
          {rows.map((a) => {
            const campaign = campaigns.find((c) => c.id === a.campaignId);
            return (
              <div key={a.id} className="flex flex-wrap items-center gap-4 p-5">
                <div className="min-w-44 flex-1">
                  <Link
                    to="/applications/$id"
                    params={{ id: a.id }}
                    className="font-semibold hover:text-primary"
                  >
                    {a.patient.name}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {a.patient.age} yrs · {a.patient.gender} · {a.patient.phone}
                  </p>
                </div>
                <div className="min-w-40 flex-1 text-sm">
                  <p className="font-medium">{a.condition}</p>
                  <p className="text-muted-foreground">Applied {a.submitted}</p>
                </div>
                <div className="min-w-32 text-sm">
                  {campaign ? (
                    <Link
                      to="/campaigns/$id"
                      params={{ id: campaign.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {naira(campaign.raised)} raised
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">No campaign yet</span>
                  )}
                </div>
                <StatusBadge status={a.status} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
