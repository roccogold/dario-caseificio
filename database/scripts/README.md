# Database Scripts

This directory contains all SQL scripts for database setup, migrations, and maintenance.

## 📁 Script Organization

### Phase 1: Schema Migration
- **`FASE1_SCHEMA_MIGRATION.sql`** - Main schema migration script
- **`FASE1_VERIFY_SCHEMA.sql`** - Verification script to check migration success
- **`FASE1_ENABLE_REALTIME.sql`** - Enable real-time for tables
- **`FASE1_ENABLE_REALTIME_V2.sql`** - Updated real-time configuration
- **`FASE1_CLEAR_ALL_DATA.sql`** - Clear all data (use with caution!)

### Phase 2: Security & RLS Policies
- **`FASE2_RLS_POLICIES.sql`** - Apply Row Level Security policies
- **`FASE2_VERIFY_RLS.sql`** - Verify RLS policies are correctly applied
- **`FASE2_CHECK_MISSING_POLICIES.sql`** - Check for missing policies
- **`FASE2_CREATE_MISSING_POLICIES.sql`** - Create any missing policies
- **`FIX_RLS_POLICIES.sql`** - Fix RLS policy issues

### Legacy/Migration Scripts
- **`SCHEMA_MIGRATION.sql`** - Legacy schema migration
- **`supabase-schema.sql`** - Base Supabase schema
- **`supabase-rls-policies.sql`** - Base RLS policies
- **`supabase-add-yield-price-columns.sql`** - Add yield and price columns

## 🚀 Usage

1. Go to [Supabase Dashboard](https://app.supabase.com) → **SQL Editor**
2. Open the script file you need
3. Copy and paste the content into the SQL editor
4. Click **Run** (or press `Cmd/Ctrl + Enter`)

## ⚠️ Important Notes

- **Always backup your database** before running migration scripts
- Run scripts in the order specified in the documentation
- Verify each step using the corresponding verification script
- Test in a development environment first

## 📚 Documentation

For detailed instructions, see:
- [Phase 1 Documentation](../../docs/database/FASE1_README.md)
- [Phase 2 Documentation](../../docs/database/FASE2_README.md)
