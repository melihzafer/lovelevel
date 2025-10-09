/**
 * Pet XP and Leveling System
 * Level curve: requiredXP = round(100 * level * multiplier^(level-1))
 * Default multiplier: 1.15
 */

export interface LevelInfo {
  currentLevel: number;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  xpProgress: number; // 0-1
  xpProgressPercent: number; // 0-100
}

export interface LevelUpResult {
  didLevelUp: boolean;
  newLevel: number;
  levelsGained: number;
  remainingXP: number;
}

/**
 * Calculate XP required for a specific level
 */
export function getXPForLevel(level: number, multiplier: number = 1.15): number {
  if (level <= 1) return 0;
  return Math.round(100 * (level - 1) * Math.pow(multiplier, level - 2));
}

/**
 * Calculate total XP required to reach a level
 */
export function getTotalXPForLevel(targetLevel: number, multiplier: number = 1.15): number {
  let total = 0;
  for (let level = 2; level <= targetLevel; level++) {
    total += getXPForLevel(level, multiplier);
  }
  return total;
}

/**
 * Calculate what level a given total XP corresponds to
 */
export function getLevelFromTotalXP(totalXP: number, multiplier: number = 1.15): number {
  if (totalXP <= 0) return 1;
  
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXP) {
    level++;
    xpNeeded += getXPForLevel(level, multiplier);
  }
  
  return level - 1;
}

/**
 * Get detailed level information
 */
export function getLevelInfo(currentLevel: number, currentXP: number, multiplier: number = 1.15): LevelInfo {
  const xpForCurrentLevel = getTotalXPForLevel(currentLevel, multiplier);
  const xpForNextLevel = getTotalXPForLevel(currentLevel + 1, multiplier);
  const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
  const xpProgress = xpNeededForNext > 0 ? (currentXP - xpForCurrentLevel) / xpNeededForNext : 0;
  
  return {
    currentLevel,
    currentXP,
    xpForCurrentLevel,
    xpForNextLevel,
    xpProgress: Math.max(0, Math.min(1, xpProgress)),
    xpProgressPercent: Math.round(Math.max(0, Math.min(100, xpProgress * 100))),
  };
}

/**
 * Add XP and check for level-ups
 */
export function addXP(
  currentLevel: number,
  currentXP: number,
  xpToAdd: number,
  multiplier: number = 1.15
): LevelUpResult {
  const newXP = currentXP + xpToAdd;
  const newLevel = getLevelFromTotalXP(newXP, multiplier);
  const didLevelUp = newLevel > currentLevel;
  const levelsGained = newLevel - currentLevel;
  
  return {
    didLevelUp,
    newLevel,
    levelsGained,
    remainingXP: newXP,
  };
}

/**
 * Get XP rewards based on action type
 */
export interface XPRewards {
  challenge: number;
  petTask: number;
  monthiversary: number;
  yearAnniversary: number;
}

export const DEFAULT_XP_REWARDS: XPRewards = {
  challenge: 20,
  petTask: 10,
  monthiversary: 100,
  yearAnniversary: 500,
};

/**
 * Calculate XP for completing a challenge
 */
export function getChallengeXP(rewards: XPRewards = DEFAULT_XP_REWARDS): number {
  return rewards.challenge;
}

/**
 * Calculate XP for completing a pet task
 */
export function getPetTaskXP(rewards: XPRewards = DEFAULT_XP_REWARDS): number {
  return rewards.petTask;
}

/**
 * Calculate XP for a monthiversary based on which one
 */
export function getMonthiversaryXP(
  monthNumber: number,
  rewards: XPRewards = DEFAULT_XP_REWARDS
): number {
  // Special milestones get bonus XP
  if (monthNumber % 12 === 0) {
    // Year anniversaries
    return rewards.yearAnniversary;
  }
  if ([3, 6].includes(monthNumber)) {
    // 3 and 6 month milestones get 1.5x
    return Math.round(rewards.monthiversary * 1.5);
  }
  return rewards.monthiversary;
}

/**
 * Get items unlocked at a specific level
 */
export function getItemsUnlockedAtLevel(_level: number): string[] {
  // This would be populated based on your item unlock schedule
  // For now, return empty array - will be implemented with pet items
  return [];
}

/**
 * Check if a level is a milestone that unlocks special content
 */
export function isMilestoneLevel(level: number): boolean {
  // Milestones at levels: 5, 10, 15, 20, 25, etc.
  return level % 5 === 0;
}

/**
 * Generate level progression table for debugging/display
 */
export function generateLevelTable(maxLevel: number = 20, multiplier: number = 1.15): Array<{
  level: number;
  xpNeeded: number;
  totalXP: number;
}> {
  const table = [];
  for (let level = 1; level <= maxLevel; level++) {
    table.push({
      level,
      xpNeeded: getXPForLevel(level, multiplier),
      totalXP: getTotalXPForLevel(level, multiplier),
    });
  }
  return table;
}
