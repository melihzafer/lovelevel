/**
 * Store Index - Re-exports all stores for backward compatibility
 * 
 * The stores have been split into separate files for better maintainability:
 * - settingsStore.ts: User preferences and relationship settings
 * - petStore.ts: Virtual pet state and actions
 * - challengesStore.ts: Relationship challenges
 */

// Re-export stores
export { useSettingsStore } from './settingsStore';
export { usePetStore } from './petStore';
export { useChallengesStore } from './challengesStore';

// Import for initialization and selectors
import { useSettingsStore } from './settingsStore';
import { usePetStore } from './petStore';
import { useChallengesStore } from './challengesStore';
import { getDateStats } from '../lib/dateUtils';
import { getLevelInfo } from '../lib/xpSystem';

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
  
  // Calculate and apply decay based on time since last visit
  const { calculateAndApplyDecay } = await import('../lib/petDecayService');
  const decayResult = await calculateAndApplyDecay();
  
  // Reload pet state after decay calculation
  if (decayResult.minutesElapsed > 0) {
    await usePetStore.getState().loadPet();
  }
  
  // Set up listeners for real-time sync events
  if (typeof window !== 'undefined') {
    // Settings Sync
    window.addEventListener('sync:settings', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Store: Received settings sync', customEvent.detail);
      useSettingsStore.getState().setSettingsRemote(customEvent.detail);
    });

    // Pet Sync - Use setPetRemote to avoid sync loops (data comes FROM remote)
    window.addEventListener('sync:pet', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Store: Received pet sync (from remote)', customEvent.detail);
      usePetStore.getState().setPetRemote(customEvent.detail);
    });

    // Challenge Sync
    window.addEventListener('sync:challenge', (event: Event) => {
      const customEvent = event as CustomEvent;
      console.log('🔄 Store: Received challenge sync', customEvent.detail);
      
      // Reload challenges for consistency
      useChallengesStore.getState().loadChallenges();
    });
  }
}
