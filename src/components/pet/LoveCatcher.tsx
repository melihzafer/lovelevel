import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePetStore } from '../../store';
import { Button } from '../Button';
import { X, ArrowLeftRight } from 'lucide-react';

interface LoveCatcherProps {
  onClose: () => void;
}

interface Item {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'heart' | 'poop' | 'star';
  speed: number;
}

export const LoveCatcher = ({ onClose }: LoveCatcherProps) => {
  const pet = usePetStore((state) => state);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [petX, setPetX] = useState(50); // Percentage: 0 to 100
  
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // Move Pet on drag/touch
  const handleMove = (clientX: number) => {
      if (!containerRef.current || !isPlaying) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const percentage = (relativeX / rect.width) * 100;
      
      // Clamp between 5% and 95% (keep pet visible)
      setPetX(Math.max(5, Math.min(95, percentage)));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
      handleMove(e.clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX);
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying || gameOver) {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        return;
    }

    let lastTime = Date.now();
    let spawnTimer = 0;

    const loop = () => {
        const now = Date.now();
        const dt = now - lastTime;
        lastTime = now;

        // Spawn Items (faster as time goes on)
        spawnTimer += dt;
        if (spawnTimer > (800 - (score * 2))) { // Difficulty curve
            const typeProb = Math.random();
            const type = typeProb > 0.85 ? 'poop' : (typeProb > 0.7 ? 'heart' : 'coin');
            
            setItems(prev => [
                ...prev,
                {
                    id: Date.now() + Math.random(),
                    x: Math.random() * 80 + 10,
                    y: -10,
                    type: type as any,
                    speed: (Math.random() * 0.5 + 0.5) // Base speed
                }
            ]);
            spawnTimer = 0;
        }

        // Update Items & Collision Detection
        setItems(prevItems => {
            const nextItems: Item[] = [];
            
            for (const item of prevItems) {
                // Move item (pixels approx per frame at 60fps)
                // We use percentage Y for simplicity in React rendering, so speed is % per tick
                // Let's assume 100% height = 400px. 1% = 4px.
                const newY = item.y + item.speed;

                // Collision Detection
                // Pet is at petX (center), ~15% width, at Y=85% roughly
                const hitY = newY > 80 && newY < 95;
                const petRadius = 10; // % width acceptance
                const hitX = Math.abs(petX - item.x) < petRadius;

                if (hitY && hitX) {
                    // CATCH!
                    if (item.type === 'coin') {
                        setScore(s => s + 5);
                    } else if (item.type === 'heart') {
                        setScore(s => s + 20);
                        // Trigger haptic
                        if ('vibrate' in navigator) navigator.vibrate(50);
                    } else if (item.type === 'poop') {
                        setScore(s => Math.max(0, s - 30));
                         if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
                         // Visual shake effect?
                    }
                    // Don't add to nextItems (removed)
                } else if (newY < 110) {
                    // Keep item if still on screen
                    nextItems.push({ ...item, y: newY });
                }
            }
            return nextItems;
        });

        requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, gameOver, petX, score]); // Dependencies for loop closures

  // Timer
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                setGameOver(true);
                setIsPlaying(false);
                return 0;
            }
            return prev - 1;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  const startGame = () => {
      setIsPlaying(true);
      setItems([]);
      setScore(0);
      setTimeLeft(45);
      setGameOver(false);
      setPetX(50);
  };
  
  // Award coins on game over
  useEffect(() => {
      if (gameOver && score > 0) {
          pet.addCoins(score);
          // Bonus XP for playing
          pet.gainXP(10, 'minigame'); 
      }
  }, [gameOver]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm overflow-hidden border-4 border-amber-400 shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-amber-400 p-4 flex justify-between items-center text-amber-950 shrink-0">
             <div className="font-bold text-xl flex items-center gap-2">
                <ArrowLeftRight size={20} />
                Love Catcher
             </div>
             <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                 <X size={24} />
             </button>
        </div>

        {/* Game Area */}
        <div 
            ref={containerRef}
            className="flex-1 min-h-[400px] bg-gradient-to-b from-sky-200 to-sky-100 dark:from-sky-900 dark:to-sky-800 relative overflow-hidden touch-none"
            onPointerMove={handlePointerMove}
            onTouchMove={handleTouchMove}
        >
            {/* Score & HUD */}
            <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
                <div className="bg-white/90 dark:bg-black/60 backdrop-blur px-4 py-2 rounded-full font-black text-amber-600 text-lg shadow-sm border border-amber-100 dark:border-amber-900">
                    🪙 {score}
                </div>
                <div className={`bg-white/90 dark:bg-black/60 backdrop-blur px-4 py-2 rounded-full font-black text-lg shadow-sm border ${
                    timeLeft < 10 ? 'text-red-500 border-red-200 animate-pulse' : 'text-gray-600 border-gray-100 dark:border-gray-800 dark:text-gray-300'
                }`}>
                    ⏱️ {timeLeft}s
                </div>
            </div>

            {/* Start Screen */}
            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 text-white p-6 text-center space-y-6 backdrop-blur-[2px]">
                    <div className="text-6xl animate-bounce">👐</div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black">Ready?</h3>
                        <p className="text-lg opacity-90">Drag your pet left & right to catch coins!</p>
                        <div className="flex justify-center gap-4 text-sm opacity-80 mt-2">
                            <span className="flex items-center gap-1">🪙 +5</span>
                            <span className="flex items-center gap-1">💖 +20</span>
                            <span className="flex items-center gap-1">💩 -30</span>
                        </div>
                    </div>
                    <Button onClick={startGame} className="w-full text-lg py-4 bg-amber-500 hover:bg-amber-600 border-none shadow-lg shadow-amber-500/20">
                        Start Game!
                    </Button>
                </div>
            )}

            {/* Game Over Screen */}
            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white p-6 text-center space-y-6 backdrop-blur-md">
                    <h3 className="text-4xl font-black text-amber-400">Time's Up!</h3>
                    
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10 w-full">
                        <div className="text-sm uppercase tracking-widest opacity-70 mb-2">Total Score</div>
                        <div className="text-7xl font-black mb-4">{score}</div>
                        <div className="text-amber-300 font-bold flex items-center justify-center gap-2">
                            <span>+{score} Coins Added</span>
                            <span>🪙</span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full pt-2">
                        <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10 py-3">Exit</Button>
                        <Button onClick={startGame} className="flex-1 bg-amber-500 text-white hover:bg-amber-600 border-none py-3 shadow-lg shadow-amber-500/20">Play Again</Button>
                    </div>
                </div>
            )}

            {/* The Pet Paddle */}
            <motion.div 
                className="absolute bottom-[10%] w-20 h-20 -ml-10 pointer-events-none z-10"
                style={{ left: `${petX}%` }}
                animate={{ scale: isPlaying ? 1 : 0.9 }}
            >
                <div className="text-6xl filter drop-shadow-xl transform -translate-y-2">
                    {/* Simplified pet render for game */}
                    🐶
                </div>
                {/* Hitbox visual guide (optional/debug) */}
                {/* <div className="absolute inset-0 border-2 border-red-500 rounded-full opacity-30"></div> */}
            </motion.div>

            {/* Falling Items */}
            {items.map(item => (
                <div
                    key={item.id}
                    className="absolute text-4xl transform -translate-x-1/2 pointer-events-none"
                    style={{ 
                        left: `${item.x}%`, 
                        top: `${item.y}%`,
                        opacity: 1 // No fade out for sharpness
                    }}
                >
                    {item.type === 'coin' && '🪙'}
                    {item.type === 'heart' && '💖'}
                    {item.type === 'poop' && '💩'}
                </div>
            ))}
            
            {/* Guide Text */}
            {isPlaying && (
                <div className="absolute bottom-4 w-full text-center text-sky-900/40 dark:text-sky-100/30 text-sm font-bold pointer-events-none">
                    &larr; Drag to Move &rarr;
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
