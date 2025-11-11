-- Migration: Add display_order column to categories table
-- This allows manual ordering of categories for display purposes
-- Created: 2025-10-19

-- Add display_order column to categories table
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Set initial display_order values based on current created_at order
-- Categories created earlier get lower numbers (appear first)
WITH ordered_categories AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM categories
)
UPDATE categories
SET display_order = ordered_categories.row_num
FROM ordered_categories
WHERE categories.id = ordered_categories.id
AND categories.display_order IS NULL;

-- Create index on display_order for better query performance
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);

-- Add comment for documentation
COMMENT ON COLUMN categories.display_order IS 'Determines the display order of categories in the menu (lower numbers appear first)';
