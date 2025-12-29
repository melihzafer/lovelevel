import { Modal } from '../Modal';
import { usePetStore } from '../../store';
import { useTranslation } from '../../lib/i18n';
import { SEED_PET_ITEMS, isItemUnlocked } from '../../data/seedPetItems';
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PetItem } from '../../types/database'; // Fix: Uses type import

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShopModal = ({ isOpen, onClose }: ShopModalProps) => {
  const { t } = useTranslation();
  const pet = usePetStore();
  /* const { settings } = useSettingsStore(); */
  const [selectedTab, setSelectedTab] = useState<'food' | 'accessory' | 'background' | 'emote'>('food');
  const [buyingId, setBuyingId] = useState<string | null>(null);

  // Filter items for shop
  const shopItems = selectedTab === 'food' 
    ? [
        { id: 'food-apple', name: 'Apple', type: 'food', price: 5, description: 'A healthy snack', icon: '🍎' },
        { id: 'food-burger', name: 'Burger', type: 'food', price: 20, description: 'Yummy cheat meal', icon: '🍔' },
        { id: 'food-cake', name: 'Cake', type: 'food', price: 50, description: 'Party time!', icon: '🍰' },
        { id: 'food-pizza', name: 'Pizza', type: 'food', price: 25, description: 'Cheesy goodness', icon: '🍕' },
      ] as any[] // Using simplified content for food as it's not in SEED_PET_ITEMS yet
    : SEED_PET_ITEMS.filter(item => item.type === selectedTab);

  const handleBuy = async (item: any) => {
    if (pet.coins < (item.price || 0)) return;
    
    setBuyingId(item.id);
    try {
        await pet.purchaseItem(item as PetItem);
        // Haptic feedback
        if ('vibrate' in navigator) navigator.vibrate(50);
    } catch (e) {
        console.error("Purchase failed", e);
    } finally {
        setBuyingId(null);
    }
  };

  const isOwned = (itemId: string) => {
    if (selectedTab === 'food') return false; // Food is consumable
    return pet.inventory.includes(itemId);
  };
  
  // Calculate unlock status
  // We use pet store state for count
  const unlocked = (item: any) => {
      if (selectedTab === 'food') return true; 
      // Need a way to pass counts, for now defaulting to true or using what we have
      return isItemUnlocked(item, pet.level, 0, 0); // TODO: Pass real metrics
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.petShop || "Pet Shop 🛍️"}>
      <div className="space-y-4">
        
        {/* Coin Balance Header */}
        <div className="flex justify-between items-center bg-amber-100 dark:bg-amber-900/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
             <div className="flex items-center gap-2">
                 <span className="text-2xl">🪙</span>
                 <span className="font-bold text-amber-900 dark:text-amber-100">{t.yourCoins || 'Your Coins'}</span>
             </div>
             <span className="text-xl font-black text-amber-600 dark:text-amber-400">{pet.coins}</span>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:flex sm:justify-center gap-2 pb-2">
             {(['food', 'accessory', 'background', 'emote'] as const).map(tab => (
                 <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-2 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors w-full sm:w-auto ${
                        selectedTab === tab 
                        ? 'bg-primary-500 text-white shadow-md transform scale-[1.02]' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                 >
                    <span className="mr-1.5">
                        {tab === 'food' && '🍎'}
                        {tab === 'accessory' && '👔'}
                        {tab === 'background' && '🎨'}
                        {tab === 'emote' && '😄'}
                    </span>
                    <span>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </span>
                 </button>
             ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
             {shopItems.map((item) => {
                 const owned = isOwned(item.id);
                 const canAfford = pet.coins >= (item.price || 0);
                 const isUnlocked = unlocked(item);
                 const isLoading = buyingId === item.id;

                 return (
                     <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`
                            relative p-2.5 rounded-xl border-2 flex flex-col gap-2 min-h-[140px]
                            ${owned 
                                ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 opacity-80' 
                                : !isUnlocked 
                                    ? 'border-gray-200 bg-gray-50 dark:bg-gray-900 dark:border-gray-800 opacity-60' // Locked
                                    : 'border-white/50 bg-white/40 dark:bg-black/20 dark:border-white/10' // Available
                            }
                        `}
                     >
                         {/* Badge */}
                         {owned && (
                             <div className="absolute top-2 right-2 bg-green-500 text-white text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full z-10">
                                 Owned
                             </div>
                         )}

                         <div className="text-3xl self-center p-2 bg-white/50 dark:bg-white/5 rounded-full mb-1">
                             {item.icon || (item.type === 'accessory' ? '👔' : item.type === 'background' ? '🎨' : '😄')}
                         </div>
                         
                         <div className="flex-1 min-w-0 text-center">
                             <h4 className="font-bold text-xs truncate leading-tight mx-auto px-1">{item.name}</h4>
                             <p className="text-[10px] text-text-secondary line-clamp-1 opacity-80">{item.description}</p>
                         </div>

                         <div className="mt-auto pt-1 w-full">
                            {!owned && isUnlocked ? (
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={!canAfford || isLoading}
                                    className={`
                                        w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all whitespace-nowrap
                                        ${canAfford 
                                            ? 'bg-amber-400 hover:bg-amber-500 text-amber-950 shadow-sm active:scale-95' 
                                            : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                        }
                                    `}
                                >
                                    {isLoading ? (
                                        <span className="animate-spin text-lg block leading-none">⏳</span>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <span>{item.price}</span>
                                            <span className="text-sm pb-0.5">🪙</span>
                                        </div>
                                    )}
                                </button>
                            ) : owned ? (
                                <div className="w-full py-1.5 text-center text-[10px] uppercase font-black text-green-600 dark:text-green-400 border border-green-200 dark:border-green-900/50 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                                    Purchased
                                </div>
                            ) : (
                                <div className="text-[10px] text-center text-gray-400 font-medium py-1.5">
                                    Locked 🔒
                                </div>
                            )}
                         </div>
                     </motion.div>
                 );
             })}
        </div>
      </div>
    </Modal>
  );
};
