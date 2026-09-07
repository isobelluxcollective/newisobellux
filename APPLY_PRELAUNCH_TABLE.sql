-- Paste this into Supabase → SQL Editor → Run
-- Fixes: signup form error + admin dashboard "prelaunch_signups" missing

CREATE TABLE IF NOT EXISTS public.prelaunch_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  mobile text NOT NULL,
  mobile_normalized text NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'prelaunch',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT prelaunch_signups_email_unique UNIQUE (email),
  CONSTRAINT prelaunch_signups_mobile_unique UNIQUE (mobile_normalized)
);

CREATE INDEX IF NOT EXISTS prelaunch_signups_created_at_idx
  ON public.prelaunch_signups (created_at DESC);

ALTER TABLE public.prelaunch_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read prelaunch signups" ON public.prelaunch_signups;

CREATE POLICY "Admins can read prelaunch signups"
  ON public.prelaunch_signups
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
