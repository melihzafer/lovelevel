/**
 * Chat Service
 * Handles real-time messaging using Supabase Realtime
 */

import { supabase } from './supabase';
import type { ChatMessage, TypingIndicator, LoveNote } from '../types/chat';

// Realtime channel names
const getChatChannel = (partnershipId: string) => `chat:${partnershipId}`;
const getTypingChannel = (partnershipId: string) => `typing:${partnershipId}`;

class ChatService {
  private subscriptions: Map<string, ReturnType<typeof supabase.channel>> = new Map();

  /**
   * Send a text message
   */
  async sendMessage(
    partnershipId: string,
    senderId: string,
    content: string,
    messageType: 'text' | 'voice' | 'love_note' = 'text',
    metadata?: ChatMessage['metadata']
  ): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          partnership_id: partnershipId,
          sender_id: senderId,
          message_type: messageType,
          content,
          metadata: metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      // Broadcast to realtime channel
      const channel = this.subscriptions.get(getChatChannel(partnershipId));
      if (channel) {
        channel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: data,
        });
      }

      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Get recent messages for a conversation
   */
  async getMessages(
    partnershipId: string,
    limit: number = 50,
    before?: string
  ): Promise<ChatMessage[]> {
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .eq('partnership_id', partnershipId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).reverse();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Subscribe to new messages in real-time
   */
  subscribeToMessages(
    partnershipId: string,
    onMessage: (message: ChatMessage) => void
  ): () => void {
    const channelName = getChatChannel(partnershipId);

    // Check if already subscribed
    if (this.subscriptions.has(channelName)) {
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `partnership_id=eq.${partnershipId}`,
        },
        (payload) => {
          onMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeToTyping(
    partnershipId: string,
    onTyping: (indicator: TypingIndicator) => void
  ): () => void {
    const channelName = getTypingChannel(partnershipId);

    if (this.subscriptions.has(channelName)) {
      return () => this.unsubscribe(channelName);
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast' as any,
        { event: 'typing' },
        (payload: { payload: TypingIndicator }) => {
          onTyping(payload.payload);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);

    return () => this.unsubscribe(channelName);
  }

  /**
   * Send typing indicator
   */
  async sendTypingIndicator(
    partnershipId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const channelName = getTypingChannel(partnershipId);
    const channel = this.subscriptions.get(channelName);

    if (channel) {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          partnership_id: partnershipId,
          user_id: userId,
          is_typing: isTyping,
          updated_at: new Date().toISOString(),
        } as TypingIndicator,
      });
    }
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(
    partnershipId: string,
    userId: string,
    messageIds: string[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          metadata: { read_at: new Date().toISOString() },
        })
        .in('id', messageIds)
        .eq('partnership_id', partnershipId)
        .neq('sender_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  /**
   * Send a love note
   */
  async sendLoveNote(
    partnershipId: string,
    senderId: string,
    content: string,
    scheduledFor?: Date,
    options?: {
      backgroundTheme?: string;
      animationType?: 'hearts' | 'sparkles' | 'confetti' | 'none';
    }
  ): Promise<LoveNote | null> {
    try {
      const { data, error } = await supabase
        .from('love_notes')
        .insert({
          partnership_id: partnershipId,
          sender_id: senderId,
          content,
          scheduled_for: scheduledFor?.toISOString(),
          background_theme: options?.backgroundTheme,
          animation_type: options?.animationType || 'hearts',
          is_delivered: !scheduledFor,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error sending love note:', error);
      return null;
    }
  }

  /**
   * Get love notes
   */
  async getLoveNotes(partnershipId: string): Promise<LoveNote[]> {
    try {
      const { data, error } = await supabase
        .from('love_notes')
        .select('*')
        .eq('partnership_id', partnershipId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching love notes:', error);
      return [];
    }
  }

  /**
   * Delete a message (soft delete by updating content)
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({
          content: '[Message deleted]',
          metadata: { deleted: true },
        })
        .eq('id', messageId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Unsubscribe from a channel
   */
  private unsubscribe(channelName: string): void {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.subscriptions.clear();
  }
}

export const chatService = new ChatService();