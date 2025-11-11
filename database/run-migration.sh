#!/bin/bash

# ============================================================================
# Run Ordering Migration Script
# Created: 2025-01-20
# ============================================================================

echo "=========================================="
echo "Ordering Migration - Runner Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup exists
BACKUP_DIR="$(dirname "$0")/backups"
if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR 2>/dev/null)" ]; then
    echo -e "${RED}✗ No backup found!${NC}"
    echo ""
    echo "Please create a backup first:"
    echo "  bash database/create-backup.sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓ Backup found${NC}"
echo ""

# Confirm before proceeding
echo -e "${YELLOW}WARNING: This will modify the database schema!${NC}"
echo ""
echo "This migration will:"
echo "  • Add 'order' column to categories, subcategories, menu_items, addons"
echo "  • Initialize order values based on created_at timestamps"
echo "  • Create indexes for better performance"
echo ""
read -p "Do you want to proceed? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "Running migration using Supabase CLI..."
    echo ""

    # Run migration
    supabase db execute -f "$(dirname "$0")/migrations/add-ordering-columns.sql"

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}=========================================="
        echo "✓ MIGRATION COMPLETED SUCCESSFULLY"
        echo -e "==========================================${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Update TypeScript types"
        echo "  2. Update menuService queries"
        echo "  3. Add ordering UI to admin panels"
        echo ""
        echo "If you need to rollback:"
        echo "  supabase db execute -f database/rollback-ordering-migration.sql"
        echo ""
    else
        echo ""
        echo -e "${RED}✗ MIGRATION FAILED${NC}"
        echo ""
        echo "To rollback, run:"
        echo "  supabase db execute -f database/rollback-ordering-migration.sql"
        echo ""
        exit 1
    fi
else
    echo -e "${YELLOW}Supabase CLI not found${NC}"
    echo ""
    echo "Please run the migration manually:"
    echo ""
    echo "Option 1: Install Supabase CLI"
    echo "  npm install -g supabase"
    echo "  Then run this script again"
    echo ""
    echo "Option 2: Run via Supabase Dashboard"
    echo "  1. Go to https://supabase.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Go to SQL Editor"
    echo "  4. Copy and paste: database/migrations/add-ordering-columns.sql"
    echo "  5. Execute"
    echo ""
    echo "Option 3: Use psql (if you have direct database access)"
    echo "  psql [CONNECTION_STRING] < database/migrations/add-ordering-columns.sql"
    echo ""
    exit 1
fi
