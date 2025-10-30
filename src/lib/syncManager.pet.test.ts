/**
 * Unit tests for Pet State Synchronization
 * Tests bidirectional pet sync between partners
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { PetState } from '../types/database';

// Mock dependencies
vi.mock('./db', () => ({
  addChallenge: vi.fn(),
  updateChallenge: vi.fn(),
  deleteChallenge: vi.fn(),
  getAllChallenges: vi.fn().mockResolvedValue([]),
  getChallenge: vi.fn().mockResolvedValue(null),
  updatePet: vi.fn(),
  getPet: vi.fn().mockResolvedValue({
    name: 'Test Pet',
    xp: 100,
    level: 5,
    mood: 'happy',
    hunger: 80,
    energy: 90,
    equipped: {},
  }),
}));

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-123' } },
      }),
    },
    from: vi.fn((table: string) => ({
      select: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockResolvedValue({ error: null }),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: table === 'shared_pet' ? {
          name: 'Remote Pet',
          xp: 200,
          level: 10,
          mood: 'chill',
          hunger: 50,
          energy: 60,
          equipped_accessory_id: 'acc-sunglasses',
          equipped_background_id: 'bg-beach',
        } : null,
        error: null,
      }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
  },
}));

// Mock window object for event dispatching
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};
global.window = mockWindow as any;

// Import SyncManager after mocks
import { syncManager } from './syncManager';
import { supabase } from './supabase';
import * as db from './db';

describe('Pet Synchronization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset sync manager state
    (syncManager as any).syncQueue = [];
    (syncManager as any).partnershipId = 'test-partnership-123';
    (syncManager as any).isSyncing = false;
  });

  describe('queueSync for Pet', () => {
    it('should queue pet update when partnership exists', () => {
      const petState = {
        name: 'Fluffy',
        xp: 150,
        level: 7,
        mood: 'happy',
        hunger: 85,
        energy: 95,
        equippedAccessoryId: 'acc-crown',
        equippedBackgroundId: 'bg-space',
      };

      syncManager.queueSync('pet', 'update', petState);

      expect((syncManager as any).syncQueue.length).toBe(1);
      expect((syncManager as any).syncQueue[0].type).toBe('pet');
      expect((syncManager as any).syncQueue[0].action).toBe('update');
      expect((syncManager as any).syncQueue[0].data).toEqual(petState);
    });

    it('should not queue pet update when no partnership exists', () => {
      (syncManager as any).partnershipId = null;

      const petState = {
        name: 'Solo Pet',
        xp: 50,
        level: 3,
        mood: 'sleepy',
        hunger: 30,
        energy: 40,
      };

      syncManager.queueSync('pet', 'update', petState);

      expect((syncManager as any).syncQueue.length).toBe(0);
    });
  });

  describe('syncPet', () => {
    it('should sync pet state to Supabase with correct schema mapping', async () => {
      const petData = {
        name: 'Buddy',
        xp: 300,
        level: 12,
        mood: 'chill',
        hunger: 70,
        energy: 80,
        equippedAccessoryId: 'acc-wizard-hat',
        equippedBackgroundId: 'bg-forest',
      };

      const userId = 'user-456';

      await (syncManager as any).syncPet(
        {
          id: 'sync-item-1',
          type: 'pet',
          action: 'update',
          data: petData,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        },
        userId
      );

      expect(supabase.from).toHaveBeenCalledWith('shared_pet');
      const upsertCall = (supabase.from as any).mock.results[0].value.upsert;
      expect(upsertCall).toHaveBeenCalledWith({
        partnership_id: 'test-partnership-123',
        name: 'Buddy',
        xp: 300,
        level: 12,
        mood: 'chill',
        hunger: 70,
        energy: 80,
        equipped_accessory_id: 'acc-wizard-hat',
        equipped_background_id: 'bg-forest',
        updated_by: userId,
      });
    });

    it('should handle undefined equipped items correctly', async () => {
      const petData = {
        name: 'Naked Pet',
        xp: 50,
        level: 2,
        mood: 'happy',
        hunger: 100,
        energy: 100,
        equippedAccessoryId: undefined,
        equippedBackgroundId: undefined,
      };

      const userId = 'user-789';

      await (syncManager as any).syncPet(
        {
          id: 'sync-item-2',
          type: 'pet',
          action: 'update',
          data: petData,
          timestamp: new Date().toISOString(),
          retryCount: 0,
        },
        userId
      );

      const upsertCall = (supabase.from as any).mock.results[0].value.upsert;
      expect(upsertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          equipped_accessory_id: null,
          equipped_background_id: null,
        })
      );
    });
  });

  describe('syncPetRemoteToLocal', () => {
    it('should fetch remote pet state and update IndexedDB', async () => {
      await (syncManager as any).syncPetRemoteToLocal('test-partnership-123');

      expect(supabase.from).toHaveBeenCalledWith('shared_pet');
      expect(db.updatePet).toHaveBeenCalledWith({
        name: 'Remote Pet',
        xp: 200,
        level: 10,
        mood: 'chill',
        hunger: 50,
        energy: 60,
        equipped: {
          accessoryId: 'acc-sunglasses',
          backgroundId: 'bg-beach',
        },
      });
    });

    it('should handle missing pet record gracefully', async () => {
      // Mock no pet record found (PGRST116 error)
      (supabase.from as any).mockReturnValueOnce({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { code: 'PGRST116', message: 'No rows found' },
        }),
      });

      await expect(
        (syncManager as any).syncPetRemoteToLocal('test-partnership-123')
      ).resolves.not.toThrow();
    });
  });

  describe('handleRemotePetChange', () => {
    it('should dispatch sync:pet event with new pet state', async () => {
      const payload = {
        eventType: 'UPDATE',
        new: {
          name: 'Updated Pet',
          xp: 250,
          level: 11,
          mood: 'sleepy',
          hunger: 40,
          energy: 30,
          equipped_accessory_id: 'acc-headphones',
          equipped_background_id: 'bg-city',
        },
        old: {},
      };

      await (syncManager as any).handleRemotePetChange(payload);

      expect(mockWindow.dispatchEvent).toHaveBeenCalled();
      const eventCall = mockWindow.dispatchEvent.mock.calls[0][0];
      expect(eventCall.type).toBe('sync:pet');
      expect(eventCall.detail).toEqual({
        name: 'Updated Pet',
        xp: 250,
        level: 11,
        mood: 'sleepy',
        hunger: 40,
        energy: 30,
        equippedAccessoryId: 'acc-headphones',
        equippedBackgroundId: 'bg-city',
      });
    });

    it('should handle undefined equipped items in remote change', async () => {
      const payload = {
        eventType: 'UPDATE',
        new: {
          name: 'Bare Pet',
          xp: 10,
          level: 1,
          mood: 'happy',
          hunger: 50,
          energy: 100,
          equipped_accessory_id: null,
          equipped_background_id: null,
        },
        old: {},
      };

      await (syncManager as any).handleRemotePetChange(payload);

      const eventCall = mockWindow.dispatchEvent.mock.calls[0][0];
      expect(eventCall.detail.equippedAccessoryId).toBeUndefined();
      expect(eventCall.detail.equippedBackgroundId).toBeUndefined();
    });
  });

  describe('processQueue for Pet', () => {
    it('should process pet sync queue successfully', async () => {
      const petState = {
        name: 'Queue Pet',
        xp: 175,
        level: 8,
        mood: 'happy',
        hunger: 90,
        energy: 85,
        equippedAccessoryId: 'acc-party-hat',
        equippedBackgroundId: 'bg-party',
      };

      syncManager.queueSync('pet', 'update', petState);
      await syncManager.processQueue();

      expect((syncManager as any).syncQueue.length).toBe(0);
      expect(supabase.from).toHaveBeenCalledWith('shared_pet');
    });

    it('should retry pet sync on network error', async () => {
      // Mock network error
      (supabase.from as any).mockReturnValueOnce({
        upsert: vi.fn().mockRejectedValue(new Error('Network error')),
      });

      const petState = {
        name: 'Retry Pet',
        xp: 100,
        level: 5,
        mood: 'chill',
        hunger: 60,
        energy: 70,
      };

      syncManager.queueSync('pet', 'update', petState);
      await syncManager.processQueue();

      // Should still be in queue with incremented retry count
      expect((syncManager as any).syncQueue.length).toBe(1);
      expect((syncManager as any).syncQueue[0].retryCount).toBe(1);
    });

    it('should remove from queue after 3 failed retries', async () => {
      // Mock permanent error
      (supabase.from as any).mockImplementation(() => ({
        upsert: vi.fn().mockRejectedValue(new Error('Permanent error')),
      }));

      const petState = {
        name: 'Failed Pet',
        xp: 50,
        level: 3,
        mood: 'sleepy',
        hunger: 30,
        energy: 40,
      };

      syncManager.queueSync('pet', 'update', petState);

      // Attempt 1
      await syncManager.processQueue();
      expect((syncManager as any).syncQueue.length).toBe(1);
      expect((syncManager as any).syncQueue[0].retryCount).toBe(1);

      // Attempt 2
      await syncManager.processQueue();
      expect((syncManager as any).syncQueue.length).toBe(1);
      expect((syncManager as any).syncQueue[0].retryCount).toBe(2);

      // Attempt 3 - should remove from queue
      await syncManager.processQueue();
      expect((syncManager as any).syncQueue.length).toBe(0);
    });
  });

  describe('XP and Level Sync', () => {
    it('should sync XP changes immediately', async () => {
      const beforeXP = 100;
      const gainedXP = 50;
      const afterXP = 150;

      const petState = {
        name: 'XP Pet',
        xp: afterXP,
        level: 5,
        mood: 'happy',
        hunger: 80,
        energy: 90,
      };

      syncManager.queueSync('pet', 'update', petState);
      await syncManager.processQueue();

      expect(supabase.from).toHaveBeenCalledWith('shared_pet');
      const upsertCall = (supabase.from as any).mock.results[0].value.upsert;
      expect(upsertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          xp: 150,
          level: 5,
        })
      );
    });

    it('should sync level-up events', async () => {
      const petState = {
        name: 'Leveled Up Pet',
        xp: 0, // Reset XP after level-up
        level: 10, // New level
        mood: 'happy',
        hunger: 80,
        energy: 90,
      };

      syncManager.queueSync('pet', 'update', petState);
      await syncManager.processQueue();

      const upsertCall = (supabase.from as any).mock.results[0].value.upsert;
      expect(upsertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 10,
          xp: 0,
        })
      );
    });
  });

  describe('Equipped Items Sync', () => {
    it('should sync accessory equip', async () => {
      const petState = {
        name: 'Fashionable Pet',
        xp: 100,
        level: 5,
        mood: 'happy',
        hunger: 80,
        energy: 90,
        equippedAccessoryId: 'acc-crown',
        equippedBackgroundId: undefined,
      };

      syncManager.queueSync('pet', 'update', petState);
      await syncManager.processQueue();

      const upsertCall = (supabase.from as any).mock.results[0].value.upsert;
      expect(upsertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          equipped_accessory_id: 'acc-crown',
          equipped_background_id: null,
        })
      );
    });

    it('should sync accessory unequip', async () => {
      const petState = {
        name: 'Naked Pet',
        xp: 100,
        level: 5,
        mood: 'happy',
        hunger: 80,
        energy: 90,
        equippedAccessoryId: undefined,
        equippedBackgroundId: 'bg-forest',
      };

      syncManager.queueSync('pet', 'update', petState);
      await syncManager.processQueue();

      const upsertCall = (supabase.from as any).mock.results[0].value.upsert;
      expect(upsertCall).toHaveBeenCalledWith(
        expect.objectContaining({
          equipped_accessory_id: null,
          equipped_background_id: 'bg-forest',
        })
      );
    });
  });
});
