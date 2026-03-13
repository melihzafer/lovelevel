/**
 * Pet Evolution Types
 * Defines evolution stages and configurations
 */

export type EvolutionStage = 'egg' | 'baby' | 'child' | 'teen' | 'adult' | 'elder' | 'legendary';

export interface EvolutionInfo {
  stage: EvolutionStage;
  name: string;
  description: string;
  minLevel: number;
  emoji: string;
  color: string;
  sizeMultiplier: number;
  abilities: string[];
}

export const EVOLUTION_STAGES: Record<EvolutionStage, EvolutionInfo> = {
  egg: {
    stage: 'egg',
    name: 'Egg',
    description: 'A mysterious egg waiting to hatch...',
    minLevel: 0,
    emoji: '🥚',
    color: 'from-gray-300 to-gray-400',
    sizeMultiplier: 0.5,
    abilities: [],
  },
  baby: {
    stage: 'baby',
    name: 'Baby',
    description: 'Just hatched! Needs lots of love and care.',
    minLevel: 1,
    emoji: '🐣',
    color: 'from-yellow-200 to-yellow-300',
    sizeMultiplier: 0.6,
    abilities: ['Basic interactions'],
  },
  child: {
    stage: 'child',
    name: 'Child',
    description: 'Growing stronger every day! Can play mini games.',
    minLevel: 5,
    emoji: '🐥',
    color: 'from-orange-300 to-orange-400',
    sizeMultiplier: 0.75,
    abilities: ['Basic interactions', 'Mini games', 'Item equipping'],
  },
  teen: {
    stage: 'teen',
    name: 'Teen',
    description: 'Adolescent phase - getting more personality!',
    minLevel: 15,
    emoji: '🐤',
    color: 'from-amber-400 to-amber-500',
    sizeMultiplier: 0.9,
    abilities: ['All previous', 'Challenges', 'Custom emotes'],
  },
  adult: {
    stage: 'adult',
    name: 'Adult',
    description: 'Fully grown and wise. A true companion!',
    minLevel: 30,
    emoji: '🐕',
    color: 'from-amber-500 to-amber-600',
    sizeMultiplier: 1.0,
    abilities: ['All previous', 'Special tricks', 'Partner bonuses'],
  },
  elder: {
    stage: 'elder',
    name: 'Elder',
    description: 'A wise and experienced companion. Truly special!',
    minLevel: 50,
    emoji: '🦊',
    color: 'from-purple-400 to-purple-600',
    sizeMultiplier: 1.1,
    abilities: ['All previous', 'Wisdom insights', 'Memory boosts'],
  },
  legendary: {
    stage: 'legendary',
    name: 'Legendary',
    description: 'Reached legendary status! A once-in-a-lifetime companion.',
    minLevel: 100,
    emoji: '🐉',
    color: 'from-yellow-400 via-pink-500 to-purple-600',
    sizeMultiplier: 1.25,
    abilities: ['All abilities', 'Legendary aura', 'Rainbow trail', 'Special celebrations'],
  },
};

export const getEvolutionStage = (level: number): EvolutionStage => {
  if (level >= 100) return 'legendary';
  if (level >= 50) return 'elder';
  if (level >= 30) return 'adult';
  if (level >= 15) return 'teen';
  if (level >= 5) return 'child';
  if (level >= 1) return 'baby';
  return 'egg';
};

export const getNextEvolutionLevel = (currentLevel: number): number | null => {
  const stages = Object.values(EVOLUTION_STAGES);
  for (const stage of stages) {
    if (stage.minLevel > currentLevel) {
      return stage.minLevel;
    }
  }
  return null; // Already at max evolution
};

export const canEvolve = (currentLevel: number, _currentStage: EvolutionStage): boolean => {
  const nextStage = getNextEvolutionLevel(currentLevel);
  return nextStage !== null;
};