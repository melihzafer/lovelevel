/**
 * Pet Store - Manages virtual pet state and actions
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { PetState as PetStateType, PetItem } from '../types/database';
import { DEFAULT_PET_STATE } from '../types/database';
import { petService, syncService } from '../services';
import { addXP } from '../lib/xpSystem';
import { api } from '../lib/api';
import * as db from '../lib/db';
import { useSettingsStore } from './settingsStore';


interface PetState extends PetStateType {
  isLoading: boolean;
  loadPet: () => Promise<void>;
  updatePet: (updates: Partial<PetStateType>) => Promise<void>;
  setPetRemote: (updates: Partial<PetStateType>) => Promise<void>;
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
  equipEmote: (emoteId: string | undefined) => Promise<void>;
  cleanPet: () => Promise<void>;
  purchaseItem: (item: PetItem) => Promise<{ success: boolean; error?: string }>;
  addCoins: (amount: number) => Promise<void>;
  syncInventory: () => Promise<void>;
}

export const usePetStore = create<PetState>()(
  devtools(
    (set, get) => ({
      ...DEFAULT_PET_STATE,
      isLoading: true,
      
      loadPet: async () => {
        set({ isLoading: true });
        const pet = await petService.getPet();
        set({ ...pet, isLoading: false });
      },
      
      updatePet: async (updates) => {
        await petService.updatePet(updates);
        set(updates);
        await syncService.queuePetSync(get());
      },
      
      setPetRemote: async (updates) => {
        await petService.updatePet(updates);
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

        await petService.updatePet({
          level: result.newLevel,
          xp: result.remainingXP,
        });

        set({
          level: result.newLevel,
          xp: result.remainingXP,
        });

        await syncService.queuePetSync(get());

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
        const newHunger = Math.min(100, state.hunger + 20);
        await petService.updatePet({ hunger: newHunger, mood: 'happy' });
        set({ hunger: newHunger, mood: 'happy' });
        await syncService.queuePetSync(get());
      },
      
      playWithPet: async () => {
        const state = get();
        const newEnergy = Math.max(0, state.energy - 10);
        const newMood = newEnergy > 20 ? 'happy' : 'sleepy';
        const lastInteraction = new Date().toISOString();
        
        await petService.updatePet({
          energy: newEnergy,
          mood: newMood,
          lastInteraction,
        });
        
        set({ energy: newEnergy, mood: newMood, lastInteraction });
        await syncService.queuePetSync(get());
      },
      
      setName: async (name: string) => {
        await petService.updatePet({ name });
        set({ name });
        await syncService.queuePetSync(get());
      },
      
      setHunger: async (hunger: number) => {
        await petService.updatePet({ hunger });
        set({ hunger });
        await syncService.queuePetSync(get());
      },
      
      setEnergy: async (energy: number) => {
        await petService.updatePet({ energy });
        set({ energy });
        await syncService.queuePetSync(get());
      },
      
      equipAccessory: async (accessoryId: string | undefined) => {
        const state = get();
        const equipped = { ...state.equipped, accessoryId };
        await petService.updatePet({ equipped });
        set({ equipped });
        await syncService.queuePetSync(get());
      },
      
      equipBackground: async (backgroundId: string | undefined) => {
        const state = get();
        const equipped = { ...state.equipped, backgroundId };
        await petService.updatePet({ equipped });
        set({ equipped });
        await syncService.queuePetSync(get());
      },
      
      equipOutfit: async (outfitId: string | undefined) => {
        const state = get();
        const equipped = { ...state.equipped, outfitId };
        await petService.updatePet({ equipped });
        set({ equipped });
        await syncService.queuePetSync(get());
      },
      
      equipEmote: async (emoteId: string | undefined) => {
        const state = get();
        const equipped = { ...state.equipped, emoteId };
        await petService.updatePet({ equipped });
        set({ equipped });
        await syncService.queuePetSync(get());
      },
      
      cleanPet: async () => {
        const state = get();
        if (state.hygiene >= 100) return;
        
        const newHygiene = 100;
        await petService.updatePet({ hygiene: newHygiene, mood: 'happy' });
        set({ hygiene: newHygiene, mood: 'happy' });
        
        const status = syncService.getSyncStatus();
        if (status.partnershipId) {
          await api.updateHygiene(status.partnershipId, newHygiene);
        }
        
        await syncService.queuePetSync(get());
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
          await petService.updatePet({ coins: newCoins, hunger: newHunger });
          set({ coins: newCoins, hunger: newHunger });
        } else {
          await petService.updatePet({ coins: newCoins, inventory: newInventory });
          set({ coins: newCoins, inventory: newInventory });
        }
        
        await syncService.queuePetSync(get());
        
        const status = syncService.getSyncStatus();
        if (status.partnershipId) {
          await api.buyItem(status.partnershipId, item);
        }
        
        return { success: true };
      },
      
      addCoins: async (amount: number) => {
        const state = get();
        const newCoins = state.coins + amount;
        await petService.updatePet({ coins: newCoins });
        set({ coins: newCoins });
        await syncService.queuePetSync(get());
      },
      
      syncInventory: async () => {
        // Placeholder for inventory sync
      },
    }),
    { name: 'pet-store' }
  )
);
