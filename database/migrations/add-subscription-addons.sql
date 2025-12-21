-- Add subscription_addons column to restaurants table
-- This will store purchased addons like "Menu multilingue" as a JSON array

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS subscription_addons jsonb DEFAULT '[]'::jsonb;

-- Add a comment to explain the column
COMMENT ON COLUMN restaurants.subscription_addons IS 'JSON array of purchased subscription addons (e.g., ["prod_TeCHj5wFSShp6w"])';
