import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  TRANSFER_FLOW,
  capabilityStatusLabel,
  transferStatusLabel,
  urgencyLabel,
  type CapabilityStatus,
  type TransferRequest,
  type TransferStatus,
  type Urgency,
} from "@/lib/transfers";

export function CapabilityBadge({ status }: { status: CapabilityStatus }) {
  const tone: Record<CapabilityStatus, string> = {
    available: "bg-success/15 text-success border-success/30",
    "temporarily-unavailable": "bg-warning/15 text-warning-foreground border-warning/30",
    "not-available": "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", tone[status])}>
      {capabilityStatusLabel[status]}
    </Badge>
  );
}

export function TransferStatusBadge({ status }: { status: TransferStatus }) {
  const tone: Record<TransferStatus, string> = {
    submitted: "bg-secondary text-secondary-foreground border-border",
    "under-review": "bg-warning/15 text-warning-foreground border-warning/30",
    "receiving-hospital-pending": "bg-warning/15 text-warning-foreground border-warning/30",
    accepted: "bg-primary-soft text-accent-foreground border-primary/30",
    "patient-notified": "bg-primary-soft text-accent-foreground border-primary/30",
    "transfer-scheduled": "bg-primary-soft text-accent-foreground border-primary/30",
    "treatment-commenced": "bg-primary-soft text-accent-foreground border-primary/30",
    completed: "bg-success/15 text-success border-success/30",
    rejected: "bg-destructive/10 text-destructive border-destructive/30",
    cancelled: "bg-secondary text-secondary-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", tone[status])}>
      {transferStatusLabel[status]}
    </Badge>
  );
}

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const tone: Record<Urgency, string> = {
    routine: "bg-secondary text-secondary-foreground border-border",
    urgent: "bg-warning/15 text-warning-foreground border-warning/30",
    critical: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", tone[urgency])}>
      {urgencyLabel[urgency]}
    </Badge>
  );
}

export function TransferTimeline({ transfer }: { transfer: TransferRequest }) {
  const done = new Set(transfer.history.map((h) => h.status));
  const isRejected = transfer.status === "rejected";
  const isCancelled = transfer.status === "cancelled";
  const currentIndex = TRANSFER_FLOW.indexOf(transfer.status);

  return (
    <ol className="space-y-3">
      {TRANSFER_FLOW.map((s, i) => {
        const complete = done.has(s) && i < Math.max(currentIndex, 0);
        const current = s === transfer.status;
        const event = [...transfer.history].reverse().find((h) => h.status === s);
        return (
          <li key={s} className="flex gap-3">
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                complete
                  ? "border-success/40 bg-success/15 text-success"
                  : current
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground",
              )}
            >
              {complete ? "✓" : current ? "●" : "○"}
            </span>
            <div className="min-w-0">
              <p
                className={cn(
                  "text-sm",
                  complete || current ? "font-semibold" : "text-muted-foreground",
                )}
              >
                {transferStatusLabel[s]}
              </p>
              {event && (
                <p className="text-xs text-muted-foreground">
                  {event.date}
                  {event.note ? ` · ${event.note}` : ""}
                </p>
              )}
            </div>
          </li>
        );
      })}
      {(isRejected || isCancelled) && (
        <li className="flex gap-3">
          <span
            className={cn(
              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
              isRejected
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border text-muted-foreground",
            )}
          >
            ✕
          </span>
          <div>
            <p className="text-sm font-semibold">
              {isRejected ? "Rejected" : "Cancelled"}
            </p>
            <p className="text-xs text-muted-foreground">
              {transfer.history[transfer.history.length - 1]?.note ?? ""}
            </p>
          </div>
        </li>
      )}
    </ol>
  );
}
