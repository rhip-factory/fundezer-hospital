import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BadgeCheck, Save } from "lucide-react";
import { toast } from "sonner";
import { PortalLayout } from "@/components/portal-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CapabilityBadge } from "@/components/transfer-bits";
import {
  capabilityStatusLabel,
  type Capability,
  type CapabilityStatus,
} from "@/lib/transfers";
import { saveCapabilities, useTransferState } from "@/lib/store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Hospital profile & capabilities — FundEzer Hospital Portal" },
      {
        name: "description",
        content:
          "Maintain your hospital profile and keep clinical service and equipment availability up to date.",
      },
      { property: "og:title", content: "Hospital profile & capabilities — FundEzer" },
      {
        property: "og:description",
        content: "Declare which services and equipment your hospital can currently deliver.",
      },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { capabilities, hospital, reviewerName, reviewerRole } = useTransferState();
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<Capability[]>(capabilities);

  useEffect(() => {
    setDraft(capabilities);
  }, [capabilities]);

  const dirty = draft.some(
    (d, i) => capabilities[i] && capabilities[i]!.status !== d.status,
  );

  const set = (id: string, status: CapabilityStatus) =>
    setDraft((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));

  const save = async () => {
    setSaving(true);
    try {
      await saveCapabilities(draft);
      toast.success("Hospital capabilities updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save capabilities.");
    } finally {
      setSaving(false);
    }
  };

  const groups: { key: Capability["group"]; title: string; hint: string }[] = [
    { key: "service", title: "Services", hint: "Clinical services your hospital can deliver" },
    { key: "equipment", title: "Equipment & facilities", hint: "On-site equipment and facilities" },
  ];

  return (
    <PortalLayout
      title="Hospital profile"
      subtitle="Profile details and current clinical capabilities"
      actions={
        <Button size="sm" onClick={save} disabled={!dirty || saving}>
          <Save className="mr-1 h-4 w-4" /> {saving ? "Saving..." : "Save changes"}
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Hospital details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-lg font-bold">{hospital?.name ?? "No hospital linked"}</p>
            <p className="text-muted-foreground">
              {hospital ? `${hospital.city}, ${hospital.state}` : "Sign in to load your hospital"}
            </p>
            {hospital?.accreditation && (
              <p className="text-muted-foreground">Accreditation: {hospital.accreditation}</p>
            )}
            {hospital && <p className="text-muted-foreground">{hospital.beds} beds</p>}
            {hospital?.verified && (
              <div className="flex items-center gap-2 text-accent-foreground">
                <BadgeCheck className="h-4 w-4" />
                <span className="text-xs font-semibold">Verified FundEzer partner</span>
              </div>
            )}
            <p className="pt-2 text-muted-foreground">
              Reviewer: <span className="font-medium text-foreground">{reviewerName || "Guest"}</span>
              {reviewerRole ? ` · ${reviewerRole}` : ""}
            </p>
            <p className="pt-2 text-xs text-muted-foreground">
              Capability availability helps FundEzer Admin match patients who need a transfer to a
              hospital that can treat them.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6 xl:col-span-2">
          {groups.map((g) => (
            <Card key={g.key}>
              <CardHeader>
                <CardTitle className="text-base">{g.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{g.hint}</p>
              </CardHeader>
              <CardContent className="divide-y divide-border p-0">
                {draft.filter((c) => c.group === g.key).length === 0 && (
                  <p className="p-5 text-sm text-muted-foreground">
                    Nothing recorded for your hospital yet.
                  </p>
                )}
                {draft
                  .filter((c) => c.group === g.key)
                  .map((c) => (
                    <div
                      key={c.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium">{c.name}</p>
                        <div className="mt-1">
                          <CapabilityBadge status={c.status} />
                        </div>
                      </div>
                      <Select
                        value={c.status}
                        onValueChange={(v) => set(c.id, v as CapabilityStatus)}
                      >
                        <SelectTrigger className="w-56">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            [
                              "available",
                              "temporarily-unavailable",
                              "not-available",
                            ] as CapabilityStatus[]
                          ).map((s) => (
                            <SelectItem key={s} value={s}>
                              {capabilityStatusLabel[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
}
