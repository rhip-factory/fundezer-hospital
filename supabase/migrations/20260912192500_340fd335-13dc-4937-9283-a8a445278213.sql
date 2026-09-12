ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS assessment jsonb,
  ADD COLUMN IF NOT EXISTS risk_score integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS risk_flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS rejection_reason text;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS treatment_stage integer NOT NULL DEFAULT 0;

CREATE TABLE public.fund_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  milestone text NOT NULL,
  amount numeric NOT NULL,
  stage text,
  note text,
  document text,
  status text NOT NULL DEFAULT 'requested',
  requested_on date NOT NULL DEFAULT current_date,
  decline_reason text,
  requested_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fund_requests_status_check CHECK (status IN ('requested','approved','scheduled','paid','declined'))
);

CREATE INDEX fund_requests_campaign_idx ON public.fund_requests(campaign_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fund_requests TO authenticated;
GRANT ALL ON public.fund_requests TO service_role;

ALTER TABLE public.fund_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY fund_requests_admin_all ON public.fund_requests
  FOR ALL TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY fund_requests_hospital_read ON public.fund_requests
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = fund_requests.campaign_id
      AND c.hospital_id IS NOT NULL
      AND private.is_hospital_member(auth.uid(), c.hospital_id)
  ));

CREATE POLICY fund_requests_hospital_create ON public.fund_requests
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = fund_requests.campaign_id
      AND c.hospital_id IS NOT NULL
      AND private.is_hospital_member(auth.uid(), c.hospital_id)
  ));

CREATE POLICY fund_requests_hospital_update ON public.fund_requests
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = fund_requests.campaign_id
      AND c.hospital_id IS NOT NULL
      AND private.is_hospital_member(auth.uid(), c.hospital_id)
  ));

CREATE POLICY fund_requests_hospital_withdraw ON public.fund_requests
  FOR DELETE TO authenticated
  USING (status = 'requested' AND EXISTS (
    SELECT 1 FROM public.campaigns c
    WHERE c.id = fund_requests.campaign_id
      AND c.hospital_id IS NOT NULL
      AND private.is_hospital_member(auth.uid(), c.hospital_id)
  ));

CREATE TRIGGER trg_fund_requests_updated
  BEFORE UPDATE ON public.fund_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE POLICY campaigns_hospital_create ON public.campaigns
  FOR INSERT TO authenticated
  WITH CHECK (hospital_id IS NOT NULL AND private.is_hospital_member(auth.uid(), hospital_id));

CREATE POLICY campaigns_hospital_update ON public.campaigns
  FOR UPDATE TO authenticated
  USING (hospital_id IS NOT NULL AND private.is_hospital_member(auth.uid(), hospital_id));