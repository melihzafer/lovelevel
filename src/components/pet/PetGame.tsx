import { usePetStore } from '../../store';
import { PetAvatar } from './PetAvatar';
import { DirtLayer } from './DirtLayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useTranslation } from '../../lib/i18n';
import { LoveCatcher } from './LoveCatcher';
import { usePetLoop } from '../../hooks/usePetLoop';

export const PetGame = () => {
  const { t } = useTranslation();
  usePetLoop(); // Start stats decay loop
  
  // Selectors
  const hunger = usePetStore(state => state.hunger);
  const hygiene = usePetStore(state => state.hygiene);
  
  // Actions
  const cleanPet = usePetStore(state => state.cleanPet);
  const gainXP = usePetStore(state => state.gainXP);
  const feedPet = usePetStore(state => state.feedPet);

  const [showLoveCatcher, setShowLoveCatcher] = useState(false);

  // Handle cleaning
  const handleClean = useCallback(() => {
    cleanPet();
    gainXP(5, 'cleaning');
    if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
  }, [cleanPet, gainXP]);

  // Handle feeding
  const handleFeed = () => {
    if (hunger >= 100) return;
    feedPet();
    // Haptic
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  // Handle playing (LoveCatcher)
  const handlePlay = () => {
    setShowLoveCatcher(true);
  };

  // Background Map
  const BACKGROUND_STYLES: Record<string, string> = {
      'bg-default': 'bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800',
      'bg-park': 'bg-gradient-to-b from-sky-300 to-green-100 dark:from-sky-900 dark:to-green-900',
      'bg-beach': 'bg-gradient-to-b from-sky-200 via-yellow-100 to-blue-200 dark:from-sky-900 dark:to-blue-900',
      'bg-forest': 'bg-gradient-to-b from-emerald-800 to-emerald-950 dark:from-emerald-900 dark:to-black',
      'bg-city': 'bg-gradient-to-b from-indigo-900 via-purple-900 to-pink-900',
      'bg-space': 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900 via-purple-950 to-black',
      'bg-mountains': 'bg-gradient-to-b from-cyan-100 to-slate-200 dark:from-slate-800 dark:to-slate-950',
      'bg-cafe': 'bg-gradient-to-b from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950',
      'bg-library': 'bg-gradient-to-b from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-950',
      'bg-garden': 'bg-gradient-to-b from-purple-100 to-green-50 dark:from-purple-950 dark:to-green-950',
      'bg-winter': 'bg-gradient-to-b from-slate-100 to-blue-50 dark:from-slate-900 dark:to-blue-950',
      'bg-rainbow': 'bg-gradient-to-r from-red-100 via-yellow-100 to-blue-100 dark:from-red-900 dark:via-yellow-900 dark:to-blue-900',
  };

  const equippedBackgroundId = usePetStore(state => state.equipped?.backgroundId);
  const backgroundClass = (equippedBackgroundId && BACKGROUND_STYLES[equippedBackgroundId]) || BACKGROUND_STYLES['bg-default'];

  return (
    <div className={`relative rounded-3xl overflow-hidden transition-colors duration-700 ${backgroundClass} p-4`}>
      {/* Minigame Modal (LoveCatcher) */}
      <AnimatePresence>
        {showLoveCatcher && (
           <LoveCatcher onClose={() => setShowLoveCatcher(false)} />
        )}
      </AnimatePresence>

      {/* Main Pet Display */}
      <div className="relative h-64 flex items-center justify-center mb-8">
        
        {/* Dirt Layer Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none">
           <div className="absolute inset-0 w-48 h-48 mx-auto top-8 pointer-events-auto">
              <DirtLayer hygiene={hygiene} onClean={handleClean} />
           </div>
        </div>

        {/* The Pet */}
        <div className="z-10 transform scale-125">
             <PetAvatar />
        </div>
        
        {/* Thought Bubble (Status) */}
        {hunger < 30 && (
            <motion.div 
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               className="absolute top-0 right-10 bg-white dark:bg-black/80 px-3 py-2 rounded-2xl rounded-bl-none shadow-lg border border-gray-200 dark:border-gray-700 z-30"
            >
               <span className="text-xl">🍗</span>
            </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Hunger */}
        <div className="bg-white/50 dark:bg-black/20 p-3 rounded-2xl flex items-center gap-3">
           <span className="text-xl">🍗</span>
           <div className="flex-1">
              <div className="flex justify-between text-xs font-bold mb-1 opacity-70">
                 <span>{(t as any).hunger || 'Hunger'}</span> 
                 <span>{Math.round(Number.isFinite(hunger) ? hunger : 50)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                    className="h-full bg-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Number.isFinite(hunger) ? hunger : 50}%` }}
                 />
              </div>
           </div>
        </div>

        {/* Hygiene */}
        <div className="bg-white/50 dark:bg-black/20 p-3 rounded-2xl flex items-center gap-3">
           <span className="text-xl">🧼</span>
           <div className="flex-1">
              <div className="flex justify-between text-xs font-bold mb-1 opacity-70">
                 <span>{(t as any).hygiene || 'Hygiene'}</span>
                 <span>{Math.round(Number.isFinite(hygiene) ? hygiene : 100)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                    className="h-full bg-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${Number.isFinite(hygiene) ? hygiene : 100}%` }}
                 />
              </div>
           </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4">
          <motion.button
             whileTap={{ scale: 0.9 }}
             onClick={handleFeed}
             disabled={hunger >= 100}
             className={`flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[80px] transition-all ${
                 hunger >= 100 
                 ? 'opacity-50 grayscale bg-gray-100 dark:bg-white/5' 
                 : 'bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border border-orange-200 dark:border-orange-800 shadow-sm'
             }`}
          >
             <span className="text-3xl">🍗</span>
             <span className="text-xs font-bold text-orange-900 dark:text-orange-100">{(t as any).feed || 'Feed'}</span>
          </motion.button>

          <motion.button
             whileTap={{ scale: 0.9 }}
             onClick={handlePlay}
             className="flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[80px] bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border border-purple-200 dark:border-purple-800 shadow-sm"
          >
             <span className="text-3xl">🎮</span>
             <span className="text-xs font-bold text-purple-900 dark:text-purple-100">{(t as any).play || 'Play'}</span>
          </motion.button>
      </div>
    </div>
  );
};
