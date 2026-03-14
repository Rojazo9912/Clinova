-- Add Stripe subscription columns to clinics table
-- Run in Supabase SQL Editor

ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;

-- Ensure existing columns are present (safe no-ops if already added)
ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'inactive';

COMMENT ON COLUMN clinics.stripe_customer_id IS 'Stripe Customer ID (cus_...)';
COMMENT ON COLUMN clinics.stripe_subscription_id IS 'Active Stripe Subscription ID (sub_...)';
COMMENT ON COLUMN clinics.subscription_status IS 'active | inactive';
COMMENT ON COLUMN clinics.subscription_plan IS 'free | pro';
COMMENT ON COLUMN clinics.subscription_current_period_end IS 'Timestamp when current billing period ends';
