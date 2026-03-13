/**
 * Reaction Time Minigame
 * Test how fast you can react to visual cues
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { usePetStore } from '../../store';
import { highScoreService } from '../../lib/highScoreService';
import { Button } from '../Button';

interface ReactionTimeProps {
  onClose: () => void;
}

const ROUNDS = 5;
const MIN_WAIT = 2000; // 2 seconds minimum wait
const MAX_WAIT = 5000; // 5 seconds maximum wait

export const ReactionTime = ({ onClose }: ReactionTimeProps) => {
  const gainXP = usePetStore(state => state.gainXP);
  
  const [gameState, setGameState] = useState<'menu' | 'waiting' | 'ready' | 'clicked' | 'tooEarly' | 'ended'>('menu');
  const [currentRound, setCurrentRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState<number | null>(null);
  const [highScore, setHighScore] = useState<number | null>(null);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);
  
  // Load high score (lower is better for reaction time)
  useEffect(() => {
    const existing = highScoreService.getHighScore('reactiontime', 'normal');
    setHighScore(existing?.score || null);
  }, []);
  
  // Start a round
  const startRound = useCallback(() => {
    setGameState('waiting');
    
    // Random wait time
    const waitTime = MIN_WAIT + Math.random() * (MAX_WAIT - MIN_WAIT);
    
    timeoutRef.current = window.setTimeout(() => {
      setGameState('ready');
      startTimeRef.current = Date.now();
    }, waitTime);
  }, []);
  
  // Handle click
  const handleClick = useCallback(() => {
    if (gameState === 'waiting') {
      // Clicked too early
      clearTimeout(timeoutRef.current!);
      setGameState('tooEarly');
      return;
    }
    
    if (gameState === 'ready') {
      // Calculate reaction time
      const reactionTime = Date.now() - startTimeRef.current;
      setCurrentTime(reactionTime);
      setReactionTimes(prev => [...prev, reactionTime]);
      setGameState('clicked');
      return;
    }
    
    if (gameState === 'clicked' || gameState === 'tooEarly') {
      // Move to next round
      if (currentRound < ROUNDS - 1) {
        setCurrentRound(prev => prev + 1);
        startRound();
      } else {
        setGameState('ended');
      }
    }
  }, [gameState, currentRound, startRound]);
  
  // Start game
  const startGame = () => {
    setCurrentRound(0);
    setReactionTimes([]);
    setCurrentTime(null);
    setIsNewHighScore(false);
    startRound();
  };
  
  // Handle game end
  useEffect(() => {
    if (gameState === 'ended' && reactionTimes.length > 0) {
      // Calculate average (lower is better)
      const avgTime = Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
      
      // For high score, we store the inverse (higher score = better)
      const score = Math.max(0, 1000 - avgTime);
      
      highScoreService.submitScore('reactiontime', score, 'normal')
        .then(({ isNewHighScore }) => {
          setIsNewHighScore(isNewHighScore);
        });
      
      gainXP(score / 10, 'reactiontime');
    }
  }, [gameState, reactionTimes, gainXP]);
  
  // Calculate stats
  const averageTime = reactionTimes.length > 0
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;
  const bestTime = reactionTimes.length > 0
    ? Math.min(...reactionTimes)
    : 0;
  
  // Get rating based on average time
  const getRating = (time: number) => {
    if (time < 200) return { emoji: '🚀', text: 'Incredible!' };
    if (time < 250) return { emoji: '⚡', text: 'Lightning Fast!' };
    if (time < 300) return { emoji: '🔥', text: 'Excellent!' };
    if (time < 350) return { emoji: '👍', text: 'Good!' };
    if (time < 400) return { emoji: '😊', text: 'Average' };
    return { emoji: '🐢', text: 'Keep practicing!' };
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
            ⚡ Reaction Time
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
            <div className="text-6xl">⚡</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Test your reflexes!</h3>
              <p className="text-text-secondary text-sm">
                Click as fast as you can when the screen turns green.
                <br />
                {ROUNDS} rounds - try to get the lowest average time!
              </p>
            </div>
            {highScore && (
              <p className="text-amber-500 font-bold">
                🏆 Best Score: {1000 - highScore}ms avg
              </p>
            )}
            <Button onClick={startGame} className="w-full py-4">
              Start Test
            </Button>
          </div>
        )}
        
        {/* Game Area */}
        {(gameState === 'waiting' || gameState === 'ready' || gameState === 'clicked' || gameState === 'tooEarly') && (
          <>
            {/* Progress */}
            <div className="mb-4 text-center text-text-secondary">
              Round {currentRound + 1} of {ROUNDS}
            </div>
            
            {/* Click area */}
            <motion.button
              onClick={handleClick}
              className={`w-full h-64 rounded-2xl flex flex-col items-center justify-center transition-colors ${
                gameState === 'waiting'
                  ? 'bg-red-500'
                  : gameState === 'ready'
                    ? 'bg-green-500'
                    : gameState === 'tooEarly'
                      ? 'bg-orange-500'
                      : 'bg-blue-500'
              }`}
              animate={{
                scale: gameState === 'ready' ? [1, 1.02, 1] : 1,
              }}
              transition={{ repeat: gameState === 'ready' ? Infinity : 0, duration: 0.5 }}
            >
              {gameState === 'waiting' && (
                <div className="text-white text-center">
                  <p className="text-2xl font-bold">Wait for green...</p>
                  <p className="text-sm opacity-75 mt-2">Don't click yet!</p>
                </div>
              )}
              
              {gameState === 'ready' && (
                <div className="text-white text-center">
                  <p className="text-4xl font-black">CLICK!</p>
                </div>
              )}
              
              {gameState === 'clicked' && currentTime && (
                <div className="text-white text-center">
                  <p className="text-5xl font-black">{currentTime}ms</p>
                  <p className="text-lg mt-2">{getRating(currentTime).emoji} {getRating(currentTime).text}</p>
                  <p className="text-sm opacity-75 mt-4">Click to continue</p>
                </div>
              )}
              
              {gameState === 'tooEarly' && (
                <div className="text-white text-center">
                  <p className="text-4xl font-black">Too early! 🙅</p>
                  <p className="text-sm opacity-75 mt-4">Click to try again</p>
                </div>
              )}
            </motion.button>
            
            {/* Stats so far */}
            {reactionTimes.length > 0 && (
              <div className="mt-4 flex justify-center gap-4 text-sm text-text-secondary">
                <span>Avg: {averageTime}ms</span>
                <span>Best: {bestTime}ms</span>
              </div>
            )}
          </>
        )}
        
        {/* End State */}
        {gameState === 'ended' && (
          <div className="text-center py-8 space-y-6">
            <div className="text-6xl">{getRating(averageTime).emoji}</div>
            <div>
              <h3 className="text-3xl font-black text-amber-500">{averageTime}ms</h3>
              <p className="text-text-secondary">Average Reaction Time</p>
              <p className="text-lg font-bold mt-2">{getRating(averageTime).text}</p>
            </div>
            
            {/* All times */}
            <div className="flex justify-center gap-2 flex-wrap">
              {reactionTimes.map((time, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded text-sm ${
                    time === bestTime
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {time}ms
                </span>
              ))}
            </div>
            
            {isNewHighScore && (
              <div className="bg-amber-100 dark:bg-amber-900/40 px-4 py-2 rounded-full text-amber-600 font-bold inline-block">
                🏆 New Best!
              </div>
            )}
            
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline" className="flex-1">
                Exit
              </Button>
              <Button onClick={startGame} className="flex-1">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
