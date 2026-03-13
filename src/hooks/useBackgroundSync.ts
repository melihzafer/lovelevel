/**
 * Background Sync Hook
 * Provides offline-first data synchronization using Background Sync API
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SyncStatus {
  isOnline: boolean;
  pendingSyncs: number;
  lastSyncTime: Date | null;
  isSyncing: boolean;
}

export interface SyncQueueItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  timestamp: Date;
}

const SYNC_QUEUE_KEY = 'lovellevel-sync-queue';

/**
 * Hook for managing background sync operations
 */
export function useBackgroundSync() {
  const [status, setStatus] = useState<SyncStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    pendingSyncs: 0,
    lastSyncTime: null,
    isSyncing: false,
  });

  // Use ref to avoid circular dependency
  const processQueueRef = useRef<() => Promise<void> | undefined>(undefined);

  /**
   * Process the sync queue
   */
  const processQueue = useCallback(async () => {
    setStatus(prev => ({ ...prev, isSyncing: true }));

    try {
      const queue = localStorage.getItem(SYNC_QUEUE_KEY);
      if (!queue) {
        setStatus(prev => ({ ...prev, isSyncing: false }));
        return;
      }

      const items: SyncQueueItem[] = JSON.parse(queue);
      const successfulItems: string[] = [];

      for (const item of items) {
        try {
          const response = await fetch(item.url, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: item.body ? JSON.stringify(item.body) : undefined,
          });

          if (response.ok) {
            successfulItems.push(item.id);
          }
        } catch (error) {
          console.error('Sync failed for item:', item.id, error);
        }
      }

      // Remove successful items from queue
      const remainingItems = items.filter(item => !successfulItems.includes(item.id));
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingItems));

      setStatus(prev => ({
        ...prev,
        pendingSyncs: remainingItems.length,
        lastSyncTime: new Date(),
        isSyncing: false,
      }));
    } catch (error) {
      console.error('Error processing sync queue:', error);
      setStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Keep ref updated
  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  /**
   * Load pending syncs from localStorage
   */
  const loadPendingSyncs = useCallback(() => {
    try {
      const queue = localStorage.getItem(SYNC_QUEUE_KEY);
      if (queue) {
        const items: SyncQueueItem[] = JSON.parse(queue);
        setStatus(prev => ({ ...prev, pendingSyncs: items.length }));
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }, []);

  // Update online status
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      // Trigger sync when coming back online
      processQueueRef.current?.();
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load pending syncs from localStorage
    loadPendingSyncs();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadPendingSyncs]);

  /**
   * Queue an operation for background sync
   */
  const queueSync = useCallback(async (item: Omit<SyncQueueItem, 'id' | 'timestamp'>) => {
    const syncItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    };

    // Add to localStorage queue
    try {
      const queue = localStorage.getItem(SYNC_QUEUE_KEY);
      const items: SyncQueueItem[] = queue ? JSON.parse(queue) : [];
      items.push(syncItem);
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(items));
      
      setStatus(prev => ({ ...prev, pendingSyncs: items.length }));
    } catch (error) {
      console.error('Error queuing sync:', error);
    }

    // If online, try to process immediately
    if (navigator.onLine) {
      await processQueue();
    } else {
      // Register background sync if supported
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-data');
        } catch (error) {
          console.error('Error registering background sync:', error);
        }
      }
    }

    return syncItem.id;
  }, [processQueue]);

  /**
   * Clear the sync queue
   */
  const clearQueue = useCallback(() => {
    localStorage.removeItem(SYNC_QUEUE_KEY);
    setStatus(prev => ({ ...prev, pendingSyncs: 0 }));
  }, []);

  /**
   * Get all pending sync items
   */
  const getPendingItems = useCallback((): SyncQueueItem[] => {
    try {
      const queue = localStorage.getItem(SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch {
      return [];
    }
  }, []);

  return {
    status,
    queueSync,
    processQueue,
    clearQueue,
    getPendingItems,
  };
}

/**
 * Hook for checking if periodic sync is supported
 */
export function usePeriodicSyncSupported() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if ('serviceWorker' in navigator && 'periodicSync' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          setSupported('periodicSync' in registration);
        } catch {
          setSupported(false);
        }
      }
    };

    checkSupport();
  }, []);

  return supported;
}

/**
 * Register periodic background sync for monthiversary checks
 */
export async function registerPeriodicSync() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      if ('periodicSync' in registration) {
        // Check if we have permission for periodic background sync
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName,
        });

        if (status.state === 'granted') {
          await (registration as ServiceWorkerRegistration & { periodicSync: { register: (tag: string, options?: { minInterval: number }) => Promise<void> } }).periodicSync.register('check-monthiversary', {
            minInterval: 24 * 60 * 60 * 1000, // Once per day
          });
          console.log('Periodic sync registered');
        }
      }
    } catch (error) {
      console.error('Error registering periodic sync:', error);
    }
  }
}
