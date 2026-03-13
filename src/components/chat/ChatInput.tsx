/**
 * ChatInput Component
 * Input field for sending messages
 */

import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Heart, Smile } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (content: string, type: 'text' | 'love_note') => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onTyping,
  disabled = false,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [showLoveNote, setShowLoveNote] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleTyping = useCallback((isTyping: boolean) => {
    if (onTyping) {
      onTyping(isTyping);
    }
  }, [onTyping]);

  const updateTextareaHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLoveNote = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim(), 'love_note');
      setMessage('');
      setShowLoveNote(false);
    }
  };

  const emojis = ['❤️', '💕', '💖', '💗', '💓', '💞', '💝', '😘', '🥰', '😍', '👀', '🔥', '✨', '🎉', '🥳'];

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji);
    setShowEmojis(false);
    inputRef.current?.focus();
  };

  return (
    <div className="border-t border-border-color bg-bg-primary p-3">
      {/* Emoji picker */}
      {showEmojis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mb-2 p-2 bg-bg-secondary rounded-xl flex flex-wrap gap-1"
        >
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="w-10 h-10 flex items-center justify-center text-xl hover:bg-bg-tertiary rounded-lg transition-colors"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}

      {/* Love note preview */}
      {showLoveNote && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-2 p-4 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl text-white"
        >
          <p className="text-sm font-medium mb-2">💕 Send as Love Note</p>
          <p className="text-lg">{message || 'Your message here...'}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleLoveNote}
              className="flex-1 py-2 bg-white/20 rounded-lg font-medium hover:bg-white/30 transition-colors"
            >
              Send Love Note
            </button>
            <button
              onClick={() => setShowLoveNote(false)}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        {/* Emoji button */}
        <button
          onClick={() => setShowEmojis(!showEmojis)}
          className="p-2 rounded-full hover:bg-bg-secondary transition-colors text-text-secondary"
          disabled={disabled}
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping(e.target.value.length > 0);
              updateTextareaHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full px-4 py-2.5 bg-bg-secondary rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-text-primary placeholder:text-text-secondary disabled:opacity-50"
          />
        </div>

        {/* Love note button */}
        {message.trim() && !showLoveNote && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setShowLoveNote(true)}
            className="p-2 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors text-pink-500"
            disabled={disabled}
          >
            <Heart className="w-5 h-5" />
          </motion.button>
        )}

        {/* Send button */}
        {message.trim() && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={handleSend}
            disabled={disabled}
            className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </div>
  );
}