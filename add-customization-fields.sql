-- Add customization fields to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#F34A23',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#FFD65A',
ADD COLUMN IF NOT EXISTS background_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS text_color TEXT DEFAULT '#FFFFFF',
ADD COLUMN IF NOT EXISTS font_family TEXT DEFAULT 'forum';

-- Add comment to describe the columns
COMMENT ON COLUMN restaurants.primary_color IS 'Primary brand color for buttons and highlights';
COMMENT ON COLUMN restaurants.accent_color IS 'Secondary color for accents and emphasis';
COMMENT ON COLUMN restaurants.background_color IS 'Main background color for the menu';
COMMENT ON COLUMN restaurants.text_color IS 'Main text color for menu content';
COMMENT ON COLUMN restaurants.font_family IS 'Font family for menu templates (forum, satoshi, eb-garamond, sans-serif, serif)';
