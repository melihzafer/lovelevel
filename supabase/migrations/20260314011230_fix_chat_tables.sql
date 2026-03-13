-- Check and fix chat tables - only adds what's missing
-- Run this in Supabase SQL Editor

-- First, check if tables exist and show their structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('chat_messages', 'love_notes', 'typing_indicators')
ORDER BY table_name, ordinal_position;

-- If chat_messages exists but is missing columns, we can add them:
-- ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Enable Realtime for existing tables (if not already)
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE IF EXISTS public.love_notes;

-- Enable RLS (if not already)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their partnership messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can insert messages to their partnership" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

-- Create RLS Policies
CREATE POLICY "Users can view their partnership messages"
  ON public.chat_messages FOR SELECT
  USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages to their partnership"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (sender_id = auth.uid());

-- Love Notes Policies
DROP POLICY IF EXISTS "Users can view their partnership love notes" ON public.love_notes;
DROP POLICY IF EXISTS "Users can insert love notes to their partnership" ON public.love_notes;
DROP POLICY IF EXISTS "Users can update their own love notes" ON public.love_notes;
DROP POLICY IF EXISTS "Users can delete their own love notes" ON public.love_notes;

CREATE POLICY "Users can view their partnership love notes"
  ON public.love_notes FOR SELECT
  USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert love notes to their partnership"
  ON public.love_notes FOR INSERT
  WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

CREATE POLICY "Users can update their own love notes"
  ON public.love_notes FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Users can delete their own love notes"
  ON public.love_notes FOR DELETE
  USING (sender_id = auth.uid());