import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRightLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Campaign } from "@/lib/mock-data";
import {
  CAPABILITY_SERVICES,
  createTransferRequest,
  urgencyLabel,
  type TransferRequest,
  type Urgency,
} from "@/lib/transfers";

export function RequestTransferDialog({
  campaign,
  phases,
}: {
  campaign: Campaign;
  phases: string[];
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState(
    phases[Math.min(campaign.treatmentStage, phases.length - 1)] ?? "",
  );
  const [service, setService] = useState("");
  const [reason, setReason] = useState("");
  const [urgency, setUrgency] = useState<Urgency>("routine");
  const [extra, setExtra] = useState("");
  const [created, setCreated] = useState<TransferRequest | null>(null);

  const reset = () => {
    setService("");
    setReason("");
    setUrgency("routine");
    setExtra("");
    setCreated(null);
  };

  const submit = () => {
    if (!phase) {
      toast.error("Select the current treatment phase.");
      return;
    }
    if (!service) {
      toast.error("Select the required service.");
      return;
    }
    if (reason.trim().length < 10) {
      toast.error("Give a reason for the transfer (at least 10 characters).");
      return;
    }
    const t = createTransferRequest({
      campaignId: campaign.id,
      patientName: campaign.patientName,
      treatmentPhase: phase,
      requiredService: service,
      reason: reason.trim().slice(0, 600),
      urgency,
      extra: extra.trim().slice(0, 600) || undefined,
    });
    setCreated(t);
    toast.success(`Transfer request ${t.id} submitted to FundEzer Admin.`);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <ArrowRightLeft className="mr-1 h-4 w-4" /> Request patient transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {created ? (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-success" /> Transfer request submitted
              </DialogTitle>
              <DialogDescription>
                Your transfer request has been submitted to FundEzer Admin for review.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 rounded-lg border border-border bg-secondary/40 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transfer ID</span>
                <span className="font-bold">{created.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">Pending Admin Review</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient</span>
                <span className="font-medium">{created.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Campaign</span>
                <span className="font-medium">{created.campaignId}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button asChild>
                <Link to="/transfers/$id" params={{ id: created.id }}>
                  View transfer status
                </Link>
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle>Request patient transfer</DialogTitle>
              <DialogDescription>
                FundEzer Admin reviews every transfer request. The campaign, donors and funding
                progress stay with the patient — no new campaign is created.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Patient</Label>
                <Input value={campaign.patientName} readOnly className="bg-secondary/50" />
              </div>
              <div className="space-y-1.5">
                <Label>Campaign</Label>
                <Input
                  value={`${campaign.id} · ${campaign.condition}`}
                  readOnly
                  className="bg-secondary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Treatment phase</Label>
                <Select value={phase} onValueChange={setPhase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Required service</Label>
                <Select value={service} onValueChange={setService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPABILITY_SERVICES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Urgency</Label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as Urgency)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(["routine", "urgent", "critical"] as Urgency[]).map((u) => (
                    <SelectItem key={u} value={u}>
                      {urgencyLabel[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Reason for transfer</Label>
              <Textarea
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why does this patient need to be transferred?"
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Additional information <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                rows={2}
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="Clinical notes, preferred timing, mobility needs…"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit}>Submit transfer request</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
