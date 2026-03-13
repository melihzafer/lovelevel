-- Chat Messages Table
-- Stores all chat messages between partners

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'love_note', 'reaction')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for common queries
  CONSTRAINT chat_messages_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES partnerships(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_partnership_id ON public.chat_messages(partnership_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can only see messages from their partnership
CREATE POLICY "Users can view their partnership messages"
  ON public.chat_messages FOR SELECT
  USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Users can insert messages to their partnership
CREATE POLICY "Users can insert messages to their partnership"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- Users can update their own messages
CREATE POLICY "Users can update their own messages"
  ON public.chat_messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
  ON public.chat_messages FOR DELETE
  USING (sender_id = auth.uid());

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON public.chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Love Notes Table
-- Stores special love notes with animations

CREATE TABLE IF NOT EXISTS public.love_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ,
  background_theme TEXT DEFAULT 'pink' CHECK (background_theme IN ('pink', 'purple', 'sunset', 'ocean', 'galaxy')),
  animation_type TEXT DEFAULT 'hearts' CHECK (animation_type IN ('hearts', 'sparkles', 'confetti', 'fireworks', 'none')),
  is_delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT love_notes_partnership_id_fkey FOREIGN KEY (partnership_id) REFERENCES partnerships(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_love_notes_partnership_id ON public.love_notes(partnership_id);
CREATE INDEX IF NOT EXISTS idx_love_notes_scheduled_for ON public.love_notes(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_love_notes_is_delivered ON public.love_notes(is_delivered);

-- Enable RLS
ALTER TABLE public.love_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.love_notes;

-- Typing Indicators Table (optional - can use broadcast instead)
-- This is for persistent typing status if needed

CREATE TABLE IF NOT EXISTS public.typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.partnerships(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(partnership_id, user_id)
);

-- Enable RLS
ALTER TABLE public.typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view partnership typing indicators"
  ON public.typing_indicators FOR SELECT
  USING (
    partnership_id IN (
      SELECT id FROM public.partnerships 
      WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own typing indicator"
  ON public.typing_indicators FOR ALL
  USING (user_id = auth.uid());