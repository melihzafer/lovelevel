/**
 * Memory Service
 * Handles memory storage and retrieval for timeline
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { Memory, MemoryType } from '../types/memory';

interface MemoryDB extends DBSchema {
  memories: {
    key: string;
    value: Memory;
    indexes: {
      'by-partnership': string;
      'by-date': string;
      'by-type': string;
    };
  };
}

let db: IDBPDatabase<MemoryDB> | null = null;

async function getDB(): Promise<IDBPDatabase<MemoryDB>> {
  if (db) return db;

  db = await openDB<MemoryDB>('lovelevel-memories', 1, {
    upgrade(database) {
      const store = database.createObjectStore('memories', {
        keyPath: 'id',
      });
      store.createIndex('by-partnership', 'partnership_id');
      store.createIndex('by-date', 'date');
      store.createIndex('by-type', 'memory_type');
    },
  });

  return db;
}

export const memoryService = {
  async createMemory(
    partnershipId: string,
    createdBy: string,
    memoryType: MemoryType,
    title: string,
    date: string,
    options?: {
      description?: string;
      photos?: string[];
      location?: { name: string; lat?: number; lng?: number };
      tags?: string[];
      isFavorite?: boolean;
    }
  ): Promise<Memory> {
    const database = await getDB();
    const now = new Date().toISOString();
    
    const memory: Memory = {
      id: crypto.randomUUID(),
      partnership_id: partnershipId,
      created_by: createdBy,
      memory_type: memoryType,
      title,
      description: options?.description,
      date,
      photos: options?.photos,
      location: options?.location,
      tags: options?.tags,
      is_favorite: options?.isFavorite ?? false,
      created_at: now,
      updated_at: now,
    };

    await database.put('memories', memory);
    return memory;
  },

  async getMemories(partnershipId: string): Promise<Memory[]> {
    const database = await getDB();
    const allMemories = await database.getAll('memories');
    
    return allMemories
      .filter(memory => memory.partnership_id === partnershipId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getMemory(memoryId: string): Promise<Memory | undefined> {
    const database = await getDB();
    return database.get('memories', memoryId);
  },

  async updateMemory(
    memoryId: string,
    updates: Partial<Pick<Memory, 'title' | 'description' | 'photos' | 'location' | 'tags' | 'is_favorite'>>
  ): Promise<Memory | undefined> {
    const database = await getDB();
    const memory = await database.get('memories', memoryId);
    
    if (!memory) return undefined;

    const updatedMemory: Memory = {
      ...memory,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    await database.put('memories', updatedMemory);
    return updatedMemory;
  },

  async deleteMemory(memoryId: string): Promise<void> {
    const database = await getDB();
    await database.delete('memories', memoryId);
  },

  async getMemoriesByMonth(partnershipId: string, year: number, month: number): Promise<Memory[]> {
    const memories = await this.getMemories(partnershipId);
    return memories.filter(memory => {
      const memoryDate = new Date(memory.date);
      return memoryDate.getFullYear() === year && memoryDate.getMonth() === month;
    });
  },

  async getMemoriesByType(partnershipId: string, type: MemoryType): Promise<Memory[]> {
    const memories = await this.getMemories(partnershipId);
    return memories.filter(memory => memory.memory_type === type);
  },

  async getFavoriteMemories(partnershipId: string): Promise<Memory[]> {
    const memories = await this.getMemories(partnershipId);
    return memories.filter(memory => memory.is_favorite);
  },

  async toggleFavorite(memoryId: string): Promise<boolean> {
    const database = await getDB();
    const memory = await database.get('memories', memoryId);
    
    if (!memory) return false;

    const updatedMemory: Memory = {
      ...memory,
      is_favorite: !memory.is_favorite,
      updated_at: new Date().toISOString(),
    };

    await database.put('memories', updatedMemory);
    return updatedMemory.is_favorite;
  },

  async getMemoryStats(partnershipId: string): Promise<{
    total: number;
    byType: Record<MemoryType, number>;
    favorites: number;
  }> {
    const memories = await this.getMemories(partnershipId);
    
    const byType: Record<MemoryType, number> = {
      milestone: 0,
      photo: 0,
      challenge: 0,
      date: 0,
      note: 0,
      trip: 0,
    };

    memories.forEach(memory => {
      byType[memory.memory_type]++;
    });

    return {
      total: memories.length,
      byType,
      favorites: memories.filter(m => m.is_favorite).length,
    };
  },

  async searchMemories(partnershipId: string, query: string): Promise<Memory[]> {
    const memories = await this.getMemories(partnershipId);
    const lowerQuery = query.toLowerCase();
    
    return memories.filter(memory => 
      memory.title.toLowerCase().includes(lowerQuery) ||
      memory.description?.toLowerCase().includes(lowerQuery) ||
      memory.location?.name.toLowerCase().includes(lowerQuery) ||
      memory.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  // Get memories grouped by year and month
  async getMemoriesTimeline(partnershipId: string): Promise<Map<string, Memory[]>> {
    const memories = await this.getMemories(partnershipId);
    const timeline = new Map<string, Memory[]>();
    
    memories.forEach(memory => {
      const date = new Date(memory.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!timeline.has(key)) {
        timeline.set(key, []);
      }
      timeline.get(key)!.push(memory);
    });
    
    return timeline;
  },
};