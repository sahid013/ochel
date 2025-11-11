# Database Setup Guide

## Quick Start - Complete Database Setup

To set up the entire database from scratch, run this single script:

```bash
psql -U your_username -d your_database -f complete_database_setup.sql
```

Or copy the contents of `complete_database_setup.sql` into your database management tool (e.g., Supabase SQL Editor).

---

## What Gets Created

### Tables (7 total):

1. **reservations** - Customer reservations
2. **closed_dates** - Closed dates and custom hours
3. **restaurant_settings** - Configuration (weekly schedules, etc.)
4. **categories** - Menu categories
5. **subcategories** - Menu subcategories
6. **menu_items** - Menu items with prices
7. **addons** - Menu add-ons

### Additional Features:

- ✅ All indexes for performance
- ✅ All triggers for `updated_at` columns
- ✅ All RLS (Row Level Security) policies
- ✅ All permissions for anon/authenticated users
- ✅ Realtime subscriptions (Supabase)
- ✅ Idempotent (safe to run multiple times)

---

## File Structure

```
src/sql/
├── complete_database_setup.sql      ← Run this for full setup
├── schema.sql                        ← Reservations table only
├── closed_dates.sql                  ← Closed dates table
├── restaurant_settings.sql           ← Settings table
├── menu_system.sql                   ← Menu tables (4 tables)
├── admin_setup.sql                   ← Admin RLS policies
└── migrations/
    ├── add_manual_override_column.sql
    ├── add_time_slots_to_closed_dates.sql
    └── enable_realtime.sql
```

---

## Individual Table Setup (Optional)

If you prefer to set up tables individually:

### 1. Reservations System
```sql
\i schema.sql
\i closed_dates.sql
\i restaurant_settings.sql
```

### 2. Menu System
```sql
\i menu_system.sql
```

### 3. Manual Override Feature
```sql
\i migrations/add_manual_override_column.sql
```

---

## Database Schema Overview

### Reservations Flow
```
reservations
    ↓
Check closed_dates (for specific date overrides)
    ↓
Check restaurant_settings (for weekly schedule)
    ↓
Confirm or Reject
```

### Menu System Flow
```
categories (Appetizers, Mains, Desserts)
    ↓
subcategories (Pasta, Pizza, etc.)
    ↓
menu_items (Individual dishes)
    ↓
addons (Extra cheese, etc.)
```

---

## Key Features Explained

### 1. Weekly Schedule Sync (`is_manual_override`)

The `closed_dates` table has a special column for syncing with weekly schedules:

- `is_manual_override = true`: Date is PROTECTED from weekly schedule changes
- `is_manual_override = false`: Date will SYNC when weekly schedule changes

**Example:**
```sql
-- Christmas (permanent override)
INSERT INTO closed_dates (date, is_closed, reason, is_manual_override)
VALUES ('2025-12-25', true, 'Christmas', true);

-- Temporary closure (will sync)
INSERT INTO closed_dates (date, is_closed, reason, is_manual_override)
VALUES ('2025-10-14', true, 'Temporarily closed', false);
```

### 2. Split Hours Support

Both `closed_dates` and weekly schedules support split hours:

```sql
-- Continuous hours
opening_time = '10:00'
closing_time = '20:00'
use_split_hours = false

-- Split hours (lunch + dinner)
morning_opening = '10:00'
morning_closing = '14:00'
afternoon_opening = '19:00'
afternoon_closing = '22:00'
use_split_hours = true
```

### 3. Row Level Security (RLS)

All tables have RLS enabled:

- **Public (anon)**: Can read menu, settings, closed dates
- **Public (anon)**: Can create reservations
- **Authenticated**: Can manage everything

---

## Verification Queries

After running the setup, verify everything works:

### 1. Check all tables exist
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Expected: 7 tables

### 2. Check indexes
```sql
SELECT tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 3. Check RLS policies
```sql
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 4. Check triggers
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
```

---

## Common Operations

### Add a reservation
```sql
INSERT INTO reservations (name, email, phone, reservation_date, reservation_time, guests)
VALUES ('John Doe', 'john@example.com', '1234567890', '2025-12-01', '19:00', 4);
```

### Close a specific date
```sql
INSERT INTO closed_dates (date, is_closed, reason, is_manual_override)
VALUES ('2025-12-25', true, 'Christmas Day', true)
ON CONFLICT (date) DO UPDATE
SET is_closed = true, reason = 'Christmas Day', is_manual_override = true;
```

### Set weekly schedule (Monday = closed)
```sql
INSERT INTO restaurant_settings (setting_key, setting_value, description)
VALUES (
  'weekly_schedule_1',
  '{"day_of_week":1,"is_open":false,"use_split_hours":false}',
  'Weekly schedule for Monday'
)
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value;
```

### Add a menu category
```sql
INSERT INTO categories (title, text, status)
VALUES ('Main Courses', 'Delicious main dishes', 'active');
```

---

## Migrations

If you already have a database and need to add new features:

### Add Manual Override Column
```sql
\i migrations/add_manual_override_column.sql
```

This adds the `is_manual_override` column to `closed_dates` table for weekly schedule sync support.

---

## Troubleshooting

### Error: "relation already exists"
**Solution**: This is normal. The script uses `CREATE TABLE IF NOT EXISTS`.

### Error: "permission denied"
**Solution**: Make sure you're connected as a superuser or database owner.

### Error: "policy already exists"
**Solution**: The script drops policies before creating them. This is safe.

### Realtime not working (Supabase)
**Solution**: Make sure you're running on Supabase. For other PostgreSQL, realtime features won't work but everything else will.

---

## For Production

Before deploying to production:

1. ✅ Review all RLS policies
2. ✅ Consider adding more restrictive policies for admin operations
3. ✅ Set up database backups
4. ✅ Monitor query performance
5. ✅ Consider adding more indexes based on query patterns

---

## Support

For issues or questions:
- Check the main project README
- Review the code comments in SQL files
- Check your PostgreSQL/Supabase logs
