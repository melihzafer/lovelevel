/**
 * Settings Store - Manages user preferences and relationship settings
 */
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Settings } from '../types/database';
import { DEFAULT_SETTINGS } from '../types/database';
import { settingsService } from '../services';
import { syncService } from '../services';

interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  setSettingsRemote: (updates: Partial<Settings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: true,
      
      loadSettings: async () => {
        set({ isLoading: true });
        const settings = await settingsService.getSettings();
        set({ settings, isLoading: false });
      },
      
      updateSettings: async (updates) => {
        const currentSettings = get().settings;
        const newSettings = { ...currentSettings, ...updates };
        
        await settingsService.updateSettings(updates);
        set({ settings: newSettings });
        
        // Sync settings to partner
        await syncService.queueSettingsSync(newSettings);
      },
      
      setSettingsRemote: async (updates) => {
        // Update from remote - no sync back
        const currentSettings = get().settings;
        const newSettings = { ...currentSettings, ...updates };
        
        await settingsService.updateSettings(updates);
        set({ settings: newSettings });
      },
    }),
    { name: 'settings-store' }
  )
);
