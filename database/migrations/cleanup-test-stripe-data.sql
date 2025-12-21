-- Clean up test mode Stripe data from restaurants table
-- Run this in Supabase SQL Editor to remove test customer IDs

-- This will clear all test mode Stripe customer IDs (cus_T...) and subscription data
-- Only affects records with test mode customer IDs, not live ones
UPDATE restaurants
SET
  stripe_customer_id = NULL,
  stripe_subscription_id = NULL,
  subscription_status = 'incomplete',
  subscription_plan = NULL
WHERE
  stripe_customer_id IS NOT NULL
  AND stripe_customer_id LIKE 'cus_T%'; -- Test mode customer IDs start with cus_T

-- To verify the cleanup, run this query:
-- SELECT id, email, stripe_customer_id, subscription_status FROM restaurants WHERE email = 'your-email@example.com';
