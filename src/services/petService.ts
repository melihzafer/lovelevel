import * as db from '../lib/db';
import type { PetState, PetMood } from '../types/database';

export interface IPetService {
  getPet(): Promise<PetState>;
  updatePet(updates: Partial<PetState>): Promise<void>;
  feedPet(): Promise<{ hunger: number }>;
  playWithPet(): Promise<{ energy: number }>;
  cleanPet(): Promise<{ hygiene: number }>;
  addXP(amount: number): Promise<{ xp: number; level: number }>;
  setMood(mood: PetMood): Promise<void>;
  equipItem(itemId: string, slot: 'accessory' | 'background' | 'outfit' | 'emote'): Promise<void>;
  unequipItem(slot: 'accessory' | 'background' | 'outfit' | 'emote'): Promise<void>;
  addItemToInventory(itemId: string): Promise<void>;
  getInventory(): Promise<string[]>;
}

export class PetService implements IPetService {
  async getPet(): Promise<PetState> {
    return db.getPet();
  }

  async updatePet(updates: Partial<PetState>): Promise<void> {
    await db.updatePet(updates);
  }

  async feedPet(): Promise<{ hunger: number }> {
    const pet = await this.getPet();
    const newHunger = Math.min(100, pet.hunger + 30);
    await this.updatePet({ hunger: newHunger });
    return { hunger: newHunger };
  }

  async playWithPet(): Promise<{ energy: number }> {
    const pet = await this.getPet();
    const newEnergy = Math.max(0, pet.energy - 20);
    await this.updatePet({ energy: newEnergy });
    return { energy: newEnergy };
  }

  async cleanPet(): Promise<{ hygiene: number }> {
    await this.updatePet({ hygiene: 100 });
    return { hygiene: 100 };
  }

  async addXP(amount: number): Promise<{ xp: number; level: number }> {
    const pet = await this.getPet();
    const currentXP = pet.xp;
    const currentLevel = pet.level;
    
    // Simple XP calculation - can be enhanced with xpSystem
    let newXP = currentXP + amount;
    let newLevel = currentLevel;
    
    // Level up check (100 XP per level as base)
    const xpNeeded = 100 * currentLevel;
    if (newXP >= xpNeeded) {
      newXP = newXP - xpNeeded;
      newLevel = currentLevel + 1;
    }
    
    await this.updatePet({ xp: newXP, level: newLevel });
    return { xp: newXP, level: newLevel };
  }

  async setMood(mood: PetMood): Promise<void> {
    await this.updatePet({ mood });
  }

  async equipItem(itemId: string, slot: 'accessory' | 'background' | 'outfit' | 'emote'): Promise<void> {
    const pet = await this.getPet();
    const equipped = pet.equipped || {};
    
    switch (slot) {
      case 'accessory':
        equipped.accessoryId = itemId;
        break;
      case 'background':
        equipped.backgroundId = itemId;
        break;
      case 'outfit':
        equipped.outfitId = itemId;
        break;
      case 'emote':
        equipped.emoteId = itemId;
        break;
    }
    
    await this.updatePet({ equipped });
  }

  async unequipItem(slot: 'accessory' | 'background' | 'outfit' | 'emote'): Promise<void> {
    await this.equipItem('', slot);
  }

  async addItemToInventory(itemId: string): Promise<void> {
    const pet = await this.getPet();
    if (!pet.inventory.includes(itemId)) {
      await this.updatePet({ inventory: [...pet.inventory, itemId] });
    }
  }

  async getInventory(): Promise<string[]> {
    const pet = await this.getPet();
    return pet.inventory;
  }
}

export const petService = new PetService();
