import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { syncManager } from './syncManager';
import * as db from './db';
import { supabase } from './supabase';
import type { Challenge } from '../types/database';

// Mock dependencies
vi.mock('./db');
vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

// Mock window for event dispatching
const mockWindow = {
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
};
global.window = mockWindow as any;

describe('SyncManager - Challenge Sync', () => {
  const mockUserId = 'user-123';
  const mockPartnershipId = 'partnership-456';
  
  const mockChallenge: Challenge = {
    id: 'challenge-1',
    title: 'Date Night at Home',
    description: 'Cook dinner together',
    category: 'at-home',
    tags: ['cooking', 'romantic'],
    createdAt: '2025-01-28T10:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clear sync queue between tests
    // @ts-expect-error - accessing private property for testing
    syncManager.syncQueue = [];
    // @ts-expect-error - accessing private property for testing
    syncManager.partnershipId = null;
    // @ts-expect-error - accessing private property for testing
    syncManager.isSyncing = false;
    
    // Mock authenticated user
    (supabase.auth.getUser as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });
  });

  afterEach(() => {
    syncManager.cleanup();
  });

  describe('queueSync', () => {
    it('should queue a challenge for sync when partnership exists', async () => {
      // @ts-expect-error - accessing private property for testing
      syncManager.partnershipId = mockPartnershipId;
      
      await syncManager.queueSync('challenge', 'add', mockChallenge);
      
      // @ts-expect-error - accessing private property for testing
      expect(syncManager.syncQueue.length).toBe(1);
      // @ts-expect-error - accessing private property for testing
      expect(syncManager.syncQueue[0].type).toBe('challenge');
      // @ts-expect-error - accessing private property for testing
      expect(syncManager.syncQueue[0].action).toBe('add');
    });

    it('should not queue when no partnership exists', async () => {
      // @ts-expect-error - accessing private property for testing
      syncManager.partnershipId = null;
      
      await syncManager.queueSync('challenge', 'add', mockChallenge);
      
      // @ts-expect-error - accessing private property for testing
      expect(syncManager.syncQueue.length).toBe(0);
    });

    it('should process queue immediately when online', async () => {
      // @ts-expect-error - accessing private property for testing
      syncManager.partnershipId = mockPartnershipId;
      
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      // Mock Supabase upsert
      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        upsert: mockUpsert,
      });

      await syncManager.queueSync('challenge', 'add', mockChallenge);
      
      // Wait for processQueue to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: mockChallenge.id,
          partnership_id: mockPartnershipId,
          title: mockChallenge.title,
          category: mockChallenge.category,
          created_by: mockUserId,
        })
      );
    });
  });

  describe('syncLocalToRemote', () => {
    it('should sync all local challenges to Supabase', async () => {
      const mockChallenges: Challenge[] = [
        mockChallenge,
        {
          ...mockChallenge,
          id: 'challenge-2',
          title: 'Outdoor Hike',
          category: 'outdoors',
        },
      ];

      (db.getAllChallenges as ReturnType<typeof vi.fn>).mockResolvedValue(mockChallenges);

      const mockUpsert = vi.fn().mockResolvedValue({ data: null, error: null });
      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        upsert: mockUpsert,
      });

      await syncManager.syncLocalToRemote(mockPartnershipId, mockUserId);

      expect(mockUpsert).toHaveBeenCalledTimes(2);
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'challenge-1',
          partnership_id: mockPartnershipId,
        })
      );
    });
  });

  describe('syncRemoteToLocal', () => {
    it('should sync remote challenges to IndexedDB', async () => {
      const remoteChallenges = [
        {
          id: 'remote-challenge-1',
          title: 'Partner Challenge',
          category: 'creative',
          tags: ['art'],
          created_at: '2025-01-28T12:00:00Z',
          notes: 'Partner created this',
        },
      ];

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: remoteChallenges,
            error: null,
          }),
        }),
      });

      (db.getChallenge as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const mockAddChallenge = vi.fn().mockResolvedValue(undefined);
      (db.addChallenge as ReturnType<typeof vi.fn>).mockImplementation(mockAddChallenge);

      await syncManager.syncRemoteToLocal(mockPartnershipId);

      expect(mockAddChallenge).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'remote-challenge-1',
          title: 'Partner Challenge',
          category: 'creative',
        })
      );
    });

    it('should not duplicate existing challenges', async () => {
      const remoteChallenges = [
        {
          id: 'challenge-1',
          title: 'Existing Challenge',
          category: 'at-home',
          tags: [],
          created_at: '2025-01-28T10:00:00Z',
        },
      ];

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: remoteChallenges,
            error: null,
          }),
        }),
      });

      // Challenge already exists
      (db.getChallenge as ReturnType<typeof vi.fn>).mockResolvedValue(mockChallenge);
      const mockAddChallenge = vi.fn();
      (db.addChallenge as ReturnType<typeof vi.fn>).mockImplementation(mockAddChallenge);

      await syncManager.syncRemoteToLocal(mockPartnershipId);

      // Should not add duplicate
      expect(mockAddChallenge).not.toHaveBeenCalled();
    });
  });

  describe('handleRemoteChallengeChange', () => {
    it('should add new challenge when INSERT event received', async () => {
      const payload = {
        eventType: 'INSERT',
        new: {
          id: 'remote-challenge-2',
          title: 'New Partner Challenge',
          category: 'budget-friendly',
          tags: ['free'],
          created_at: '2025-01-28T14:00:00Z',
          notes: 'Added by partner',
        },
        old: {},
      };

      const mockAddChallenge = vi.fn().mockResolvedValue(undefined);
      (db.addChallenge as ReturnType<typeof vi.fn>).mockImplementation(mockAddChallenge);

      // @ts-expect-error - accessing private method for testing
      await syncManager.handleRemoteChallengeChange(payload);

      expect(mockAddChallenge).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'remote-challenge-2',
          title: 'New Partner Challenge',
          category: 'budget-friendly',
        })
      );
      
      // Verify event was dispatched
      expect(mockWindow.dispatchEvent).toHaveBeenCalled();
    });

    it('should update existing challenge when UPDATE event received', async () => {
      const payload = {
        eventType: 'UPDATE',
        new: {
          id: 'challenge-1',
          title: 'Updated Challenge',
          category: 'at-home',
          tags: ['updated'],
          completed_at: '2025-01-28T15:00:00Z',
          notes: 'Partner completed this',
          created_at: '2025-01-28T10:00:00Z',
        },
        old: {
          id: 'challenge-1',
        },
      };

      const mockUpdateChallenge = vi.fn().mockResolvedValue(undefined);
      (db.updateChallenge as ReturnType<typeof vi.fn>).mockImplementation(mockUpdateChallenge);

      // @ts-expect-error - accessing private method for testing
      await syncManager.handleRemoteChallengeChange(payload);

      expect(mockUpdateChallenge).toHaveBeenCalledWith(
        'challenge-1',
        expect.objectContaining({
          title: 'Updated Challenge',
          completedAt: '2025-01-28T15:00:00Z',
        })
      );
    });

    it('should delete challenge when DELETE event received', async () => {
      const payload = {
        eventType: 'DELETE',
        new: {},
        old: {
          id: 'challenge-1',
          title: 'Deleted Challenge',
        },
      };

      const mockDeleteChallenge = vi.fn().mockResolvedValue(undefined);
      (db.deleteChallenge as ReturnType<typeof vi.fn>).mockImplementation(mockDeleteChallenge);

      // @ts-expect-error - accessing private method for testing
      await syncManager.handleRemoteChallengeChange(payload);

      expect(mockDeleteChallenge).toHaveBeenCalledWith('challenge-1');
    });
  });

  describe('processQueue with retries', () => {
    it('should retry failed sync operations', async () => {
      // @ts-expect-error - accessing private property for testing
      syncManager.partnershipId = mockPartnershipId;

      let callCount = 0;
      const mockUpsert = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({ data: null, error: null });
      });

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        upsert: mockUpsert,
      });

      await syncManager.queueSync('challenge', 'add', mockChallenge);
      
      // Process queue (will fail first time)
      await syncManager.processQueue();
      
      // Process queue again (should succeed)
      await syncManager.processQueue();

      expect(mockUpsert).toHaveBeenCalledTimes(2);
    });

    it('should remove item from queue after max retries', async () => {
      // @ts-expect-error - accessing private property for testing
      syncManager.partnershipId = mockPartnershipId;

      const mockUpsert = vi.fn().mockRejectedValue(new Error('Permanent error'));

      (supabase.from as ReturnType<typeof vi.fn>).mockReturnValue({
        upsert: mockUpsert,
      });

      await syncManager.queueSync('challenge', 'add', mockChallenge);

      // Process queue 3 times (max retries)
      await syncManager.processQueue();
      await syncManager.processQueue();
      await syncManager.processQueue();

      // @ts-expect-error - accessing private property for testing
      expect(syncManager.syncQueue.length).toBe(0);
      expect(mockUpsert).toHaveBeenCalledTimes(3);
    });
  });

  describe('conflict resolution', () => {
    it('should handle concurrent challenge completion (last-write-wins)', async () => {
      const remoteChallenge = {
        id: mockChallenge.id,
        completed_at: '2025-01-28T15:00:01Z', // 1 second later
        notes: 'Completed by partner',
        title: 'Updated Challenge',
        category: 'at-home',
        tags: ['test'],
        created_at: '2025-01-28T10:00:00Z',
      };

      // Simulate remote update arriving
      const payload = {
        eventType: 'UPDATE',
        new: remoteChallenge,
        old: { id: mockChallenge.id },
      };

      const mockUpdateChallenge = vi.fn().mockResolvedValue(undefined);
      (db.updateChallenge as ReturnType<typeof vi.fn>).mockImplementation(mockUpdateChallenge);

      // @ts-expect-error - accessing private method for testing
      await syncManager.handleRemoteChallengeChange(payload);

      // Remote version should win (newer timestamp)
      expect(mockUpdateChallenge).toHaveBeenCalledWith(
        mockChallenge.id,
        expect.objectContaining({
          completedAt: '2025-01-28T15:00:01Z',
          notes: 'Completed by partner',
        })
      );
    });
  });
});
