# FundEzer Hospital Portal — backend connection roadmap

Connect the existing portal to the shared FundEzer backend (ref btdhnaajdbrwvhgoxyqs). No redesign, no duplicate tables, respect RLS.

## Tasks
- [x] Bind Supabase env/keys to the Fundezer project
- [x] Add portal-only extras: applications assessment/risk fields, campaigns.treatment_stage, fund_requests table (+RLS)
- [ ] Seed demo applications + fund requests (interrupted run, re-run)
- [ ] Refresh generated Supabase types
- [ ] Auth: sign-up/sign-in creates profile + hospital_users membership so RLS resolves a hospital
- [ ] Applications screens on real `applications` + `patients` + `documents`
- [ ] Campaigns screens on real `campaigns` + `donations` + `campaign_updates` + `fund_requests`
- [ ] Payments screen on `fund_requests`
- [ ] Hospital profile on `hospitals` + `hospital_users`
- [ ] Capabilities/equipment on `hospital_capabilities` + `services` + `hospital_equipment`
- [ ] Transfers on `transfers` + `transfer_events` (+ `patient_hospital_history` on completion)
- [ ] Treatment journey/updates on `treatment_journeys` + `treatment_updates`
- [ ] QA: login, isolation, persistence after refresh
- [ ] Report what is connected vs still mock

## Blocked / user action
- Leaked-password protection is disabled in Supabase Auth (dashboard setting, user must enable).

## Admin Portal (new request)
- Admin route(s) connected to Fundezer: review transfers (approve/reject/advance), approve/decline fund requests, update campaigns (approve updates, status changes)
- Reuse portal design system; admin role via user_roles/hospital-independent check
- Do not let hospital users approve their own requests
