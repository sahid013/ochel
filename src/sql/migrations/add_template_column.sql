-- Add template column to restaurants table
ALTER TABLE public.restaurants ADD COLUMN IF NOT EXISTS template VARCHAR(50) DEFAULT 'template1';

-- Comment on the column
COMMENT ON COLUMN public.restaurants.template IS 'The selected menu template for the restaurant (e.g., template1, template2)';
