import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { PortalLayout, StatusBadge, RiskPill } from "@/components/portal-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePortalState } from "@/lib/store";

const filters = ["all", "pending", "info-requested", "approved", "rejected"] as const;

export const Route = createFileRoute("/applications")({
  head: () => ({
    meta: [
      { title: "Patient applications — FundEzer Hospital Portal" },
      {
        name: "description",
        content: "Review sponsorship applications submitted by patients to your hospital.",
      },
      { property: "og:title", content: "Patient applications — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Screen, assess and approve patient sponsorship applications.",
      },
    ],
  }),
  component: Applications,
});

function Applications() {
  const { applications } = usePortalState();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");

  const list = applications.filter(
    (a) =>
      (filter === "all" || a.status === filter) &&
      (a.patient.name.toLowerCase().includes(q.toLowerCase()) ||
        a.condition.toLowerCase().includes(q.toLowerCase()) ||
        a.id.toLowerCase().includes(q.toLowerCase())),
  );

  return (
    <PortalLayout title="Patient applications" subtitle="Sponsorship requests routed to Alliance Hospital">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by patient, condition or ID"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f.replace("-", " ")}
            </Button>
          ))}
        </div>
      </div>

      <Card className="mt-5">
        <CardContent className="divide-y divide-border p-0">
          {list.length === 0 && (
            <p className="p-6 text-sm text-muted-foreground">No applications match this filter.</p>
          )}
          {list.map((a) => (
            <Link
              key={a.id}
              to="/applications/$id"
              params={{ id: a.id }}
              className="flex flex-wrap items-center gap-4 p-5 transition-colors hover:bg-secondary"
            >
              <div className="min-w-48 flex-1">
                <p className="font-semibold">{a.patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {a.id} · {a.patient.age} yrs · {a.patient.gender}
                </p>
              </div>
              <div className="min-w-44 flex-1 text-sm">
                <p className="font-medium">{a.condition}</p>
                <p className="text-muted-foreground">Submitted {a.submitted}</p>
              </div>
              <RiskPill score={a.riskScore} />
              <StatusBadge status={a.status} />
            </Link>
          ))}
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
