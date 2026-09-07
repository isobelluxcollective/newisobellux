-- Stage 1 pre-launch waitlist.
-- Designed to survive into Stage 2: rows can later be linked to auth.users / profiles by email
-- without rebuilding this capture path.

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

-- Public inserts go through the service-role server function only.
-- Admins can read/export from the Supabase dashboard (service role / SQL editor / CSV export).
CREATE POLICY "Admins can read prelaunch signups"
  ON public.prelaunch_signups
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

COMMENT ON TABLE public.prelaunch_signups IS
  'Stage 1 pre-launch waitlist (name, email, mobile). Exportable via Supabase Table Editor CSV. Stage 2 can link rows to profiles by email.';
