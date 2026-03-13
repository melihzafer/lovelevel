export type AchievementCategory = 'pet' | 'challenges' | 'minigames' | 'relationship' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string; // emoji
  requirement: {
    type: 'count' | 'score' | 'streak' | 'level' | 'special';
    target: number;
    action?: string;
  };
  reward: {
    xp: number;
    coins?: number;
  };
  unlockedAt?: string;
  progress?: number;
}

export interface AchievementState {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
  recentlyUnlocked: Achievement[];
}
