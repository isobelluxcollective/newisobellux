-- Expand subscription tier values for new pricing structure
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_tier_check
  CHECK (
    subscription_tier IS NULL OR subscription_tier IN (
      'bundle1', 'bundle3', 'bundle6', 'bundle12',
      'sub6', 'sub14',
      'collector', 'aficionado', 'icon'
    )
  );
