-- Stripe Integration Migration
-- Add Stripe-related fields to users table for subscription management

-- Add Stripe customer and subscription tracking fields
ALTER TABLE public.users 
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN stripe_subscription_id TEXT,
ADD COLUMN subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
ADD COLUMN subscription_period_start TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN subscription_cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Create index for efficient Stripe lookups
CREATE INDEX idx_users_stripe_customer_id ON public.users(stripe_customer_id);
CREATE INDEX idx_users_stripe_subscription_id ON public.users(stripe_subscription_id);
CREATE INDEX idx_users_subscription_status ON public.users(subscription_status);

-- Update RLS policies to include new fields
-- Users can view their own subscription data
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (but not Stripe fields directly)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Add comments for documentation
COMMENT ON COLUMN public.users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.users.stripe_subscription_id IS 'Current active Stripe subscription ID';
COMMENT ON COLUMN public.users.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN public.users.subscription_period_start IS 'Current billing period start date';
COMMENT ON COLUMN public.users.subscription_period_end IS 'Current billing period end date';
COMMENT ON COLUMN public.users.subscription_cancel_at_period_end IS 'Whether subscription will cancel at period end';
