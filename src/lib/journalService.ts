/**
 * Journal Service
 * Handles journal entry storage and retrieval
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { JournalEntry, JournalMood } from '../types/journal';

interface JournalDB extends DBSchema {
  journal_entries: {
    key: string;
    value: JournalEntry;
    indexes: {
      'by-partnership': string;
      'by-author': string;
      'by-date': string;
    };
  };
}

let db: IDBPDatabase<JournalDB> | null = null;

async function getDB(): Promise<IDBPDatabase<JournalDB>> {
  if (db) return db;

  db = await openDB<JournalDB>('lovelevel-journal', 1, {
    upgrade(database) {
      const store = database.createObjectStore('journal_entries', {
        keyPath: 'id',
      });
      store.createIndex('by-partnership', 'partnership_id');
      store.createIndex('by-author', 'author_id');
      store.createIndex('by-date', 'created_at');
    },
  });

  return db;
}

export const journalService = {
  async createEntry(
    partnershipId: string,
    authorId: string,
    title: string,
    content: string,
    options?: {
      mood?: JournalMood;
      tags?: string[];
      photos?: string[];
      isPrivate?: boolean;
    }
  ): Promise<JournalEntry> {
    const database = await getDB();
    const now = new Date().toISOString();
    
    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      partnership_id: partnershipId,
      author_id: authorId,
      title,
      content,
      mood: options?.mood,
      tags: options?.tags,
      photos: options?.photos,
      is_private: options?.isPrivate ?? false,
      created_at: now,
      updated_at: now,
    };

    await database.put('journal_entries', entry);
    return entry;
  },

  async getEntries(partnershipId: string, userId?: string): Promise<JournalEntry[]> {
    const database = await getDB();
    const allEntries = await database.getAll('journal_entries');
    
    // Filter by partnership and privacy
    return allEntries
      .filter(entry => {
        if (entry.partnership_id !== partnershipId) return false;
        if (entry.is_private && entry.author_id !== userId) return false;
        return true;
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getEntry(entryId: string): Promise<JournalEntry | undefined> {
    const database = await getDB();
    return database.get('journal_entries', entryId);
  },

  async updateEntry(
    entryId: string,
    updates: Partial<Pick<JournalEntry, 'title' | 'content' | 'mood' | 'tags' | 'photos' | 'is_private'>>
  ): Promise<JournalEntry | undefined> {
    const database = await getDB();
    const entry = await database.get('journal_entries', entryId);
    
    if (!entry) return undefined;

    const updatedEntry: JournalEntry = {
      ...entry,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await database.put('journal_entries', updatedEntry);
    return updatedEntry;
  },

  async deleteEntry(entryId: string): Promise<void> {
    const database = await getDB();
    await database.delete('journal_entries', entryId);
  },

  async getEntriesByDate(partnershipId: string, date: Date, userId?: string): Promise<JournalEntry[]> {
    const entries = await this.getEntries(partnershipId, userId);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return entryDate >= startOfDay && entryDate <= endOfDay;
    });
  },

  async getEntriesByTag(partnershipId: string, tag: string, userId?: string): Promise<JournalEntry[]> {
    const entries = await this.getEntries(partnershipId, userId);
    return entries.filter(entry => entry.tags?.includes(tag));
  },

  async searchEntries(partnershipId: string, query: string, userId?: string): Promise<JournalEntry[]> {
    const entries = await this.getEntries(partnershipId, userId);
    const lowerQuery = query.toLowerCase();
    
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  async getMoodStats(partnershipId: string, userId?: string): Promise<Record<JournalMood, number>> {
    const entries = await this.getEntries(partnershipId, userId);
    const stats: Record<JournalMood, number> = {
      happy: 0,
      love: 0,
      excited: 0,
      grateful: 0,
      reflective: 0,
      sad: 0,
      stressed: 0,
    };

    entries.forEach(entry => {
      if (entry.mood) {
        stats[entry.mood]++;
      }
    });

    return stats;
  },
};