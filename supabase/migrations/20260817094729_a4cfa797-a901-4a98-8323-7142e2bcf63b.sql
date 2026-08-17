CREATE TYPE public.app_role AS ENUM ('admin', 'hospital_reviewer', 'fundezer_reviewer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  hospital_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE TABLE public.applications (
  id TEXT PRIMARY KEY,
  hospital_id UUID REFERENCES public.profiles(id),
  patient_name TEXT NOT NULL,
  patient_age INTEGER,
  patient_gender TEXT,
  patient_phone TEXT,
  patient_email TEXT,
  patient_nin TEXT,
  patient_address TEXT,
  patient_next_of_kin TEXT,
  patient_emergency_contact TEXT,
  condition TEXT NOT NULL,
  submitted TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  risk_score INTEGER DEFAULT 0,
  risk_flags JSONB DEFAULT '[]'::jsonb,
  story TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  assessment JSONB,
  rejection_reason TEXT,
  campaign_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id TEXT PRIMARY KEY,
  hospital_id UUID REFERENCES public.profiles(id),
  patient_name TEXT NOT NULL,
  condition TEXT NOT NULL,
  goal INTEGER NOT NULL DEFAULT 0,
  raised INTEGER NOT NULL DEFAULT 0,
  donors INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created TEXT,
  treatment_stage INTEGER NOT NULL DEFAULT 0,
  updates JSONB DEFAULT '[]'::jsonb,
  application_id TEXT REFERENCES public.applications(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  donor TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  donation_date TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  milestone TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  payment_date TEXT,
  status TEXT NOT NULL DEFAULT 'requested',
  note TEXT,
  stage TEXT,
  document TEXT,
  decline_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.donations TO authenticated;
GRANT ALL ON public.donations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read profiles"
ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated users can read roles"
ON public.user_roles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Hospital reviewers manage applications"
ON public.applications FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'hospital_reviewer') OR public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'hospital_reviewer') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Hospital reviewers manage campaigns"
ON public.campaigns FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'hospital_reviewer') OR public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'hospital_reviewer') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Hospital reviewers manage donations"
ON public.donations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'hospital_reviewer') OR public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'hospital_reviewer') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Reviewers manage payments"
ON public.payments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'hospital_reviewer') OR public.has_role(auth.uid(), 'fundezer_reviewer') OR public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'hospital_reviewer') OR public.has_role(auth.uid(), 'fundezer_reviewer') OR public.has_role(auth.uid(), 'admin'));

INSERT INTO public.applications (id, patient_name, patient_age, patient_gender, patient_phone, patient_email, patient_nin, patient_address, patient_next_of_kin, patient_emergency_contact, condition, submitted, status, risk_score, risk_flags, story, documents, assessment, campaign_id)
VALUES
('APP-2041', 'Blessing Okonkwo', 34, 'Female', '+234 803 442 1187', 'blessing.okonkwo@mail.com', '•••• •••• 4471', '12 Jabi Close, Jabi, Abuja', 'Chidi Okonkwo (husband)', '+234 806 221 9042', 'Stage 2 breast cancer', '14 Jul 2026', 'pending', 12, '["Phone number seen on 2 other applications"]'::jsonb, 'I was diagnosed with stage 2 breast cancer in March 2026 at a routine screening. I am a mother of three and I run a small tailoring shop in Jabi. Since the diagnosis I have not been able to work full days, and the income that fed my family has almost stopped. My doctors say surgery followed by chemotherapy gives me a strong chance of full recovery, but the cost is far beyond what my family can raise. Every week we wait, the treatment window narrows. With support I can finish treatment, return to my shop, and raise my children.', '[{"name":"Diagnosis summary.pdf","kind":"Diagnosis","uploaded":"12 Jul 2026"},{"name":"Lab results — full blood count.pdf","kind":"Lab report","uploaded":"12 Jul 2026"},{"name":"Prescription sheet.pdf","kind":"Prescription","uploaded":"12 Jul 2026"},{"name":"Chest scan.jpg","kind":"Scan","uploaded":"13 Jul 2026"},{"name":"National ID card.jpg","kind":"Government ID","uploaded":"13 Jul 2026"},{"name":"Referral letter.pdf","kind":"Referral","uploaded":"14 Jul 2026"}]'::jsonb, NULL, NULL),
('APP-2039', 'Ibrahim Musa', 51, 'Male', '+234 809 771 3320', 'ibrahim.musa@mail.com', '•••• •••• 9018', '5 Kubwa Road, Kubwa, Abuja', 'Halima Musa (wife)', '+234 805 110 6633', 'End-stage kidney disease', '13 Jul 2026', 'pending', 64, '["Phone number seen on 2 other applications","Image metadata missing on 1 scan"]'::jsonb, 'For two years I have lived with failing kidneys. I am a driver, and dialysis three times a week means I can no longer keep steady work. My wife sells foodstuff to cover our costs but the sessions alone take more than she earns. The doctors have placed me on the transplant pathway, and they say the outcome is good if we do not delay. I am asking for help so that I can be there for my children.', '[{"name":"Diagnosis summary.pdf","kind":"Diagnosis","uploaded":"12 Jul 2026"},{"name":"Lab results — full blood count.pdf","kind":"Lab report","uploaded":"12 Jul 2026"},{"name":"Prescription sheet.pdf","kind":"Prescription","uploaded":"12 Jul 2026"},{"name":"Chest scan.jpg","kind":"Scan","uploaded":"13 Jul 2026"},{"name":"National ID card.jpg","kind":"Government ID","uploaded":"13 Jul 2026"}]'::jsonb, NULL, NULL),
('APP-2036', 'Grace Adeyemi', 8, 'Female', '+234 812 664 5521', 'tunde.adeyemi@mail.com', '•••• •••• 2204', '27 Wuse II, Abuja', 'Tunde Adeyemi (father)', '+234 812 664 5521', 'Congenital heart defect (VSD)', '10 Jul 2026', 'info-requested', 8, '[]'::jsonb, 'Grace is eight years old and was born with a hole in her heart. She tires after a few minutes of play and has missed most of this school term. Her cardiologist says corrective surgery now would let her grow up like any other child. We have spent our savings on tests and medication and cannot reach the surgery cost on our own.', '[{"name":"Diagnosis summary.pdf","kind":"Diagnosis","uploaded":"12 Jul 2026"},{"name":"Lab results — full blood count.pdf","kind":"Lab report","uploaded":"12 Jul 2026"},{"name":"Prescription sheet.pdf","kind":"Prescription","uploaded":"12 Jul 2026"},{"name":"Chest scan.jpg","kind":"Scan","uploaded":"13 Jul 2026"},{"name":"National ID card.jpg","kind":"Government ID","uploaded":"13 Jul 2026"},{"name":"Echocardiogram report.pdf","kind":"Scan","uploaded":"10 Jul 2026"}]'::jsonb, NULL, NULL),
('APP-2030', 'Samuel Eze', 27, 'Male', '+234 807 900 2214', 'samuel.eze@mail.com', '•••• •••• 7756', '9 Gwarinpa Estate, Abuja', 'Ngozi Eze (mother)', '+234 803 445 0091', 'Compound tibia fracture', '6 Jul 2026', 'approved', 15, '[]'::jsonb, 'A commercial bike accident in June left my right leg broken in two places. I work as a warehouse loader, and I have not earned since. The surgeons say a plate and screws plus physiotherapy will get me walking again in a few months. Without the surgery I risk permanent disability.', '[{"name":"Diagnosis summary.pdf","kind":"Diagnosis","uploaded":"12 Jul 2026"},{"name":"Lab results — full blood count.pdf","kind":"Lab report","uploaded":"12 Jul 2026"},{"name":"Prescription sheet.pdf","kind":"Prescription","uploaded":"12 Jul 2026"},{"name":"Chest scan.jpg","kind":"Scan","uploaded":"13 Jul 2026"},{"name":"National ID card.jpg","kind":"Government ID","uploaded":"13 Jul 2026"}]'::jsonb, '{"diagnosis":"Compound fracture of right tibia with soft tissue injury","investigation":"X-ray right leg (AP/lateral), full blood count, clotting profile","procedure":"Open reduction and internal fixation with plate and screws","admission":"6 days","rehabilitation":"3 months physiotherapy; weight-bearing from week 6","urgency":"urgent","recovery":"12–16 weeks with physiotherapy","costs":{"diagnosis":[100000,155000],"investigation":[80000,120000],"procedure":[1350000,1820000],"admission":[180000,260000],"rehabilitation":[200000,320000],"recovery":[90000,140000],"other":[50000,85000]}}'::jsonb, 'CMP-118');

INSERT INTO public.campaigns (id, patient_name, condition, goal, raised, donors, status, created, treatment_stage, updates, application_id)
VALUES
('CMP-118', 'Samuel Eze', 'Compound tibia fracture', 3600000, 2415000, 87, 'active', '7 Jul 2026', 2, '[{"date":"28 Jul 2026","note":"Surgery completed successfully; patient stable on ward 3."},{"date":"20 Jul 2026","note":"Pre-operative investigations concluded, surgery scheduled."}]'::jsonb, 'APP-2030'),
('CMP-112', 'Fatima Bello', 'Cataract surgery (both eyes)', 980000, 980000, 54, 'completed', '12 Jun 2026', 4, '[{"date":"9 Jul 2026","note":"Discharged with full vision restored in both eyes."},{"date":"1 Jul 2026","note":"Second eye operated, recovery on track."}]'::jsonb, NULL),
('CMP-105', 'Daniel Okoro', 'Appendectomy', 720000, 318000, 23, 'active', '26 Jun 2026', 1, '[{"date":"27 Jun 2026","note":"Campaign published and verified by Alliance Hospital."}]'::jsonb, NULL);

INSERT INTO public.donations (campaign_id, donor, amount, donation_date)
VALUES
('CMP-118', 'Anonymous', 250000, '2 Aug 2026'),
('CMP-118', 'Chinelo A.', 50000, '1 Aug 2026'),
('CMP-118', 'Zenith Staff Circle', 400000, '30 Jul 2026'),
('CMP-118', 'Anonymous', 15000, '29 Jul 2026'),
('CMP-118', 'Musa B.', 100000, '27 Jul 2026'),
('CMP-112', 'Anonymous', 300000, '24 Jun 2026'),
('CMP-112', 'Hope Foundation', 500000, '20 Jun 2026'),
('CMP-105', 'Anonymous', 20000, '3 Aug 2026'),
('CMP-105', 'Ayo T.', 75000, '31 Jul 2026');

INSERT INTO public.payments (id, campaign_id, milestone, amount, payment_date, status, note, stage, document, decline_reason)
VALUES
('PAY-701', 'CMP-118', 'Investigations & admission', 420000, '18 Jul 2026', 'paid', NULL, NULL, NULL, NULL),
('PAY-702', 'CMP-118', 'Surgical procedure', 1400000, '27 Jul 2026', 'paid', NULL, NULL, NULL, NULL),
('PAY-703', 'CMP-118', 'Post-operative care & physiotherapy', 780000, 'Due 20 Aug 2026', 'scheduled', NULL, NULL, NULL, NULL),
('PAY-704', 'CMP-112', 'Pre-op assessment', 180000, '22 Jun 2026', 'paid', NULL, NULL, NULL, NULL),
('PAY-705', 'CMP-112', 'Bilateral surgery', 640000, '30 Jun 2026', 'paid', NULL, NULL, NULL, NULL),
('PAY-706', 'CMP-112', 'Follow-up review', 160000, '8 Jul 2026', 'paid', NULL, NULL, NULL, NULL),
('PAY-707', 'CMP-105', 'Admission deposit', 200000, '1 Jul 2026', 'paid', NULL, NULL, NULL, NULL);