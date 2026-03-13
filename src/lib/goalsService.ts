/**
 * Goals Service
 * Handles couple goals and achievements storage
 */

import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import type { CoupleGoal, UserAchievement } from '../types/goals';
import { ACHIEVEMENTS } from '../types/goals';

interface GoalsDB extends DBSchema {
  couple_goals: {
    key: string;
    value: CoupleGoal;
    indexes: {
      'by-partnership': string;
      'by-status': string;
    };
  };
  user_achievements: {
    key: string;
    value: UserAchievement;
    indexes: {
      'by-user': string;
      'by-partnership': string;
    };
  };
}

let db: IDBPDatabase<GoalsDB> | null = null;

async function getDB(): Promise<IDBPDatabase<GoalsDB>> {
  if (db) return db;

  db = await openDB<GoalsDB>('lovelevel-goals', 1, {
    upgrade(database) {
      const goalsStore = database.createObjectStore('couple_goals', {
        keyPath: 'id',
      });
      goalsStore.createIndex('by-partnership', 'partnership_id');
      goalsStore.createIndex('by-status', 'status');

      const achievementsStore = database.createObjectStore('user_achievements', {
        keyPath: ['achievement_id', 'user_id'],
      });
      achievementsStore.createIndex('by-user', 'user_id');
      achievementsStore.createIndex('by-partnership', 'partnership_id');
    },
  });

  return db;
}

export const goalsService = {
  // Goals
  async createGoal(
    partnershipId: string,
    createdBy: string,
    title: string,
    category: CoupleGoal['category'],
    options?: {
      description?: string;
      targetDate?: string;
      xpReward?: number;
    }
  ): Promise<CoupleGoal> {
    const database = await getDB();
    const now = new Date().toISOString();
    
    const goal: CoupleGoal = {
      id: crypto.randomUUID(),
      partnership_id: partnershipId,
      created_by: createdBy,
      title,
      description: options?.description,
      category,
      target_date: options?.targetDate,
      status: 'not_started',
      progress: 0,
      xp_reward: options?.xpReward ?? 20,
      created_at: now,
      updated_at: now,
    };

    await database.put('couple_goals', goal);
    return goal;
  },

  async getGoals(partnershipId: string): Promise<CoupleGoal[]> {
    const database = await getDB();
    const allGoals = await database.getAll('couple_goals');
    
    return allGoals
      .filter(goal => goal.partnership_id === partnershipId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async updateGoalStatus(
    goalId: string,
    status: CoupleGoal['status'],
    progress?: number
  ): Promise<CoupleGoal | undefined> {
    const database = await getDB();
    const goal = await database.get('couple_goals', goalId);
    
    if (!goal) return undefined;

    const updatedGoal: CoupleGoal = {
      ...goal,
      status,
      progress: progress ?? goal.progress,
      updated_at: new Date().toISOString(),
      completed_at: status === 'completed' ? new Date().toISOString() : undefined,
    };

    await database.put('couple_goals', updatedGoal);
    return updatedGoal;
  },

  async deleteGoal(goalId: string): Promise<void> {
    const database = await getDB();
    await database.delete('couple_goals', goalId);
  },

  async getGoalsByStatus(partnershipId: string, status: CoupleGoal['status']): Promise<CoupleGoal[]> {
    const goals = await this.getGoals(partnershipId);
    return goals.filter(goal => goal.status === status);
  },

  // Achievements
  async initializeUserAchievements(userId: string, partnershipId: string): Promise<void> {
    const database = await getDB();
    
    for (const achievement of ACHIEVEMENTS) {
      const existing = await database.get('user_achievements', [achievement.id, userId] as unknown as string);
      if (!existing) {
        const userAchievement: UserAchievement = {
          achievement_id: achievement.id,
          user_id: userId,
          partnership_id: partnershipId,
          progress: 0,
          completed: false,
        };
        await database.put('user_achievements', userAchievement);
      }
    }
  },

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const database = await getDB();
    const all = await database.getAll('user_achievements');
    return all.filter(a => a.user_id === userId);
  },

  async updateAchievementProgress(
    achievementId: string,
    userId: string,
    progress: number
  ): Promise<UserAchievement | undefined> {
    const database = await getDB();
    const achievement = await database.get('user_achievements', [achievementId, userId] as unknown as string);
    
    if (!achievement) return undefined;

    const achievementDef = ACHIEVEMENTS.find(a => a.id === achievementId);
    const completed = achievementDef ? progress >= achievementDef.requirement.target : false;

    const updated: UserAchievement = {
      ...achievement,
      progress,
      completed,
      completed_at: completed && !achievement.completed ? new Date().toISOString() : achievement.completed_at,
    };

    await database.put('user_achievements', updated);
    return updated;
  },

  async incrementAchievementProgress(
    achievementId: string,
    userId: string
  ): Promise<UserAchievement | undefined> {
    const database = await getDB();
    const achievement = await database.get('user_achievements', [achievementId, userId] as unknown as string);
    
    if (!achievement) return undefined;

    return this.updateAchievementProgress(achievementId, userId, achievement.progress + 1);
  },

  async getCompletedAchievements(userId: string): Promise<UserAchievement[]> {
    const achievements = await this.getUserAchievements(userId);
    return achievements.filter(a => a.completed);
  },

  async checkAndAwardAchievement(
    action: string,
    userId: string,
    _partnershipId: string
  ): Promise<UserAchievement | null> {
    const relevantAchievements = ACHIEVEMENTS.filter(
      a => a.requirement.action === action
    );

    for (const achievement of relevantAchievements) {
      const userAchievement = await this.incrementAchievementProgress(achievement.id, userId);
      
      if (userAchievement && userAchievement.completed && !userAchievement.completed_at) {
        return userAchievement;
      }
    }

    return null;
  },

  // Get achievement definition with user progress
  async getAchievementsWithProgress(userId: string): Promise<Array<UserAchievement & { definition: typeof ACHIEVEMENTS[0] }>> {
    const userAchievements = await this.getUserAchievements(userId);
    
    return ACHIEVEMENTS.map(def => {
      const userAch = userAchievements.find(a => a.achievement_id === def.id);
      return {
        ...userAch || {
          achievement_id: def.id,
          user_id: userId,
          partnership_id: '',
          progress: 0,
          completed: false,
        },
        definition: def,
      };
    });
  },
};