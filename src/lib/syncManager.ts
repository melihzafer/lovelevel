import { supabase } from './supabase';
import * as db from './db';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Challenge } from '../types/database';

interface SyncQueueItem {
  id: string;
  type: 'challenge' | 'pet';
  action: 'add' | 'update' | 'delete';
  data: Challenge | Record<string, unknown>;
  timestamp: string;
  retryCount: number;
}

class SyncManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing = false;
  private partnershipId: string | null = null;

  /**
   * Initialize sync for a partnership
   */
  async initialize(userId: string) {
    try {
      // Fetch user's active partnership
      const { data: partnership, error } = await supabase
        .from('partnerships')
        .select('id, status, anniversary_date')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .eq('status', 'active')
        .single();

      if (error) {
        console.log('No active partnership found:', error.message);
        return null;
      }

      this.partnershipId = partnership.id;

      // Start real-time sync
      await this.startRealtimeSync(partnership.id);

      // Initial sync: IndexedDB → Supabase
      await this.syncLocalToRemote(partnership.id, userId);

      // Initial sync: Supabase → IndexedDB
      await this.syncRemoteToLocal(partnership.id);

      return partnership;
    } catch (error) {
      console.error('Sync initialization error:', error);
      return null;
    }
  }

  /**
   * Start real-time subscriptions for partnership data
   */
  async startRealtimeSync(partnershipId: string) {
    // Subscribe to shared challenges
    const challengesChannel = supabase
      .channel(`partnership:${partnershipId}:challenges`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_challenges',
          filter: `partnership_id=eq.${partnershipId}`,
        },
        (payload) => {
          this.handleRemoteChallengeChange(payload);
        }
      )
      .subscribe();

    this.channels.set('challenges', challengesChannel);

    // Subscribe to shared pet
    const petChannel = supabase
      .channel(`partnership:${partnershipId}:pet`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shared_pet',
          filter: `partnership_id=eq.${partnershipId}`,
        },
        (payload) => {
          this.handleRemotePetChange(payload);
        }
      )
      .subscribe();

    this.channels.set('pet', petChannel);

    console.log('✅ Real-time sync started for partnership:', partnershipId);
  }

  /**
   * Handle remote challenge changes (from partner)
   */
  private async handleRemoteChallengeChange(payload: Record<string, unknown>) {
    try {
      const { eventType, new: newData, old: oldData } = payload as {
        eventType: string;
        new: Record<string, unknown>;
        old: Record<string, unknown>;
      };

      switch (eventType) {
        case 'INSERT':
          // Add new challenge to IndexedDB
          await db.addChallenge({
            id: String(newData.id),
            title: String(newData.title),
            description: newData.notes ? String(newData.notes) : undefined,
            category: String(newData.category) as Challenge['category'],
            tags: (newData.tags as string[]) || [],
            completedAt: newData.completed_at ? String(newData.completed_at) : undefined,
            notes: newData.notes ? String(newData.notes) : undefined,
            createdAt: String(newData.created_at),
          });
          console.log('✅ Remote challenge added:', newData.title);
          break;

        case 'UPDATE':
          // Update challenge in IndexedDB
          await db.updateChallenge(String(newData.id), {
            title: String(newData.title),
            description: newData.notes ? String(newData.notes) : undefined,
            category: String(newData.category) as Challenge['category'],
            tags: (newData.tags as string[]) || [],
            completedAt: newData.completed_at ? String(newData.completed_at) : undefined,
            notes: newData.notes ? String(newData.notes) : undefined,
          });
          console.log('✅ Remote challenge updated:', newData.title);
          break;

        case 'DELETE':
          // Delete challenge from IndexedDB
          await db.deleteChallenge(String(oldData.id));
          console.log('✅ Remote challenge deleted:', oldData.title);
          break;
      }

      // Trigger UI refresh (dispatch custom event)
      window.dispatchEvent(new CustomEvent('sync:challenge', { detail: payload }));
    } catch (error) {
      console.error('Error handling remote challenge change:', error);
    }
  }

  /**
   * Handle remote pet changes (from partner)
   */
  private async handleRemotePetChange(payload: Record<string, unknown>) {
    try {
      const { new: newData } = payload as {
        new: Record<string, unknown>;
      };

      // Update pet in Zustand store (not IndexedDB - pet state is in store)
      const petState = {
        name: String(newData.name),
        xp: Number(newData.xp),
        level: Number(newData.level),
        mood: String(newData.mood),
        hunger: Number(newData.hunger),
        energy: Number(newData.energy),
        equippedAccessoryId: newData.equipped_accessory_id ? String(newData.equipped_accessory_id) : undefined,
        equippedBackgroundId: newData.equipped_background_id ? String(newData.equipped_background_id) : undefined,
      };

      // Trigger UI refresh (dispatch custom event)
      window.dispatchEvent(new CustomEvent('sync:pet', { detail: petState }));

      console.log('✅ Remote pet updated:', newData.name);
    } catch (error) {
      console.error('Error handling remote pet change:', error);
    }
  }

  /**
   * Sync local IndexedDB data to Supabase
   */
  async syncLocalToRemote(partnershipId: string, userId: string) {
    try {
      // Sync all challenges (idb doesn't support syncStatus filtering yet)
      const challenges = await db.getAllChallenges();

      for (const challenge of challenges) {
        // Map local Challenge to Supabase schema
        const { error } = await supabase.from('shared_challenges').upsert({
          id: challenge.id,
          partnership_id: partnershipId,
          title: challenge.title,
          category: challenge.category,
          status: challenge.completedAt ? 'done' : 'todo',
          completed_at: challenge.completedAt,
          notes: challenge.notes || challenge.description,
          tags: challenge.tags,
          xp_reward: 20, // Default XP reward
          created_by: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error('❌ Error syncing challenge:', challenge.title, error);
        }
      }

      console.log(`✅ Synced ${challenges.length} local challenges to Supabase`);
    } catch (error) {
      console.error('Error syncing local to remote:', error);
    }
  }

  /**
   * Sync remote Supabase data to IndexedDB (initial load)
   */
  async syncRemoteToLocal(partnershipId: string) {
    try {
      // Fetch all shared challenges
      const { data: challenges, error } = await supabase
        .from('shared_challenges')
        .select('*')
        .eq('partnership_id', partnershipId);

      if (error) throw error;

      // Merge with IndexedDB (avoid duplicates)
      for (const challenge of challenges || []) {
        const exists = await db.getChallenge(challenge.id);
        if (!exists) {
          await db.addChallenge({
            id: challenge.id,
            title: challenge.title,
            description: challenge.notes || undefined,
            category: challenge.category as Challenge['category'],
            tags: challenge.tags || [],
            completedAt: challenge.completed_at || undefined,
            notes: challenge.notes || undefined,
            createdAt: challenge.created_at || new Date().toISOString(),
          });
        }
      }

      console.log(`✅ Synced ${challenges?.length || 0} remote challenges to IndexedDB`);
    } catch (error) {
      console.error('Error syncing remote to local:', error);
    }
  }

  /**
   * Queue a local change for sync (when online)
   */
  async queueSync(
    type: 'challenge' | 'pet',
    action: 'add' | 'update' | 'delete',
    data: Challenge | Record<string, unknown>
  ) {
    if (!this.partnershipId) {
      console.log('No partnership - skipping sync queue');
      return;
    }

    const item: SyncQueueItem = {
      id: crypto.randomUUID(),
      type,
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    this.syncQueue.push(item);

    // Process queue immediately if online
    if (navigator.onLine && !this.isSyncing) {
      await this.processQueue();
    }
  }

  /**
   * Process sync queue (upload to Supabase)
   */
  async processQueue() {
    if (this.isSyncing || this.syncQueue.length === 0 || !this.partnershipId) {
      return;
    }

    this.isSyncing = true;

    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');

      while (this.syncQueue.length > 0) {
        const item = this.syncQueue[0];

        try {
          if (item.type === 'challenge') {
            await this.syncChallenge(item, userId);
          } else if (item.type === 'pet') {
            await this.syncPet(item, userId);
          }

          // Remove from queue on success
          this.syncQueue.shift();
        } catch (error) {
          console.error('Sync error:', error);

          // Retry logic (max 3 attempts)
          item.retryCount++;
          if (item.retryCount >= 3) {
            console.error('Max retries reached, removing from queue:', item);
            this.syncQueue.shift();
          } else {
            // Move to end of queue for retry
            this.syncQueue.push(this.syncQueue.shift()!);
          }

          break; // Stop processing queue on error
        }
      }
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync a challenge to Supabase
   */
  private async syncChallenge(item: SyncQueueItem, userId: string) {
    const { action, data } = item;
    const challengeData = data as Challenge;

    switch (action) {
      case 'add':
      case 'update':
        await supabase.from('shared_challenges').upsert({
          id: challengeData.id,
          partnership_id: this.partnershipId,
          title: challengeData.title,
          category: challengeData.category,
          status: challengeData.completedAt ? 'done' : 'todo',
          completed_at: challengeData.completedAt,
          notes: challengeData.notes || challengeData.description,
          tags: challengeData.tags,
          xp_reward: 20, // Default XP reward
          created_by: userId,
        });
        break;

      case 'delete':
        await supabase
          .from('shared_challenges')
          .delete()
          .eq('id', challengeData.id);
        break;
    }
  }

  /**
   * Sync pet state to Supabase
   */
  private async syncPet(item: SyncQueueItem, userId: string) {
    const { data } = item;
    const petData = data as Record<string, unknown>;

    await supabase.from('shared_pet').upsert({
      partnership_id: this.partnershipId,
      name: String(petData.name),
      xp: Number(petData.xp),
      level: Number(petData.level),
      mood: String(petData.mood),
      hunger: Number(petData.hunger),
      energy: Number(petData.energy),
      equipped_accessory_id: petData.equippedAccessoryId ? String(petData.equippedAccessoryId) : null,
      equipped_background_id: petData.equippedBackgroundId ? String(petData.equippedBackgroundId) : null,
      updated_by: userId,
    });
  }

  /**
   * Stop all real-time subscriptions
   */
  cleanup() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
    console.log('✅ Sync manager cleaned up');
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
