#!/bin/bash

# ============================================================================
# Database Backup Script - Before Ordering Migration
# Created: 2025-01-20
# ============================================================================

echo "=========================================="
echo "Database Backup - Before Ordering Migration"
echo "=========================================="
echo ""

# Set backup directory
BACKUP_DIR="$(dirname "$0")/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/backup_before_ordering_${TIMESTAMP}.sql"

# Create backups directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "Backup will be saved to: $BACKUP_FILE"
echo ""

# Check if Supabase CLI is installed
if command -v supabase &> /dev/null; then
    echo "✓ Supabase CLI found"
    echo "Creating backup using Supabase CLI..."
    echo ""

    # Create backup using Supabase CLI
    supabase db dump -f "$BACKUP_FILE"

    if [ $? -eq 0 ]; then
        echo ""
        echo "✓ Backup created successfully!"
        echo "  Location: $BACKUP_FILE"

        # Show file size
        FILESIZE=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
        echo "  Size: $FILESIZE"

        # Create a copy with a fixed name for rollback
        cp "$BACKUP_FILE" "${BACKUP_DIR}/latest_backup.sql"
        echo "  Copy saved as: ${BACKUP_DIR}/latest_backup.sql"

        echo ""
        echo "=========================================="
        echo "✓ BACKUP COMPLETED SUCCESSFULLY"
        echo "=========================================="
        echo ""
        echo "You can now proceed with the migration."
        echo "To rollback if needed, run: database/rollback-ordering-migration.sh"
        echo ""
    else
        echo ""
        echo "✗ BACKUP FAILED"
        echo "Please check your Supabase configuration and try again."
        echo ""
        exit 1
    fi
else
    echo "✗ Supabase CLI not found"
    echo ""
    echo "Please install Supabase CLI or create a manual backup:"
    echo ""
    echo "Option 1: Install Supabase CLI"
    echo "  npm install -g supabase"
    echo "  Then run this script again"
    echo ""
    echo "Option 2: Manual backup via Supabase Dashboard"
    echo "  1. Go to https://supabase.com/dashboard"
    echo "  2. Select your project"
    echo "  3. Go to Database > Backups"
    echo "  4. Create a new backup"
    echo "  5. Download the backup file to: $BACKUP_DIR"
    echo ""
    echo "Option 3: Use pg_dump (if you have direct database access)"
    echo "  pg_dump [CONNECTION_STRING] > $BACKUP_FILE"
    echo ""
    exit 1
fi
