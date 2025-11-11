-- Migration: Add multi-language support to menu system
-- Date: 2025-10-18
-- Description: Adds language-specific columns for English, Italian, and Spanish translations
--              to categories, subcategories, menu_items, and addons tables

-- ============================================================================
-- CATEGORIES TABLE - Add Language Columns
-- ============================================================================

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_it VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_es VARCHAR(255),
  ADD COLUMN IF NOT EXISTS text_en TEXT,
  ADD COLUMN IF NOT EXISTS text_it TEXT,
  ADD COLUMN IF NOT EXISTS text_es TEXT;

-- Add comments for documentation
COMMENT ON COLUMN categories.title IS 'Category title in French (default/primary language)';
COMMENT ON COLUMN categories.title_en IS 'Category title in English';
COMMENT ON COLUMN categories.title_it IS 'Category title in Italian';
COMMENT ON COLUMN categories.title_es IS 'Category title in Spanish';
COMMENT ON COLUMN categories.text IS 'Category description in French (default/primary language)';
COMMENT ON COLUMN categories.text_en IS 'Category description in English';
COMMENT ON COLUMN categories.text_it IS 'Category description in Italian';
COMMENT ON COLUMN categories.text_es IS 'Category description in Spanish';

-- ============================================================================
-- SUBCATEGORIES TABLE - Add Language Columns
-- ============================================================================

ALTER TABLE subcategories
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_it VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_es VARCHAR(255),
  ADD COLUMN IF NOT EXISTS text_en TEXT,
  ADD COLUMN IF NOT EXISTS text_it TEXT,
  ADD COLUMN IF NOT EXISTS text_es TEXT;

-- Add comments for documentation
COMMENT ON COLUMN subcategories.title IS 'Subcategory title in French (default/primary language)';
COMMENT ON COLUMN subcategories.title_en IS 'Subcategory title in English';
COMMENT ON COLUMN subcategories.title_it IS 'Subcategory title in Italian';
COMMENT ON COLUMN subcategories.title_es IS 'Subcategory title in Spanish';
COMMENT ON COLUMN subcategories.text IS 'Subcategory description in French (default/primary language)';
COMMENT ON COLUMN subcategories.text_en IS 'Subcategory description in English';
COMMENT ON COLUMN subcategories.text_it IS 'Subcategory description in Italian';
COMMENT ON COLUMN subcategories.text_es IS 'Subcategory description in Spanish';

-- ============================================================================
-- MENU_ITEMS TABLE - Add Language Columns
-- ============================================================================

ALTER TABLE menu_items
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_it VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_es VARCHAR(255),
  ADD COLUMN IF NOT EXISTS text_en TEXT,
  ADD COLUMN IF NOT EXISTS text_it TEXT,
  ADD COLUMN IF NOT EXISTS text_es TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_it TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT;

-- Add comments for documentation
COMMENT ON COLUMN menu_items.title IS 'Menu item title in French (default/primary language)';
COMMENT ON COLUMN menu_items.title_en IS 'Menu item title in English';
COMMENT ON COLUMN menu_items.title_it IS 'Menu item title in Italian';
COMMENT ON COLUMN menu_items.title_es IS 'Menu item title in Spanish';
COMMENT ON COLUMN menu_items.text IS 'Menu item subtitle/text in French (default/primary language)';
COMMENT ON COLUMN menu_items.text_en IS 'Menu item subtitle/text in English';
COMMENT ON COLUMN menu_items.text_it IS 'Menu item subtitle/text in Italian';
COMMENT ON COLUMN menu_items.text_es IS 'Menu item subtitle/text in Spanish';
COMMENT ON COLUMN menu_items.description IS 'Menu item description in French (default/primary language)';
COMMENT ON COLUMN menu_items.description_en IS 'Menu item description in English';
COMMENT ON COLUMN menu_items.description_it IS 'Menu item description in Italian';
COMMENT ON COLUMN menu_items.description_es IS 'Menu item description in Spanish';

-- ============================================================================
-- ADDONS TABLE - Add Language Columns
-- ============================================================================

ALTER TABLE addons
  ADD COLUMN IF NOT EXISTS title_en VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_it VARCHAR(255),
  ADD COLUMN IF NOT EXISTS title_es VARCHAR(255),
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_it TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT;

-- Add comments for documentation
COMMENT ON COLUMN addons.title IS 'Addon title in French (default/primary language)';
COMMENT ON COLUMN addons.title_en IS 'Addon title in English';
COMMENT ON COLUMN addons.title_it IS 'Addon title in Italian';
COMMENT ON COLUMN addons.title_es IS 'Addon title in Spanish';
COMMENT ON COLUMN addons.description IS 'Addon description in French (default/primary language)';
COMMENT ON COLUMN addons.description_en IS 'Addon description in English';
COMMENT ON COLUMN addons.description_it IS 'Addon description in Italian';
COMMENT ON COLUMN addons.description_es IS 'Addon description in Spanish';

-- ============================================================================
-- INDEXES (Optional - for better query performance)
-- ============================================================================

-- These indexes can help if you frequently filter by translated titles
-- CREATE INDEX IF NOT EXISTS idx_categories_title_en ON categories(title_en);
-- CREATE INDEX IF NOT EXISTS idx_subcategories_title_en ON subcategories(title_en);
-- CREATE INDEX IF NOT EXISTS idx_menu_items_title_en ON menu_items(title_en);
-- CREATE INDEX IF NOT EXISTS idx_addons_title_en ON addons(title_en);

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- After running this migration:
-- 1. All existing French data remains in the original columns (title, text, description)
-- 2. New language columns are NULL by default
-- 3. You need to populate translations either:
--    a) Manually through admin interface
--    b) Using a bulk translation script (see scripts/translate-menu.ts)
--    c) Gradually as you edit menu items

-- Example query to fetch menu item with language fallback:
-- SELECT
--   id,
--   COALESCE(title_en, title) as title,
--   COALESCE(description_en, description) as description,
--   price
-- FROM menu_items
-- WHERE status = 'active';
