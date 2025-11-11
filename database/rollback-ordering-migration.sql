-- ============================================================================
-- ROLLBACK: Remove Ordering Columns
-- Created: 2025-01-20
-- Purpose: Rollback the ordering migration if something goes wrong
-- ============================================================================

-- WARNING: This will remove all ordering data!
-- Only run this if you need to rollback the migration.

BEGIN;

-- ============================================================================
-- STEP 1: Drop indexes
-- ============================================================================

DROP INDEX IF EXISTS idx_categories_order;
DROP INDEX IF EXISTS idx_subcategories_category_order;
DROP INDEX IF EXISTS idx_menu_items_subcategory_order;
DROP INDEX IF EXISTS idx_menu_items_special_order;
DROP INDEX IF EXISTS idx_addons_subcategory_order;

-- ============================================================================
-- STEP 2: Drop order columns
-- ============================================================================

ALTER TABLE categories DROP COLUMN IF EXISTS "order";
ALTER TABLE subcategories DROP COLUMN IF EXISTS "order";
ALTER TABLE menu_items DROP COLUMN IF EXISTS "order";
ALTER TABLE addons DROP COLUMN IF EXISTS "order";

-- ============================================================================
-- ROLLBACK COMPLETED
-- ============================================================================

COMMIT;

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'ROLLBACK COMPLETED';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Removed:';
  RAISE NOTICE '  ✓ order column from categories';
  RAISE NOTICE '  ✓ order column from subcategories';
  RAISE NOTICE '  ✓ order column from menu_items';
  RAISE NOTICE '  ✓ order column from addons';
  RAISE NOTICE '  ✓ All ordering indexes';
  RAISE NOTICE '';
  RAISE NOTICE 'Database restored to pre-migration state.';
  RAISE NOTICE '';
END $$;
