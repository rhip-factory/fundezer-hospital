# Hospital fund requests (milestone drawdown)

Today the hospital can only see milestone payments that already exist. This adds the missing step: the reviewer asks FundEzer to release money from a campaign wallet, and that request is tracked until it is paid.

## How it works

1. On a campaign page, the reviewer clicks **Request funds**.
2. A dialog collects: milestone/purpose (e.g. Surgery deposit), amount, treatment stage it relates to, optional note, and an optional supporting document name (bill/invoice — prototype only, no real upload).
3. Validation: amount must be greater than zero and cannot exceed the campaign's **available balance** (raised minus already paid/requested).
4. Submitting creates a request with status **requested** and it appears:
   - in the campaign's Milestone payments list,
   - in a new **Fund requests** section on the Payments page,
   - as a pending amount in the wallet summary (available balance drops by the requested amount).
5. Statuses move: `requested` → `approved` → `paid`, or `declined` with a reason. Since this is a prototype with no FundEzer-side admin, the Payments page includes simulate controls (Mark approved / Mark paid / Decline) so the whole loop can be demoed.
6. Once paid, the amount flows into the existing "Total bills paid to date", per-patient and per-period reports automatically.

## Rules

- Requests are only possible on **active** campaigns with a positive available balance.
- A request cannot be edited after submission; it can be **withdrawn** while still in `requested`.
- Declined requests release their reserved amount back to available balance.
- Toasts confirm each action, consistent with the rest of the portal.

## Technical notes

- Extend the campaign payment type in `src/lib/mock-data.ts` to `{ id, milestone, amount, date, status: "requested" | "approved" | "scheduled" | "paid" | "declined", note?, stage?, document?, declineReason? }`, keeping existing seed rows valid.
- Add store helpers in `src/lib/store.ts`: `requestFunds(campaignId, payload)`, `setPaymentStatus(campaignId, paymentId, status, reason?)`.
- New component `src/components/request-funds-dialog.tsx` using the existing shadcn Dialog, Input, Textarea, Select and Button primitives.
- `src/routes/campaigns.$id.tsx`: add the Request funds button + dialog, and show requested/approved amounts in the wallet card (reserved vs available).
- `src/routes/payments.tsx`: add a Fund requests card above the payment history with the status actions; keep existing totals logic, counting only `paid`.
- `StatusBadge` in `src/components/portal-layout.tsx` gains styles for the new statuses.
