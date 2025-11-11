-- ============================================================================
-- MIGRATION: Add Ordering Columns to Menu Tables
-- Created: 2025-01-20
-- Purpose: Add 'order' column to categories, subcategories, menu_items, addons
--          Initialize order values based on created_at (scoped by parent)
-- ============================================================================

-- IMPORTANT: Run backup script before executing this migration!
-- Run: bash database/create-backup.sh

BEGIN;

-- ============================================================================
-- STEP 1: Add 'order' columns with default value 0
-- ============================================================================

-- Categories: Global ordering
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Subcategories: Ordering within category
ALTER TABLE subcategories
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Menu Items: Ordering within subcategory
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- Addons: Ordering within subcategory
ALTER TABLE addons
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;

-- ============================================================================
-- STEP 2: Initialize order values based on created_at (oldest = lowest order)
-- ============================================================================

-- Categories: Global ordering (1, 2, 3, 4...)
-- First created category gets order: 1, second gets order: 2, etc.
UPDATE categories
SET "order" = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM categories
) AS subquery
WHERE categories.id = subquery.id;

-- Subcategories: Scoped by category_id (1, 2, 3... per category)
-- Within each category, first created subcategory gets order: 1
UPDATE subcategories
SET "order" = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY category_id
    ORDER BY created_at ASC
  ) as row_num
  FROM subcategories
) AS subquery
WHERE subcategories.id = subquery.id;

-- Menu Items: Scoped by subcategory_id (1, 2, 3... per subcategory)
-- Within each subcategory, first created item gets order: 1
UPDATE menu_items
SET "order" = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY subcategory_id
    ORDER BY created_at ASC
  ) as row_num
  FROM menu_items
) AS subquery
WHERE menu_items.id = subquery.id;

-- Addons: Scoped by subcategory_id (1, 2, 3... per subcategory)
-- Within each subcategory, first created addon gets order: 1
UPDATE addons
SET "order" = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY subcategory_id
    ORDER BY created_at ASC
  ) as row_num
  FROM addons
) AS subquery
WHERE addons.id = subquery.id;

-- ============================================================================
-- STEP 3: Add indexes for better query performance
-- ============================================================================

-- Index for categories ordering
CREATE INDEX IF NOT EXISTS idx_categories_order ON categories("order");

-- Index for subcategories ordering within category
CREATE INDEX IF NOT EXISTS idx_subcategories_category_order ON subcategories(category_id, "order");

-- Index for menu_items ordering within subcategory
CREATE INDEX IF NOT EXISTS idx_menu_items_subcategory_order ON menu_items(subcategory_id, "order");

-- Index for special items ordering (cross-subcategory)
CREATE INDEX IF NOT EXISTS idx_menu_items_special_order ON menu_items(is_special, "order") WHERE is_special = true;

-- Index for addons ordering within subcategory
CREATE INDEX IF NOT EXISTS idx_addons_subcategory_order ON addons(subcategory_id, "order");

-- ============================================================================
-- STEP 4: Verify migration
-- ============================================================================

-- Check categories ordering
DO $$
DECLARE
  cat_count INTEGER;
  cat_ordered_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO cat_count FROM categories;
  SELECT COUNT(*) INTO cat_ordered_count FROM categories WHERE "order" > 0;

  RAISE NOTICE 'Categories: Total=%, Ordered=%', cat_count, cat_ordered_count;

  IF cat_count > 0 AND cat_ordered_count = 0 THEN
    RAISE EXCEPTION 'Categories ordering initialization failed!';
  END IF;
END $$;

-- Check subcategories ordering
DO $$
DECLARE
  subcat_count INTEGER;
  subcat_ordered_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO subcat_count FROM subcategories;
  SELECT COUNT(*) INTO subcat_ordered_count FROM subcategories WHERE "order" > 0;

  RAISE NOTICE 'Subcategories: Total=%, Ordered=%', subcat_count, subcat_ordered_count;

  IF subcat_count > 0 AND subcat_ordered_count = 0 THEN
    RAISE EXCEPTION 'Subcategories ordering initialization failed!';
  END IF;
END $$;

-- Check menu_items ordering
DO $$
DECLARE
  items_count INTEGER;
  items_ordered_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO items_count FROM menu_items;
  SELECT COUNT(*) INTO items_ordered_count FROM menu_items WHERE "order" > 0;

  RAISE NOTICE 'Menu Items: Total=%, Ordered=%', items_count, items_ordered_count;

  IF items_count > 0 AND items_ordered_count = 0 THEN
    RAISE EXCEPTION 'Menu items ordering initialization failed!';
  END IF;
END $$;

-- Check addons ordering
DO $$
DECLARE
  addons_count INTEGER;
  addons_ordered_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO addons_count FROM addons;
  SELECT COUNT(*) INTO addons_ordered_count FROM addons WHERE "order" > 0;

  RAISE NOTICE 'Addons: Total=%, Ordered=%', addons_count, addons_ordered_count;

  IF addons_count > 0 AND addons_ordered_count = 0 THEN
    RAISE EXCEPTION 'Addons ordering initialization failed!';
  END IF;
END $$;

-- ============================================================================
-- MIGRATION COMPLETED SUCCESSFULLY
-- ============================================================================

COMMIT;

-- Display summary
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '  ✓ Added order column to categories';
  RAISE NOTICE '  ✓ Added order column to subcategories';
  RAISE NOTICE '  ✓ Added order column to menu_items';
  RAISE NOTICE '  ✓ Added order column to addons';
  RAISE NOTICE '  ✓ Initialized order values based on created_at';
  RAISE NOTICE '  ✓ Created performance indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Update TypeScript types';
  RAISE NOTICE '  2. Update menuService queries';
  RAISE NOTICE '  3. Add ordering UI to admin panels';
  RAISE NOTICE '';
END $$;
