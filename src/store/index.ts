import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Settings, PetState as PetStateType, Challenge } from '../types/database';
import { DEFAULT_SETTINGS, DEFAULT_PET_STATE } from '../types/database';
import type { PetItem } from '../types/database';
import * as db from '../lib/db';
import { api } from '../lib/api';
import { getDateStats } from '../lib/dateUtils';
import { addXP, getLevelInfo } from '../lib/xpSystem';
import { syncManager } from '../lib/syncManager';

// Settings Store
interface SettingsState {
  settings: Settings;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  setSettingsRemote: (updates: Partial<Settings>) => Promise<void>;
  isLoading: boolean;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: true,
      loadSettings: async () => {
        set({ isLoading: true });
        const settings = await db.getSettings();
        set({ settings, isLoading: false });
      },
      updateSettings: async (updates) => {
        await db.updateSettings(updates);
        
        // Merge updates into current settings
        const currentSettings = get().settings;
        const newSettings = { ...currentSettings, ...updates };

        set(() => ({
          settings: newSettings,
        }));

        // Sync settings to Supabase
        syncManager.queueSync('settings', 'update', newSettings as unknown as Record<string, unknown>);
      },
      setSettingsRemote: async (updates) => {
        // Update DB without triggering sync
        await db.updateSettings(updates);
        
        const currentSettings = get().settings;
        const newSettings = { ...currentSettings, ...updates };

        set({ settings: newSettings });
      },
    }),
    { name: 'settings-store' }
  )
);

// Pet Store
interface PetState extends PetStateType {
  loadPet: () => Promise<void>;
  updatePet: (updates: Partial<PetStateType>) => Promise<void>;
  gainXP: (amount: number, source: string) => Promise<{
    didLevelUp: boolean;
    newLevel: number;
    levelsGained: number;
  }>;
  feedPet: () => Promise<void>;
  playWithPet: () => Promise<void>;
  setName: (name: string) => Promise<void>;
  setHunger: (hunger: number) => Promise<void>;
  setEnergy: (energy: number) => Promise<void>;
  equipAccessory: (accessoryId: string | undefined) => Promise<void>;
  equipBackground: (backgroundId: string | undefined) => Promise<void>;
  equipOutfit: (outfitId: string | undefined) => Promise<void>;
  cleanPet: () => Promise<void>;
  purchaseItem: (item: PetItem) => Promise<{ success: boolean; error?: string }>;
  addCoins: (amount: number) => Promise<void>;
  syncInventory: () => Promise<void>;
  isLoading: boolean;
}

export const usePetStore = create<PetState>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_PET_STATE,
      isLoading: true,
      loadPet: async () => {
        set({ isLoading: true });
        const pet = await db.getPet();
        set({ ...pet, isLoading: false });
      },
      updatePet: async (updates) => {
        await db.updatePet(updates);
        set(updates);
      },
      gainXP: async (amount, source) => {
        const state = get();
        const settings = useSettingsStore.getState().settings;
        const result = addXP(
          state.level,
          state.xp,
          amount,
          settings.levelCurveMultiplier
        );

        await db.updatePet({
          level: result.newLevel,
          xp: result.remainingXP,
        });

        set({
          level: result.newLevel,
          xp: result.remainingXP,
        });

        // Sync XP/level to partner
        syncManager.queueSync('pet', 'update', {
          name: state.name,
          xp: result.remainingXP,
          level: result.newLevel,
          mood: state.mood,
          hunger: state.hunger,
          energy: state.energy,
          equippedAccessoryId: state.equipped?.accessoryId,
          equippedBackgroundId: state.equipped?.backgroundId,
        });

        // Log to history
        if (result.didLevelUp) {
          await db.addHistoryEntry({
            id: `level-${Date.now()}`,
            type: 'level-up',
            timestamp: new Date().toISOString(),
            data: {
              newLevel: result.newLevel,
              source,
            },
          });
        }

        return result;
      },
      feedPet: async () => {
        const state = get();
        // Feeding now costs 10 coins (default food) if we want to enforce economy.
        // Let's assume a default apple costing 5 coins.
        
        // Optimistic update
        const newHunger = Math.min(100, state.hunger + 20);
        await db.updatePet({ hunger: newHunger, mood: 'happy' });
        set({ hunger: newHunger, mood: 'happy' });
        
        // Sync pet state to partner
        const syncPayload = {
          name: state.name,
          xp: state.xp,
          level: state.level,
          mood: 'happy',
          hunger: newHunger,
          energy: state.energy,
          hygiene: state.hygiene,
          coins: state.coins,
          equippedAccessoryId: state.equipped?.accessoryId,
          equippedBackgroundId: state.equipped?.backgroundId,
          equippedOutfitId: state.equipped?.outfitId,
        };
        syncManager.queueSync('pet', 'update', syncPayload);
      },
      playWithPet: async () => {
        const state = get();
        const newEnergy = Math.max(0, state.energy - 10);
        const newMood = newEnergy > 20 ? 'happy' : 'sleepy';
        await db.updatePet({
          energy: newEnergy,
          mood: newMood,
          lastInteraction: new Date().toISOString(),
        });
        set({
          energy: newEnergy,
          mood: newMood,
          lastInteraction: new Date().toISOString(),
        });
        
        // Sync pet state to partner
        syncManager.queueSync('pet', 'update', {
          name: state.name,
          xp: state.xp,
          level: state.level,
          mood: newMood,
          hunger: state.hunger,
          energy: newEnergy,
          equippedAccessoryId: state.equipped?.accessoryId,
          equippedBackgroundId: state.equipped?.backgroundId,
        });
      },
      setName: async (name: string) => {
        const state = get();
        await db.updatePet({ name });
        set({ name });
        
        // Sync pet name to partner
        syncManager.queueSync('pet', 'update', {
          name,
          xp: state.xp,
          level: state.level,
          mood: state.mood,
          hunger: state.hunger,
          energy: state.energy,
          equippedAccessoryId: state.equipped?.accessoryId,
          equippedBackgroundId: state.equipped?.backgroundId,
        });
      },
      setHunger: async (hunger: number) => {
        const state = get();
        await db.updatePet({ hunger });
        set({ hunger });
        
        // Sync hunger to partner
        syncManager.queueSync('pet', 'update', {
          name: state.name,
          xp: state.xp,
          level: state.level,
          mood: state.mood,
          hunger,
          energy: state.energy,
          equippedAccessoryId: state.equipped?.accessoryId,
          equippedBackgroundId: state.equipped?.backgroundId,
        });
      },
      setEnergy: async (energy: number) => {
        const state = get();
        await db.updatePet({ energy });
        set({ energy });
        
        // Sync energy to partner
        syncManager.queueSync('pet', 'update', {
          name: state.name,
          xp: state.xp,
          level: state.level,
          mood: state.mood,
          hunger: state.hunger,
          energy,
          equippedAccessoryId: state.equipped?.accessoryId,
          equippedBackgroundId: state.equipped?.backgroundId,
        });
      },
      equipAccessory: async (accessoryId: string | undefined) => {
        const state = get();
        const newEquipped = { ...state.equipped, accessoryId };
        await db.updatePet({ equipped: newEquipped });
        set({ equipped: newEquipped });
        
        // Sync equipped accessory to partner
        syncManager.queueSync('pet', 'update', {
          name: state.name,
          xp: state.xp,
          level: state.level,
          mood: state.mood,
          hunger: state.hunger,
          energy: state.energy,
          equippedAccessoryId: accessoryId,
          equippedBackgroundId: state.equipped?.backgroundId,
        });
      },
      equipBackground: async (backgroundId: string | undefined) => {
        const state = get();
        const newEquipped = { ...state.equipped, backgroundId };
        await db.updatePet({ equipped: newEquipped });
        set({ equipped: newEquipped });
        
        syncManager.queueSync('pet', 'update', {
          name: state.name,
          xp: state.xp,
          level: state.level,
          mood: state.mood,
          hunger: state.hunger,
          energy: state.energy,
          hygiene: state.hygiene,
          coins: state.coins,
          equippedAccessoryId: state.equipped?.accessoryId,
          equippedBackgroundId: backgroundId,
          equippedOutfitId: state.equipped?.outfitId,
        });
      },
      equipOutfit: async (outfitId: string | undefined) => {
        const state = get();
        const newEquipped = { ...state.equipped, outfitId };
        await db.updatePet({ equipped: newEquipped });
        set({ equipped: newEquipped });
        
        syncManager.queueSync('pet', 'update', {
          name: state.name,
          xp: state.xp,
          level: state.level,
          mood: state.mood,
          hunger: state.hunger,
          energy: state.energy,
          hygiene: state.hygiene,
          coins: state.coins,
          equippedAccessoryId: state.equipped?.accessoryId,
          equippedBackgroundId: state.equipped?.backgroundId,
          equippedOutfitId: outfitId,
        });
      },
      cleanPet: async () => {
        const state = get();
        if (state.hygiene >= 100) return;
        
        const newHygiene = 100;
        await db.updatePet({ hygiene: newHygiene, mood: 'happy' });
        set({ hygiene: newHygiene, mood: 'happy' });
        
        // Use API to sync to DB (Supabase)
        const partnershipId = useSettingsStore.getState().settings.partners[0]?.id;
        if (partnershipId) {
             api.updateHygiene(partnershipId, newHygiene);
        }
        
        syncManager.queueSync('pet', 'update', {
           name: state.name,
           xp: state.xp,
           level: state.level,
           mood: 'happy',
           hunger: state.hunger,
           energy: state.energy,
           hygiene: newHygiene,
           coins: state.coins,
           equippedAccessoryId: state.equipped?.accessoryId,
           equippedBackgroundId: state.equipped?.backgroundId,
           equippedOutfitId: state.equipped?.outfitId,
        });
      },
      purchaseItem: async (item: PetItem) => {
        const state = get();
        if (state.coins < (item.price || 0)) {
            return { success: false, error: 'Not enough coins' };
        }
        
        const newCoins = state.coins - (item.price || 0);
        let newInventory = state.inventory;
        if (item.type !== 'food') {
             newInventory = [...state.inventory, item.id];
        }
        
        if (item.type === 'food') {
            const newHunger = Math.min(100, state.hunger + 20);
            set({ coins: newCoins, hunger: newHunger });
            await db.updatePet({ coins: newCoins, hunger: newHunger });
            
             // Sync needs to be consistent
            syncManager.queueSync('pet', 'update', {
               name: state.name,
               xp: state.xp,
               level: state.level,
               mood: 'happy',
               hunger: newHunger,
               energy: state.energy,
               hygiene: state.hygiene,
               coins: newCoins,
               equippedAccessoryId: state.equipped?.accessoryId,
               equippedBackgroundId: state.equipped?.backgroundId,
               equippedOutfitId: state.equipped?.outfitId,
            });
        } else {
            set({ coins: newCoins, inventory: newInventory });
             await db.updatePet({ coins: newCoins, inventory: newInventory });
             
             // Sync
            syncManager.queueSync('pet', 'update', {
               name: state.name,
               xp: state.xp,
               level: state.level,
               mood: state.mood,
               hunger: state.hunger,
               energy: state.energy,
               hygiene: state.hygiene,
               coins: newCoins,
               equippedAccessoryId: state.equipped?.accessoryId,
               equippedBackgroundId: state.equipped?.backgroundId,
               equippedOutfitId: state.equipped?.outfitId,
            });
        }
        
        // Call API to persist purchase to Supabase
        const settings = useSettingsStore.getState().settings;
        const partnershipId = settings.partners[0]?.id;
        if (partnershipId) {
           await api.buyItem(partnershipId, item);
        }
        
        return { success: true };
      },
      addCoins: async (amount: number) => {
         const state = get();
         const newCoins = state.coins + amount;
         set({ coins: newCoins });
         await db.updatePet({ coins: newCoins });
         
         syncManager.queueSync('pet', 'update', {
           name: state.name,
           xp: state.xp,
           level: state.level,
           mood: state.mood,
           hunger: state.hunger,
           energy: state.energy,
           hygiene: state.hygiene,
           coins: newCoins,
           equippedAccessoryId: state.equipped?.accessoryId,
           equippedBackgroundId: state.equipped?.backgroundId,
           equippedOutfitId: state.equipped?.outfitId,
        });
      },
      syncInventory: async () => {
          // Placeholder
      },
    }),
    { name: 'pet-store' }
  )
);

// Challenges Store
interface ChallengesState {
  challenges: Challenge[];
  loadChallenges: () => Promise<void>;
  addChallenge: (challenge: Challenge) => Promise<void>;
  updateChallenge: (id: string, updates: Partial<Challenge>) => Promise<void>;
  completeChallenge: (id: string, notes?: string) => Promise<void>;
  deleteChallenge: (id: string) => Promise<void>;
  getCompletedChallenges: () => Challenge[];
  getActiveChallenges: () => Challenge[];
  isLoading: boolean;
}

export const useChallengesStore = create<ChallengesState>()(
  devtools(
    (set, get) => ({
      challenges: [],
      isLoading: true,
      loadChallenges: async () => {
        set({ isLoading: true });
        const challenges = await db.getAllChallenges();
        set({ challenges, isLoading: false });
      },
      addChallenge: async (challenge) => {
        await db.addChallenge(challenge);
        set((state) => ({
          challenges: [...state.challenges, challenge],
        }));
      },
      updateChallenge: async (id, updates) => {
        await db.updateChallenge(id, updates);
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },
      completeChallenge: async (id, notes) => {
        const completedAt = new Date().toISOString();
        await db.updateChallenge(id, { completedAt, notes });
        
        set((state) => ({
          challenges: state.challenges.map((c) =>
            c.id === id ? { ...c, completedAt, notes } : c
          ),
        }));

        // Award XP to pet
        const settings = useSettingsStore.getState().settings;
        const petStore = usePetStore.getState();
        await petStore.gainXP(settings.xpPerChallenge, 'challenge-completed');

        // Log to history
        const challenge = get().challenges.find(c => c.id === id);
        await db.addHistoryEntry({
          id: `challenge-${Date.now()}`,
          type: 'challenge-completed',
          timestamp: completedAt,
          data: {
            challengeId: id,
            challengeTitle: challenge?.title,
          },
        });
      },
      deleteChallenge: async (id) => {
        await db.deleteChallenge(id);
        set((state) => ({
          challenges: state.challenges.filter((c) => c.id !== id),
        }));
      },
      getCompletedChallenges: () => {
        return get().challenges.filter((c) => c.completedAt);
      },
      getActiveChallenges: () => {
        return get().challenges.filter((c) => !c.completedAt);
      },
    }),
    { name: 'challenges-store' }
  )
);

// Derived selectors for date stats
export function useDateStats() {
  const settings = useSettingsStore((state) => state.settings);
  
  if (!settings.relationshipStartDate) {
    return null;
  }

  return getDateStats(settings.relationshipStartDate);
}

// Derived selector for level info
export function useLevelInfo() {
  const pet = usePetStore();
  const settings = useSettingsStore((state) => state.settings);
  
  return getLevelInfo(pet.level, pet.xp, settings.levelCurveMultiplier);
}

// Initialize all stores and listeners
export async function initializeStores() {
  await Promise.all([
    useSettingsStore.getState().loadSettings(),
    usePetStore.getState().loadPet(),
    useChallengesStore.getState().loadChallenges(),
  ]);
  
  // Set up listeners for real-time sync events
  if (typeof window !== 'undefined') {
    // Settings Sync
    window.addEventListener('sync:settings', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Store: Received settings sync', customEvent.detail);
      useSettingsStore.getState().setSettingsRemote(customEvent.detail);
    });

    // Pet Sync
    window.addEventListener('sync:pet', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Store: Received pet sync', customEvent.detail);
      usePetStore.getState().updatePet(customEvent.detail);
    });

    // Challenge Sync
    window.addEventListener('sync:challenge', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Store: Received challenge sync', customEvent.detail);
      
      const { eventType, new: newData } = customEvent.detail;
      const store = useChallengesStore.getState();

      // For simplicity, reload everyone or optimize updates
      // Optimization:
      if (eventType === 'INSERT' && newData) {
        // We need to map DB shape to Challenge shape if needed, 
        // but db.getChallenge/getAllChallenges handles that.
        // Since we already updated DB in syncManager, let's just reload for safety/simplicity
        // store.loadChallenges();
        
        // OR manually add to state if we trust data
        // store.challenges.push(...)
      }
      
      // Reloading is safest to ensure consistency with DB
       store.loadChallenges();
    });
  }
}
