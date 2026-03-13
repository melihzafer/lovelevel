/**
 * LoveNote Component
 * Beautiful animated love notes with scheduled delivery
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, Calendar, Send } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useSync } from '../../contexts/SupabaseSyncContext';
import { chatService } from '../../lib/chatService';
import { Button } from '../Button';

interface LoveNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AnimationType = 'none' | 'hearts' | 'sparkles' | 'confetti' | 'fireworks';
type BackgroundTheme = 'pink' | 'purple' | 'sunset' | 'ocean' | 'galaxy';

const ANIMATIONS: Record<AnimationType, { name: string; emoji: string }> = {
  none: { name: 'None', emoji: '🚫' },
  hearts: { name: 'Floating Hearts', emoji: '💕' },
  sparkles: { name: 'Sparkles', emoji: '✨' },
  confetti: { name: 'Confetti', emoji: '🎊' },
  fireworks: { name: 'Fireworks', emoji: '🎆' },
};

const BACKGROUNDS: Record<BackgroundTheme, { name: string; class: string }> = {
  pink: { name: 'Romantic Pink', class: 'from-pink-400 to-rose-500' },
  purple: { name: 'Dreamy Purple', class: 'from-purple-400 to-indigo-500' },
  sunset: { name: 'Sunset Glow', class: 'from-orange-400 to-pink-500' },
  ocean: { name: 'Ocean Blue', class: 'from-cyan-400 to-blue-500' },
  galaxy: { name: 'Galaxy', class: 'from-indigo-500 to-purple-900' },
};

export function LoveNoteModal({ isOpen, onClose }: LoveNoteModalProps) {
  const { user } = useAuth();
  const { partnership } = useSync();

  const [content, setContent] = useState('');
  const [background, setBackground] = useState<BackgroundTheme>('pink');
  const [animation, setAnimation] = useState<AnimationType>('hearts');
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = async () => {
    if (!content.trim() || !partnership?.id || !user) return;

    setIsSending(true);
    try {
      const scheduledFor = showScheduler && scheduledDate && scheduledTime
        ? new Date(`${scheduledDate}T${scheduledTime}`)
        : undefined;

      await chatService.sendLoveNote(
        partnership.id,
        user.id,
        content.trim(),
        scheduledFor,
        {
          backgroundTheme: background,
          animationType: animation,
        }
      );

      setContent('');
      setShowScheduler(false);
      setScheduledDate('');
      setScheduledTime('');
      onClose();
    } catch (error) {
      console.error('Error sending love note:', error);
    } finally {
      setIsSending(false);
    }
  };

  const templates = [
    "I love you more than words can say! 💕",
    "You make every day brighter! ☀️",
    "Thinking of you makes me smile 😊",
    "You're my favorite person in the whole world! 🌍",
    "I'm so lucky to have you in my life! 🍀",
    "You're the best thing that's ever happened to me! ✨",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            {/* Love Note Card */}
            <div
              className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${BACKGROUNDS[background].class}`}
            >
              {/* Animation overlay */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {animation === 'hearts' && (
                  <>
                    {[...Array(12)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-2xl"
                        initial={{ 
                          x: Math.random() * 300, 
                          y: 400,
                          opacity: 0 
                        }}
                        animate={{ 
                          y: -100,
                          opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      >
                        💕
                      </motion.span>
                    ))}
                  </>
                )}
                {animation === 'sparkles' && (
                  <>
                    {[...Array(20)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-xl"
                        initial={{ 
                          x: Math.random() * 300, 
                          y: Math.random() * 400,
                          scale: 0,
                          opacity: 0 
                        }}
                        animate={{ 
                          scale: [0, 1.5, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      >
                        ✨
                      </motion.span>
                    ))}
                  </>
                )}
                {animation === 'confetti' && (
                  <>
                    {[...Array(30)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-lg"
                        initial={{ 
                          x: Math.random() * 300, 
                          y: -20,
                          rotate: 0,
                        }}
                        animate={{ 
                          y: 450,
                          rotate: 360,
                        }}
                        transition={{
                          duration: 3 + Math.random() * 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      >
                        {['🎉', '🎊', '💖', '⭐'][i % 4]}
                      </motion.span>
                    ))}
                  </>
                )}
                {animation === 'fireworks' && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute text-3xl"
                        initial={{ 
                          x: 50 + i * 60, 
                          y: 300,
                          scale: 0,
                        }}
                        animate={{ 
                          y: 100,
                          scale: [0, 2, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.4,
                        }}
                      >
                        🎆
                      </motion.span>
                    ))}
                  </>
                )}
              </div>

              {/* Header */}
              <div className="relative flex items-center justify-between p-4 text-white">
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Love Note
                </h2>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>

              {/* Content area */}
              <div className="relative p-4 pt-0">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write something sweet..."
                  className="w-full h-32 bg-white/20 rounded-xl p-3 text-white placeholder-white/60 resize-none focus:outline-none focus:ring-2 focus:ring-white/50"
                />

                {/* Quick templates */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {templates.slice(0, 3).map((template, i) => (
                    <button
                      key={i}
                      onClick={() => setContent(template)}
                      className="text-xs bg-white/20 text-white px-2 py-1 rounded-full hover:bg-white/30 transition-colors"
                    >
                      {template.split(' ').slice(0, 3).join(' ')}...
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization */}
              <div className="relative p-4 pt-0 space-y-4">
                {/* Animation selector */}
                <div>
                  <p className="text-white/80 text-sm mb-2">Animation</p>
                  <div className="flex gap-2">
                    {Object.entries(ANIMATIONS).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setAnimation(key as AnimationType)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          animation === key
                            ? 'bg-white text-pink-600'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        {value.emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background selector */}
                <div>
                  <p className="text-white/80 text-sm mb-2">Theme</p>
                  <div className="flex gap-2">
                    {Object.entries(BACKGROUNDS).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setBackground(key as BackgroundTheme)}
                        className={`w-8 h-8 rounded-full bg-gradient-to-br ${value.class} ring-2 ${
                          background === key ? 'ring-white' : 'ring-transparent'
                        }`}
                        title={value.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Schedule toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowScheduler(!showScheduler)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                      showScheduler
                        ? 'bg-white text-pink-600'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    Schedule
                  </button>
                </div>

                {showScheduler && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="flex gap-2"
                  >
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="flex-1 bg-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="flex-1 bg-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                  </motion.div>
                )}
              </div>

              {/* Send button */}
              <div className="relative p-4 pt-0">
                <Button
                  onClick={handleSend}
                  disabled={!content.trim() || isSending}
                  className="w-full py-3 bg-white text-pink-600 font-bold rounded-xl hover:bg-white/90 disabled:opacity-50"
                >
                  <Send className="w-4 h-4 inline mr-2" />
                  {isSending ? 'Sending...' : showScheduler ? 'Schedule Love Note' : 'Send Love Note'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}