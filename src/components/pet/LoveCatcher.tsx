import { useState, useEffect, useRef } from 'react';
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
  type: 'coin' | 'heart' | 'poop';
  speed: number;
}

export const LoveCatcher = ({ onClose }: LoveCatcherProps) => {
  const pet = usePetStore(); // We only need actions, and this component is isolated, so re-renders aren't critical here except inside the loop
  const requestRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Game State (Refs for performance - no re-renders on tick)
  const itemsRef = useRef<Item[]>([]);
  const scoreRef = useRef(0);
  const paddleXRef = useRef(50); // %
  const lastTimeRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const gameActiveRef = useRef(false);

  // UI State
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);

  // Init Game
  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setFinalScore(0);
    setTimeLeft(45);
    
    // Reset Refs
    itemsRef.current = [];
    scoreRef.current = 0;
    paddleXRef.current = 50;
    lastTimeRef.current = performance.now();
    spawnTimerRef.current = 0;
    gameActiveRef.current = true;
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  // Game Loop
  const gameLoop = (time: number) => {
    if (!gameActiveRef.current) return;

    const dt = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    update(dt);
    draw();
    
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  const update = (dt: number) => {
    // Spawn
    spawnTimerRef.current += dt;
    // Difficulty: Spawn faster as score increases
    const spawnRate = Math.max(200, 800 - (scoreRef.current * 2));
    
    if (spawnTimerRef.current > spawnRate) {
        const typeProb = Math.random();
        const type = typeProb > 0.85 ? 'poop' : (typeProb > 0.7 ? 'heart' : 'coin');
        
        itemsRef.current.push({
            id: Date.now() + Math.random(),
            x: Math.random() * 80 + 10, // 10% to 90%
            y: -10,
            type: type as any,
            speed: (Math.random() * 0.05 + 0.05) // Speed in % per ms
        });
        spawnTimerRef.current = 0;
    }

    // Move & Collision
    const nextItems: Item[] = [];
    const paddleWidth = 15; // %
    const paddleY = 85; // %
    const paddleHitY = 10; // % tolerance

    itemsRef.current.forEach(item => {
        // Move (speed * dt)
        item.y += item.speed * (dt / 16); // Normalize to ~60fps

        // Check Collision
        // Hitbox: item is roughly at item.x, paddle at paddleXRef.current
        // Simple rectangular collision check in % coordinates
        const hitY = item.y > (paddleY - 5) && item.y < (paddleY + 5);
        const hitX = Math.abs(item.x - paddleXRef.current) < (paddleWidth / 2 + 5);

        if (hitY && hitX) {
            // Caught!
            if (item.type === 'coin') scoreRef.current += 5;
            else if (item.type === 'heart') {
                 scoreRef.current += 20;
                 if ('vibrate' in navigator) navigator.vibrate(50);
            }
            else if (item.type === 'poop') {
                 scoreRef.current = Math.max(0, scoreRef.current - 30);
                 if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
            }
            // Consumed
        } else if (item.y < 110) {
            nextItems.push(item);
        }
    });

    itemsRef.current = nextItems;
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Helpers
    const w = canvas.width;
    const h = canvas.height;
    
    // Draw Paddle (Pet)
    // paddleXRef is %, convert to px
    const px = (paddleXRef.current / 100) * w;
    const py = 0.85 * h;
    
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.fillText('🐶', px, py);
    ctx.shadowBlur = 0;

    // Draw Items
    itemsRef.current.forEach(item => {
        const ix = (item.x / 100) * w;
        const iy = (item.y / 100) * h;
        
        let icon = '🪙';
        if (item.type === 'heart') icon = '💖';
        if (item.type === 'poop') icon = '💩';
        
        ctx.font = '30px Arial';
        ctx.fillText(icon, ix, iy);
    });
    
    // Draw Score (in Canvas for performance, or overlay? Overlay is cleaner text, but let's do overlay)
  };

  // Timer Effect
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
        setTimeLeft(prev => {
            if (prev <= 1) {
                // Game Over
                gameActiveRef.current = false;
                setFinalScore(scoreRef.current);
                setGameOver(true);
                setIsPlaying(false);
                if (requestRef.current) cancelAnimationFrame(requestRef.current);
                return 0;
            }
            return prev - 1;
        });
    }, 1000); // UI timer doesn't need to be synced perfectly with frames

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Input Handling
  const handleInput = (clientX: number) => {
    if (!canvasRef.current || !gameActiveRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = (x / rect.width) * 100;
    paddleXRef.current = Math.max(5, Math.min(95, pct));
  };

  // Resize Handler to keep canvas 1:1 pixel density or fit
  useEffect(() => {
    const handleResize = () => {
        if (canvasRef.current && canvasRef.current.parentElement) {
            const rect = canvasRef.current.parentElement.getBoundingClientRect();
            canvasRef.current.width = rect.width;
            canvasRef.current.height = rect.height;
            // Draw once to prevent blank
            if (!isPlaying) {
                 // intro draw?
            }
        }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save Score Effect
  useEffect(() => {
    if (gameOver && finalScore > 0) {
        pet.addCoins(finalScore);
        pet.gainXP(10, 'minigame');
    }
  }, [gameOver]);
  
  // Cleanup
  useEffect(() => {
      return () => {
          gameActiveRef.current = false;
          if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm overflow-hidden border-4 border-amber-400 shadow-2xl relative flex flex-col h-[70vh]">
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

        {/* Game Container */}
        <div className="flex-1 relative bg-gradient-to-b from-sky-200 to-sky-100 dark:from-sky-900 dark:to-sky-800 touch-none overflow-hidden">
             
             {/* HUD Overlay */}
             <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none select-none">
                <div className="bg-white/90 dark:bg-black/60 backdrop-blur px-4 py-2 rounded-full font-black text-amber-600 text-lg shadow-sm border border-amber-100 dark:border-amber-900">
                    🪙 {isPlaying ? scoreRef.current : finalScore}
                </div>
                <div className={`bg-white/90 dark:bg-black/60 backdrop-blur px-4 py-2 rounded-full font-black text-lg shadow-sm border ${
                     timeLeft < 10 ? 'text-red-500 border-red-200 animate-pulse' : 'text-gray-600 border-gray-100 dark:border-gray-800 dark:text-gray-300'
                }`}>
                    ⏱️ {timeLeft}s
                </div>
            </div>

            {/* Canvas Layer */}
            <canvas 
                ref={canvasRef}
                className="w-full h-full block"
                onPointerMove={(e) => handleInput(e.clientX)}
                onTouchMove={(e) => handleInput(e.touches[0].clientX)}
            />

            {/* Start Screen Overlay */}
            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 text-white p-6 text-center space-y-6 backdrop-blur-[2px]">
                    <div className="text-6xl animate-bounce">👐</div>
                    <div className="space-y-2">
                        <h3 className="text-3xl font-black">Ready?</h3>
                        <p className="text-lg opacity-90">Drag your pet left & right to catch coins!</p>
                    </div>
                    <Button onClick={startGame} className="w-full text-lg py-4 bg-amber-500 hover:bg-amber-600 border-none shadow-lg shadow-amber-500/20">
                        Start Game!
                    </Button>
                </div>
            )}

            {/* Game Over Overlay */}
            {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 text-white p-6 text-center space-y-6 backdrop-blur-md">
                    <h3 className="text-4xl font-black text-amber-400">Time's Up!</h3>
                    
                    <div className="bg-white/10 p-6 rounded-2xl border border-white/10 w-full mb-4">
                        <div className="text-sm uppercase tracking-widest opacity-70 mb-2">Total Score</div>
                        <div className="text-7xl font-black mb-4">{finalScore}</div>
                        <div className="text-amber-300 font-bold flex items-center justify-center gap-2">
                            <span>+{finalScore} Coins Added</span>
                            <span>🪙</span>
                        </div>
                    </div>

                    <div className="flex gap-3 w-full">
                        <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent border-white/30 text-white hover:bg-white/10 py-3">Exit</Button>
                        <Button onClick={startGame} className="flex-1 bg-amber-500 text-white hover:bg-amber-600 border-none py-3 shadow-lg shadow-amber-500/20">Play Again</Button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
