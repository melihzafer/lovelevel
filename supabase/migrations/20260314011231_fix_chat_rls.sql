-- Fixed Chat Tables Migration
-- Uses proper type casts: auth.uid()::text to match your existing schema

-- ============================================
-- Run this SQL in Supabase SQL Editor
-- ============================================

-- Check what currently exists
SELECT 'chat_messages columns' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' ORDER BY ordinal_position;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS public.chat_messages;

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Users can view their partnership messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their partnership" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Create RLS Policies with TYPE CASTS (auth.uid()::text)
CREATE POLICY "Users can view their partnership messages"
  ON public.chat_messages FOR SELECT
  USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid()::text OR user2_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert messages to their partnership"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid()::text OR user2_id = auth.uid()::text
    )
    AND sender_id = auth.uid()::text
  );

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (sender_id = auth.uid()::text);

CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (sender_id = auth.uid()::text);

-- ============================================
-- LOVE NOTES
-- ============================================

-- Check what currently exists
SELECT 'love_notes columns' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'love_notes' ORDER BY ordinal_position;

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS public.love_notes;

-- Enable RLS
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view their partnership love notes" ON public.love_notes;
DROP POLICY IF EXISTS "Users can insert love notes to their partnership" ON public.love_notes;
DROP POLICY IF EXISTS "Users can update their own love notes" ON public.love_notes;
DROP POLICY IF EXISTS "Users can delete their own love notes" ON public.love_notes;

-- Create policies with TYPE CASTS
CREATE POLICY "Users can view their partnership love notes"
  ON public.love_notes FOR SELECT
  USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid()::text OR user2_id = auth.uid()::text
    )
  );

CREATE POLICY "Users can insert love notes to their partnership"
  ON public.love_notes FOR INSERT
  WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid()::text OR user2_id = auth.uid()::text
    )
    AND sender_id = auth.uid()::text
  );

CREATE POLICY "Users can update their own love notes"
  ON public.love_notes FOR UPDATE
  USING (sender_id = auth.uid()::text);

CREATE POLICY "Users can delete their own love notes"
  ON public.love_notes FOR DELETE
  USING (sender_id = auth.uid()::text);

-- ============================================
-- VERIFICATION - Run this after to confirm
-- ============================================
SELECT 'RLS Policies verified' as status;
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('chat_messages', 'love_notes');