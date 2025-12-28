import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './FirebaseAuthContext';
import { syncManager } from '../lib/syncManager';
import { ensureProfile } from '../lib/supabase';
import { useSettingsStore } from '../store';
import type { Partnership } from '../types/database';

interface SupabaseSyncContextType {
  partnership: Partnership | null;
  isSyncing: boolean;
  isOnline: boolean;
  isProfileSynced: boolean;
  queuedItems: number;
}

const SupabaseSyncContext = createContext<SupabaseSyncContextType | undefined>(undefined);

export function SupabaseSyncProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [partnership, setPartnership] = useState<Partnership | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isProfileSynced, setIsProfileSynced] = useState(false);

  // Initialize sync when user logs in
  useEffect(() => {
    if (!user) {
      setPartnership(null);
      setIsProfileSynced(false);
      return;
    }

    const initSync = async () => {
      setIsSyncing(true);
      try {
        console.log('🔄 Initializing Supabase sync for user:', user.uid);
        
        // 🔧 CRITICAL FIX: Ensure profile exists BEFORE any Supabase operations
        // This prevents foreign key constraint errors (23503)
        console.log('👤 Ensuring profile exists in Supabase...');
        await ensureProfile(
          user.uid,
          user.email,
          user.displayName,
          user.photoURL
        );
        console.log('✅ Profile ensured');
        
        // Now safe to initialize sync (which queries partnerships, etc.)
        const partnershipData = await syncManager.initialize(user.uid);

        // Reload settings from local DB (updated by syncManager)
        console.log('🔄 Reloading settings from local DB...');
        await useSettingsStore.getState().loadSettings();
        
        // MARK PROFILE AS SYNCED - This is critical for preventing onboarding loop
        setIsProfileSynced(true);

        if (partnershipData) {
          setPartnership(partnershipData);
          console.log('✅ Sync initialized for partnership:', partnershipData.id);
        } else {
          console.log('ℹ️ No active partnership - operating in solo mode');
          // 🔧 FIX: Solo mode is OK, not an error - user can still use app
          setPartnership(null);

          // 🆕 Listen for new partnerships (if we sent an invite)
          syncManager.subscribeToPartnershipRequests(user.uid, () => {
             console.log('🎉 Partnership request detected! Re-initializing sync...');
             // Re-run initialization to pick up the new partnership and start full sync
             initSync();
          });
        }
      } catch (error) {
        console.error('⚠️ Sync initialization error (continuing in solo mode):', error);
        // 🔧 FIX: Don't block login - let user continue without sync
        setPartnership(null);
        
        // Even if sync fails, we mark as synced so app can load (perhaps fallback to local data)
        setIsProfileSynced(true);
      } finally {
        setIsSyncing(false);
      }
    };

    // 🔧 FIX: Immediate sync initialization (removed delay)
    // The sync is now non-blocking and won't interfere with navigation
    initSync();

    // Cleanup on unmount or user logout
    return () => {
      syncManager.cleanup();
    };
  }, [user]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Retry sync queue when coming back online
      syncManager.processQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to sync events for UI updates
  useEffect(() => {
    const handleChallengeSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Challenge synced:', customEvent.detail);
      // Trigger re-render by updating sync state
      setIsSyncing(false);
    };

    const handlePetSync = (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Pet synced:', customEvent.detail);
      setIsSyncing(false);
    };

    window.addEventListener('sync:challenge', handleChallengeSync);
    window.addEventListener('sync:pet', handlePetSync);

    return () => {
      window.removeEventListener('sync:challenge', handleChallengeSync);
      window.removeEventListener('sync:pet', handlePetSync);
    };
  }, []);

  const value = {
    partnership,
    isSyncing,
    isOnline,
    isProfileSynced,
    queuedItems: 0, // TODO: Expose sync queue length from syncManager
  };

  return (
    <SupabaseSyncContext.Provider value={value}>
      {children}
    </SupabaseSyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SupabaseSyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SupabaseSyncProvider');
  }
  return context;
}
