# Supabase Database Reset Guide

## 🔴 Critical Issues Fixed

### 1. PGRST200 Foreign Key Error
**Error Message:**
```
{
  code: 'PGRST200',
  details: "Searched for a foreign key relationship between 'invite_codes' and 'profiles' in the schema 'public', but no matches were found.",
  hint: null,
  message: "Could not find a relationship between 'invite_codes' and 'profiles' in the schema cache"
}
```

**Root Cause:** Foreign key constraints were missing or not properly established in Supabase.

**Solution:** Complete database reset with proper foreign key constraints and RLS policies.

---

### 2. Login Redirect Timing Issue
**Symptoms:**
- Login succeeds but redirect doesn't work
- Navigating manually to `localhost:5173` shows long loading then logs in
- Supabase sync responds too quickly but app doesn't recognize login

**Root Cause:** The 1-second delay in `SupabaseSyncContext` was interfering with navigation timing.

**Solution:** Removed the artificial delay. Sync now initializes immediately but is non-blocking (wrapped in try-catch).

---

## 📋 Step-by-Step Reset Instructions

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project: `jdxqrcqaeuocuihgfczl`
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Reset Script
1. Open the file: `SUPABASE_RESET.sql`
2. **Copy the entire script** (all lines)
3. **Paste into Supabase SQL Editor**
4. Click **Run** (or press `Ctrl+Enter`)

**Expected Output:**
```
✅ Tables dropped successfully
✅ 5 tables created (profiles, partnerships, invite_codes, shared_challenges, shared_pet)
✅ 11 foreign key constraints established
✅ RLS policies created for all tables
✅ Indexes created for faster queries
```

### Step 3: Verify Database Structure

Run these verification queries in SQL Editor:

#### A) Check Tables Created
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'partnerships', 'invite_codes', 'shared_challenges', 'shared_pet')
ORDER BY table_name;
```

**Expected Result:**
```
invite_codes
partnerships
profiles
shared_challenges
shared_pet
```

#### B) Check Foreign Key Constraints
```sql
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

**Expected Result:** Should show 11 foreign key constraints including:
- `invite_codes.created_by` → `profiles.id`
- `invite_codes.partnership_id` → `partnerships.id`
- `partnerships.user1_id` → `profiles.id`
- `partnerships.user2_id` → `profiles.id`
- `shared_challenges.partnership_id` → `partnerships.id`
- `shared_challenges.created_by` → `profiles.id`
- `shared_pet.partnership_id` → `partnerships.id`
- `shared_pet.updated_by` → `profiles.id`

#### C) Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Result:** Should show multiple policies for each table (SELECT, INSERT, UPDATE, DELETE where applicable).

---

## 🧪 Testing After Reset

### Test 1: Login Flow
```
1. Open http://localhost:5173/login
2. Login with email/password or Google OAuth
3. Watch browser console (F12)
4. Expected:
   ✅ No long loading delays
   ✅ Immediate redirect to /home or /onboarding
   ✅ "Initializing Supabase sync" log appears
   ✅ "No active partnership - operating in solo mode" message
   ✅ No PGRST errors
```

### Test 2: Profile Creation (Automatic)
```
1. Login as new user
2. Open Supabase Dashboard → Table Editor → profiles
3. Expected:
   ✅ Your user profile row exists with Firebase UID
   ✅ display_name, email, photo_url populated
   ✅ created_at and updated_at timestamps present
```

### Test 3: Invite Code Generation
```
1. Login to app
2. Navigate to /partner page
3. Click "Generate Invite Code" button
4. Watch browser console
5. Expected:
   ✅ No PGRST200 errors
   ✅ Code generated successfully (6 characters)
   ✅ Code appears in Supabase invite_codes table
   ✅ created_by field matches your Firebase UID
```

### Test 4: Invite Code Acceptance
```
1. Have another user (or second account) login
2. Navigate to /partner page
3. Enter the invite code (e.g., 684PXC)
4. Click "Join Partner"
5. Expected:
   ✅ No PGRST200 errors
   ✅ Partnership created in partnerships table
   ✅ Both users see partnership status "active"
   ✅ Invite code marked as "used" in invite_codes table
```

### Test 5: Real-time Sync
```
1. After partnership established
2. User 1: Add a challenge
3. User 2: Should see challenge appear in real-time
4. Expected:
   ✅ Challenge appears without page refresh
   ✅ Both users see same challenges
   ✅ Console shows "Sync initialized for partnership" message
```

---

## 🔧 Code Changes Made

### 1. SupabaseSyncContext.tsx
**Before:**
```typescript
// 🔧 FIX: Delay sync initialization to avoid blocking login
const timeoutId = setTimeout(initSync, 1000);

// Cleanup on unmount or user logout
return () => {
  clearTimeout(timeoutId);
  syncManager.cleanup();
};
```

**After:**
```typescript
// 🔧 FIX: Immediate sync initialization (removed delay)
// The sync is now non-blocking and won't interfere with navigation
initSync();

// Cleanup on unmount or user logout
return () => {
  syncManager.cleanup();
};
```

**Why:** The 1-second delay was causing navigation timing issues. Since sync is already wrapped in try-catch and non-blocking, immediate initialization works fine.

---

## 🎯 Key Foreign Key Relationships

```
profiles (id)
├── partnerships.user1_id [ON DELETE CASCADE]
├── partnerships.user2_id [ON DELETE CASCADE]
├── invite_codes.created_by [ON DELETE CASCADE]
├── shared_challenges.created_by [ON DELETE CASCADE]
└── shared_pet.updated_by [ON DELETE SET NULL]

partnerships (id)
├── invite_codes.partnership_id [ON DELETE SET NULL]
├── shared_challenges.partnership_id [ON DELETE CASCADE]
└── shared_pet.partnership_id [ON DELETE CASCADE]
```

**Important:**
- `ON DELETE CASCADE`: When parent row deleted, child rows automatically deleted
- `ON DELETE SET NULL`: When parent row deleted, foreign key set to null (child row remains)

---

## 🚨 Troubleshooting

### Issue: "Could not find relationship" error persists
**Solution:**
1. Refresh Supabase schema cache:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
2. Or restart Supabase project (Settings → General → Restart project)

### Issue: "violates foreign key constraint" error
**Cause:** Trying to insert data referencing non-existent parent row.
**Solution:** Ensure Firebase UID exists in `profiles` table before creating invite codes.

### Issue: RLS policies blocking operations
**Solution:** Check if user is authenticated:
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('Supabase auth user:', user); // Should match Firebase UID
```

### Issue: Invite codes not visible in table
**Solution:** Check RLS policy - codes only visible if:
- `used = false` AND `expires_at > now()` (for anyone)
- OR `created_by = auth.uid()` (for creator)

---

## 📊 Database Schema Summary

| Table | Primary Key | Foreign Keys | RLS Enabled | Purpose |
|-------|-------------|--------------|-------------|---------|
| **profiles** | `id` (text) | - | ✅ | User profiles synced from Firebase |
| **partnerships** | `id` (uuid) | `user1_id`, `user2_id` → profiles | ✅ | Partner relationships |
| **invite_codes** | `code` (text) | `created_by` → profiles, `partnership_id` → partnerships | ✅ | Invitation codes |
| **shared_challenges** | `id` (text) | `partnership_id` → partnerships, `created_by` → profiles | ✅ | Shared to-do challenges |
| **shared_pet** | `partnership_id` (uuid) | `partnership_id` → partnerships, `updated_by` → profiles | ✅ | Shared virtual pet data |

---

## ✅ Post-Reset Checklist

- [ ] All 5 tables created successfully
- [ ] 11 foreign key constraints verified
- [ ] RLS policies created for all tables
- [ ] Indexes created on foreign key columns
- [ ] Verification queries return expected results
- [ ] Login flow works without delays
- [ ] Redirect to home/onboarding works immediately
- [ ] Profile auto-created in Supabase on first login
- [ ] Invite code generation works (no PGRST200)
- [ ] Invite code acceptance creates partnership
- [ ] Real-time sync working between partners
- [ ] No console errors during normal operations

---

## 🎉 Expected Final State

After completing this reset:

✅ **Login**: Fast, immediate redirect, no blocking
✅ **Database**: All foreign keys properly established
✅ **Invite Codes**: Generation and acceptance work flawlessly
✅ **Partnerships**: Real-time sync between partners
✅ **Solo Mode**: App works fine without partnership
✅ **No Errors**: Clean console, no PGRST errors

---

**Last Updated:** 2025-01-28
**Related Files:**
- `SUPABASE_RESET.sql` - Complete database reset script
- `src/contexts/SupabaseSyncContext.tsx` - Sync initialization (removed delay)
- `src/lib/syncManager.ts` - Partnership lookup with error handling
- `src/services/inviteService.ts` - Invite code generation/validation
