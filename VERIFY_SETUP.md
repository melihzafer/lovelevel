# 🛠️ Verification & Fix Guide

## 1. Check your Supabase API Key

The error `WebSocket connection failed` with `apikey=sb_publishable_...` suggests your API key might be incorrect.

1.  Open your `.env.local` file in the project root.
2.  Find `VITE_SUPABASE_ANON_KEY`.
3.  **It should look like a long code starting with `ey...`** (it is a JWT token).
4.  If it starts with `sb_publishable_`, it is likely **incorrect**.
    *   Go to [Supabase Dashboard](https://supabase.com/dashboard) > Project Settings > API.
    *   Copy the `anon` `public` key.
    *   Update `.env.local`.
    *   **Restart your dev server** (`Ctrl+C` then `npm run dev`).

## 2. Run the Database Migration (Critical for "Settings not saving")

The error `PATCH ... 400 (Bad Request)` happens because your database is missing the new columns to store settings.

1.  Go to [Supabase Dashboard](https://supabase.com/dashboard) > **SQL Editor**.
2.  Click **New Query**.
3.  Copy and paste the code below:

```sql
-- Add onboarding_completed and settings columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Create an index on onboarding_completed
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed 
ON profiles(onboarding_completed);

-- Verify it worked
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('settings', 'onboarding_completed');
```

4.  Click **Run**.
5.  You should see "Success" and the query result showing the two columns.

## 3. Test Again

1.  Refresh your app.
2.  Log out.
3.  Log in.
4.  Complete onboarding.
5.  Refresh again -> You should stay on the Home page (Onboarding skipped).
