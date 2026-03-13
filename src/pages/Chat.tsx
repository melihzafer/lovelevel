/**
 * ChatPage - Couple Chat Interface
 * Real-time messaging between partners
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MoreVertical, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/SupabaseAuthContext';
import { useSync } from '../contexts/SupabaseSyncContext';
import { chatService } from '../lib/chatService';
import { ChatMessageBubble } from '../components/chat/ChatMessage';
import { ChatInput } from '../components/chat/ChatInput';
import type { ChatMessage } from '../types/chat';
import { supabase } from '../lib/supabase';

export default function ChatPage() {
  const { user } = useAuth();
  const { partnership } = useSync();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerProfile, setPartnerProfile] = useState<{ display_name?: string; photo_url?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const partnershipId = partnership?.id;

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Fetch partner profile
  useEffect(() => {
    if (!partnership || !user) return;

    const partnerId = partnership.user1_id === user.id 
      ? partnership.user2_id 
      : partnership.user1_id;

    const fetchPartner = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, photo_url')
        .eq('id', partnerId)
        .single();
      
      setPartnerProfile(data);
    };

    fetchPartner();
  }, [partnership, user]);

  // Load initial messages
  useEffect(() => {
    if (!partnershipId) return;

    const loadMessages = async () => {
      setLoading(true);
      const msgs = await chatService.getMessages(partnershipId);
      setMessages(msgs);
      setLoading(false);
    };

    loadMessages();
  }, [partnershipId]);

  // Subscribe to new messages
  useEffect(() => {
    if (!partnershipId) return;

    const unsubscribe = chatService.subscribeToMessages(
      partnershipId,
      (message) => {
        setMessages((prev) => [...prev, message]);
      }
    );

    return unsubscribe;
  }, [partnershipId]);

  // Subscribe to typing indicators
  useEffect(() => {
    if (!partnershipId || !user) return;

    const unsubscribe = chatService.subscribeToTyping(
      partnershipId,
      (indicator) => {
        if (indicator.user_id !== user.id) {
          setPartnerTyping(indicator.is_typing);
        }
      }
    );

    return unsubscribe;
  }, [partnershipId, user]);

  // Send message handler
  const handleSendMessage = async (content: string, type: 'text' | 'voice' | 'love_note') => {
    if (!partnershipId || !user) return;

    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      partnership_id: partnershipId,
      sender_id: user.id,
      message_type: type,
      content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    await chatService.sendMessage(partnershipId, user.id, content, type);
  };

  // Typing indicator handler
  const handleTyping = async (isTyping: boolean) => {
    if (!partnershipId || !user) return;
    await chatService.sendTypingIndicator(partnershipId, user.id, isTyping);
  };

  if (!partnership) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-secondary p-4">
        <Heart className="w-16 h-16 text-primary-300 mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Connect with your partner</h2>
        <p className="text-text-secondary text-center">
          You need to be connected with a partner to start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg-secondary">
      {/* Header */}
      <div className="bg-bg-primary border-b border-border-color px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => window.history.back()}
          className="p-2 -ml-2 rounded-full hover:bg-bg-secondary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-text-primary">
              {partnerProfile?.display_name || 'Partner'}
            </h1>
          </div>
          {partnerTyping && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-primary-500"
            >
              typing...
            </motion.p>
          )}
        </div>

        <button className="p-2 rounded-full hover:bg-bg-secondary transition-colors">
          <MoreVertical className="w-5 h-5 text-text-secondary" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Heart className="w-16 h-16 text-primary-300 mb-4" />
            <h2 className="text-xl font-bold text-text-primary mb-2">
              Start the conversation
            </h2>
            <p className="text-text-secondary max-w-xs">
              Send a message to {partnerProfile?.display_name || 'your partner'} and keep the love flowing! 💕
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <AnimatePresence>
              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                  partnerAvatar={partnerProfile?.photo_url}
                  partnerName={partnerProfile?.display_name}
                />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
        placeholder={`Message ${partnerProfile?.display_name || 'Partner'}...`}
      />
    </div>
  );
}