/**
 * ChatMessage Component
 * Displays a single chat message
 */

import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import type { ChatMessage } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessage;
  isOwn: boolean;
  showAvatar?: boolean;
  partnerAvatar?: string;
  partnerName?: string;
}

export function ChatMessageBubble({
  message,
  isOwn,
  partnerAvatar,
}: ChatMessageProps) {
  const isLoveNote = message.message_type === 'love_note';
  const isVoice = message.message_type === 'voice';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`flex items-end gap-2 max-w-[80%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        {!isOwn && partnerAvatar && (
          <img
            src={partnerAvatar}
            alt="Partner"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
        )}

        {/* Message bubble */}
        <div
          className={`relative px-4 py-2 rounded-2xl ${
            isLoveNote
              ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg'
              : isOwn
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}
        >
          {/* Love note special styling */}
          {isLoveNote && (
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">💕</div>
          )}

          {/* Message content */}
          {isVoice ? (
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span>▶️</span>
              </button>
              <div className="flex gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-4 bg-white/70 rounded-full"
                    style={{ height: `${Math.random() * 16 + 8}px` }}
                  />
                ))}
              </div>
              <span className="text-sm opacity-75">
                {message.metadata?.duration ? `${Math.round(message.metadata.duration / 1000)}s` : '0s'}
              </span>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          )}

          {/* Timestamp */}
          <p
            className={`text-xs mt-1 ${
              isLoveNote || isOwn ? 'text-white/70' : 'text-gray-500'
            }`}
          >
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </motion.div>
  );
}