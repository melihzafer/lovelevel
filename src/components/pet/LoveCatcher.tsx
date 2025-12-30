import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePetStore } from '../../store';
import { Button } from '../Button';
import { X, ArrowLeftRight, Maximize2, Minimize2 } from 'lucide-react';

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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [showHitEffect, setShowHitEffect] = useState<string | null>(null); // 'heart', 'coin', 'poop'

  // Init Game
  const startGame = (selectedDifficulty: 'easy' | 'normal' | 'hard') => {
    setDifficulty(selectedDifficulty);
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
    // Difficulty Logic based on selected level
    let baseSpawnRate = 1200;
    let minSpawnRate = 400;
    let spawnDecay = 4;
    let baseSpeed = 0.15; // % per ms
    let speedScaling = 0.002;
    let bombChance = 0.25;

    if (difficulty === 'easy') {
        baseSpawnRate = 1500; minSpawnRate = 600; spawnDecay = 2;
        baseSpeed = 0.10; speedScaling = 0.001; bombChance = 0.15;
    } else if (difficulty === 'hard') {
        baseSpawnRate = 800; minSpawnRate = 250; spawnDecay = 5;
        baseSpeed = 0.20; speedScaling = 0.003; bombChance = 0.35;
    }

    const spawnRate = Math.max(minSpawnRate, baseSpawnRate - (scoreRef.current * spawnDecay));
    
    if (spawnTimerRef.current > spawnRate) {
        const typeProb = Math.random();
        
        let type = 'coin';
        if (typeProb > (1 - bombChance)) type = 'poop';
        else if (typeProb > (1 - bombChance - 0.15)) type = 'heart';

        // Speed scaling
        const speedMultiplier = 1 + (scoreRef.current * speedScaling);
        
        itemsRef.current.push({
            id: Date.now() + Math.random(),
            x: Math.random() * 80 + 10,
            y: -10,
            type: type as any,
            speed: (Math.random() * 0.1 + baseSpeed) * speedMultiplier
        });
        spawnTimerRef.current = 0;
    }

    // Move & Collision
    const nextItems: Item[] = [];
    const paddleWidth = 15; // %
    const paddleY = 85; // %

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
            if (item.type === 'coin') {
                 scoreRef.current += 5;
            } else if (item.type === 'heart') {
                 scoreRef.current += 20;
                 if ('vibrate' in navigator) navigator.vibrate(50);
            } else if (item.type === 'poop') {
                 if (difficulty === 'hard') {
                     // Instant Game Over on Hard
                     gameActiveRef.current = false;
                     setFinalScore(scoreRef.current);
                     setGameOver(true);
                     setIsPlaying(false);
                     if ('vibrate' in navigator) navigator.vibrate([100, 50, 100, 50, 200]);
                 } else {
                     scoreRef.current = Math.max(0, scoreRef.current - 50); // Higher penalty
                     if ('vibrate' in navigator) navigator.vibrate([50, 50, 50]);
                 }
                 setShowHitEffect('poop');
                 setTimeout(() => setShowHitEffect(null), 500);
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

  // Resize Handler with ResizeObserver to handle transitions and dynamic layout changes
  useEffect(() => {
    if (!canvasRef.current || !canvasRef.current.parentElement) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;

    const updateSize = () => {
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        // Only update if dimensions actually changed to avoid loop
        if (canvas.width !== rect.width || canvas.height !== rect.height) {
            canvas.width = rect.width;
            canvas.height = rect.height;
            // Redraw immediately if static
            if (!isPlaying) {
                 // Optional: draw intro or static frame
            }
        }
    };

    // Initial size
    updateSize();

    const resizeObserver = new ResizeObserver(() => {
        updateSize();
    });

    if (parent) {
        resizeObserver.observe(parent);
    }

    return () => {
        resizeObserver.disconnect();
    };
  }, [isPlaying]);

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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm touch-none">
      <div className={`${
          isFullscreen 
            ? 'fixed inset-0 w-full h-full z-[9999] border-none rounded-none' 
            : 'w-full max-w-sm h-[70vh] rounded-3xl border-4 border-amber-400 shadow-2xl overflow-hidden relative'
        } bg-white dark:bg-gray-900 flex flex-col transition-all duration-300`}>
        {/* Header */}
        <div className="bg-amber-400 p-4 flex justify-between items-center text-amber-950 shrink-0">
             <div className="font-bold text-xl flex items-center gap-2">
                <ArrowLeftRight size={20} />
                Love Catcher
             </div>
             <div className="flex items-center gap-1">
                 <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1 hover:bg-white/20 rounded-full transition-colors mr-1">
                     {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                 </button>
                 <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                     <X size={24} />
                 </button>
             </div>
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

            <canvas 
                ref={canvasRef}
                className={`w-full h-full block transition-colors duration-200 ${showHitEffect === 'poop' ? 'bg-red-500/20' : ''}`}
                onPointerMove={(e) => handleInput(e.clientX)}
                onTouchMove={(e) => handleInput(e.touches[0].clientX)}
            />

            {/* Start Screen Overlay */}
            {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 text-white p-6 text-center space-y-6 backdrop-blur-[2px]">
                    <div className="text-6xl animate-bounce">👐</div>
                    <div className="space-y-2 mb-4">
                        <h3 className="text-3xl font-black">Choose Difficulty</h3>
                        <p className="text-sm opacity-90">Avoid the 💩 bombs!</p>
                    </div>
                    
                    <div className="flex flex-col gap-3 w-full max-w-xs">
                        <Button onClick={() => startGame('easy')} className="w-full py-4 bg-green-500 hover:bg-green-600 border-none shadow-lg">
                            Easy <span className="text-xs opacity-75 ml-2">(Slow)</span>
                        </Button>
                        <Button onClick={() => startGame('normal')} className="w-full py-4 bg-amber-500 hover:bg-amber-600 border-none shadow-lg">
                            Normal <span className="text-xs opacity-75 ml-2">(Balanced)</span>
                        </Button>
                        <Button onClick={() => startGame('hard')} className="w-full py-4 bg-red-600 hover:bg-red-700 border-none shadow-lg animate-pulse hover:animate-none">
                            😈 HARD <span className="text-xs opacity-75 ml-2">(Bomb = Game Over)</span>
                        </Button>
                    </div>
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
                        <Button onClick={() => setGameOver(false)} className="flex-1 bg-amber-500 text-white hover:bg-amber-600 border-none py-3 shadow-lg shadow-amber-500/20">Play Again</Button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>,
    document.body
  );
};
