import { supabase } from './supabase';
import * as db from './db';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Challenge } from '../types/database';

interface SyncQueueItem {
  id: string;
  type: 'challenge' | 'pet' | 'settings';
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
  private currentUserId: string | null = null;
  private partnerId: string | null = null;
  
  /**
   * Initialize sync for a partnership
   */
  async initialize(userId: string) {
    try {
      console.log('🔍 Initializing sync for user:', userId);
      this.currentUserId = userId;

      // 🚀 OPTIMIZATION: Fetch profile and partnership in parallel
      const [profileResult, partnershipResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('onboarding_completed, settings')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('partnerships')
          .select('id, user1_id, user2_id, status, anniversary_date')
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
          .eq('status', 'active')
          .maybeSingle(),
      ]);

      // Process profile result
      if (profileResult.error) {
        console.error('❌ Error fetching profile for sync:', profileResult.error);
      } else if (profileResult.data) {
        console.log('✅ Found user profile settings');
        const currentSettings = await db.getSettings();
        const remoteSettings = (profileResult.data.settings as Record<string, any>) || {};
        
        // Safely merge settings ensuring partners array integrity
        const mergedSettings = {
          ...currentSettings,
          ...remoteSettings,
          onboardingCompleted: profileResult.data.onboarding_completed ?? currentSettings.onboardingCompleted,
        };

        // Ensure partners array exists
        if (!mergedSettings.partners || !Array.isArray(mergedSettings.partners)) {
           mergedSettings.partners = [...currentSettings.partners];
        }

        await db.updateSettings(mergedSettings);
      }

      // Process partnership result
      if (partnershipResult.error) {
        console.warn('⚠️ Partnership query error:', partnershipResult.error.message);
        return null;
      }

      const partnership = partnershipResult.data;
      if (!partnership) {
        console.log('ℹ️ No active partnership found (this is normal for new users)');
        return null;
      }

      console.log('✅ Found partnership:', partnership.id);
      this.partnershipId = partnership.id;
      this.partnerId = partnership.user1_id === userId ? partnership.user2_id : partnership.user1_id;

      // 🚀 OPTIMIZATION: Start real-time sync (non-blocking, runs in background)
      this.startRealtimeSync(partnership.id);

      // 🚀 OPTIMIZATION: Defer heavy sync to background (don't block page load)
      setTimeout(async () => {
        try {
          console.log('🔄 Background sync: Starting deferred sync operations...');
          
          // These run in parallel in background
          await Promise.all([
            this.syncLocalToRemote(partnership.id, userId),
            this.syncRemoteToLocal(partnership.id),
            this.syncPetRemoteToLocal(partnership.id),
            this.syncInventoryRemoteToLocal(partnership.id),
          ]);
          
          console.log('✅ Background sync: Deferred operations complete');
        } catch (err) {
          console.error('Background sync error:', err);
        }
      }, 0);

      // 🚀 OPTIMIZATION: Sync shared settings inline (fast, critical for UI)
      try {
        const currentSettings = await db.getSettings();
        let settingsUpdates: Record<string, any> = {};
        let hasUpdates = false;

        // 1. Sync Anniversary Date from Partnership (already have data)
        if (partnership.anniversary_date && partnership.anniversary_date !== currentSettings.relationshipStartDate) {
           settingsUpdates.relationshipStartDate = partnership.anniversary_date;
           hasUpdates = true;
        }

        // 2. Sync Partner Name from Profile (fast single query)
        if (this.partnerId) {
           const { data: partnerProfile } = await supabase
             .from('profiles')
             .select('display_name')
             .eq('id', this.partnerId)
             .maybeSingle();

           if (partnerProfile && partnerProfile.display_name) {
              const partners = [...(currentSettings.partners || [])];
              // Ensure we have at least 2 slots
              if (partners.length === 0) {
                 partners.push({ id: userId, name: 'Me', avatar: '👤' });
              }
              if (partners.length === 1) {
                 partners.push({ id: 'p2', name: 'Partner', avatar: '👤' });
              }

              let partnerIndex = partners.findIndex(p => p.id === this.partnerId);
              if (partnerIndex === -1) partnerIndex = 1;
              
              if (partners[partnerIndex] && partners[partnerIndex].name !== partnerProfile.display_name) {
                 partners[partnerIndex] = {
                   ...partners[partnerIndex],
                   id: this.partnerId,
                   name: partnerProfile.display_name
                 };
                 settingsUpdates.partners = partners;
                 hasUpdates = true;
              }
           }
        }

        if (hasUpdates) {
          await db.updateSettings(settingsUpdates);
          window.dispatchEvent(new CustomEvent('sync:settings', { detail: settingsUpdates }));
          console.log('✅ Local settings updated with shared data');
        }
      } catch (err) {
         console.error('Error syncing shared settings during init:', err);
      }

      return partnership;
    } catch (error) {
      console.error('⚠️ Sync initialization failed (app will work in solo mode):', error);
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

    // Subscribe to partnership changes (Anniversary Date)
    const partnershipChannel = supabase
      .channel(`partnership:${partnershipId}:details`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'partnerships',
          filter: `id=eq.${partnershipId}`,
        },
        (payload) => {
          this.handleRemotePartnershipChange(payload);
        }
      )
      .subscribe();
      
    this.channels.set('partnership-details', partnershipChannel);

    // Subscribe to partner's profile changes (Name)
    if (this.partnerId) {
      const profileChannel = supabase
        .channel(`partnership:${partnershipId}:partner-profile`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${this.partnerId}`,
          },
          (payload) => {
            this.handleRemoteProfileChange(payload);
          }
        )
        .subscribe();
        
      this.channels.set('partner-profile', profileChannel);
    }

    // Subscribe to inventory changes
    const inventoryChannel = supabase
      .channel(`partnership:${partnershipId}:inventory`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory',
          filter: `partnership_id=eq.${partnershipId}`,
        },
        (payload) => {
          this.handleRemoteInventoryChange(payload);
        }
      )
      .subscribe();

    this.channels.set('inventory', inventoryChannel);

    console.log('✅ Real-time sync started for partnership:', partnershipId);
  }

  /**
   * Subscribe to new partnership requests (for inviter waiting for partner)
   */
  subscribeToPartnershipRequests(userId: string, onPartnershipCreated: () => void) {
    if (this.channels.has('partnership-requests')) {
      return;
    }

    console.log('👂 Listening for new partnerships for user:', userId);

    const channel = supabase
      .channel(`user:${userId}:partnerships`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partnerships',
          filter: `user1_id=eq.${userId}`, 
        },
        async (payload) => {
          console.log('✨ New partnership detected (user1)!', payload);
          onPartnershipCreated();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partnerships',
          filter: `user2_id=eq.${userId}`,
        },
        async (payload) => {
          console.log('✨ New partnership detected (user2)!', payload);
          onPartnershipCreated();
        }
      )
      .subscribe();

    this.channels.set('partnership-requests', channel);
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
   * Handle remote partnership changes (Anniversary Date)
   */
  private async handleRemotePartnershipChange(payload: Record<string, unknown>) {
    try {
      const { new: newData } = payload as {
        new: Record<string, unknown>;
      };

      if (newData.anniversary_date) {
        console.log('📅 Remote partnership update:', newData.anniversary_date);
        
        // Update local settings directly
        // Note: we are not scheduling a sync back to prevent loops
        const currentSettings = await db.getSettings();
        const newDate = String(newData.anniversary_date);
        
        if (currentSettings.relationshipStartDate !== newDate) {
           await db.updateSettings({
             relationshipStartDate: newDate
           });
           
           // Dispatch event for Store update
           window.dispatchEvent(new CustomEvent('sync:settings', { 
             detail: { relationshipStartDate: newDate } 
           }));
        }
      }
    } catch (error) {
      console.error('Error handling remote partnership change:', error);
    }
  }

  /**
   * Handle remote profile changes (Partner Name)
   */
  private async handleRemoteProfileChange(payload: Record<string, unknown>) {
    try {
      const { new: newData } = payload as {
        new: Record<string, unknown>;
      };

      if (newData.display_name) {
        console.log('👤 Remote partner profile update:', newData.display_name);
        
        // Update local settings partners array
        const currentSettings = await db.getSettings();
        const newName = String(newData.display_name);
        const partnerId = String(newData.id);
        
        // Clone partners array safely
        const partners = [...(currentSettings.partners || [])];
        
        // Ensure array has enough slots
        while (partners.length < 2) {
             partners.push({ id: `temp-${partners.length}`, name: 'Partner', avatar: '👤' });
        }
        
        // 1. Try to find by ID
        let partnerIndex = partners.findIndex(p => p.id === partnerId);
        
        // 2. If not found, check if it matches our known partnerId
        if (partnerIndex === -1 && this.partnerId === partnerId) {
          // Assume index 1 is the partner slot (standard convention in this app)
          partnerIndex = 1;
        }

        // 3. Fallback: If we still don't know, and it's NOT us (currentUserId), 
        // and we have a placeholder like 'p2' at index 1, update it.
        if (partnerIndex === -1 && partnerId !== this.currentUserId) {
             // Check if index 1 has a placeholder ID
             if (partners[1] && (partners[1].id === 'p2' || partners[1].id === 'partner')) {
                 partnerIndex = 1;
             }
        }
           
        if (partnerIndex !== -1 && partners[partnerIndex]) {
          console.log(`✅ Updating partner at index ${partnerIndex} with name: ${newName}`);
          partners[partnerIndex] = { 
            ...partners[partnerIndex], 
            name: newName, 
            id: partnerId // Ensure ID is synced now
          };
          
          await db.updateSettings({ partners });
          
          // Dispatch event for Store update
          window.dispatchEvent(new CustomEvent('sync:settings', { 
             detail: { partners } 
          }));
        } else {
            console.warn('⚠️ Could not find partner slot to update for ID:', partnerId);
        }
      }
    } catch (error) {
      console.error('Error handling remote profile change:', error);
    }
  }

  /**
   * Handle remote inventory changes
   */
  private async handleRemoteInventoryChange(payload: Record<string, unknown>) {
    console.log('🎒 Remote inventory update detected:', payload);
    if (this.partnershipId) {
       await this.syncInventoryRemoteToLocal(this.partnershipId);
    }
  }


  /**
   * Helper to ensure a value is a valid number, returning default if not
   */
  private safeNumber(value: unknown, defaultValue: number): number {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
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
        name: String(newData.name || 'Buddy'),
        xp: this.safeNumber(newData.xp, 0),
        level: this.safeNumber(newData.level, 1),
        mood: String(newData.mood || 'happy'),
        hunger: this.safeNumber(newData.hunger, 50),
        energy: this.safeNumber(newData.energy, 100),
        hygiene: this.safeNumber(newData.hygiene, 100),
        coins: this.safeNumber(newData.coins, 0),
        equippedAccessoryId: newData.equipped_accessory_id ? String(newData.equipped_accessory_id) : undefined,
        equippedBackgroundId: newData.equipped_background_id ? String(newData.equipped_background_id) : undefined,
        equippedOutfitId: newData.equipped_outfit_id ? String(newData.equipped_outfit_id) : undefined,
        equippedEmoteId: newData.equipped_emote_id ? String(newData.equipped_emote_id) : undefined,
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
        try {
            // Using put (upsert) to be safe against race conditions/duplicates
            // We map the remote challenge structure to our local structure
            await db.updateChallenge(challenge.id, {
                id: challenge.id,
                title: challenge.title,
                description: challenge.notes || undefined,
                category: challenge.category as Challenge['category'],
                tags: challenge.tags || [],
                completedAt: challenge.completed_at || undefined,
                notes: challenge.notes || undefined,
                createdAt: challenge.created_at || new Date().toISOString(),
            });
        } catch (err) {
            console.warn(`Failed to sync remote challenge ${challenge.id} to local:`, err);
        }
      }

      console.log(`✅ Synced ${challenges?.length || 0} remote challenges to IndexedDB`);
    } catch (error) {
      console.error('Error syncing remote to local:', error);
    }
  }

  /**
   * Sync remote inventory from Supabase to IndexedDB
   */
  async syncInventoryRemoteToLocal(partnershipId: string) {
    try {
      const { data: inventoryItems, error } = await supabase
        .from('inventory')
        .select('item_id')
        .eq('partnership_id', partnershipId);

      if (error) throw error;

      if (inventoryItems && inventoryItems.length > 0) {
        const itemIds = inventoryItems.map(i => i.item_id);
        await db.updatePet({ inventory: itemIds });
        
        // Also update the store if running
        window.dispatchEvent(new CustomEvent('sync:pet', { detail: { inventory: itemIds } }));
        
        console.log(`✅ Synced ${itemIds.length} inventory items to IndexedDB`);
      }
    } catch (error) {
      console.error('Error syncing remote inventory to local:', error);
    }
  }

  /**
   * Sync remote pet state from Supabase to IndexedDB (initial load)
   */
  async syncPetRemoteToLocal(partnershipId: string) {
    try {
      // Fetch shared pet state
      const { data: petData, error } = await supabase
        .from('shared_pet')
        .select('*')
        .eq('partnership_id', partnershipId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!petData) {
        console.log('ℹ️ No shared pet record found (will be created on first update)');
        return;
      }

      if (petData) {
        // Update local pet state in IndexedDB
        // Ensure defaults if fields are null/undefined to prevent NaN
        await db.updatePet({
          name: petData.name || 'Buddy',
          xp: this.safeNumber(petData.xp, 0),
          level: this.safeNumber(petData.level, 1),
          mood: (petData.mood as 'happy' | 'chill' | 'sleepy') || 'happy',
          hunger: this.safeNumber(petData.hunger, 50),
          energy: this.safeNumber(petData.energy, 100),
          hygiene: this.safeNumber(petData.hygiene, 100),
          coins: this.safeNumber(petData.coins, 0),
          equipped: {
            accessoryId: petData.equipped_accessory_id || undefined,
            backgroundId: petData.equipped_background_id || undefined,
            outfitId: petData.equipped_outfit_id || undefined,
          },
        });

        console.log('✅ Synced remote pet state to IndexedDB');
      }
    } catch (error) {
      console.error('Error syncing remote pet to local:', error);
    }
  }

  /**
   * Queue a local change for sync (when online)
   */
  async queueSync(
    type: 'challenge' | 'pet' | 'settings',
    action: 'add' | 'update' | 'delete',
    data: Challenge | Record<string, unknown>
  ) {
    if (type !== 'settings' && !this.partnershipId) {
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
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    // Only check partnershipId if there are items that require it
    const needsPartnership = this.syncQueue.some(item => item.type !== 'settings');
    if (needsPartnership && !this.partnershipId) {
      // Filter out items that don't need partnership and process them?
      // Or just return?
      // For simplicity, let's just proceed. 
      // Individual handlers like syncChallenge might fail if no partnershipId but queueSync prevents adding them.
      // However, queueSync check was: type !== 'settings' && !this.partnershipId.
      // So if queue has non-settings items, partnershipId must have been present when adding.
      // If it's gone now (e.g. disconnected), we should probably fail those items or skip.
      
      // Let's refine the check: if the head of the queue needs partnership but we don't have it, we're stuck.
      const nextItem = this.syncQueue[0];
      if (nextItem.type !== 'settings' && !this.partnershipId) {
        return;
      }
    }

    this.isSyncing = true;

    try {
      // Try to get user ID from Supabase auth, or fallback to stored user ID
      let userId = (await supabase.auth.getUser()).data.user?.id;
      
      // If we are using Firebase Auth exclusively, supabase.auth.getUser() might be empty.
      // We should use the userId passed during initialization.
      if (!userId && this.currentUserId) {
        userId = this.currentUserId;
      }

      if (!userId) throw new Error('User not authenticated');

      while (this.syncQueue.length > 0) {
        const item = this.syncQueue[0];

        // Double check partnership requirement before processing
        if (item.type !== 'settings' && !this.partnershipId) {
           // Should ideally remove or skip, but let's break loop
           break;
        }

        try {
          if (item.type === 'challenge') {
            await this.syncChallenge(item, userId);
          } else if (item.type === 'pet') {
            await this.syncPet(item, userId);
          } else if (item.type === 'settings') {
            await this.syncSettings(item, userId);
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
   * Sync settings to Supabase
   */
  private async syncSettings(item: SyncQueueItem, userId: string) {
    const { data } = item;
    const settings = data as Record<string, unknown>;

    console.log('🔄 Syncing settings to remote:', settings);

    // 1. Sync full settings blob + onboarding
    await supabase.from('profiles').update({
      settings: settings,
      onboarding_completed: Boolean(settings.onboardingCompleted),
      updated_at: new Date().toISOString(),
    }).eq('id', userId);

    console.log('✅ Synced profile settings');

    // 2. Sync Shared Data: Relationship Start Date -> Partnerships
    if (this.partnershipId && settings.relationshipStartDate) {
      console.log(`🔄 Updating partnership date: ${settings.relationshipStartDate} for ID: ${this.partnershipId}`);
      const { error } = await supabase.from('partnerships').update({
        anniversary_date: settings.relationshipStartDate,
      }).eq('id', this.partnershipId);
      
      if (error) console.error('❌ Error updating partnership date:', error);
      else console.log('✅ Updated partnership date');
    } else {
        console.log('⚠️ Skipping partnership date sync:', { 
            hasPartnershipId: !!this.partnershipId, 
            hasDate: !!settings.relationshipStartDate 
        });
    }

    // 3. Sync Public Profile: Display Name -> Profiles
    // Assume partners[0] is always "me" / the current user
    const partners = settings.partners as Array<{id: string, name: string}>;
    if (partners && partners[0] && partners[0].name) {
      console.log(`🔄 Updating public profile name: ${partners[0].name}`);
      const { error } = await supabase.from('profiles').update({
        display_name: partners[0].name,
      }).eq('id', userId);
      
      if (error) console.error('❌ Error updating profile name:', error);
      else console.log('✅ Updated profile name');
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

    const payload = {
      partnership_id: this.partnershipId,
      name: String(petData.name || ''),
      xp: Math.round(Number(petData.xp) || 0),
      level: Math.round(Number(petData.level) || 1),
      mood: String(petData.mood || 'happy'),
      hunger: Math.round(Number(petData.hunger) || 0),
      energy: Math.round(Number(petData.energy) || 0),
      hygiene: Math.round(Number(petData.hygiene) || 0),
      coins: Math.round(Number(petData.coins) || 0),
      equipped_accessory_id: petData.equippedAccessoryId ? String(petData.equippedAccessoryId) : null,
      equipped_background_id: petData.equippedBackgroundId ? String(petData.equippedBackgroundId) : null,
      equipped_outfit_id: petData.equippedOutfitId ? String(petData.equippedOutfitId) : null,
      equipped_emote_id: petData.equippedEmoteId ? String(petData.equippedEmoteId) : null,
      updated_by: userId,
    };

    console.log('🔄 Syncing Pet Payload:', JSON.stringify(payload, null, 2));

    const { error } = await supabase.from('shared_pet').upsert(payload);

    if (error) {
        console.error('❌ Error syncing pet:', error.message, error.details, error.hint, payload);
        throw error;
    }
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
  /**
   * Get the current partnership ID
   */
  getPartnershipId() {
    return this.partnershipId;
  }
}

// Export singleton instance
export const syncManager = new SyncManager();
