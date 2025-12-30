import { motion } from 'framer-motion';
import { Lock, Check, Shirt, Image as ImageIcon } from 'lucide-react';
import type { PetItem } from '../../types/database';

interface PetInventoryProps {
  items: PetItem[];
  unlockedItemIds: string[];
  equippedAccessoryId?: string;
  equippedBackgroundId?: string;
  equippedEmoteId?: string;
  onEquip: (item: PetItem) => void;
  onClose: () => void;
}

export const PetInventory = ({ 
  items, 
  unlockedItemIds, 
  equippedAccessoryId, 
  equippedBackgroundId, 
  equippedEmoteId, 
  onEquip, 
  onClose 
}: PetInventoryProps) => {
  
  const isEquipped = (item: PetItem) => {
    if (item.type === 'accessory') return item.id === equippedAccessoryId;
    if (item.type === 'background') return item.id === equippedBackgroundId;
    if (item.type === 'emote') return item.id === equippedEmoteId;
    return false;
  };

  const isUnlocked = (item: PetItem) => unlockedItemIds.includes(item.id);

  // Emoji map for display
  const getItemIcon = (item: PetItem) => {
    // If it has a predefined icon in the seed data (not in type but commonly added), use it.
    // Otherwise fallback to emoji based on ID or type.
    const iconMap: Record<string, string> = {
      'acc-sunglasses': '😎',
      'acc-party-hat': '🥳',
      'acc-flower-crown': '🌸',
      'acc-chef-hat': '👨‍🍳',
      'acc-wizard-hat': '🧙',
      'acc-crown': '👑',
      'acc-headphones': '🎧',
      'acc-pirate-hat': '🏴‍☠️',
      'bg-sunset': '🌅',
      'bg-ocean': '🌊',
      'bg-forest': '🌲',
      'bg-galaxy': '🌌',
      'bg-candy': '🍬',
      'bg-desert': '🌵',
      'bg-snow': '❄️',
      'bg-cherry': '🌸',
      'bg-lavender': '🪻',
      'bg-mint': '🍃',
      'bg-park': '🌳',
      'bg-rainbow': '🌈',
      'emote-hearts': '😍',
      'emote-heart': '❤️',
      'emote-stars': '🤩', 
      'emote-sparkle': '✨',
      'emote-music': '🎵',
      'emote-angry': '💢',
      'emote-sleepy': '💤',
      'emote-sleep': '😴',
      'emote-confused': '😕',
      'emote-think': '🤔',
      'emote-cool': '😎',
      'emote-wave': '👋',
      'emote-laugh': '😂',
      'emote-dance': '💃',
      'emote-party': '🥳',
      'emote-wink': '😉',
      'emote-celebrate': '🎉',
    };
    
    if (iconMap[item.id]) return iconMap[item.id];
    
    if (item.type === 'accessory') return '👔';
    if (item.type === 'background') return '🎨';
    if (item.type === 'emote') return '😄';
    
    return '📦';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-3xl p-6 h-full flex flex-col"
    >
      <div className="flex justify-between items-center mb-6 pt-2">
        <h2 className="text-2xl font-black flex items-center gap-2 text-gray-900 dark:text-white">
          <span className="text-3xl">🎒</span> Wardrobe
        </h2>
        <button 
          onClick={onClose} 
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4">
        {items.map((item) => {
          const unlocked = isUnlocked(item);
          const equipped = isEquipped(item);

          return (
            <button
              key={item.id}
              onClick={() => unlocked && onEquip(item)}
              disabled={!unlocked}
              className={`
                relative p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all min-h-[140px] justify-between group
                ${equipped 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md ring-2 ring-blue-500/20' 
                  : unlocked
                    ? 'border-gray-200 hover:border-blue-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1'
                    : 'border-gray-100 bg-gray-50 opacity-60 dark:bg-gray-800/50 dark:border-gray-800 cursor-not-allowed grayscale-[0.5]'
                }
              `}
            >
              <div className="text-4xl filter drop-shadow-sm">{getItemIcon(item)}</div>
              
              <div className="text-center w-full">
                <div className="font-bold text-sm text-gray-900 dark:text-white mb-1 truncate px-1">
                  {item.name}
                </div>
                
                {unlocked ? (
                  <div className={`text-xs font-medium ${equipped ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                    {equipped ? (
                      <span className="flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Equipped</span>
                    ) : (
                      'Tap to equip'
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3" /> 
                    {item.unlockCondition?.type === 'level' ? `Lvl ${item.unlockCondition.value}` : 'Locked'}
                  </div>
                )}
              </div>

              {/* Type badge */}
              <div className="absolute top-2 right-2 text-gray-300 dark:text-gray-600">
                {item.type === 'accessory' ? <Shirt className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
