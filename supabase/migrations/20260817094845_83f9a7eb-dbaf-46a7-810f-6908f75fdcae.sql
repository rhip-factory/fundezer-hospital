GRANT SELECT ON public.applications TO anon;
GRANT SELECT ON public.campaigns TO anon;
GRANT SELECT ON public.donations TO anon;
GRANT SELECT ON public.payments TO anon;

CREATE POLICY "Anonymous users can view applications"
ON public.applications FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view campaigns"
ON public.campaigns FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view donations"
ON public.donations FOR SELECT TO anon USING (true);

CREATE POLICY "Anonymous users can view payments"
ON public.payments FOR SELECT TO anon USING (true);