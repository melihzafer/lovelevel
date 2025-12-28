import { motion, type Variants } from 'framer-motion';

interface PetAvatarProps {
  mood: 'happy' | 'chill' | 'sleepy';
  action: 'idle' | 'eating' | 'playing';
  accessoryId?: string;
}

export const PetAvatar = ({ mood, action, accessoryId }: PetAvatarProps) => {
  // Animation variants based on state
  const variants: Variants = {
    idle: {
      y: [0, -10, 0],
      scaleY: [1, 1.05, 1],
      scaleX: [1, 0.95, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    eating: {
      scale: [1, 1.2, 1],
      rotate: [0, -10, 10, 0],
      transition: { duration: 0.5, repeat: 3 }
    },
    playing: {
      y: [0, -50, 0],
      rotate: [0, 360],
      transition: { duration: 0.8 }
    },
    sleeping: {
      scaleY: [1, 0.9, 1],
      opacity: 0.8,
      transition: { duration: 3, repeat: Infinity }
    }
  };

  // Determine effective animation state
  // If mood is sleepy and we are idle, animate as sleeping
  const effectiveState = action === 'idle' && mood === 'sleepy' ? 'sleeping' : action;

  // Emoji map for accessories
  const getAccessoryEmoji = (id: string) => {
    const map: Record<string, string> = {
      'acc-sunglasses': '😎',
      'acc-party-hat': '🥳',
      'acc-flower-crown': '🌸',
      'acc-chef-hat': '👨‍🍳',
      'acc-wizard-hat': '🧙',
      'acc-crown': '👑',
      'acc-headphones': '🎧',
      'acc-pirate-hat': '‍☠️',
    };
    return map[id] || '';
  };

  // Determine eye shape based on mood/state
  const getEyes = () => {
    if (effectiveState === 'sleeping') return (
      <div className="flex gap-4 mt-8">
        <div className="w-4 h-1 bg-gray-700 rounded-full" />
        <div className="w-4 h-1 bg-gray-700 rounded-full" />
      </div>
    );
    
    // Chill/Happy eyes
    return (
      <div className="flex gap-4 mt-8">
        <div className="w-4 h-6 bg-black rounded-full relative">
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
        </div>
        <div className="w-4 h-6 bg-black rounded-full relative">
          <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex justify-center items-center h-64">
      {/* Zzz particles for sleeping */}
      {effectiveState === 'sleeping' && (
        <motion.div 
          className="absolute top-0 right-10 text-2xl font-bold text-blue-400"
          animate={{ y: -40, opacity: [0, 1, 0], x: 20 }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Zzz...
        </motion.div>
      )}

      {/* The Pet Body */}
      <motion.div
        variants={variants}
        animate={effectiveState}
        className={`
          w-40 h-36 rounded-[40%] 
          bg-amber-400 border-4 border-amber-600
          flex flex-col items-center justify-start
          shadow-xl relative z-10
        `}
      >
        {/* Accessory */}
        {accessoryId && (
          <div className="absolute -top-8 text-5xl z-20">
            {getAccessoryEmoji(accessoryId)}
          </div>
        )}

        {/* Eyes */}
        {getEyes()}

        {/* Mouth */}
        <div className="mt-2">
          {action === 'eating' ? (
            <div className="w-6 h-6 bg-red-900 rounded-full animate-pulse" />
          ) : effectiveState === 'sleeping' ? (
             <div className="w-3 h-3 bg-black rounded-full opacity-50" />
          ) : (
            <div className={`w-4 h-2 border-b-2 border-black rounded-full ${mood === 'sleepy' ? 'w-2 h-2 bg-black rounded-full' : ''}`} />
          )}
        </div>

      </motion.div>
      
      {/* Shadow */}
      <div className="absolute bottom-10 w-32 h-4 bg-black/20 rounded-[50%] blur-sm" />
    </div>
  );
};
