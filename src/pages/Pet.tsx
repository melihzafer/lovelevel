import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { usePetStore } from '../store';
import { useTranslation } from '../lib/i18n';
import { SEED_PET_ITEMS, getUnlockedItems } from '../data/seedPetItems';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import type { PetItem } from '../types/database';
import { PetGame } from '../components/pet/PetGame';
import { ShopModal } from '../components/pet/ShopModal';
import { AnimatedBackground } from '../components/layout/AnimatedBackground';

export default function PetPage() {
  const { t } = useTranslation();
  
  // Performance: Use selectors to avoid re-rendering the whole page on every store change
  const petName = usePetStore(state => state.name) || 'Your Pet';
  const petLevel = usePetStore(state => state.level);
  const petInventory = usePetStore(state => state.inventory);
  const petEquipped = usePetStore(state => state.equipped);
  
  // Actions (stable functions, don't trigger re-renders)
  const setName = usePetStore(state => state.setName);
  const equipAccessory = usePetStore(state => state.equipAccessory);
  const equipBackground = usePetStore(state => state.equipBackground);
  const equipEmote = usePetStore(state => state.equipEmote);
  // NOTE: Pet sync is handled centrally by the store (initializeStores)

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [newName, setNewName] = useState(petName);
  const [nameError, setNameError] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'accessory' | 'background' | 'emote'>('accessory');

  // Get unlocked items based on level
  const unlockedItems = getUnlockedItems(petLevel, 0, 0);

  const handleRename = () => {
    const trimmed = newName.trim();
    
    if (trimmed.length < 2) {
      setNameError(t.petNameTooShort || 'Name must be at least 2 characters');
      return;
    }
    
    if (trimmed.length > 20) {
      setNameError(t.petNameTooLong || 'Name must be 20 characters or less');
      return;
    }
    
    if (!/^[a-zA-Z0-9\s]+$/.test(trimmed)) {
      setNameError(t.petNameInvalidChars || 'Only letters, numbers, and spaces allowed');
      return;
    }
    
    setName(trimmed);
    setShowRenameModal(false);
    setNameError('');
  };

  const handleEquip = (item: PetItem) => {
    if (item.type === 'accessory') {
      const currentlyEquipped = petEquipped?.accessoryId === item.id;
      const newAccessoryId = currentlyEquipped ? undefined : item.id;
      equipAccessory(newAccessoryId);
    } else if (item.type === 'background') {
      const currentlyEquipped = petEquipped?.backgroundId === item.id;
      const newBackgroundId = currentlyEquipped ? undefined : item.id;
      equipBackground(newBackgroundId);
    } else if (item.type === 'emote') {
      const currentlyEquipped = petEquipped?.emoteId === item.id;
      const newEmoteId = currentlyEquipped ? undefined : item.id;
      equipEmote(newEmoteId);
    }
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const isItemUnlocked = (item: PetItem) => {
    return unlockedItems.some(unlocked => unlocked.id === item.id);
  };
  
  const isItemOwned = (item: PetItem) => {
      // Default items (price 0) are always owned if unlocked
      if ((item.price || 0) === 0) return true;
      // Otherwise check inventory
      return petInventory.includes(item.id);
  };

  const isItemEquipped = (item: PetItem) => {
    if (item.type === 'accessory') {
      return petEquipped?.accessoryId === item.id;
    } else if (item.type === 'background') {
      return petEquipped?.backgroundId === item.id;
    } else if (item.type === 'emote') {
      return petEquipped?.emoteId === item.id;
    }
    return false;
  };

  const filteredItems = SEED_PET_ITEMS.filter(item => item.type === selectedTab);

  // NOTE: Pet sync is handled centrally by the store (initializeStores)
  // No duplicate listener needed here - the store's setPetRemote handles it

  // Background class logic (preserved from original)
  const [backgroundClass, setBackgroundClass] = useState('bg-gradient-to-br from-accent-50 via-white to-primary-50 dark:from-accent-950 dark:via-gray-900 dark:to-primary-950');

  useEffect(() => {
    const equippedBackground = SEED_PET_ITEMS.find(item => item.id === petEquipped?.backgroundId);
    
    if (!equippedBackground) {
      setBackgroundClass('bg-gradient-to-br from-accent-50 via-white to-primary-50 dark:from-accent-950 dark:via-gray-900 dark:to-primary-950');
      return;
    }

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

    setBackgroundClass(backgroundMap[equippedBackground.id] || 'bg-gradient-to-br from-accent-50 via-white to-primary-50 dark:from-accent-950 dark:via-gray-900 dark:to-primary-950');
  }, [petEquipped?.backgroundId]);

  return (
    <div className={`min-h-screen ${backgroundClass} relative overflow-hidden transition-colors duration-700 pb-32`}>
      {/* Show animated background primarily when default bg is active, or overlaying subtle effect */}
      <AnimatedBackground />
      
      <div className="max-w-md mx-auto p-6 relative z-10 space-y-6">
        {/* Premium Header Card */}
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-white/5 ring-1 ring-black/5">
            {/* Pet Name & Level */}
            <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 drop-shadow-sm">
                {petName}
                </h1>
                <button
                onClick={() => setShowRenameModal(true)}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Rename pet"
                >
                <span className="text-xl filter drop-shadow">✏️</span>
                </button>
            </div>
            </div>

            {/* Pet Game Component */}
            <PetGame />
        </div>

        {/* Action Buttons Grid */}
        <div className="flex gap-3">
            {/* Shop Button */}
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowShop(true)} 
              className="flex-1 py-4 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/40 dark:to-orange-900/40 backdrop-blur-md border border-amber-200 dark:border-amber-800 shadow-lg flex flex-col items-center justify-center gap-1 group hover:brightness-105 transition-all"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">🛍️</span>
              <span className="font-bold text-amber-900 dark:text-amber-100 text-sm">{t.petShop || 'Shop'}</span>
            </motion.button>

            {/* Inventory Button */}
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowInventory(true)} 
              className="flex-1 py-4 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg flex flex-col items-center justify-center gap-1 group hover:bg-white/50 dark:hover:bg-black/30 transition-all"
            >
              <div className="relative">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">🎒</span>
                  <span className="absolute -top-1 -right-2 bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                    {unlockedItems.length}
                  </span>
              </div>
              <span className="font-bold text-text-primary text-sm">{t.inventory || 'Inventory'}</span>
            </motion.button>
        </div>

        {/* Tips - Clean Glass Card */}
        <div className="bg-white/30 dark:bg-black/30 backdrop-blur-md rounded-2xl p-5 border border-white/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">💡</span>
            <p className="font-bold text-text-primary">{t.levelUpTips}</p>
          </div>
          <ul className="space-y-2">
            {[t.levelUpTip1, t.levelUpTip2, t.levelUpTip3].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                    <span className="text-primary-500 mt-1">•</span>
                    <span>{tip}</span>
                </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Rename Modal */}
      <Modal
        isOpen={showRenameModal}
        onClose={() => {
          setShowRenameModal(false);
          setNameError('');
          setNewName(petName);
        }}
        title={t.renamePet || 'Rename Pet'}
      >
        <div className="space-y-4">
          <Input
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setNameError('');
            }}
            placeholder={t.enterPetName || 'Enter pet name'}
            maxLength={20}
            autoFocus
          />
          {nameError && (
            <p className="text-sm text-red-500">{nameError}</p>
          )}
          <div className="flex gap-3">
            <Button 
              onClick={() => {
                setShowRenameModal(false);
                setNameError('');
                setNewName(petName);
              }} 
              variant="outline" 
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button onClick={handleRename} className="flex-1">
              {t.save || 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* Shop Modal */}
      <ShopModal isOpen={showShop} onClose={() => setShowShop(false)} />

      {/* Inventory Modal */}
      <Modal
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        title={t.petInventory || 'Pet Inventory'}
      >
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2 border-b border-border-color">
            {(['accessory', 'background', 'emote'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 font-medium transition-colors ${
                  selectedTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab === 'accessory' && '👔 '}
                {tab === 'background' && '🎨 '}
                {tab === 'emote' && '😄 '}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredItems.map((item) => {
              const unlocked = isItemUnlocked(item);
              const owned = isItemOwned(item);
              const equipped = isItemEquipped(item);
              const canUse = unlocked && owned;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => canUse && handleEquip(item)}
                  disabled={!canUse}
                  whileHover={canUse ? { scale: 1.02 } : {}}
                  whileTap={canUse ? { scale: 0.98 } : {}}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    equipped
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : canUse
                      ? 'border-border-color hover:border-primary-300 bg-bg-primary'
                      : 'border-border-color bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3">
                      <div className="text-2xl p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                        {item.type === 'accessory' && '👔'}
                        {item.type === 'background' && '🎨'}
                        {item.type === 'emote' && '😄'}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h4 className={`font-bold text-sm truncate ${canUse ? 'text-text-primary' : 'text-text-secondary'}`}>
                                {item.name}
                            </h4>
                            {equipped && <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded font-bold">EQUIPPED</span>}
                            {!unlocked && <span className="text-sm">🔒</span>}
                            {unlocked && !owned && <span className="text-xs font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">{item.price} 🪙</span>}
                          </div>
                          
                          <p className="text-xs text-text-secondary line-clamp-1">{item.description}</p>
                          
                          {/* Status Text - simplified */}
                          <div className="mt-1 text-xs sm:text-[10px]">
                            {!unlocked && item.unlockCondition ? (
                                <p className="text-accent-600 dark:text-accent-400 truncate">
                                {item.unlockCondition.type === 'level' && `Lvl ${item.unlockCondition.value}+`}
                                {item.unlockCondition.type === 'monthiversary' && `${item.unlockCondition.value}mo+`}
                                {item.unlockCondition.type === 'challenge-count' && `${item.unlockCondition.value} challenges`}
                                </p>
                            ) : !owned ? (
                                <p className="font-bold text-amber-600 dark:text-amber-400 truncate text-[10px]">Tap to buy in Shop</p>
                            ) : null}
                          </div>
                      </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}