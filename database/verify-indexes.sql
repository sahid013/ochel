-- Run this to verify if indexes exist and check their status
-- Copy the output and share with me

-- Check if indexes exist
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'restaurants'
ORDER BY indexname;

-- Check table statistics
SELECT
    schemaname,
    tablename,
    n_live_tup as row_count,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE tablename = 'restaurants';

-- Test query performance
EXPLAIN ANALYZE
SELECT id, name
FROM restaurants
WHERE owner_id = (SELECT id FROM auth.users LIMIT 1)
LIMIT 1;
