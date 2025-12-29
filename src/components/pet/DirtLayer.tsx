import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

interface DirtLayerProps {
  hygiene: number;
  onClean: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
}

export const DirtLayer = ({ hygiene, onClean }: DirtLayerProps) => {
  if (hygiene >= 95) return null;

  const [scrubAmount, setScrubAmount] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{x: number, y: number} | null>(null);

  // Calculate visual dirtiness based on actual hygiene AND scrub progress
  // As user scrubs, the dirt visually fades before the actual onClean triggers (optimistic UI)
  const currentDirtOpacity = Math.max(0, Math.min(0.8, (100 - hygiene) / 100)) * (1 - scrubAmount / 100);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsScrubbing(true);
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = () => {
    setIsScrubbing(false);
    lastPos.current = null;
    
    // If scrubbed enough, trigger clean
    if (scrubAmount >= 100) {
      onClean();
      setScrubAmount(0); // Reset for next time (though component might unmount)
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isScrubbing || !lastPos.current) return;

    // Calculate distance moved
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Update progress (easier to clean if dirtier?)
    // Threshold: Need ~2000px of movement to clean fully
    setScrubAmount(prev => Math.min(100, prev + (distance / 15)));

    // Spawn bubbles/sparkles
    if (Math.random() > 0.7) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            setParticles(prev => [
                ...prev.slice(-15), // Keep max 15 particles
                { 
                    id: Date.now() + Math.random(), 
                    x: e.clientX - rect.left, 
                    y: e.clientY - rect.top 
                }
            ]);
        }
    }

    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  // Auto-clean up particles
  useEffect(() => {
     if (particles.length > 0) {
         const timer = setTimeout(() => {
             setParticles(prev => prev.slice(1));
         }, 500);
         return () => clearTimeout(timer);
     }
  }, [particles]);

  // If hygiene updates externally (e.g. sync), reset scrub amount if needed
  useEffect(() => {
      if (hygiene >= 95) setScrubAmount(0);
  }, [hygiene]);

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden touch-none"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      style={{
        background: `radial-gradient(circle at center, transparent 30%, rgba(60, 40, 10, ${currentDirtOpacity}) 100%)`,
        boxShadow: `inset 0 0 ${100 - hygiene}px rgba(60, 40, 10, ${currentDirtOpacity})`,
        opacity: currentDirtOpacity > 0.05 ? 1 : 0 // Hide if practically clean
      }}
    >
        {/* Helper Text */}
        {scrubAmount < 10 && hygiene < 60 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md"
                >
                    Scrub to clean! 🧼
                </motion.div>
            </div>
        )}

        {/* Bubbles / Sparkles */}
        <AnimatePresence>
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    initial={{ scale: 0, opacity: 0, y: 0 }}
                    animate={{ scale: [1, 1.5], opacity: [1, 0], y: -20 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute text-xl pointer-events-none"
                    style={{ left: p.x, top: p.y }}
                >
                    🧼
                </motion.div>
            ))}
        </AnimatePresence>

        {/* Progress Circle (Optional feedback) */}
        {isScrubbing && scrubAmount > 0 && scrubAmount < 100 && (
             <div className="absolute top-4 right-4 pointer-events-none">
                 <div className="w-10 h-10 rounded-full border-4 border-white/20 relative flex items-center justify-center bg-black/20 backdrop-blur-sm">
                     <span className="text-[10px] font-bold text-white">{Math.round(scrubAmount)}%</span>
                     <svg className="absolute inset-0 -rotate-90">
                         <circle 
                            cx="20" cy="20" r="18" 
                            fill="none" 
                            stroke="white" 
                            strokeWidth="4" 
                            strokeDasharray="113"
                            strokeDashoffset={113 - (113 * scrubAmount / 100)}
                            className="transition-all duration-100"
                        />
                     </svg>
                 </div>
             </div>
        )}

        {/* Mud Spots - Fading out with scrub */}
        <div style={{ opacity: 1 - (scrubAmount / 100) }} className="absolute inset-0 pointer-events-none transition-opacity duration-200">
             {hygiene < 80 && (
                <svg className="absolute top-10 left-10 w-24 h-24 opacity-40 text-amber-900" viewBox="0 0 100 100">
                     <path fill="currentColor" d="M30,10 Q50,0 70,20 T90,50 T70,90 T30,80 T10,50 T30,10 Z" />
                </svg>
             )}
             {hygiene < 60 && (
                <svg className="absolute bottom-20 right-10 w-32 h-32 opacity-50 text-amber-900" viewBox="0 0 100 100">
                    <path fill="currentColor" d="M20,20 Q50,10 80,30 T90,70 T60,95 T20,80 T10,40 Z" />
                </svg>
             )}
             {hygiene < 40 && (
                <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 opacity-30 text-amber-950" viewBox="0 0 100 100">
                    <path fill="currentColor" d="M40,10 Q80,0 90,40 T60,90 T10,60 T20,20 Z" />
                </svg>
             )}
        </div>
    </motion.div>
  );
};
