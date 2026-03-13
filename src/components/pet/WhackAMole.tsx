/**
 * Whack-a-Mole Minigame
 * Tap moles as they appear to score points
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePetStore } from '../../store';
import { highScoreService } from '../../lib/highScoreService';
import { achievementService } from '../../lib/achievementService';
import { Button } from '../Button';

interface Mole {
  id: number;
  position: number;
  isVisible: boolean;
  isHit: boolean;
  type: 'mole' | 'golden' | 'bomb';
}

interface WhackAMoleProps {
  onClose: () => void;
}

const GRID_SIZE = 9; // 3x3 grid
const GAME_DURATION = 30; // seconds

export const WhackAMole = ({ onClose }: WhackAMoleProps) => {
  const gainXP = usePetStore(state => state.gainXP);
  
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'ended'>('menu');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [highScore, setHighScore] = useState<number | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [combo, setCombo] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  
  const moleSpawnRef = useRef<number | null>(null);
  
  // Load high score
  useEffect(() => {
    const existing = highScoreService.getHighScore('whackamole', 'normal');
    setHighScore(existing?.score || null);
  }, []);
  
  // Spawn moles
  const spawnMole = useCallback(() => {
    const availablePositions = moles
      .map((m, idx) => (!m.isVisible ? idx : -1))
      .filter(idx => idx !== -1);
    
    if (availablePositions.length === 0) return;
    
    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    
    // 10% chance for golden mole (3x points), 5% chance for bomb (-5 points)
    const rand = Math.random();
    const type: 'mole' | 'golden' | 'bomb' = rand < 0.05 ? 'bomb' : rand < 0.15 ? 'golden' : 'mole';
    
    setMoles(prev => prev.map((m, idx) => 
      idx === randomPosition 
        ? { ...m, isVisible: true, type, isHit: false }
        : m
    ));
    
    // Hide mole after random time
    const hideDelay = type === 'golden' ? 800 : type === 'bomb' ? 1500 : 1000 + Math.random() * 500;
    setTimeout(() => {
      setMoles(prev => prev.map((m, idx) => 
        idx === randomPosition && !m.isHit
          ? { ...m, isVisible: false }
          : m
      ));
    }, hideDelay);
  }, [moles]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Spawn moles at increasing frequency
    let spawnInterval = 800;
    const minSpawnInterval = 400;
    
    const spawnLoop = () => {
      spawnMole();
      spawnInterval = Math.max(minSpawnInterval, spawnInterval - 5);
      moleSpawnRef.current = window.setTimeout(spawnLoop, spawnInterval);
    };
    
    spawnLoop();
    
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setGameState('ended');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => {
      clearTimeout(moleSpawnRef.current!);
      clearInterval(timer);
    };
  }, [gameState, spawnMole]);
  
  // Handle game end
  useEffect(() => {
    if (gameState === 'ended' && score > 0) {
      // Check high score
      highScoreService.submitScore('whackamole', score, 'normal')
        .then(({ isNewHighScore }) => {
          setIsNewHighScore(isNewHighScore);
        });
      
      // Award XP
      gainXP(score / 2, 'whackamole');
      
      // Check achievements
      achievementService.checkScoreAchievement('whackamole', score);
    }
  }, [gameState, score, gainXP]);
  
  // Initialize moles
  const startGame = () => {
    setMoles(Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      position: i,
      isVisible: false,
      isHit: false,
      type: 'mole',
    })));
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setCombo(0);
    setGameState('playing');
    setIsNewHighScore(false);
  };
  
  // Handle mole hit
  const handleHit = (moleId: number) => {
    const mole = moles.find(m => m.id === moleId);
    if (!mole || !mole.isVisible || mole.isHit) return;
    
    setMoles(prev => prev.map(m => 
      m.id === moleId ? { ...m, isHit: true, isVisible: false } : m
    ));
    
    if (mole.type === 'bomb') {
      setScore(prev => Math.max(0, prev - 5));
      setCombo(0);
    } else {
      const points = mole.type === 'golden' ? 3 : 1;
      const comboBonus = Math.floor(combo / 5);
      setScore(prev => prev + points + comboBonus);
      setCombo(prev => prev + 1);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), 300);
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(mole.type === 'bomb' ? [50, 30, 50] : 30);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-bg-primary rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            🔨 Whack-a-Mole
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Menu State */}
        {gameState === 'menu' && (
          <div className="text-center py-8 space-y-6">
            <div className="text-6xl">🐹</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Whack the moles!</h3>
              <p className="text-text-secondary text-sm">
                Tap moles as they appear. Watch out for 💣 bombs!
                <br />
                🌟 Golden moles = 3x points!
              </p>
            </div>
            {highScore && (
              <p className="text-amber-500 font-bold">
                🏆 High Score: {highScore}
              </p>
            )}
            <Button onClick={startGame} className="w-full py-4">
              Start Game
            </Button>
          </div>
        )}
        
        {/* Playing State */}
        {gameState === 'playing' && (
          <>
            {/* HUD */}
            <div className="flex justify-between mb-4">
              <div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-2 rounded-full font-bold">
                🔨 {score}
              </div>
              <div className={`px-4 py-2 rounded-full font-bold ${
                timeLeft <= 10 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                ⏱️ {timeLeft}s
              </div>
            </div>
            
            {/* Combo indicator */}
            <AnimatePresence>
              {showCombo && combo > 1 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1.2, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-black text-primary-500 pointer-events-none"
                >
                  {combo}x COMBO!
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Game Grid */}
            <div className="grid grid-cols-3 gap-3">
              {moles.map((mole) => (
                <motion.button
                  key={mole.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleHit(mole.id)}
                  className="aspect-square rounded-xl bg-gradient-to-b from-green-200 to-green-300 dark:from-green-800 dark:to-green-900 relative overflow-hidden border-2 border-green-400 dark:border-green-700"
                >
                  {/* Hole */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-gradient-to-t from-green-900/50 to-transparent rounded-t-full" />
                  
                  {/* Mole */}
                  <AnimatePresence>
                    {mole.isVisible && (
                      <motion.div
                        initial={{ y: 60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 60, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                        className="absolute inset-0 flex items-center justify-center text-4xl"
                      >
                        {mole.type === 'bomb' ? '💣' : mole.type === 'golden' ? '🌟' : '🐹'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Hit effect */}
                  {mole.isHit && (
                    <motion.div
                      initial={{ scale: 0, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center text-2xl"
                    >
                      {mole.type === 'bomb' ? '💥' : '✨'}
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </>
        )}
        
        {/* End State */}
        {gameState === 'ended' && (
          <div className="text-center py-8 space-y-6">
            <div className="text-6xl">🎉</div>
            <div>
              <h3 className="text-3xl font-black text-amber-500">{score}</h3>
              <p className="text-text-secondary">Points Scored!</p>
            </div>
            {isNewHighScore && (
              <div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-2 rounded-full text-amber-600 font-bold inline-block">
                🏆 New High Score!
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Exit
              </Button>
              <Button onClick={startGame} className="flex-1">
                Play Again
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
