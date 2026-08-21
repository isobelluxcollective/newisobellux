-- Role system
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Raffles table
CREATE TABLE public.raffles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_number text NOT NULL UNIQUE,
  title text NOT NULL,
  italic text NOT NULL DEFAULT '',
  prize_name text NOT NULL,
  prize_short text NOT NULL,
  description text NOT NULL DEFAULT '',
  ticket_price numeric(10,2) NOT NULL DEFAULT 10.00,
  hero_image_url text NOT NULL DEFAULT '',
  draw_date timestamptz NOT NULL,
  odds text NOT NULL DEFAULT '',
  retail_value text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'live' CHECK (status IN ('draft','live','closed')),
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  winner_first_name text,
  winner_city text,
  winner_quote text,
  winner_instagram text,
  winner_image_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX raffles_status_idx ON public.raffles(status);
CREATE INDEX raffles_featured_idx ON public.raffles(featured) WHERE featured = true;
CREATE INDEX raffles_draw_date_idx ON public.raffles(draw_date);

ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view live and closed raffles"
ON public.raffles FOR SELECT TO anon, authenticated
USING (status IN ('live','closed'));

CREATE POLICY "Admins can view all raffles"
ON public.raffles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert raffles"
ON public.raffles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update raffles"
ON public.raffles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete raffles"
ON public.raffles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER raffles_set_updated_at
BEFORE UPDATE ON public.raffles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();