-- Add has_completed_onboarding column to restaurants table
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;

-- Comment on the column
COMMENT ON COLUMN public.restaurants.has_completed_onboarding IS 'Flag to track if the restaurant owner has completed the initial onboarding flow';
