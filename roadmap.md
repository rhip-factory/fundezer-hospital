# FundEzer Hospital Portal — backend connection roadmap

Connect the existing portal to the shared FundEzer backend (ref btdhnaajdbrwvhgoxyqs). No redesign, no duplicate tables, respect RLS.

## Tasks
- [x] Bind Supabase env/keys to the Fundezer project
- [x] Add portal-only extras: applications assessment/risk fields, campaigns.treatment_stage, fund_requests table (+RLS)
- [x] Refresh generated Supabase types
- [x] Auth: sign-up/sign-in creates profile + hospital_users membership so RLS resolves a hospital
- [x] Guest access removed — signed-out visitors are redirected to /auth
- [x] Applications screens on real `applications` + `patients` + `documents`
- [x] Campaigns screens on real `campaigns` + `donations` + `campaign_updates` + `fund_requests`
- [x] Payments screen on `fund_requests`
- [x] Hospital profile on `hospitals` + `hospital_users`
- [x] Capabilities/equipment on `hospital_capabilities` + `services` + `hospital_equipment`
- [x] Transfers on `transfers` + `transfer_events` (+ `patient_hospital_history` on completion)
- [x] Typecheck + build clean; signed-out routing and live hospital list verified in browser
- [ ] Signed-in end-to-end QA (blocked: external Supabase, no test session can be minted)

## Still local / not connected
- Treatment journey strip on the campaign page is derived from campaign + transfer data; `treatment_journeys` / `treatment_updates` tables are not read or written.
- `notifications` and `audit_logs` are not written by the portal (audit_logs is admin-only by RLS).
- Applications list is empty until real applications exist in the database (no seed data was added).

## Blocked / user action
- Leaked-password protection is disabled in Supabase Auth (dashboard setting, user must enable).
- Admin portal already exists separately — no admin UI is built here.
