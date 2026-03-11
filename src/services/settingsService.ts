import * as db from '../lib/db';
import type { Settings, Language, Theme } from '../types/database';
import { DEFAULT_SETTINGS } from '../types/database';

export interface ISettingsService {
  getSettings(): Promise<Settings>;
  updateSettings(updates: Partial<Settings>): Promise<void>;
  setLanguage(lang: Language): Promise<void>;
  setTheme(theme: Theme): Promise<void>;
  toggleNotifications(): Promise<void>;
  completeOnboarding(): Promise<void>;
  resetSettings(): Promise<void>;
}

export class SettingsService implements ISettingsService {
  async getSettings(): Promise<Settings> {
    return db.getSettings();
  }

  async updateSettings(updates: Partial<Settings>): Promise<void> {
    await db.updateSettings(updates);
  }

  async setLanguage(lang: Language): Promise<void> {
    await this.updateSettings({ language: lang });
  }

  async setTheme(theme: Theme): Promise<void> {
    await this.updateSettings({ theme });
  }

  async toggleNotifications(): Promise<void> {
    const settings = await this.getSettings();
    await this.updateSettings({ notificationsEnabled: !settings.notificationsEnabled });
  }

  async completeOnboarding(): Promise<void> {
    await this.updateSettings({ onboardingCompleted: true });
  }

  async resetSettings(): Promise<void> {
    await db.updateSettings(DEFAULT_SETTINGS);
  }
}

export const settingsService = new SettingsService();
