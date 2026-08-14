import { useState } from "react";
import { Banknote } from "lucide-react";
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
import { naira, type Campaign } from "@/lib/mock-data";
import { requestFunds } from "@/lib/store";

export function RequestFundsDialog({
  campaign,
  available,
  stages,
}: {
  campaign: Campaign;
  available: number;
  stages: string[];
}) {
  const [open, setOpen] = useState(false);
  const [milestone, setMilestone] = useState("");
  const [amount, setAmount] = useState("");
  const [stage, setStage] = useState(stages[Math.min(campaign.treatmentStage, stages.length - 1)] ?? "");
  const [note, setNote] = useState("");
  const [document, setDocument] = useState("");

  const value = Number(amount.replace(/\D/g, "")) || 0;

  const submit = () => {
    if (milestone.trim().length < 3) {
      toast.error("Describe the milestone or purpose of this request.");
      return;
    }
    if (value <= 0) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (value > available) {
      toast.error(`Amount exceeds the available balance of ${naira(available)}.`);
      return;
    }
    requestFunds(campaign.id, {
      milestone: milestone.trim().slice(0, 120),
      amount: value,
      stage,
      note: note.trim().slice(0, 500) || undefined,
      document: document.trim().slice(0, 120) || undefined,
    });
    toast.success("Fund request submitted to FundEzer for approval.");
    setOpen(false);
    setMilestone("");
    setAmount("");
    setNote("");
    setDocument("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" disabled={campaign.status !== "active" || available <= 0}>
          <Banknote className="mr-1 h-4 w-4" /> Request funds
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request funds — {campaign.patientName}</DialogTitle>
          <DialogDescription>
            Available balance {naira(available)}. Requests are reviewed by FundEzer before release to the
            hospital.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rf-milestone">Milestone / purpose</Label>
            <Input
              id="rf-milestone"
              maxLength={120}
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              placeholder="e.g. Surgery deposit"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="rf-amount">Amount (₦)</Label>
              <Input
                id="rf-amount"
                inputMode="numeric"
                value={value ? value.toLocaleString("en-NG") : ""}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Treatment stage</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rf-doc">Supporting bill / invoice (optional)</Label>
            <Input
              id="rf-doc"
              maxLength={120}
              value={document}
              onChange={(e) => setDocument(e.target.value)}
              placeholder="e.g. Theatre invoice 4471.pdf"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="rf-note">Note to FundEzer (optional)</Label>
            <Textarea
              id="rf-note"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Anything the reviewer should know about this drawdown"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Submit request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
