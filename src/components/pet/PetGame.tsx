import { usePetStore } from '../../store';
import { PetAvatar } from './PetAvatar';
import { DirtLayer } from './DirtLayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback } from 'react';
import { useTranslation } from '../../lib/i18n';
import { LoveCatcher } from './LoveCatcher';

export const PetGame = () => {
  const { t } = useTranslation();
  const pet = usePetStore();
  const [showLoveCatcher, setShowLoveCatcher] = useState(false);

  // Handle cleaning
  const handleClean = useCallback(() => {
    pet.cleanPet(); // Fixed: Use store action
    pet.gainXP(5, 'cleaning');
    if ('vibrate' in navigator) navigator.vibrate([30, 50, 30]);
  }, [pet]);

  // Handle feeding
  const handleFeed = () => {
    if (pet.hunger >= 100) return;
    pet.feedPet(); // Fixed: No arguments needed for default feed
    // Haptic
    if ('vibrate' in navigator) navigator.vibrate(50);
  };

  // Handle playing (LoveCatcher)
  const handlePlay = () => {
    setShowLoveCatcher(true);
  };

  return (
    <div className="relative">
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
              <DirtLayer hygiene={pet.hygiene} onClean={handleClean} />
           </div>
        </div>

        {/* The Pet */}
        <div className="z-10 transform scale-125">
             <PetAvatar />
        </div>
        
        {/* Thought Bubble (Status) */}
        {pet.hunger < 30 && (
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
                 <span>{Math.round(pet.hunger)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                    className="h-full bg-orange-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pet.hunger}%` }}
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
                 <span>{Math.round(pet.hygiene)}%</span>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                 <motion.div 
                    className="h-full bg-blue-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${pet.hygiene}%` }}
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
             disabled={pet.hunger >= 100}
             className={`flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[80px] transition-all ${
                 pet.hunger >= 100 
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
