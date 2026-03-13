/**
 * Goals Types
 * Types for the couple goals system
 */

export type GoalCategory = 'relationship' | 'experience' | 'communication' | 'growth' | 'fun';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed';

export interface CoupleGoal {
  id: string;
  partnership_id: string;
  created_by: string;
  title: string;
  description?: string;
  category: GoalCategory;
  target_date?: string;
  status: GoalStatus;
  progress?: number; // 0-100
  xp_reward: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export type AchievementCategory = 'challenges' | 'streaks' | 'pet' | 'social' | 'special';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  requirement: {
    type: 'count' | 'streak' | 'level' | 'special';
    target: number;
    action?: string;
  };
  xp_reward: number;
  is_secret?: boolean;
}

export interface UserAchievement {
  achievement_id: string;
  user_id: string;
  partnership_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
}

// Predefined achievements
export const ACHIEVEMENTS: Achievement[] = [
  // Challenge achievements
  {
    id: 'first_challenge',
    name: 'First Step Together',
    description: 'Complete your first challenge',
    icon: '🎯',
    category: 'challenges',
    requirement: { type: 'count', target: 1, action: 'challenge_complete' },
    xp_reward: 10,
  },
  {
    id: 'challenge_10',
    name: 'Challenge Accepted',
    description: 'Complete 10 challenges',
    icon: '🏆',
    category: 'challenges',
    requirement: { type: 'count', target: 10, action: 'challenge_complete' },
    xp_reward: 50,
  },
  {
    id: 'challenge_50',
    name: 'Challenge Champion',
    description: 'Complete 50 challenges',
    icon: '🏅',
    category: 'challenges',
    requirement: { type: 'count', target: 50, action: 'challenge_complete' },
    xp_reward: 200,
  },
  {
    id: 'challenge_100',
    name: 'Challenge Master',
    description: 'Complete 100 challenges',
    icon: '👑',
    category: 'challenges',
    requirement: { type: 'count', target: 100, action: 'challenge_complete' },
    xp_reward: 500,
  },
  
  // Streak achievements
  {
    id: 'streak_7',
    name: 'Week Strong',
    description: 'Log in for 7 consecutive days',
    icon: '🔥',
    category: 'streaks',
    requirement: { type: 'streak', target: 7, action: 'login' },
    xp_reward: 25,
  },
  {
    id: 'streak_30',
    name: 'Monthly Devotion',
    description: 'Log in for 30 consecutive days',
    icon: '💎',
    category: 'streaks',
    requirement: { type: 'streak', target: 30, action: 'login' },
    xp_reward: 100,
  },
  {
    id: 'streak_100',
    name: 'Unstoppable Love',
    description: 'Log in for 100 consecutive days',
    icon: '💫',
    category: 'streaks',
    requirement: { type: 'streak', target: 100, action: 'login' },
    xp_reward: 500,
  },
  
  // Pet achievements
  {
    id: 'pet_level_5',
    name: 'Growing Together',
    description: 'Reach pet level 5',
    icon: '🐾',
    category: 'pet',
    requirement: { type: 'level', target: 5 },
    xp_reward: 30,
  },
  {
    id: 'pet_level_20',
    name: 'Best Friends',
    description: 'Reach pet level 20',
    icon: '💕',
    category: 'pet',
    requirement: { type: 'level', target: 20 },
    xp_reward: 100,
  },
  {
    id: 'pet_level_50',
    name: 'Soulmates',
    description: 'Reach pet level 50',
    icon: '❤️‍🔥',
    category: 'pet',
    requirement: { type: 'level', target: 50 },
    xp_reward: 300,
  },
  {
    id: 'pet_evolution_adult',
    name: 'All Grown Up',
    description: 'Evolve your pet to adult stage',
    icon: '🐕',
    category: 'pet',
    requirement: { type: 'level', target: 30 },
    xp_reward: 150,
  },
  {
    id: 'pet_evolution_legendary',
    name: 'Legendary Love',
    description: 'Evolve your pet to legendary stage',
    icon: '🐉',
    category: 'pet',
    requirement: { type: 'level', target: 100 },
    xp_reward: 1000,
    is_secret: true,
  },
  
  // Social achievements
  {
    id: 'minigame_10',
    name: 'Game Night',
    description: 'Play 10 mini games',
    icon: '🎮',
    category: 'social',
    requirement: { type: 'count', target: 10, action: 'minigame_play' },
    xp_reward: 20,
  },
  {
    id: 'minigame_50',
    name: 'Gaming Partners',
    description: 'Play 50 mini games',
    icon: '🎲',
    category: 'social',
    requirement: { type: 'count', target: 50, action: 'minigame_play' },
    xp_reward: 100,
  },
  {
    id: 'journal_5',
    name: 'Storyteller',
    description: 'Write 5 journal entries',
    icon: '📝',
    category: 'social',
    requirement: { type: 'count', target: 5, action: 'journal_entry' },
    xp_reward: 25,
  },
  
  // Special achievements
  {
    id: 'first_monthiversary',
    name: 'First Milestone',
    description: 'Celebrate your first monthiversary',
    icon: '🎊',
    category: 'special',
    requirement: { type: 'count', target: 1, action: 'monthiversary' },
    xp_reward: 50,
  },
  {
    id: 'monthiversary_12',
    name: 'One Year Strong',
    description: 'Celebrate 12 monthiversaries',
    icon: '🎂',
    category: 'special',
    requirement: { type: 'count', target: 12, action: 'monthiversary' },
    xp_reward: 200,
  },
  {
    id: 'memory_10',
    name: 'Memory Keeper',
    description: 'Create 10 memories',
    icon: '📸',
    category: 'special',
    requirement: { type: 'count', target: 10, action: 'memory_create' },
    xp_reward: 50,
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all daily challenges for a week',
    icon: '⭐',
    category: 'special',
    requirement: { type: 'streak', target: 7, action: 'daily_complete' },
    xp_reward: 100,
  },
];

export const GOAL_SUGGESTIONS: Array<{ title: string; category: GoalCategory; xp_reward: number }> = [
  { title: 'Go on a weekly date night', category: 'relationship', xp_reward: 30 },
  { title: 'Try a new restaurant together', category: 'experience', xp_reward: 20 },
  { title: 'Have a deep conversation', category: 'communication', xp_reward: 15 },
  { title: 'Learn something new together', category: 'growth', xp_reward: 25 },
  { title: 'Plan a weekend getaway', category: 'experience', xp_reward: 50 },
  { title: 'Start a new hobby together', category: 'growth', xp_reward: 40 },
  { title: 'Have a movie marathon', category: 'fun', xp_reward: 10 },
  { title: 'Cook dinner together', category: 'experience', xp_reward: 15 },
  { title: 'Exercise together 3 times', category: 'growth', xp_reward: 30 },
  { title: 'Write love letters to each other', category: 'communication', xp_reward: 25 },
];