-- Add ticket fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ticket_balance int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ticket_expiry timestamptz,
  ADD COLUMN IF NOT EXISTS subscription_tier text;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (subscription_tier IS NULL OR subscription_tier IN ('collector','aficionado','icon'));

-- Per-raffle total ticket pool (drives 10% per-user cap)
ALTER TABLE public.raffles
  ADD COLUMN IF NOT EXISTS total_ticket_pool int NOT NULL DEFAULT 10000;

-- Entries table
CREATE TABLE IF NOT EXISTS public.entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raffle_id uuid NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  tickets int NOT NULL CHECK (tickets > 0),
  source text NOT NULL CHECK (source IN ('subscription','oneoff','postal')),
  amount_paid_pence int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entries_user_idx ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS entries_raffle_idx ON public.entries(raffle_id);

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own entries"
  ON public.entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all entries"
  ON public.entries FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert entries"
  ON public.entries FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ticket grants log (idempotency)
CREATE TABLE IF NOT EXISTS public.ticket_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN ('subscription_renewal','oneoff','postal','reset')),
  stripe_event_id text UNIQUE,
  tickets_granted int NOT NULL,
  amount_paid_pence int NOT NULL DEFAULT 0,
  tier text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ticket_grants_user_idx ON public.ticket_grants(user_id, created_at DESC);

ALTER TABLE public.ticket_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own ticket grants"
  ON public.ticket_grants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Server function: enter draw with tickets, enforcing 10% cap and balance
CREATE OR REPLACE FUNCTION public.enter_draw_with_tickets(
  p_raffle_id uuid,
  p_tickets int,
  p_source text DEFAULT 'subscription'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_status text;
  v_pool int;
  v_max_per_user int;
  v_existing int;
  v_balance int;
  v_entry_id uuid;
  v_new_balance int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  IF p_tickets IS NULL OR p_tickets < 1 THEN
    RAISE EXCEPTION 'INVALID_TICKETS';
  END IF;

  IF p_source NOT IN ('subscription','oneoff') THEN
    RAISE EXCEPTION 'INVALID_SOURCE';
  END IF;

  SELECT status, total_ticket_pool INTO v_status, v_pool
  FROM public.raffles WHERE id = p_raffle_id FOR SHARE;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'RAFFLE_NOT_FOUND';
  END IF;
  IF v_status <> 'live' THEN
    RAISE EXCEPTION 'RAFFLE_NOT_LIVE';
  END IF;

  v_max_per_user := GREATEST(1, (v_pool / 10));

  SELECT COALESCE(SUM(tickets),0) INTO v_existing
  FROM public.entries
  WHERE user_id = v_user_id AND raffle_id = p_raffle_id;

  IF (v_existing + p_tickets) > v_max_per_user THEN
    RAISE EXCEPTION 'TICKET_CAP_EXCEEDED:%', v_max_per_user;
  END IF;

  SELECT ticket_balance INTO v_balance
  FROM public.profiles WHERE id = v_user_id FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_tickets THEN
    RAISE EXCEPTION 'INSUFFICIENT_BALANCE';
  END IF;

  UPDATE public.profiles
  SET ticket_balance = ticket_balance - p_tickets,
      updated_at = now()
  WHERE id = v_user_id
  RETURNING ticket_balance INTO v_new_balance;

  INSERT INTO public.entries (user_id, raffle_id, tickets, source)
  VALUES (v_user_id, p_raffle_id, p_tickets, p_source)
  RETURNING id INTO v_entry_id;

  RETURN jsonb_build_object(
    'entry_id', v_entry_id,
    'new_balance', v_new_balance,
    'max_per_user', v_max_per_user
  );
END;
$$;

REVOKE ALL ON FUNCTION public.enter_draw_with_tickets(uuid, int, text) FROM public;
GRANT EXECUTE ON FUNCTION public.enter_draw_with_tickets(uuid, int, text) TO authenticated;

-- Lookup helper: how many tickets has the user already put into this draw + cap
CREATE OR REPLACE FUNCTION public.get_draw_ticket_info(p_raffle_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_pool int;
  v_max_per_user int;
  v_existing int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;

  SELECT total_ticket_pool INTO v_pool
  FROM public.raffles WHERE id = p_raffle_id;

  IF v_pool IS NULL THEN
    RAISE EXCEPTION 'RAFFLE_NOT_FOUND';
  END IF;

  v_max_per_user := GREATEST(1, (v_pool / 10));

  SELECT COALESCE(SUM(tickets),0) INTO v_existing
  FROM public.entries
  WHERE user_id = v_user_id AND raffle_id = p_raffle_id;

  RETURN jsonb_build_object(
    'user_existing', v_existing,
    'max_per_user', v_max_per_user,
    'remaining_for_user', GREATEST(0, v_max_per_user - v_existing)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_draw_ticket_info(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.get_draw_ticket_info(uuid) TO authenticated;