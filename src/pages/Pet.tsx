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
import { AnimatedBackground } from '../components/layout/AnimatedBackground';

export default function PetPage() {
  const { t } = useTranslation();
  const pet = usePetStore();
  const petName = pet.name || 'Your Pet';

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newName, setNewName] = useState(petName);
  const [nameError, setNameError] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'accessory' | 'background' | 'emote'>('accessory');

  // Get unlocked items based on level and monthiversaries
  const unlockedItems = getUnlockedItems(pet.level, 0, 0); // TODO: get actual monthiversaries and challenge count

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
    
    pet.setName(trimmed);
    setShowRenameModal(false);
    setNameError('');
  };

  const handleEquip = (item: PetItem) => {
    if (item.type === 'accessory') {
      const currentlyEquipped = pet.equipped?.accessoryId === item.id;
      const newAccessoryId = currentlyEquipped ? undefined : item.id;
      pet.equipAccessory(newAccessoryId);
    } else if (item.type === 'background') {
      const currentlyEquipped = pet.equipped?.backgroundId === item.id;
      const newBackgroundId = currentlyEquipped ? undefined : item.id;
      pet.equipBackground(newBackgroundId);
    }
    
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const isItemUnlocked = (item: PetItem) => {
    return unlockedItems.some(unlocked => unlocked.id === item.id);
  };

  const isItemEquipped = (item: PetItem) => {
    if (item.type === 'accessory') {
      return pet.equipped?.accessoryId === item.id;
    } else if (item.type === 'background') {
      return pet.equipped?.backgroundId === item.id;
    }
    return false; // emotes not supported yet
  };

  const filteredItems = SEED_PET_ITEMS.filter(item => item.type === selectedTab);

  // Listen for remote pet updates from partner
  useEffect(() => {
    const handleRemotePetUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const remotePetState = customEvent.detail;
      
      console.log('🔄 Partner updated pet:', remotePetState);
      
      // Update local pet state (triggers re-render)
      pet.updatePet({
        name: remotePetState.name,
        xp: remotePetState.xp,
        level: remotePetState.level,
        mood: remotePetState.mood,
        hunger: remotePetState.hunger,
        energy: remotePetState.energy,
        equipped: {
          accessoryId: remotePetState.equippedAccessoryId,
          backgroundId: remotePetState.equippedBackgroundId,
        },
      });
    };

    window.addEventListener('sync:pet', handleRemotePetUpdate);
    
    return () => {
      window.removeEventListener('sync:pet', handleRemotePetUpdate);
    };
  }, [pet]);

  // Background class logic (preserved from original)
  const [backgroundClass, setBackgroundClass] = useState('bg-gradient-to-br from-accent-50 via-white to-primary-50 dark:from-accent-950 dark:via-gray-900 dark:to-primary-950');

  useEffect(() => {
    const equippedBackground = SEED_PET_ITEMS.find(item => item.id === pet.equipped?.backgroundId);
    
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
  }, [pet.equipped?.backgroundId]);

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

        {/* Inventory Button - Premium Glass Style */}
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowInventory(true)} 
          className="w-full py-4 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg flex items-center justify-center gap-3 group hover:bg-white/50 dark:hover:bg-black/30 transition-all"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🎒</span>
          <span className="font-bold text-text-primary text-lg">{t.inventory || 'Inventory'}</span>
          <span className="bg-white/50 dark:bg-black/50 px-3 py-1 rounded-full text-xs font-bold text-text-secondary">
            {unlockedItems.length}
          </span>
        </motion.button>

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
          <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredItems.map((item) => {
              const unlocked = isItemUnlocked(item);
              const equipped = isItemEquipped(item);

              return (
                <motion.button
                  key={item.id}
                  onClick={() => unlocked && handleEquip(item)}
                  disabled={!unlocked}
                  whileHover={unlocked ? { scale: 1.02 } : {}}
                  whileTap={unlocked ? { scale: 0.98 } : {}}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    equipped
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : unlocked
                      ? 'border-border-color hover:border-primary-300 bg-bg-primary'
                      : 'border-border-color bg-gray-100 dark:bg-gray-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xl">
                      {item.type === 'accessory' && '👔'}
                      {item.type === 'background' && '🎨'}
                      {item.type === 'emote' && '😄'}
                    </span>
                    {equipped && <span className="text-xs bg-primary-500 text-white px-2 py-1 rounded">✓</span>}
                    {!unlocked && <span className="text-xl">🔒</span>}
                  </div>
                  <h4 className={`font-medium text-sm mb-1 ${unlocked ? 'text-text-primary' : 'text-text-secondary'}`}>
                    {item.name}
                  </h4>
                  <p className="text-xs text-text-secondary line-clamp-2">{item.description}</p>
                  {!unlocked && item.unlockCondition && (
                    <p className="text-xs text-accent-600 dark:text-accent-400 mt-2">
                      {item.unlockCondition.type === 'level' && `Level ${item.unlockCondition.value}`}
                      {item.unlockCondition.type === 'monthiversary' && `${item.unlockCondition.value} month${item.unlockCondition.value > 1 ? 's' : ''}`}
                      {item.unlockCondition.type === 'challenge-count' && `${item.unlockCondition.value} challenges`}
                    </p>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      </Modal>
    </div>
  );
}