// Database Schema Types

export type Language = 'en' | 'tr' | 'bg';

export interface Partner {
  id: string;
  name: string;
  avatar?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description?: string;
  category: 'at-home' | 'outdoors' | 'creative' | 'budget-friendly' | 'custom';
  tags: string[];
  estimate?: {
    minutes?: number;
    costUSD?: number;
  };
  completedAt?: string; // ISO 8601 string
  notes?: string; // Markdown-lite: bold/italic/emojis
  createdAt: string;
  createdBy?: string;
}

export type ItemType = 'accessory' | 'background' | 'emote' | 'outfit' | 'food';

export interface PetItem {
  id: string;
  name: string;
  type: ItemType;
  description?: string;
  price?: number;
  unlockedAt?: string; // ISO 8601 string
  unlockCondition?: {
    type: 'level' | 'monthiversary' | 'challenge-count';
    value: number;
  };
}

export type PetMood = 'happy' | 'chill' | 'sleepy';

export interface PetState {
  name: string;
  level: number;
  xp: number;
  mood: PetMood;
  hunger: number; // 0-100
  energy: number; // 0-100
  hygiene: number; // 0-100
  coins: number;
  inventory: string[]; // Item IDs
  items: PetItem[]; // Deprecated? Keeping for backward compatibility or UI convenience
  equipped?: {
    accessoryId?: string;
    backgroundId?: string;
    outfitId?: string;
  };
  lastInteraction?: string; // ISO 8601 string
}

export type Theme = 'system' | 'light' | 'dark';

export interface Settings {
  relationshipStartDate: string; // YYYY-MM-DD
  partners: Partner[];
  notificationsEnabled: boolean;
  notificationPermission?: NotificationPermission;
  messageTemplate: string;
  theme: Theme;
  language: Language;
  xpPerChallenge: number;
  xpPerPetTask: number;
  xpPerMonthiversary: number;
  levelCurveMultiplier: number;
  onboardingCompleted: boolean;
}

export interface HistoryEntry {
  id: string;
  type: 'challenge-completed' | 'level-up' | 'monthiversary' | 'item-unlocked';
  timestamp: string; // ISO 8601
  data: Record<string, unknown>;
}

export interface AppDB {
  version: number;
  settings: Settings;
  challenges: Challenge[];
  pet: PetState;
  history: HistoryEntry[];
  lastBackupAt?: string;
}

// Default values
export const DEFAULT_SETTINGS: Settings = {
  relationshipStartDate: new Date().toISOString().split('T')[0],
  partners: [],
  notificationsEnabled: false,
  messageTemplate: 'Happy {months_together} month anniversary, {partner_name_1} & {partner_name_2}! 💕 {days_together} days of love together!',
  theme: 'system',
  language: 'en',
  xpPerChallenge: 20,
  xpPerPetTask: 10,
  xpPerMonthiversary: 100,
  levelCurveMultiplier: 1.15,
  onboardingCompleted: false,
};

export const DEFAULT_PET_STATE: PetState = {
  name: 'Buddy',
  level: 1,
  xp: 0,
  mood: 'happy',
  hunger: 50,
  energy: 100,
  hygiene: 100,
  coins: 0,
  inventory: [],
  items: [],
  equipped: {},
};

// Supabase-specific types (synced data)
export interface Partnership {
  id: string;
  user1_id: string;
  user2_id: string;
  status: 'pending' | 'active' | 'declined';
  anniversary_date: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface InviteCode {
  id?: string;
  code: string;
  created_by: string;
  created_at: string;
  expires_at: string;
  used: boolean;
  used_by?: string;
  used_at?: string;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
