import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Heart, Target, Brain, Trophy, X } from 'lucide-react';

import { highScoreService } from '../../lib/highScoreService';
import { PetMinigame } from './PetMinigame';
import { LoveCatcher } from './LoveCatcher';
import { MemoryMatch } from './MemoryMatch';
import { RelationshipQuiz } from './RelationshipQuiz';
import { WhackAMole } from './WhackAMole';
import { TriviaQuiz } from './TriviaQuiz';
import { ReactionTime } from './ReactionTime';

interface MinigameHubProps {
  onClose: () => void;
}

type GameType = 'petminigame' | 'lovecatcher' | 'memorymatch' | 'quiz' | 'whackamole' | 'triviaquiz' | 'reactiontime' | null;

interface GameInfo {
  id: GameType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const GAMES: GameInfo[] = [
  {
    id: 'petminigame',
    name: 'Heart Catcher',
    description: 'Tap falling hearts to score points!',
    icon: <Heart className="w-8 h-8" />,
    color: 'bg-pink-500',
  },
  {
    id: 'lovecatcher',
    name: 'Love Catcher',
    description: 'Catch hearts and coins, avoid the poop!',
    icon: <Target className="w-8 h-8" />,
    color: 'bg-purple-500',
  },
  {
    id: 'memorymatch',
    name: 'Memory Match',
    description: 'Match pairs of hearts from memory!',
    icon: <Brain className="w-8 h-8" />,
    color: 'bg-blue-500',
  },
  {
    id: 'quiz',
    name: 'Relationship Quiz',
    description: 'Test your knowledge about your partner!',
    icon: <Gamepad2 className="w-8 h-8" />,
    color: 'bg-green-500',
  },
  {
    id: 'whackamole',
    name: 'Whack-a-Mole',
    description: 'Tap moles before they hide!',
    icon: <span className="text-3xl">🐹</span>,
    color: 'bg-amber-500',
  },
  {
    id: 'triviaquiz',
    name: 'Trivia Quiz',
    description: 'Test your general knowledge!',
    icon: <span className="text-3xl">🧠</span>,
    color: 'bg-indigo-500',
  },
  {
    id: 'reactiontime',
    name: 'Reaction Time',
    description: 'How fast can you react?',
    icon: <span className="text-3xl">⚡</span>,
    color: 'bg-red-500',
  },
];

export const MinigameHub = ({ onClose }: MinigameHubProps) => {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [highScores, setHighScores] = useState<Record<string, number>>({});
  
  // Load high scores on mount
  useEffect(() => {
    const scores: Record<string, number> = {};
    GAMES.forEach(game => {
      if (game.id) {
        const hs = highScoreService.getHighScore(game.id);
        if (hs) scores[game.id] = hs.score;
      }
    });
    setHighScores(scores);
  }, []);
  
  const renderGame = () => {
    switch (activeGame) {
      case 'petminigame':
        return <PetMinigame onClose={() => setActiveGame(null)} />;
      case 'lovecatcher':
        return <LoveCatcher onClose={() => setActiveGame(null)} />;
      case 'memorymatch':
        return <MemoryMatch onClose={() => setActiveGame(null)} />;
      case 'quiz':
        return <RelationshipQuiz onClose={() => setActiveGame(null)} />;
      case 'whackamole':
        return <WhackAMole onClose={() => setActiveGame(null)} />;
      case 'triviaquiz':
        return <TriviaQuiz onClose={() => setActiveGame(null)} />;
      case 'reactiontime':
        return <ReactionTime onClose={() => setActiveGame(null)} />;
      default:
        return null;
    }
  };
  
  return (
    <>
      <AnimatePresence>
        {!activeGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-primary rounded-2xl shadow-2xl p-6 max-w-lg w-full mx-4"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-primary-500" />
                  Minigames
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {GAMES.map((game) => (
                  <motion.button
                    key={game.id}
                    onClick={() => setActiveGame(game.id)}
                    className={`relative p-4 rounded-xl ${game.color} text-white text-left overflow-hidden group`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="relative z-10">
                      <div className="mb-2">{game.icon}</div>
                      <h3 className="font-bold">{game.name}</h3>
                      <p className="text-sm text-white/80 mt-1">{game.description}</p>
                      
                      {highScores[game.id!] && (
                        <div className="flex items-center gap-1 mt-2 text-sm">
                          <Trophy className="w-4 h-4" />
                          <span>{highScores[game.id!]} pts</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-bg-secondary rounded-lg">
                <p className="text-sm text-text-secondary text-center">
                  🎮 Play games to earn XP and coins for your pet!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {activeGame && renderGame()}
    </>
  );
};
