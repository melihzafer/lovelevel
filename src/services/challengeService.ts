import * as db from '../lib/db';
import type { Challenge } from '../types/database';
import { nanoid } from 'nanoid';

export interface IChallengeService {
  getChallenges(): Promise<Challenge[]>;
  getChallenge(id: string): Promise<Challenge | undefined>;
  addChallenge(challenge: Omit<Challenge, 'id' | 'createdAt'>): Promise<Challenge>;
  updateChallenge(id: string, updates: Partial<Challenge>): Promise<void>;
  completeChallenge(id: string, notes?: string): Promise<void>;
  uncompleteChallenge(id: string): Promise<void>;
  deleteChallenge(id: string): Promise<void>;
  getChallengesByCategory(category: Challenge['category']): Promise<Challenge[]>;
  getCompletedChallenges(): Promise<Challenge[]>;
  getPendingChallenges(): Promise<Challenge[]>;
}

export class ChallengeService implements IChallengeService {
  async getChallenges(): Promise<Challenge[]> {
    return db.getAllChallenges();
  }

  async getChallenge(id: string): Promise<Challenge | undefined> {
    return db.getChallenge(id);
  }

  async addChallenge(challengeData: Omit<Challenge, 'id' | 'createdAt'>): Promise<Challenge> {
    const challenge: Challenge = {
      ...challengeData,
      id: nanoid(),
      createdAt: new Date().toISOString(),
    };
    await db.addChallenge(challenge);
    return challenge;
  }

  async updateChallenge(id: string, updates: Partial<Challenge>): Promise<void> {
    await db.updateChallenge(id, updates);
  }

  async completeChallenge(id: string, notes?: string): Promise<void> {
    const updates: Partial<Challenge> = {
      completedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updates.notes = notes;
    }
    await this.updateChallenge(id, updates);
  }

  async uncompleteChallenge(id: string): Promise<void> {
    await this.updateChallenge(id, {
      completedAt: undefined,
      notes: undefined,
    });
  }

  async deleteChallenge(id: string): Promise<void> {
    await db.deleteChallenge(id);
  }

  async getChallengesByCategory(category: Challenge['category']): Promise<Challenge[]> {
    return db.getChallengesByCategory(category);
  }

  async getCompletedChallenges(): Promise<Challenge[]> {
    return db.getCompletedChallenges();
  }

  async getPendingChallenges(): Promise<Challenge[]> {
    const all = await this.getChallenges();
    return all.filter(c => !c.completedAt);
  }
}

export const challengeService = new ChallengeService();
