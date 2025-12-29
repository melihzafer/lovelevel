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

  return (
    <div className="relative w-48 h-48">
        <motion.div
           animate={{ 
               y: [0, -10, 0],
               scale: bounce % 2 === 0 ? 1 : [1, 1.1, 1] // Use bounce to trigger subtle scale change
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
           {equipped?.accessoryId === 'acc-glasses' && (
               <div className="absolute top-[35%] left-[25%] w-[50%] text-4xl text-center pointer-events-none">
                   👓
               </div>
           )}
           {equipped?.accessoryId === 'acc-hat' && (
               <div className="absolute -top-[10%] left-[30%] w-[40%] text-5xl text-center pointer-events-none">
                   🎩
               </div>
           )}
           {equipped?.accessoryId === 'acc-bowtie' && (
               <div className="absolute top-[65%] left-[35%] w-[30%] text-3xl text-center pointer-events-none">
                   🎀
               </div>
           )}
           {/* Generic accessory handler if ID is different */}
           {equipped?.accessoryId && !['acc-glasses','acc-hat','acc-bowtie'].includes(equipped.accessoryId) && (
               <div className="absolute -top-5 right-0 bg-white rounded-full p-1 shadow">
                   {/* Fallback indicator */}
                   Correct accessory rendering requires assets
               </div>
           )}

        </motion.div>
    </div>
  );
};
