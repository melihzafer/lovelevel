import type { Achievement, AchievementCategory } from '../types/achievements';

const ACHIEVEMENTS: Achievement[] = [
  // Pet Achievements
  {
    id: 'first-feed',
    name: 'First Steps',
    description: 'Feed your pet for the first time',
    category: 'pet',
    icon: '🍼',
    requirement: { type: 'count', target: 1, action: 'feed' },
    reward: { xp: 10 },
  },
  {
    id: 'pet-lover',
    name: 'Pet Lover',
    description: 'Feed your pet 100 times',
    category: 'pet',
    icon: '❤️',
    requirement: { type: 'count', target: 100, action: 'feed' },
    reward: { xp: 100, coins: 50 },
  },
  {
    id: 'clean-freak',
    name: 'Clean Freak',
    description: 'Clean your pet 50 times',
    category: 'pet',
    icon: '🧹',
    requirement: { type: 'count', target: 50, action: 'clean' },
    reward: { xp: 50 },
  },
  
  // Minigame Achievements
  {
    id: 'first-game',
    name: 'Game On!',
    description: 'Play your first minigame',
    category: 'minigames',
    icon: '🎮',
    requirement: { type: 'count', target: 1, action: 'minigame_play' },
    reward: { xp: 10 },
  },
  {
    id: 'heart-collector',
    name: 'Heart Collector',
    description: 'Score 100 points in Heart Catcher',
    category: 'minigames',
    icon: '💝',
    requirement: { type: 'score', target: 100, action: 'petminigame' },
    reward: { xp: 50 },
  },
  {
    id: 'catcher-pro',
    name: 'Catcher Pro',
    description: 'Score 200 points in Love Catcher',
    category: 'minigames',
    icon: '🏆',
    requirement: { type: 'score', target: 200, action: 'lovecatcher' },
    reward: { xp: 75, coins: 25 },
  },
  {
    id: 'game-master',
    name: 'Game Master',
    description: 'Play 50 minigames',
    category: 'minigames',
    icon: '🎯',
    requirement: { type: 'count', target: 50, action: 'minigame_play' },
    reward: { xp: 200, coins: 100 },
  },
  
  // Challenge Achievements
  {
    id: 'first-challenge',
    name: 'Challenge Accepted',
    description: 'Complete your first challenge',
    category: 'challenges',
    icon: '✅',
    requirement: { type: 'count', target: 1, action: 'challenge_complete' },
    reward: { xp: 15 },
  },
  {
    id: 'challenge-champion',
    name: 'Challenge Champion',
    description: 'Complete 25 challenges',
    category: 'challenges',
    icon: '🏅',
    requirement: { type: 'count', target: 25, action: 'challenge_complete' },
    reward: { xp: 150, coins: 75 },
  },
  
  // Relationship Achievements
  {
    id: 'month-1',
    name: 'First Month',
    description: 'Celebrate your 1 month anniversary',
    category: 'relationship',
    icon: '💕',
    requirement: { type: 'special', target: 1, action: 'monthiversary' },
    reward: { xp: 100 },
  },
  {
    id: 'level-5',
    name: 'Rising Star',
    description: 'Reach level 5 with your pet',
    category: 'pet',
    icon: '⭐',
    requirement: { type: 'level', target: 5 },
    reward: { xp: 50, coins: 25 },
  },
  {
    id: 'level-10',
    name: 'Pet Master',
    description: 'Reach level 10 with your pet',
    category: 'pet',
    icon: '🌟',
    requirement: { type: 'level', target: 10 },
    reward: { xp: 200, coins: 100 },
  },
];

const STORAGE_KEY = 'lovelevel-achievements';

class AchievementService {
  private achievements: Achievement[];
  
  constructor() {
    this.achievements = ACHIEVEMENTS.map(a => ({ ...a, progress: 0 }));
    this.load();
  }
  
  private load(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const saved = JSON.parse(stored) as Record<string, { unlockedAt?: string; progress?: number }>;
        this.achievements = this.achievements.map(a => ({
          ...a,
          unlockedAt: saved[a.id]?.unlockedAt,
          progress: saved[a.id]?.progress || 0,
        }));
      }
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  }
  
  private save(): void {
    try {
      const data: Record<string, { unlockedAt?: string; progress?: number }> = {};
      this.achievements.forEach(a => {
        data[a.id] = {
          unlockedAt: a.unlockedAt,
          progress: a.progress,
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save achievements:', error);
    }
  }
  
  getAll(): Achievement[] {
    return this.achievements;
  }
  
  getByCategory(category: AchievementCategory): Achievement[] {
    return this.achievements.filter(a => a.category === category);
  }
  
  checkAchievement(
    action: string,
    count: number,
    currentLevel?: number
  ): Achievement | null {
    for (const achievement of this.achievements) {
      if (achievement.unlockedAt) continue;
      
      const req = achievement.requirement;
      
      if (req.type === 'count' && req.action === action) {
        achievement.progress = count;
        if (count >= req.target) {
          achievement.unlockedAt = new Date().toISOString();
          this.save();
          return achievement;
        }
      }
      
      if (req.type === 'level' && currentLevel !== undefined) {
        achievement.progress = currentLevel;
        if (currentLevel >= req.target) {
          achievement.unlockedAt = new Date().toISOString();
          this.save();
          return achievement;
        }
      }
    }
    
    this.save();
    return null;
  }
  
  checkScoreAchievement(game: string, score: number): Achievement | null {
    for (const achievement of this.achievements) {
      if (achievement.unlockedAt) continue;
      
      const req = achievement.requirement;
      if (req.type === 'score' && req.action === game) {
        achievement.progress = Math.max(achievement.progress || 0, score);
        if (score >= req.target && !achievement.unlockedAt) {
          achievement.unlockedAt = new Date().toISOString();
          this.save();
          return achievement;
        }
      }
    }
    
    this.save();
    return null;
  }
  
  getUnlocked(): Achievement[] {
    return this.achievements.filter(a => a.unlockedAt);
  }
  
  getProgress(): { unlocked: number; total: number } {
    const unlocked = this.achievements.filter(a => a.unlockedAt).length;
    return { unlocked, total: this.achievements.length };
  }
  
  incrementAction(action: string): number {
    // Track action counts in localStorage
    const countsKey = 'lovelevel-action-counts';
    try {
      const stored = localStorage.getItem(countsKey);
      const counts = stored ? JSON.parse(stored) : {};
      counts[action] = (counts[action] || 0) + 1;
      localStorage.setItem(countsKey, JSON.stringify(counts));
      return counts[action];
    } catch {
      return 0;
    }
  }
  
  getActionCount(action: string): number {
    const countsKey = 'lovelevel-action-counts';
    try {
      const stored = localStorage.getItem(countsKey);
      const counts = stored ? JSON.parse(stored) : {};
      return counts[action] || 0;
    } catch {
      return 0;
    }
  }
}

export const achievementService = new AchievementService();
