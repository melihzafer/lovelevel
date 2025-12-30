import { motion } from 'framer-motion';
import { usePetStore } from '../../store';
import { useState, useEffect } from 'react';

// Simple SVGs for base pet and accessories to avoid external image deps for now
const BasePetSVG = ({ mood }: { mood: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
     {/* Body */}
     <circle cx="50" cy="55" r="40" fill="#ffb7b2" />
     <circle cx="50" cy="55" r="40" fill="url(#fur-gradient)" className="opacity-50" />
     <defs>
        <radialGradient id="fur-gradient" cx="0.4" cy="0.4" r="0.8">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
     </defs>
     
     {/* Ears */}
     <ellipse cx="30" cy="25" rx="10" ry="18" fill="#ffb7b2" transform="rotate(-20 30 25)" />
     <ellipse cx="70" cy="25" rx="10" ry="18" fill="#ffb7b2" transform="rotate(20 70 25)" />

     {/* Face */}
     <circle cx="35" cy="50" r="4" fill="#333" /> {/* Left Eye */}
     <circle cx="65" cy="50" r="4" fill="#333" /> {/* Right Eye */}
     
     {/* Mouth based on mood */}
     {mood === 'happy' && <path d="M 40 65 Q 50 75 60 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />}
     {mood === 'sad' && <path d="M 40 70 Q 50 60 60 70" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />}
     {mood === 'sleepy' && <circle cx="55" cy="65" r="5" fill="none" stroke="#333" strokeWidth="2" />} {/* 'O' mouth */}
     {mood === 'normal' && <path d="M 45 65 L 55 65" fill="none" stroke="#333" strokeWidth="3" strokeLinecap="round" />}

     {/* Cheeks */}
     <circle cx="25" cy="60" r="5" fill="#ff9999" opacity="0.6" />
     <circle cx="75" cy="60" r="5" fill="#ff9999" opacity="0.6" />
  </svg>
);

export const PetAvatar = () => {
  const mood = usePetStore(state => state.mood);
  const equipped = usePetStore(state => state.equipped);
  const [bounce, setBounce] = useState(0);

  // Idle Animation
  useEffect(() => {
    const interval = setInterval(() => {
       if (Math.random() > 0.7) {
           setBounce(prev => prev + 1);
       }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Accessory Map
  const ACCESSORY_RENDER: Record<string, React.ReactNode> = {
     'acc-starter-bow': <div className="absolute top-[65%] left-[35%] w-[30%] text-3xl text-center pointer-events-none drop-shadow-md">🎀</div>,
     'acc-sunglasses': <div className="absolute top-[35%] left-[25%] w-[50%] text-4xl text-center pointer-events-none drop-shadow-md">🕶️</div>,
     'acc-party-hat': <div className="absolute -top-[15%] left-[30%] w-[40%] text-5xl text-center pointer-events-none drop-shadow-md rotate-12">🥳</div>,
     'acc-flower-crown': <div className="absolute top-[5%] left-[15%] w-[70%] text-4xl text-center pointer-events-none drop-shadow-md">🌸</div>,
     'acc-chef-hat': <div className="absolute -top-[20%] left-[25%] w-[50%] text-5xl text-center pointer-events-none drop-shadow-md">👨‍🍳</div>,
     'acc-wizard-hat': <div className="absolute -top-[25%] left-[20%] w-[60%] text-5xl text-center pointer-events-none drop-shadow-md">🧙‍♂️</div>,
     'acc-crown': <div className="absolute -top-[15%] left-[25%] w-[50%] text-5xl text-center pointer-events-none drop-shadow-md">👑</div>,
     'acc-halo': <div className="absolute -top-[25%] left-[25%] w-[50%] text-5xl text-center pointer-events-none drop-shadow-lg animate-pulse">😇</div>,
     'acc-headphones': <div className="absolute top-[20%] left-[5%] w-[90%] text-5xl text-center pointer-events-none drop-shadow-md">🎧</div>,
     'acc-pirate-hat': <div className="absolute -top-[20%] left-[20%] w-[60%] text-5xl text-center pointer-events-none drop-shadow-md">🏴‍☠️</div>,
     'acc-santa-hat': <div className="absolute -top-[15%] left-[25%] w-[50%] text-5xl text-center pointer-events-none drop-shadow-md">🎅</div>,
      'acc-unicorn-horn': <div className="absolute -top-[15%] left-[40%] w-[20%] text-4xl text-center pointer-events-none drop-shadow-md">🦄</div>,
  };

  // Emote Map
  const EMOTE_RENDER: Record<string, React.ReactNode> = {
      'emote-hearts': (
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0], y: [0, -20] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-10 left-0 right-0 flex justify-center gap-2 text-3xl pointer-events-none"
          >
              ❤️ ❤️ ❤️
          </motion.div>
      ),
      'emote-heart': (
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0, 1, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-10 right-2 text-5xl pointer-events-none drop-shadow-lg"
          >
              ❤️
          </motion.div>
      ),
      'emote-stars': (
        <motion.div 
            animate={{ rotate: [0, 180, 360], scale: [1, 1.2, 1] }} 
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-8 -right-4 text-4xl pointer-events-none"
        >
            ✨
        </motion.div>
      ),
      'emote-sparkle': (
        <motion.div 
            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }} 
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute -top-5 right-5 text-4xl pointer-events-none"
        >
            ✨
        </motion.div>
      ),
      'emote-music': (
          <motion.div 
            animate={{ y: [0, -15, 0], x: [0, 10, 0, -10, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-8 left-10 text-3xl pointer-events-none"
          >
              🎵
          </motion.div>
      ),
      'emote-angry': (
          <div className="absolute top-0 right-10 text-4xl pointer-events-none filter drop-shadow-md">💢</div>
      ),
      'emote-sleepy': (
          <motion.div 
            animate={{ x: [0, 10, 20], y: [0, -20, -40], opacity: [0, 1, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-10 right-0 text-3xl font-bold text-slate-500 pointer-events-none"
          >
              Zzz
          </motion.div>
      ),
      'emote-sleep': (
          <motion.div 
            animate={{ scale: [1, 0.9, 1], opacity: [0.6, 1, 0.6] }} 
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-10 right-0 text-3xl pointer-events-none"
          >
              😴
          </motion.div>
      ),
      'emote-confused': (
          <motion.div 
            animate={{ rotate: [0, -10, 10, -10, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-5 right-5 text-4xl pointer-events-none"
          >
              ❓
          </motion.div>
      ),
      'emote-think': (
          <div className="absolute -top-8 right-0 text-4xl pointer-events-none drop-shadow-md">🤔</div>
      ),
      'emote-cool': (
          <div className="absolute -top-5 -right-5 text-4xl pointer-events-none">❄️</div>
      ),
      'emote-wave': (
          <motion.div 
            animate={{ rotate: [0, 20, 0, -20, 0] }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute top-0 left-0 text-4xl pointer-events-none"
          >
              👋
          </motion.div>
      ),
      'emote-laugh': (
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -top-5 right-5 text-4xl pointer-events-none"
          >
              😂
          </motion.div>
      ),
      'emote-dance': (
          <motion.div 
            animate={{ x: [0, 5, -5, 0] }} 
            transition={{ duration: 0.5, repeat: Infinity }}
            className="absolute -top-5 right-5 text-4xl pointer-events-none"
          >
              💃
          </motion.div>
      ),
      'emote-party': (
          <div className="absolute -top-10 right-0 text-4xl pointer-events-none drop-shadow-md">🥳</div>
      ),
      'emote-wink': (
          <div className="absolute top-10 right-0 text-3xl pointer-events-none">😉</div>
      ),
      'emote-celebrate': (
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }} 
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -top-10 left-10 text-4xl pointer-events-none drop-shadow-lg"
          >
              🎉
          </motion.div>
      ),
  };

  return (
    <div className="relative w-48 h-48">
        <motion.div
           animate={{ 
               y: [0, -10, 0],
               scale: bounce % 2 === 0 ? 1 : [1, 1.1, 1] 
           }}
           transition={{ 
               duration: 2, 
               repeat: Infinity, 
               ease: "easeInOut" 
           }}
           className="w-full h-full"
        >
           {/* Base Pet */}
           <div className="w-full h-full p-2">
              <BasePetSVG mood={mood} />
           </div>

           {/* Accessories Layer */}
           {equipped?.accessoryId && ACCESSORY_RENDER[equipped.accessoryId]}
           
           {/* Legacy/Fallback for unknown IDs to avoid breaking old data */}
           {equipped?.accessoryId && !ACCESSORY_RENDER[equipped.accessoryId] && !['acc-glasses','acc-hat','acc-bowtie'].includes(equipped.accessoryId) && (
               <div className="absolute -top-5 right-0 bg-white/90 rounded-full px-2 py-1 shadow-sm text-[10px] text-gray-500 border border-gray-200">
                   ?
               </div>
           )}

           {/* Emote Overlay (if equipped) */}
           {equipped?.emoteId && EMOTE_RENDER[equipped.emoteId]}
        </motion.div>
    </div>
  );
};
