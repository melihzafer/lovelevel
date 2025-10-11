import { describe, it, expect } from 'vitest';
import { 
  getXPForLevel, 
  getTotalXPForLevel, 
  getLevelFromTotalXP 
} from '../lib/xpSystem';

describe('xpSystem', () => {
  describe('getXPForLevel', () => {
    it('should return 0 for level 1', () => {
      expect(getXPForLevel(1)).toBe(0);
    });

    it('should calculate XP for level 2', () => {
      const xp = getXPForLevel(2);
      expect(xp).toBeGreaterThan(0);
      expect(xp).toBeLessThan(200);
    });

    it('should return increasing XP for higher levels', () => {
      const level2XP = getXPForLevel(2);
      const level3XP = getXPForLevel(3);
      const level4XP = getXPForLevel(4);
      
      expect(level3XP).toBeGreaterThan(level2XP);
      expect(level4XP).toBeGreaterThan(level3XP);
    });
  });

  describe('getTotalXPForLevel', () => {
    it('should return 0 for level 1', () => {
      expect(getTotalXPForLevel(1)).toBe(0);
    });

    it('should calculate cumulative XP correctly', () => {
      const level2Total = getTotalXPForLevel(2);
      const level3Total = getTotalXPForLevel(3);
      
      expect(level2Total).toBeGreaterThan(0);
      expect(level3Total).toBeGreaterThan(level2Total);
    });

    it('should be sum of individual level XP', () => {
      const level5Total = getTotalXPForLevel(5);
      const manual = getXPForLevel(2) + getXPForLevel(3) + getXPForLevel(4) + getXPForLevel(5);
      
      expect(level5Total).toBe(manual);
    });
  });

  describe('getLevelFromTotalXP', () => {
    it('should return level 1 for 0 XP', () => {
      expect(getLevelFromTotalXP(0)).toBe(1);
    });

    it('should return level 1 for negative XP', () => {
      expect(getLevelFromTotalXP(-100)).toBe(1);
    });

    it('should calculate level correctly', () => {
      // Get XP needed for level 3
      const xpForLevel3 = getTotalXPForLevel(3);
      
      // Should be level 2 with slightly less XP
      expect(getLevelFromTotalXP(xpForLevel3 - 1)).toBe(2);
      
      // Should be level 3 with that XP
      expect(getLevelFromTotalXP(xpForLevel3)).toBe(3);
      
      // Should still be level 3 with slightly more XP
      expect(getLevelFromTotalXP(xpForLevel3 + 1)).toBe(3);
    });

    it('should handle large XP values', () => {
      const level = getLevelFromTotalXP(10000);
      expect(level).toBeGreaterThan(1);
      expect(level).toBeLessThan(100);
    });
  });

  describe('XP System Integration', () => {
    it('should level up correctly', () => {
      let totalXP = 0;
      expect(getLevelFromTotalXP(totalXP)).toBe(1);

      // Add enough XP for level 2
      const xpForLevel2 = getTotalXPForLevel(2);
      totalXP = xpForLevel2;
      expect(getLevelFromTotalXP(totalXP)).toBe(2);

      // Add enough XP for level 3
      const xpForLevel3 = getTotalXPForLevel(3);
      totalXP = xpForLevel3;
      expect(getLevelFromTotalXP(totalXP)).toBe(3);
    });

    it('should be consistent', () => {
      const xp = 500;
      const level1 = getLevelFromTotalXP(xp);
      const level2 = getLevelFromTotalXP(xp);
      expect(level1).toBe(level2);
    });
  });
});
