/**
 * Chat Types
 * Types for the real-time messaging system
 */

export type MessageType = 'text' | 'voice' | 'love_note' | 'reaction';

export interface ChatMessage {
  id: string;
  partnership_id: string;
  sender_id: string;
  message_type: MessageType;
  content: string;
  metadata?: {
    duration?: number; // for voice messages
    reaction_to?: string; // for reactions
    scheduled_for?: string; // for scheduled love notes
    delivered_at?: string;
    read_at?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface TypingIndicator {
  partnership_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
}

export interface LoveNote {
  id: string;
  partnership_id: string;
  sender_id: string;
  content: string;
  scheduled_for?: string;
  background_theme?: string;
  animation_type?: 'hearts' | 'sparkles' | 'confetti' | 'none';
  is_delivered: boolean;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

export interface Conversation {
  partnership_id: string;
  last_message?: ChatMessage;
  unread_count: number;
  updated_at: string;
}