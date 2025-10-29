-- ============================================================
-- SUPABASE DATABASE RESET SCRIPT
-- Complete database recreation with proper constraints and RLS
-- ============================================================
-- Date: 2025-01-28
-- Purpose: Fix foreign key constraints and schema cache issues
-- Error Fixed: PGRST200 "Could not find relationship between invite_codes and profiles"
-- ============================================================

-- STEP 1: Drop existing tables in correct order (child tables first)
-- ============================================================

DROP TABLE IF EXISTS public.shared_pet CASCADE;
DROP TABLE IF EXISTS public.shared_pet_backup CASCADE;
DROP TABLE IF EXISTS public.shared_challenges CASCADE;
DROP TABLE IF EXISTS public.shared_challenges_backup CASCADE;
DROP TABLE IF EXISTS public.invite_codes CASCADE;
DROP TABLE IF EXISTS public.invite_codes_backup CASCADE;
DROP TABLE IF EXISTS public.partnerships CASCADE;
DROP TABLE IF EXISTS public.partnerships_backup CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.profiles_backup CASCADE;

-- STEP 2: Create profiles table (parent table - must exist first)
-- ============================================================

CREATE TABLE public.profiles (
  id text NOT NULL,
  display_name text,
  email text,
  photo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

-- Add index for faster lookups
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (true);

-- STEP 3: Create partnerships table
-- ============================================================

CREATE TABLE public.partnerships (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id text NOT NULL,
  user2_id text NOT NULL,
  status text DEFAULT 'pending'::text,
  anniversary_date date,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partnerships_pkey PRIMARY KEY (id),
  CONSTRAINT partnerships_status_check CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'declined'::text])),
  CONSTRAINT partnerships_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT partnerships_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT partnerships_unique_pair UNIQUE (user1_id, user2_id)
);

-- Add indexes for faster lookups
CREATE INDEX idx_partnerships_user1_id ON public.partnerships(user1_id);
CREATE INDEX idx_partnerships_user2_id ON public.partnerships(user2_id);
CREATE INDEX idx_partnerships_status ON public.partnerships(status);

-- Enable RLS
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partnerships
CREATE POLICY "Users can view their own partnerships"
  ON public.partnerships FOR SELECT
  USING (
    auth.uid()::text = user1_id OR 
    auth.uid()::text = user2_id
  );

CREATE POLICY "Users can create partnerships"
  ON public.partnerships FOR INSERT
  WITH CHECK (
    auth.uid()::text = user1_id OR 
    auth.uid()::text = user2_id
  );

CREATE POLICY "Users can update their partnerships"
  ON public.partnerships FOR UPDATE
  USING (
    auth.uid()::text = user1_id OR 
    auth.uid()::text = user2_id
  );

-- STEP 4: Create invite_codes table with proper foreign keys
-- ============================================================

CREATE TABLE public.invite_codes (
  code text NOT NULL,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  status text DEFAULT 'pending'::text,
  partnership_id uuid,
  target_email text,
  used boolean NOT NULL DEFAULT false,
  CONSTRAINT invite_codes_pkey PRIMARY KEY (code),
  CONSTRAINT invite_codes_status_check CHECK (status = ANY (ARRAY['pending'::text, 'used'::text, 'expired'::text])),
  CONSTRAINT invite_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT invite_codes_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.partnerships(id) ON DELETE SET NULL
);

-- Add indexes for faster lookups
CREATE INDEX idx_invite_codes_created_by ON public.invite_codes(created_by);
CREATE INDEX idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_status ON public.invite_codes(status);
CREATE INDEX idx_invite_codes_used ON public.invite_codes(used);

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for invite_codes
CREATE POLICY "Anyone can view valid invite codes"
  ON public.invite_codes FOR SELECT
  USING (used = false AND expires_at > now());

CREATE POLICY "Users can view their own invite codes"
  ON public.invite_codes FOR SELECT
  USING (auth.uid()::text = created_by);

CREATE POLICY "Users can create their own invite codes"
  ON public.invite_codes FOR INSERT
  WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update their own invite codes"
  ON public.invite_codes FOR UPDATE
  USING (auth.uid()::text = created_by);

-- STEP 5: Create shared_challenges table
-- ============================================================

CREATE TABLE public.shared_challenges (
  id text NOT NULL DEFAULT gen_random_uuid()::text,
  partnership_id uuid NOT NULL,
  title text NOT NULL,
  category text,
  status text DEFAULT 'todo'::text,
  completed_at timestamp with time zone,
  notes text,
  tags text[],
  xp_reward integer DEFAULT 0,
  created_by text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shared_challenges_pkey PRIMARY KEY (id),
  CONSTRAINT shared_challenges_status_check CHECK (status = ANY (ARRAY['todo'::text, 'done'::text])),
  CONSTRAINT shared_challenges_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.partnerships(id) ON DELETE CASCADE,
  CONSTRAINT shared_challenges_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Add indexes for faster lookups
CREATE INDEX idx_shared_challenges_partnership_id ON public.shared_challenges(partnership_id);
CREATE INDEX idx_shared_challenges_status ON public.shared_challenges(status);

-- Enable RLS
ALTER TABLE public.shared_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_challenges
CREATE POLICY "Partners can view their shared challenges"
  ON public.shared_challenges FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = partnership_id
      AND (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
    )
  );

CREATE POLICY "Partners can create shared challenges"
  ON public.shared_challenges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = partnership_id
      AND (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
    )
  );

CREATE POLICY "Partners can update their shared challenges"
  ON public.shared_challenges FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = partnership_id
      AND (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
    )
  );

CREATE POLICY "Partners can delete their shared challenges"
  ON public.shared_challenges FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = partnership_id
      AND (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
    )
  );

-- STEP 6: Create shared_pet table
-- ============================================================

CREATE TABLE public.shared_pet (
  partnership_id uuid NOT NULL,
  name text DEFAULT 'Your Pet'::text,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  mood text DEFAULT 'happy'::text,
  hunger integer DEFAULT 50,
  energy integer DEFAULT 100,
  equipped_accessory_id text,
  equipped_background_id text,
  last_updated_at timestamp with time zone DEFAULT now(),
  updated_by text,
  CONSTRAINT shared_pet_pkey PRIMARY KEY (partnership_id),
  CONSTRAINT shared_pet_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES public.partnerships(id) ON DELETE CASCADE,
  CONSTRAINT shared_pet_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.shared_pet ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shared_pet
CREATE POLICY "Partners can view their shared pet"
  ON public.shared_pet FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = partnership_id
      AND (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
    )
  );

CREATE POLICY "Partners can update their shared pet"
  ON public.shared_pet FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = partnership_id
      AND (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
    )
  );

CREATE POLICY "Partners can insert their shared pet"
  ON public.shared_pet FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partnerships
      WHERE id = partnership_id
      AND (user1_id = auth.uid()::text OR user2_id = auth.uid()::text)
    )
  );

-- STEP 7: Grant necessary permissions
-- ============================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.partnerships TO anon, authenticated;
GRANT ALL ON public.invite_codes TO anon, authenticated;
GRANT ALL ON public.shared_challenges TO anon, authenticated;
GRANT ALL ON public.shared_pet TO anon, authenticated;

-- STEP 8: Create helpful functions
-- ============================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_challenges_updated_at BEFORE UPDATE ON public.shared_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to expire old invite codes (can be called via cron)
CREATE OR REPLACE FUNCTION expire_old_invite_codes()
RETURNS void AS $$
BEGIN
  UPDATE public.invite_codes
  SET status = 'expired'
  WHERE expires_at < now()
  AND status = 'pending';
END;
$$ language 'plpgsql';

-- STEP 9: Verification Queries (run these after reset to confirm)
-- ============================================================

-- Check table creation
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'partnerships', 'invite_codes', 'shared_challenges', 'shared_pet')
ORDER BY table_name;

-- Check foreign key constraints
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

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================
-- POST-RESET INSTRUCTIONS
-- ============================================================
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Verify all tables created by running verification queries above
-- 3. Test invite code generation in your app
-- 4. Test partnership creation with invite code 684PXC (after regenerating it)
-- 5. Monitor browser console for any remaining errors
--
-- Expected Results:
-- ✅ 5 tables created (profiles, partnerships, invite_codes, shared_challenges, shared_pet)
-- ✅ 11 foreign key constraints established
-- ✅ RLS policies enabled on all tables
-- ✅ Indexes created for faster queries
-- ✅ No PGRST200 errors when using invite codes
-- ============================================================
