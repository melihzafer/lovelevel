/**
 * SyncService - Abstraction layer for synchronization operations
 * 
 * This service wraps the existing SyncManager with a cleaner interface,
 * providing a stepping stone towards full decoupling of sync logic from stores.
 */

import { syncManager } from '../lib/syncManager';
import type { PetState, Challenge, Settings } from '../types/database';

export interface SyncStatus {
  isOnline: boolean;
  partnershipId: string | null;
}

export interface ISyncService {
  initialize(userId: string): Promise<void>;
  getSyncStatus(): SyncStatus;
  queuePetSync(pet: PetState): Promise<void>;
  queueChallengeSync(challenge: Challenge, action: 'add' | 'update' | 'delete'): Promise<void>;
  queueSettingsSync(settings: Settings): Promise<void>;
  processQueue(): Promise<void>;
  cleanup(): void;
}

class SyncServiceImpl implements ISyncService {
  private initialized = false;

  async initialize(userId: string): Promise<void> {
    if (this.initialized) return;
    
    try {
      await syncManager.initialize(userId);
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize sync:', error);
      throw error;
    }
  }

  getSyncStatus(): SyncStatus {
    return {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      partnershipId: syncManager.getPartnershipId(),
    };
  }

  async queuePetSync(pet: PetState): Promise<void> {
    const partnershipId = syncManager.getPartnershipId();
    if (!partnershipId) return;
    
    const payload = {
      name: pet.name,
      xp: pet.xp,
      level: pet.level,
      mood: pet.mood,
      hunger: pet.hunger,
      energy: pet.energy,
      hygiene: pet.hygiene,
      coins: pet.coins,
      equippedAccessoryId: pet.equipped?.accessoryId,
      equippedBackgroundId: pet.equipped?.backgroundId,
      equippedOutfitId: pet.equipped?.outfitId,
      equippedEmoteId: pet.equipped?.emoteId,
    };
    
    await syncManager.queueSync('pet', 'update', payload);
  }

  async queueChallengeSync(challenge: Challenge, action: 'add' | 'update' | 'delete'): Promise<void> {
    const partnershipId = syncManager.getPartnershipId();
    if (!partnershipId) return;
    
    await syncManager.queueSync('challenge', action, challenge);
  }

  async queueSettingsSync(settings: Settings): Promise<void> {
    await syncManager.queueSync('settings', 'update', settings as unknown as Record<string, unknown>);
  }

  async processQueue(): Promise<void> {
    await syncManager.processQueue();
  }

  cleanup(): void {
    syncManager.cleanup();
    this.initialized = false;
  }
}

export const syncService = new SyncServiceImpl();
