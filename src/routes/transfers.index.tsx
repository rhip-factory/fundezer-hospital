import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PortalLayout } from "@/components/portal-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransferStatusBadge, UrgencyBadge } from "@/components/transfer-bits";
import { transferStatusLabel, useTransferState, type TransferStatus } from "@/lib/transfers";

export const Route = createFileRoute("/transfers/")({
  head: () => ({
    meta: [
      { title: "Transfer requests — FundEzer Hospital Portal" },
      {
        name: "description",
        content:
          "Track patient transfer requests your hospital has submitted to FundEzer Admin for review.",
      },
      { property: "og:title", content: "Transfer requests — FundEzer Hospital Portal" },
      {
        property: "og:description",
        content: "Monitor the status of every patient transfer request raised by your hospital.",
      },
    ],
  }),
  component: Transfers,
});

const statuses: TransferStatus[] = [
  "submitted",
  "under-review",
  "receiving-hospital-pending",
  "accepted",
  "patient-notified",
  "transfer-scheduled",
  "treatment-commenced",
  "completed",
  "rejected",
  "cancelled",
];

function Transfers() {
  const { transfers } = useTransferState();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  const rows = transfers.filter((t) => {
    const matchQ =
      q.trim() === "" ||
      [t.id, t.patientName, t.requiredService, t.campaignId]
        .join(" ")
        .toLowerCase()
        .includes(q.trim().toLowerCase());
    return matchQ && (status === "all" || t.status === status);
  });

  return (
    <PortalLayout
      title="Transfer requests"
      subtitle="Patient transfer requests submitted by your hospital to FundEzer Admin"
    >
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search transfer ID, patient or service"
              className="max-w-xs"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {transferStatusLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mt-5 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transfer ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Required service</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-sm text-muted-foreground">
                      No transfer requests match your filters.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.id}</TableCell>
                    <TableCell className="whitespace-nowrap">{t.patientName}</TableCell>
                    <TableCell className="whitespace-nowrap">{t.requiredService}</TableCell>
                    <TableCell>
                      <UrgencyBadge urgency={t.urgency} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{t.submitted}</TableCell>
                    <TableCell>
                      <TransferStatusBadge status={t.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link to="/transfers/$id" params={{ id: t.id }}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </PortalLayout>
  );
}
