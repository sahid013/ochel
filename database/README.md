# Database Ordering Migration

## Overview
This directory contains scripts to add ordering functionality to the menu system.

## Files

- **`create-backup.sh`** - Creates a backup before migration
- **`run-migration.sh`** - Runs the ordering migration
- **`migrations/add-ordering-columns.sql`** - Main migration SQL
- **`rollback-ordering-migration.sql`** - Rollback script (emergency use)
- **`backup-before-ordering-migration.sql`** - Backup documentation

## Migration Process

### Step 1: Create Backup ⚠️ IMPORTANT!

```bash
cd database
./create-backup.sh
```

This will:
- Create a backup of your current database
- Save it to `database/backups/backup_before_ordering_TIMESTAMP.sql`
- Create a copy as `database/backups/latest_backup.sql`

**Do NOT proceed without a backup!**

### Step 2: Run Migration

```bash
./run-migration.sh
```

This will:
- Check if backup exists
- Confirm before proceeding
- Add `order` column to all menu tables
- Initialize order values based on `created_at` timestamps
- Create performance indexes
- Verify migration success

### Step 3: Verify Migration

After migration, verify in Supabase dashboard:

1. Go to Table Editor
2. Check each table has `order` column:
   - `categories.order`
   - `subcategories.order`
   - `menu_items.order`
   - `addons.order`
3. Check order values are populated (not all 0)

## What the Migration Does

### Schema Changes

Adds `order INTEGER DEFAULT 0` to:
- `categories` (global ordering)
- `subcategories` (ordered within category)
- `menu_items` (ordered within subcategory)
- `addons` (ordered within subcategory)

### Data Initialization

Orders items based on `created_at` timestamp:
- **Categories**: First created = order 1, second = order 2, etc.
- **Subcategories**: First in each category = order 1 (resets per category)
- **Menu Items**: First in each subcategory = order 1 (resets per subcategory)
- **Addons**: First in each subcategory = order 1 (resets per subcategory)

### Example

```
Before Migration:
Categories:
  Pizza (created: 2024-01-15) → order: 0
  Pasta (created: 2024-01-16) → order: 0
  Desserts (created: 2024-01-14) → order: 0

After Migration:
Categories (ordered by created_at ASC):
  Desserts (created: 2024-01-14) → order: 1 ← Oldest first
  Pizza (created: 2024-01-15) → order: 2
  Pasta (created: 2024-01-16) → order: 3
```

### Indexes Created

Performance indexes for faster queries:
- `idx_categories_order`
- `idx_subcategories_category_order`
- `idx_menu_items_subcategory_order`
- `idx_menu_items_special_order` (for special items)
- `idx_addons_subcategory_order`

## Rollback (Emergency Only)

If migration fails or you need to revert:

### Option 1: Automated Rollback
```bash
supabase db execute -f database/rollback-ordering-migration.sql
```

### Option 2: Manual Restore from Backup
```bash
# Find your backup file
ls database/backups/

# Restore using Supabase CLI
supabase db reset --db-url [YOUR_DB_URL]
# Then restore from backup file
```

### Option 3: Via Supabase Dashboard
1. Go to Database > Backups
2. Find the backup created before migration
3. Click "Restore"

## Manual Migration (if scripts don't work)

### Via Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to SQL Editor
4. Copy contents of `migrations/add-ordering-columns.sql`
5. Paste and execute

### Via psql

```bash
psql [YOUR_CONNECTION_STRING] < database/migrations/add-ordering-columns.sql
```

## Troubleshooting

### "No backup found" error
Run `./create-backup.sh` first

### "Supabase CLI not found"
```bash
npm install -g supabase
```

### Migration fails mid-way
1. Check error message
2. Run rollback script
3. Fix issue
4. Try migration again

### Order values are all 0
This means initialization failed. Check:
- Do tables have `created_at` values?
- Run verification queries manually

## Verification Queries

After migration, run these to verify:

```sql
-- Check categories ordering
SELECT id, title, "order", created_at
FROM categories
ORDER BY "order" ASC;

-- Check subcategories ordering (scoped by category)
SELECT s.id, c.title as category, s.title, s."order", s.created_at
FROM subcategories s
JOIN categories c ON s.category_id = c.id
ORDER BY s.category_id, s."order" ASC;

-- Check menu items ordering (scoped by subcategory)
SELECT m.id, s.title as subcategory, m.title, m."order", m.created_at
FROM menu_items m
JOIN subcategories s ON m.subcategory_id = s.id
ORDER BY m.subcategory_id, m."order" ASC
LIMIT 20;

-- Check special items ordering
SELECT id, title, "order", is_special, created_at
FROM menu_items
WHERE is_special = true
ORDER BY "order" ASC;
```

## Next Steps After Migration

1. ✅ Backup created
2. ✅ Migration completed
3. ⏳ Update TypeScript types
4. ⏳ Update menuService queries
5. ⏳ Add ordering UI to admin panels
6. ⏳ Test frontend menu display

## Support

If you encounter issues:
1. Check error messages carefully
2. Verify backup exists before rollback
3. Consult Supabase documentation
4. Restore from backup if needed
