import { useState } from 'react';
import { usePetStore, useLevelInfo } from '../../store';
import { PetAvatar } from './PetAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Gamepad2, Ticket } from 'lucide-react';
import { DirtLayer } from './DirtLayer';
import { LoveCatcher } from './LoveCatcher';

export const PetGame = () => {
  const pet = usePetStore();
  const levelInfo = useLevelInfo();
  
  const [currentAction, setCurrentAction] = useState<'idle' | 'eating' | 'playing' | 'cleaning'>('idle');
  const [showLoveCatcher, setShowLoveCatcher] = useState(false);

  const handleFeed = async () => {
    if (pet.hunger >= 100) return;
    setCurrentAction('eating');
    await pet.feedPet();
    setTimeout(() => setCurrentAction('idle'), 2000);
  };

  const handlePlay = async () => {
    if (pet.energy <= 10) return;
    setCurrentAction('playing');
    await pet.playWithPet();
    setTimeout(() => setCurrentAction('idle'), 1000);
  };
  
  const handleClean = async () => {
      // Allow cleaning if not 100% clean
      if (pet.hygiene >= 100) return;
      setCurrentAction('cleaning');
      await pet.cleanPet();
      setTimeout(() => setCurrentAction('idle'), 1500);
  };

  // Background mapping
  const getBackgroundClass = (id?: string) => {
    const backgroundMap: Record<string, string> = {
      'bg-sunset': 'bg-gradient-to-br from-orange-200 via-pink-200 to-purple-300 dark:from-orange-900 dark:via-pink-900 dark:to-purple-900',
      'bg-ocean': 'bg-gradient-to-br from-blue-200 via-cyan-200 to-teal-300 dark:from-blue-900 dark:via-cyan-900 dark:to-teal-900',
      'bg-forest': 'bg-gradient-to-br from-green-200 via-emerald-200 to-lime-300 dark:from-green-900 dark:via-emerald-900 dark:to-lime-900',
      'bg-galaxy': 'bg-gradient-to-br from-purple-300 via-indigo-300 to-blue-400 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950',
      'bg-candy': 'bg-gradient-to-br from-pink-200 via-rose-200 to-fuchsia-300 dark:from-pink-900 dark:via-rose-900 dark:to-fuchsia-900',
      'bg-desert': 'bg-gradient-to-br from-yellow-200 via-amber-200 to-orange-300 dark:from-yellow-900 dark:via-amber-900 dark:to-orange-900',
      'bg-snow': 'bg-gradient-to-br from-blue-50 via-cyan-50 to-white dark:from-blue-950 dark:via-cyan-950 dark:to-gray-900',
      'bg-cherry': 'bg-gradient-to-br from-pink-300 via-rose-300 to-red-300 dark:from-pink-900 dark:via-rose-300 dark:to-red-900',
      'bg-lavender': 'bg-gradient-to-br from-purple-200 via-violet-200 to-fuchsia-200 dark:from-purple-900 dark:via-violet-900 dark:to-fuchsia-900',
      'bg-mint': 'bg-gradient-to-br from-green-100 via-teal-100 to-cyan-100 dark:from-green-900 dark:via-teal-900 dark:to-cyan-900',
      'bg-park': 'bg-gradient-to-br from-green-200 via-yellow-200 to-green-300 dark:from-green-900 dark:via-yellow-900 dark:to-green-950',
      'bg-rainbow': 'bg-gradient-to-br from-red-200 via-yellow-200 via-green-200 via-blue-200 to-purple-200 dark:from-red-900 dark:via-yellow-900 dark:via-green-900 dark:via-blue-900 dark:to-purple-900',
    };
    return backgroundMap[id || ''] || 'bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20';
  };

  if (!levelInfo) return null;

  return (
    <div className="bg-transparent">
      {/* Header Stats */}
      <div className="flex justify-between items-center mb-6 px-2">
        <div className="flex flex-col w-full mr-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Level {pet.level}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {levelInfo.currentXP} / {levelInfo.xpForNextLevel} XP
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-black/5 dark:border-white/5 shadow-inner">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.xpProgressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
        <div className="text-right min-w-[60px]">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Mood</span>
          <div className={`text-sm font-bold capitalize ${
            pet.mood === 'happy' ? 'text-green-500' : 
            pet.mood === 'chill' ? 'text-blue-500' : 
            'text-purple-500'
          }`}>
            {pet.mood}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className={`${getBackgroundClass(pet.equipped?.backgroundId)} rounded-2xl p-4 mb-6 relative overflow-hidden min-h-[300px] flex flex-col justify-center border border-white/30 dark:border-white/10 transition-colors duration-700`}>
        <PetAvatar 
          mood={pet.mood as 'happy' | 'chill' | 'sleepy'}
          action={currentAction}
          accessoryId={pet.equipped?.accessoryId}
        />
        
        {/* Dirt Layer Overlay */}
        <DirtLayer hygiene={pet.hygiene} onClean={handleClean} />
        
        {/* Status Bars Overlay */}
        <div className="absolute top-4 left-4 right-4 flex gap-2">
          <StatBar icon="🍖" value={pet.hunger} color="bg-orange-400" />
          <StatBar icon="⚡" value={pet.energy} color="bg-yellow-400" />
          <StatBar icon="🧼" value={pet.hygiene} color="bg-cyan-400" />
        </div>

        {/* Minigame Overlay */}
        <AnimatePresence>
          {showLoveCatcher && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30"
            >
              <LoveCatcher onClose={() => setShowLoveCatcher(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 gap-3">
        <ControlButton 
          onClick={handleFeed} 
          disabled={pet.hunger >= 100 || currentAction !== 'idle'}
          icon={<Utensils className="w-6 h-6" />}
          label="Feed"
          color="bg-orange-100 text-orange-600 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50"
        />
        
        <ControlButton 
          onClick={handlePlay} 
          disabled={pet.energy <= 10 || currentAction !== 'idle'}
          icon={<Gamepad2 className="w-6 h-6" />}
          label="Play"
          color="bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:hover:bg-pink-900/50"
        />

        <ControlButton 
          onClick={() => setShowLoveCatcher(true)}
          disabled={currentAction !== 'idle'}
          icon={<Ticket className="w-6 h-6" />}
          label="Games"
          color="bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50"
        />
      </div>
    </div>
  );
};

// Helper Components
const StatBar = ({ icon, value, color }: { icon: string, value: number, color: string }) => (
  <div className="flex-1 bg-white/80 dark:bg-black/40 backdrop-blur rounded-full h-8 flex items-center px-2 gap-2 shadow-sm">
    <span className="text-xs">{icon}</span>
    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div 
        className={`h-full ${color}`}
        animate={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const ControlButton = ({ onClick, label, color, disabled }: any) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    whileHover={{ scale: 1.05 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      flex flex-col items-center justify-center p-4 rounded-3xl transition-all shadow-md
      ${disabled ? 'opacity-40 grayscale cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-400' : `${color} backdrop-blur-sm border border-white/20`}
    `}
  >
    <div className="mb-2 p-3 rounded-full bg-white/40 dark:bg-black/20 shadow-inner text-3xl">
        {/* Render icon as emoji or lucide icon */}
        {label === 'Feed' ? '🍖' : label === 'Play' ? '🎾' : '🎰'}
    </div>
    <span className="text-xs font-bold whitespace-nowrap uppercase tracking-wider opacity-80">{label}</span>
  </motion.button>
);
