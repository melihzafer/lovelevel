import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X } from 'lucide-react';
import { usePetStore } from '../../store';
import { Button } from '../Button';

interface PetMinigameProps {
  onClose: () => void;
}

interface GameItem {
  id: number;
  x: number;
  y: number;
  type: 'heart' | 'golden-heart';
}

export const PetMinigame = ({ onClose }: PetMinigameProps) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [items, setItems] = useState<GameItem[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const gainXP = usePetStore((state) => state.gainXP);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Start game timer
  useEffect(() => {
    if (!gameActive) return;

    if (timeLeft <= 0) {
      endGame();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameActive]);

  // Spawn items
  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      if (items.length < 5) {
        spawnItem();
      }
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [gameActive, items]);

  const spawnItem = () => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    const padding = 40;
    
    const newItem: GameItem = {
      id: Date.now(),
      x: Math.random() * (width - padding * 2) + padding,
      y: Math.random() * (height - padding * 2) + padding,
      type: Math.random() > 0.9 ? 'golden-heart' : 'heart',
    };

    setItems((prev) => [...prev, newItem]);

    // Auto-remove item after a few seconds
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== newItem.id));
    }, 2000);
  };

  const handleItemClick = (id: number, type: 'heart' | 'golden-heart') => {
    // Vibrate if supported
    if (navigator.vibrate) navigator.vibrate(10);

    const points = type === 'golden-heart' ? 5 : 1;
    setScore((prev) => prev + points);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(30);
    setScore(0);
    setItems([]);
    setShowResult(false);
  };

  const endGame = async () => {
    setGameActive(false);
    setShowResult(true);
    setItems([]);
    
    if (score > 0) {
      await gainXP(score * 2, 'minigame'); // 2 XP per point
    }
  };

  return (
    <div className="absolute inset-0 z-20 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex gap-4">
          <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
            Score: {score}
          </div>
          <div className={`text-xl font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-600 dark:text-gray-300'}`}>
            {timeLeft}s
          </div>
        </div>
        {!gameActive && !showResult && (
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
             <X className="w-6 h-6 text-gray-500" />
           </button>
        )}
      </div>

      {/* Game Area */}
      <div ref={containerRef} className="flex-1 relative cursor-crosshair">
        {!gameActive && !showResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <Heart className="w-16 h-16 text-primary-500 animate-bounce" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Catch the Love!</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Click as many hearts as you can in 30 seconds.<br/>
                Golden hearts are worth 5x points!
              </p>
            </div>
            <Button onClick={startGame} className="w-48 shadow-lg shadow-primary-500/30">
              Start Game
            </Button>
          </div>
        )}

        {showResult && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-6xl mb-2">🏆</div>
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Time's Up!</h3>
              <p className="text-xl text-primary-600 dark:text-primary-400 font-medium">
                You scored {score} points!
              </p>
              <p className="text-gray-500 mt-2">
                +{score * 2} XP Gained
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
              <Button onClick={startGame}>
                Play Again
              </Button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {items.map((item) => (
            <motion.button
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              style={{ left: item.x, top: item.y }}
              className="absolute p-2 active:scale-90 transition-transform"
              onClick={() => handleItemClick(item.id, item.type)}
            >
              <Heart 
                className={`
                  ${item.type === 'golden-heart' 
                    ? 'w-12 h-12 text-yellow-400 fill-yellow-400 drop-shadow-lg' 
                    : 'w-10 h-10 text-primary-500 fill-primary-500'
                  }
                `} 
              />
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
