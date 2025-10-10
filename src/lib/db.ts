import { openDB, type IDBPDatabase, type DBSchema } from 'idb';
import type { AppDB, Challenge, PetState, Settings, HistoryEntry } from '../types/database';
import { DEFAULT_SETTINGS, DEFAULT_PET_STATE } from '../types/database';
import { SEED_CHALLENGES } from '../data/seedChallenges';
import { getTranslation } from './i18n';
import { nanoid } from 'nanoid';

// IndexedDB Schema Definition
interface LoveLevelDB extends DBSchema {
  settings: {
    key: string;
    value: Settings;
  };
  challenges: {
    key: string;
    value: Challenge;
    indexes: {
      'by-category': string;
      'by-completed': string;
    };
  };
  pet: {
    key: string;
    value: PetState;
  };
  history: {
    key: string;
    value: HistoryEntry;
    indexes: {
      'by-type': string;
      'by-timestamp': string;
    };
  };
  metadata: {
    key: string;
    value: { version: number; lastBackupAt?: string };
  };
}

const DB_NAME = 'lovelevel-db';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<LoveLevelDB> | null = null;

// Initialize database
export async function initDB(): Promise<IDBPDatabase<LoveLevelDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<LoveLevelDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create object stores if they don't exist
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings');
      }

      if (!db.objectStoreNames.contains('challenges')) {
        const challengeStore = db.createObjectStore('challenges', { keyPath: 'id' });
        challengeStore.createIndex('by-category', 'category');
        challengeStore.createIndex('by-completed', 'completedAt');
      }

      if (!db.objectStoreNames.contains('pet')) {
        db.createObjectStore('pet');
      }

      if (!db.objectStoreNames.contains('history')) {
        const historyStore = db.createObjectStore('history', { keyPath: 'id' });
        historyStore.createIndex('by-type', 'type');
        historyStore.createIndex('by-timestamp', 'timestamp');
      }

      if (!db.objectStoreNames.contains('metadata')) {
        db.createObjectStore('metadata');
      }
    },
  });

  // Initialize default data if not exists
  await initializeDefaultData(dbInstance);

  return dbInstance;
}

// Initialize default data
async function initializeDefaultData(db: IDBPDatabase<LoveLevelDB>) {
  const tx = db.transaction(['settings', 'pet', 'metadata', 'challenges'], 'readwrite');
  
  const existingSettings = await tx.objectStore('settings').get('main');
  if (!existingSettings) {
    await tx.objectStore('settings').put(DEFAULT_SETTINGS, 'main');
  }

  const existingPet = await tx.objectStore('pet').get('main');
  if (!existingPet) {
    await tx.objectStore('pet').put(DEFAULT_PET_STATE, 'main');
  }

  const existingMetadata = await tx.objectStore('metadata').get('main');
  if (!existingMetadata) {
    await tx.objectStore('metadata').put({ version: DB_VERSION }, 'main');
  }

  // Seed challenges if none exist - use current language for translations
  const challengeStore = tx.objectStore('challenges');
  const challengeCount = await challengeStore.count();
  if (challengeCount === 0) {
    // Get current language from settings (or default to English)
    const settings = existingSettings || DEFAULT_SETTINGS;
    const language = settings.language || 'en';
    const translations = getTranslation(language);
    
    // Generate challenges with translated content
    const seedChallenges = SEED_CHALLENGES.map((challenge) => {
      const translatedContent = translations.challengeContent[challenge.challengeId as keyof typeof translations.challengeContent];
      return {
        ...challenge,
        id: nanoid(),
        title: translatedContent?.title || challenge.title,
        description: translatedContent?.description || challenge.description,
        createdAt: new Date().toISOString(),
      } as Challenge;
    });
    
    for (const challenge of seedChallenges) {
      await challengeStore.add(challenge);
    }
  }

  await tx.done;
}

// Migrate existing challenges to current language
export async function migrateChallengeTranslations(): Promise<number> {
  const db = await initDB();
  const settings = await db.get('settings', 'main');
  const language = settings?.language || 'en';
  const translations = getTranslation(language);
  
  const tx = db.transaction('challenges', 'readwrite');
  const store = tx.objectStore('challenges');
  const challenges = await store.getAll();
  
  let updatedCount = 0;
  
  for (const challenge of challenges) {
    // Check if this is a seed challenge (has a challengeId in SEED_CHALLENGES)
    const seedChallenge = SEED_CHALLENGES.find(sc => 
      sc.challengeId && challenge.title === sc.title
    );
    
    if (seedChallenge) {
      const translatedContent = translations.challengeContent[seedChallenge.challengeId as keyof typeof translations.challengeContent];
      
      if (translatedContent) {
        // Update with translated content
        const updatedChallenge: Challenge = {
          ...challenge,
          title: translatedContent.title,
          description: translatedContent.description,
        };
        
        await store.put(updatedChallenge);
        updatedCount++;
      }
    }
  }
  
  await tx.done;
  return updatedCount;
}

// Settings operations
export async function getSettings(): Promise<Settings> {
  const db = await initDB();
  const settings = await db.get('settings', 'main');
  return settings || DEFAULT_SETTINGS;
}

export async function updateSettings(settings: Partial<Settings>): Promise<void> {
  const db = await initDB();
  const current = await getSettings();
  await db.put('settings', { ...current, ...settings }, 'main');
}

// Challenge operations
export async function getAllChallenges(): Promise<Challenge[]> {
  const db = await initDB();
  return db.getAll('challenges');
}

export async function getChallenge(id: string): Promise<Challenge | undefined> {
  const db = await initDB();
  return db.get('challenges', id);
}

export async function addChallenge(challenge: Challenge): Promise<void> {
  const db = await initDB();
  await db.add('challenges', challenge);
}

export async function updateChallenge(id: string, updates: Partial<Challenge>): Promise<void> {
  const db = await initDB();
  const challenge = await getChallenge(id);
  if (challenge) {
    await db.put('challenges', { ...challenge, ...updates });
  }
}

export async function deleteChallenge(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('challenges', id);
}

export async function getChallengesByCategory(category: string): Promise<Challenge[]> {
  const db = await initDB();
  return db.getAllFromIndex('challenges', 'by-category', category);
}

export async function getCompletedChallenges(): Promise<Challenge[]> {
  await initDB();
  const all = await getAllChallenges();
  return all.filter(c => c.completedAt);
}

// Pet operations
export async function getPet(): Promise<PetState> {
  const db = await initDB();
  const pet = await db.get('pet', 'main');
  return pet || DEFAULT_PET_STATE;
}

export async function updatePet(updates: Partial<PetState>): Promise<void> {
  const db = await initDB();
  const current = await getPet();
  await db.put('pet', { ...current, ...updates }, 'main');
}

// History operations
export async function addHistoryEntry(entry: HistoryEntry): Promise<void> {
  const db = await initDB();
  await db.add('history', entry);
}

export async function getHistory(limit?: number): Promise<HistoryEntry[]> {
  const db = await initDB();
  const all = await db.getAll('history');
  const sorted = all.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return limit ? sorted.slice(0, limit) : sorted;
}

export async function getHistoryByType(type: string): Promise<HistoryEntry[]> {
  const db = await initDB();
  return db.getAllFromIndex('history', 'by-type', type);
}

// Backup and restore
export async function exportData(): Promise<AppDB> {
  const db = await initDB();
  const [settings, challenges, pet, history, metadata] = await Promise.all([
    getSettings(),
    getAllChallenges(),
    getPet(),
    getHistory(),
    db.get('metadata', 'main'),
  ]);

  return {
    version: metadata?.version || DB_VERSION,
    settings,
    challenges,
    pet,
    history,
    lastBackupAt: new Date().toISOString(),
  };
}

export async function importData(data: AppDB): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(['settings', 'challenges', 'pet', 'history', 'metadata'], 'readwrite');

  // Clear existing data
  await tx.objectStore('challenges').clear();
  await tx.objectStore('history').clear();

  // Import settings
  if (data.settings) {
    await tx.objectStore('settings').put(data.settings, 'main');
  }

  // Import challenges
  if (data.challenges) {
    for (const challenge of data.challenges) {
      await tx.objectStore('challenges').put(challenge);
    }
  }

  // Import pet
  if (data.pet) {
    await tx.objectStore('pet').put(data.pet, 'main');
  }

  // Import history
  if (data.history) {
    for (const entry of data.history) {
      await tx.objectStore('history').put(entry);
    }
  }

  // Update metadata
  await tx.objectStore('metadata').put({
    version: data.version || DB_VERSION,
    lastBackupAt: data.lastBackupAt,
  }, 'main');

  await tx.done;
}

// Download backup as JSON
export async function downloadBackup(): Promise<void> {
  const data = await exportData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lovelevel-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Clear all data (for testing/reset)
export async function clearAllData(): Promise<void> {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
