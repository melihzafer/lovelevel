# Supabase Schema Fixes - Partner Invite System

> **Quick Links**: [Issue #1](#issue-1-invite_codesused-column-missing) | [Issue #2](#issue-2-partnerships-foreign-key-constraints) | [Issue #3](#issue-3-shared_challenges-foreign-key-constraint) ✅

---

## 🔴 Issue #1: invite_codes.used Column Missing

**Error**: `column invite_codes.used does not exist` (PostgreSQL error code 42703)

**Root Cause**: The `invite_codes` table in Supabase is missing the `used` column that the code expects.

**Impact**: Partner invite system completely broken - cannot generate or validate invite codes.

**Status**: ✅ FIXED

---

## ✅ Quick Fix (Recommended)

### Step 1: Add Missing Column

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **lovelevel-7dadc**
3. Click **SQL Editor** (left sidebar)
4. Paste this SQL and click **Run**:

```sql
-- Add missing 'used' column to invite_codes table
ALTER TABLE invite_codes 
ADD COLUMN IF NOT EXISTS used BOOLEAN DEFAULT false NOT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_invite_codes_used 
ON invite_codes(used);

-- Create composite index for common query pattern
CREATE INDEX IF NOT EXISTS idx_invite_codes_creator_used 
ON invite_codes(created_by, used) WHERE used = false;
```

### Step 2: Verify Fix

Run this query to check the table structure:

```sql
-- Check table columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'invite_codes'
ORDER BY ordinal_position;
```

**Expected Output** (should include):
- `code` (text)
- `created_by` (text or uuid)
- `created_at` (timestamp)
- `expires_at` (timestamp)
- `used` (boolean) ← **THIS ONE IS CRITICAL**
- `used_by` (text or uuid, nullable)

### Step 3: Test in Browser

1. Refresh browser (Ctrl+R or Cmd+R)
2. Navigate to Partner page: http://localhost:5174/partner
3. Open DevTools Console (F12)
4. Check for errors - should see:
   - ✅ "No active partnership found" (expected, not an error)
   - ✅ NO "column invite_codes.used does not exist" error

---

## 📋 Full Table Schema (Reference)

If the above doesn't work, or if the table doesn't exist at all, run this to create it from scratch:

```sql
-- Drop existing table (CAUTION: This deletes all data!)
DROP TABLE IF EXISTS invite_codes CASCADE;

-- Create invite_codes table with complete schema
CREATE TABLE invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by TEXT NOT NULL, -- Firebase UID (not FK, Firebase Auth is external)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false NOT NULL,
  used_by TEXT, -- Firebase UID of user who accepted invite
  used_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT code_length_check CHECK (length(code) = 6),
  CONSTRAINT expires_after_creation CHECK (expires_at > created_at),
  CONSTRAINT used_consistency CHECK (
    (used = false AND used_by IS NULL AND used_at IS NULL) OR
    (used = true AND used_by IS NOT NULL AND used_at IS NOT NULL)
  )
);

-- Indexes for performance
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_created_by ON invite_codes(created_by);
CREATE INDEX idx_invite_codes_used ON invite_codes(used);
CREATE INDEX idx_invite_codes_creator_used ON invite_codes(created_by, used) WHERE used = false;
CREATE INDEX idx_invite_codes_expires ON invite_codes(expires_at) WHERE used = false;

-- RLS Policies (if RLS is enabled)
-- Note: Currently RLS is DISABLED per project requirements
-- If you enable RLS later, add these policies:

-- ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Users can create their own invite codes"
-- ON invite_codes FOR INSERT
-- WITH CHECK (created_by = current_setting('request.jwt.claims', true)::json->>'sub');

-- CREATE POLICY "Users can read all active invite codes"
-- ON invite_codes FOR SELECT
-- USING (used = false AND expires_at > NOW());

-- CREATE POLICY "Users can update codes they created"
-- ON invite_codes FOR UPDATE
-- USING (created_by = current_setting('request.jwt.claims', true)::json->>'sub');

-- Comments for documentation
COMMENT ON TABLE invite_codes IS 'Partner invitation codes for connecting couples';
COMMENT ON COLUMN invite_codes.code IS '6-character alphanumeric code (uppercase, no ambiguous chars)';
COMMENT ON COLUMN invite_codes.created_by IS 'Firebase UID of code creator';
COMMENT ON COLUMN invite_codes.used IS 'Boolean flag for quick filtering of available codes';
COMMENT ON COLUMN invite_codes.used_by IS 'Firebase UID of partner who accepted invite';
COMMENT ON COLUMN invite_codes.expires_at IS 'Code expires 7 days after creation';
```

---

## 🧪 Test Queries

### Check Active Codes
```sql
-- View all active (unused, not expired) invite codes
SELECT 
  code,
  created_by,
  created_at,
  expires_at,
  (expires_at > NOW()) AS is_valid,
  EXTRACT(EPOCH FROM (expires_at - NOW())) / 3600 AS hours_until_expiry
FROM invite_codes
WHERE used = false
  AND expires_at > NOW()
ORDER BY created_at DESC;
```

### Check Used Codes
```sql
-- View all used invite codes with partnership info
SELECT 
  ic.code,
  ic.created_by,
  ic.used_by,
  ic.created_at,
  ic.used_at,
  EXTRACT(EPOCH FROM (ic.used_at - ic.created_at)) / 3600 AS hours_to_accept,
  p.id AS partnership_id,
  p.status AS partnership_status
FROM invite_codes ic
LEFT JOIN partnerships p ON (
  (p.user1_id = ic.created_by AND p.user2_id = ic.used_by) OR
  (p.user2_id = ic.created_by AND p.user1_id = ic.used_by)
)
WHERE ic.used = true
ORDER BY ic.used_at DESC;
```

### Cleanup Expired Codes
```sql
-- Delete expired unused codes (optional housekeeping)
DELETE FROM invite_codes
WHERE used = false
  AND expires_at < NOW();
```

---

## 🔄 Alternative Fix (If Column Exists as Different Name)

If the table already has a `used_by` column and you want to derive `used` status from it:

**Option 1: Use Generated Column** (PostgreSQL 12+)
```sql
-- Add computed column based on used_by
ALTER TABLE invite_codes 
ADD COLUMN used BOOLEAN GENERATED ALWAYS AS (used_by IS NOT NULL) STORED;
```

**Option 2: Update Code Instead** (if you prefer not to alter DB)
Change inviteService.ts queries from:
```typescript
.eq('used', false)  // Current code
```
To:
```typescript
.is('used_by', null)  // Alternative query
```

---

## 📊 Verification Checklist

After running the fix:

- [ ] SQL command executed without errors
- [ ] `SELECT * FROM invite_codes LIMIT 1;` returns columns including `used`
- [ ] Browser console shows NO "column ... does not exist" errors
- [ ] Partner page loads without errors
- [ ] Can click "Generate Invite Code" button (check for new errors)

---

## 🚨 Troubleshooting

### Error: "relation invite_codes does not exist"
**Cause**: Table not created yet.  
**Fix**: Run the full "CREATE TABLE" script above.

### Error: "column used_by does not exist"
**Cause**: Table created without used_by column.  
**Fix**: Add it:
```sql
ALTER TABLE invite_codes ADD COLUMN used_by TEXT;
ALTER TABLE invite_codes ADD COLUMN used_at TIMESTAMPTZ;
```

### Error: "permission denied for table invite_codes"
**Cause**: Your Supabase user lacks permissions.  
**Fix**: Make sure you're logged in as the project owner. Check Supabase dashboard → Settings → Database → Connection string.

### Partnership Query 406 Error
**Status**: This is expected, NOT an error.  
**Reason**: User has no active partnership yet. Once invite code is accepted, this will resolve.

---

## 📌 Related Files

- `src/services/inviteService.ts` - Invite code logic (uses `used` column)
- `src/types/database.ts` - TypeScript types (InviteCode interface missing - see below)
- `TESTING_PARTNER_INVITE.md` - Comprehensive test cases for invite system

---

## 🔧 Next Steps

1. **IMMEDIATE**: Run the ALTER TABLE command above
2. **VERIFY**: Check browser console for errors
3. **TEST**: Generate invite code, verify no errors
4. **OPTIONAL**: Add InviteCode type to database.ts (see below)

---

## 💡 Bonus: Add InviteCode Type to database.ts

For type safety, add this to `src/types/database.ts`:

```typescript
// Add after Partnership interface
export interface InviteCode {
  id?: string;
  code: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_by?: string;
  used_at?: string;
}
```

This centralizes types and prevents drift between inviteService.ts interface and database schema.

---

## ✅ Success Criteria

You'll know the fix worked when:

1. ✅ Browser console shows NO "column invite_codes.used does not exist" errors
2. ✅ Partner page loads without errors (only "No active partnership found" log, which is expected)
3. ✅ Clicking "Generate Invite Code" creates a 6-character code without errors
4. ✅ Code displays with expiry countdown (e.g., "7 days 2 hours")
5. ✅ Supabase SQL Editor query `SELECT * FROM invite_codes;` returns rows with `used` column

---

## 🔴 Issue #3: shared_challenges Foreign Key Constraint

**Error**: `insert or update on table "shared_challenges" violates foreign key constraint "shared_challenges_created_by_fkey"` (PostgreSQL error code 23503)

**Root Cause**: The `shared_challenges` table has a foreign key constraint on `created_by` column referencing the `profiles` table. When users authenticate via Firebase, they're NOT automatically added to the `profiles` table, causing all challenge syncs to fail.

**Impact**: 
- ✅ Partnership creation works
- ✅ Real-time sync initializes
- ❌ All 20 seed challenges fail to sync (409 Conflict)
- ❌ No challenges appear in Supabase
- ❌ Challenge completion sync broken

**Console Pattern**:
```
syncManager.ts:99 ✅ Real-time sync started for partnership: [ID]
@supabase POST .../shared_challenges 409 (Conflict) [× 20]
syncManager.ts:212 ❌ Error syncing challenge: [name] {code: '23503', details: 'Key (created_by)=(...)  is not present in table "profiles".'}
syncManager.ts:216 ✅ Synced 20 local challenges to Supabase [MISLEADING - all failed!]
```

**Status**: 🔴 **URGENT FIX REQUIRED**

---

### ✅ Quick Fix (Issue #3)

**Step 1: Remove Foreign Key Constraint**

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **lovelevel-7dadc**
3. Click **SQL Editor** (left sidebar)
4. Paste this SQL and click **Run**:

```sql
-- Remove foreign key constraint on shared_challenges.created_by
ALTER TABLE shared_challenges 
DROP CONSTRAINT IF EXISTS shared_challenges_created_by_fkey;

-- Optional: Add index for performance (no constraint)
CREATE INDEX IF NOT EXISTS idx_shared_challenges_created_by 
ON shared_challenges(created_by);

-- Verify constraint removed
SELECT conname, contype 
FROM pg_constraint 
WHERE conrelid = 'shared_challenges'::regclass;
```

**Expected Result**:
- Constraint `shared_challenges_created_by_fkey` should NOT appear in results
- Only `shared_challenges_partnership_id_fkey` should remain (this one is valid)

**Step 2: Verify Fix**

1. Refresh browser (Ctrl+R)
2. Open DevTools Console (F12)
3. Check for sync messages:
   ```
   ✅ Real-time sync started for partnership: [ID]
   ✅ Synced 20 local challenges to Supabase [should be green, no errors]
   ✅ Synced 0 remote challenges to IndexedDB [expected - none from partner yet]
   ```

**Step 3: Verify in Supabase Dashboard**

Run this query:
```sql
SELECT COUNT(*) as total_challenges FROM shared_challenges;
```

**Expected**: Should show 20 rows (or however many challenges were synced)

**Step 4: Test Challenge Completion**

1. In the app, complete a challenge
2. Check console for sync confirmation
3. Verify in Supabase that challenge row updated

---

### 🔍 Why This Happens

**Architecture Issue**:
- Firebase Auth (external identity provider) creates users with UIDs
- Supabase `profiles` table is optional/supplementary (display_name, photo, etc.)
- Foreign keys assume `profiles` table is populated BEFORE challenges are created
- Reality: Users can create challenges immediately after login, before profile sync

**Solution**: Remove foreign key constraints on all sync tables. User IDs are managed by Firebase Auth, not Supabase.

---

### 📋 Additional Tables to Check

Run this query to find other tables with similar foreign key issues:

```sql
-- Find all foreign keys pointing to profiles table
SELECT 
  tc.table_name, 
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'profiles';
```

**Likely Candidates**:
- `shared_pet` table (if it has `created_by` or `last_updated_by` columns)
- Any other sync tables with user references

**Fix Them All**:
```sql
-- Remove foreign keys from shared_pet (if applicable)
ALTER TABLE shared_pet 
DROP CONSTRAINT IF EXISTS shared_pet_created_by_fkey;

ALTER TABLE shared_pet 
DROP CONSTRAINT IF EXISTS shared_pet_last_updated_by_fkey;
```

---

## 📊 Verification Checklist

After running ALL fixes:

- [x] Issue #1: invite_codes.used column added ✅
- [x] Issue #2: partnerships foreign keys removed ✅
- [ ] Issue #3: shared_challenges foreign key removed 🔄
- [ ] Additional: shared_pet foreign keys removed (if applicable) ⏳
- [ ] Browser console shows successful challenge sync ⏳
- [ ] Supabase shared_challenges table populated ⏳
- [ ] Real-time updates working between partners ⏳

---

**Created**: October 12, 2025  
**Status**: Ready for user execution  
**Priority**: 🔴 CRITICAL - Blocks Partner Invite System  
**Estimated Time**: 2-5 minutes
