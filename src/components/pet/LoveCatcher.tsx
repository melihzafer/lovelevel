import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetStore } from '../../store';
import { Button } from '../Button';
import { X } from 'lucide-react';

interface LoveCatcherProps {
  onClose: () => void;
}

interface Item {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'heart' | 'poop';
  speed: number;
}

export const LoveCatcher = ({ onClose }: LoveCatcherProps) => {
  const pet = usePetStore();
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    // Spawn items
    const spawnInterval = setInterval(() => {
        if (Math.random() > 0.3) {
            const type = Math.random() > 0.8 ? 'heart' : (Math.random() > 0.9 ? 'poop' : 'coin');
            setItems(prev => [
                ...prev,
                {
                    id: Date.now(),
                    x: Math.random() * 80 + 10, // 10% to 90% width
                    y: -10,
                    type: type as any,
                    speed: Math.random() * 2 + 1
                }
            ]);
        }
    }, 800);

    // Update positions
    const moveInterval = setInterval(() => {
        setItems(prev => prev.map(item => ({ ...item, y: item.y + item.speed })).filter(item => item.y < 110));
    }, 50);

    // Timer
    const timerInterval = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                setGameOver(true);
                setIsPlaying(false);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    return () => {
        clearInterval(spawnInterval);
        clearInterval(moveInterval);
        clearInterval(timerInterval);
    };
  }, [isPlaying, gameOver]);

  const handleCatch = (item: Item) => {
      // Remove item
      setItems(prev => prev.filter(i => i.id !== item.id));
      
      // Effect
      if (item.type === 'coin') {
          setScore(s => s + 10);
      } else if (item.type === 'heart') {
          setScore(s => s + 50);
          pet.feedPet(); // Bonus feeding! (Or simplified effect)
      } else if (item.type === 'poop') {
          setScore(s => Math.max(0, s - 20));
           // Vibrate
           if ('vibrate' in navigator) navigator.vibrate(200);
      }
  };

  const startGame = () => {
      setIsPlaying(true);
      setItems([]);
      setScore(0);
      setTimeLeft(30);
      setGameOver(false);
  };
  
  // Award coins on game over
  useEffect(() => {
      if (gameOver && score > 0) {
          pet.addCoins(score);
      }
  }, [gameOver]);

  // Render
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm overflow-hidden border-4 border-amber-400 shadow-2xl relative">
        {/* Header */}
        <div className="bg-amber-400 p-4 flex justify-between items-center text-amber-950">
             <div className="font-bold text-xl">Love Catcher</div>
             <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
                 <X size={24} />
             </button>
        </div>

        {/* Game Area */}
        <div 
            ref={containerRef}
            className="h-[400px] bg-sky-200 dark:bg-sky-900 relative overflow-hidden cursor-crosshair"
        >
            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-10 text-white p-6 text-center space-y-4">
                    <div className="text-4xl">🪙 ❤️ 💩</div>
                    <h3 className="text-2xl font-black">Ready?</h3>
                    <p>Catch coins and hearts! Avoid the poop!</p>
                    <Button onClick={startGame} className="w-full text-lg animate-pulse">Start Game!</Button>
                </div>
            )}

            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 text-white p-6 text-center space-y-4">
                    <h3 className="text-3xl font-black text-amber-400">Game Over!</h3>
                    <div className="text-6xl font-black">{score}</div>
                    <p className="uppercase tracking-widest text-sm">Coins Earned</p>
                    <div className="flex gap-2 w-full pt-4">
                        <Button onClick={onClose} variant="outline" className="flex-1 bg-white/10 border-white/20 text-white">Exit</Button>
                        <Button onClick={startGame} className="flex-1 bg-amber-400 text-amber-950 hover:bg-amber-500">Play Again</Button>
                    </div>
                </div>
            )}

            {/* Score & HUD */}
            <div className="absolute top-2 left-2 right-2 flex justify-between z-10 pointer-events-none">
                <div className="bg-white/80 dark:bg-black/50 px-3 py-1 rounded-full font-bold text-amber-600">
                    🪙 {score}
                </div>
                <div className={`bg-white/80 dark:bg-black/50 px-3 py-1 rounded-full font-bold ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
                    ⏱️ {timeLeft}s
                </div>
            </div>

            {/* Falling Items */}
            <AnimatePresence>
                {items.map(item => (
                    <motion.button
                        key={item.id}
                        initial={{ y: -50, x: `${item.x}%`, opacity: 0 }}
                        animate={{ y: `${item.y * 3.5}px`, opacity: 1 }} // Scale y to pixels roughly
                        exit={{ scale: 0, opacity: 0 }}
                        className="absolute text-4xl transform -translate-x-1/2 focus:outline-none"
                        style={{ left: `${item.x}%`, top: 0 }}
                        onClick={() => handleCatch(item)}
                        // Also auto-catch on simple hover for desktop?
                    >
                        {item.type === 'coin' && '🪙'}
                        {item.type === 'heart' && '💖'}
                        {item.type === 'poop' && '💩'}
                    </motion.button>
                ))}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
