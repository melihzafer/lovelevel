/**
 * Evolution Modal
 * Displays when pet reaches a new evolution stage
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, X } from 'lucide-react';

import type { EvolutionStage } from '../../types/evolution';
import { EVOLUTION_STAGES } from '../../types/evolution';


interface EvolutionModalProps {
  isOpen: boolean;
  newStage: EvolutionStage;
  petName: string;
  onClose: () => void;
}

export function EvolutionModal({ isOpen, newStage, petName, onClose }: EvolutionModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  
  const evolutionInfo = EVOLUTION_STAGES[newStage];

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!evolutionInfo) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="relative w-full max-w-md bg-gradient-to-br from-purple-900 to-indigo-900 rounded-3xl overflow-hidden shadow-2xl"
          >
            {/* Confetti effect */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: Math.random() * 400,
                      y: -20,
                      rotate: 0,
                      opacity: 1,
                    }}
                    animate={{
                      y: 500,
                      rotate: 360,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      delay: i * 0.05,
                    }}
                    className="absolute text-2xl"
                  >
                    {['✨', '⭐', '🌟', '💫', '🎉', '🎊'][i % 6]}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Header */}
            <div className="relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              <div className="pt-8 pb-4 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mb-4"
                >
                  <div className="relative inline-block">
                    <motion.div
                      animate={{
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: 'mirror',
                      }}
                      className="text-8xl"
                    >
                      {evolutionInfo.emoji}
                    </motion.div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="absolute -top-2 -right-2"
                    >
                      <Sparkles className="w-8 h-8 text-yellow-400" />
                    </motion.div>
                  </div>
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Evolution Complete!
                </motion.h2>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${evolutionInfo.color} text-white font-bold`}
                >
                  <Star className="w-5 h-5" />
                  {evolutionInfo.name}
                </motion.div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-6"
              >
                <p className="text-white/80 text-lg">
                  <span className="font-bold text-white">{petName}</span> has evolved into a{' '}
                  <span className="font-bold text-yellow-400">{evolutionInfo.name}</span>!
                </p>
                <p className="text-white/60 mt-2">{evolutionInfo.description}</p>
              </motion.div>

              {/* Abilities */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/10 rounded-xl p-4 mb-6"
              >
                <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  New Abilities
                </h3>
                <ul className="space-y-1">
                  {evolutionInfo.abilities.map((ability, index) => (
                    <motion.li
                      key={ability}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      className="text-white/80 flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                      {ability}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Level requirement */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-center text-white/60 text-sm"
              >
                Reached at Level {evolutionInfo.minLevel}
              </motion.div>

              {/* Close button */}
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={onClose}
                className="w-full mt-4 py-3 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold hover:from-pink-600 hover:to-purple-600 transition-colors"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}