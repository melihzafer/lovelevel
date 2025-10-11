import { describe, it, expect } from 'vitest';
import {
  isMonthiversary,
  getNextMonthiversary,
  daysBetween,
  monthsBetween,
  getEffectiveMonthDay,
} from '../lib/dateUtils';

describe('dateUtils', () => {
  describe('getEffectiveMonthDay', () => {
    it('should return correct day for regular dates', () => {
      const date = new Date('2024-03-15');
      const result = getEffectiveMonthDay(date, 3, 2024);
      expect(result).toBe(15);
    });

    it('should handle month-end dates in February', () => {
      const jan31 = new Date('2024-01-31');
      const result = getEffectiveMonthDay(jan31, 1, 2024);
      expect(result).toBe(29); // 2024 is leap year
    });

    it('should handle month-end dates in April', () => {
      const jan31 = new Date('2024-01-31');
      const result = getEffectiveMonthDay(jan31, 3, 2024);
      expect(result).toBe(30); // April has 30 days
    });
  });

  describe('isMonthiversary', () => {
    it('should return true for same day of month', () => {
      const start = new Date('2024-01-15');
      const current = new Date('2024-02-15');
      expect(isMonthiversary(start, current)).toBe(true);
    });

    it('should return true for month-end dates', () => {
      const start = new Date('2024-01-31');
      const current = new Date('2024-02-29'); // Leap year
      expect(isMonthiversary(start, current)).toBe(true);
    });

    it('should return false for different days', () => {
      const start = new Date('2024-01-15');
      const current = new Date('2024-02-16');
      expect(isMonthiversary(start, current)).toBe(false);
    });

    it('should handle same date', () => {
      const start = new Date('2024-01-15');
      const current = new Date('2024-01-15');
      expect(isMonthiversary(start, current)).toBe(true);
    });
  });

  describe('getNextMonthiversary', () => {
    it('should calculate next monthiversary', () => {
      const start = new Date('2024-01-15');
      const current = new Date('2024-02-10');
      const next = getNextMonthiversary(start, current);
      expect(next.getDate()).toBe(15);
      expect(next.getMonth()).toBe(1); // February (0-indexed)
    });

    it('should handle month-end dates in February', () => {
      const start = new Date('2024-01-31');
      const current = new Date('2024-02-10');
      const next = getNextMonthiversary(start, current);
      expect(next.getDate()).toBe(29); // 2024 is leap year
      expect(next.getMonth()).toBe(1); // February
    });

    it('should handle year transitions', () => {
      const start = new Date('2024-01-15');
      const current = new Date('2024-12-20');
      const next = getNextMonthiversary(start, current);
      expect(next.getDate()).toBe(15);
      expect(next.getFullYear()).toBe(2025);
    });
  });

  describe('daysBetween', () => {
    it('should return 0 for same date', () => {
      const date = new Date('2024-01-15');
      expect(daysBetween(date, date)).toBe(0);
    });

    it('should return positive days for future date', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-20');
      expect(daysBetween(start, end)).toBe(5);
    });

    it('should return negative days for past date', () => {
      const start = new Date('2024-01-20');
      const end = new Date('2024-01-15');
      expect(daysBetween(start, end)).toBe(-5);
    });

    it('should handle month transitions', () => {
      const start = new Date('2024-01-30');
      const end = new Date('2024-02-05');
      expect(daysBetween(start, end)).toBe(6);
    });
  });

  describe('monthsBetween', () => {
    it('should return 0 for same month', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-01-20');
      expect(monthsBetween(start, end)).toBe(0);
    });

    it('should return correct months', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-02-15');
      expect(monthsBetween(start, end)).toBeGreaterThanOrEqual(1);
    });

    it('should return 0 for past dates (uses Math.max)', () => {
      const start = new Date('2024-02-15');
      const end = new Date('2024-01-15');
      expect(monthsBetween(start, end)).toBe(0);
    });

    it('should handle partial months', () => {
      const start = new Date('2024-01-15');
      const end = new Date('2024-03-10');
      expect(monthsBetween(start, end)).toBeGreaterThanOrEqual(1);
    });
  });
});
