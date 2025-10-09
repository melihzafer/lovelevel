/**
 * Date and Anniversary Utilities
 * Handles monthiversary calculations with end-of-month edge cases,
 * leap years, DST, and timezone considerations
 */

export interface DateStats {
  daysTogether: number;
  monthsTogether: number;
  yearsTogether: number;
  nextMilestone: {
    type: 'months' | 'years';
    value: number;
    date: Date;
    daysUntil: number;
  };
  isMonthiversaryToday: boolean;
  nextMonthiversary: Date;
}

/**
 * Calculate the effective day-of-month for monthiversaries
 * Handles end-of-month cases (e.g., Jan 31 -> Feb 28/29)
 */
export function getEffectiveMonthDay(startDate: Date, targetMonth: number, targetYear: number): number {
  const startDay = startDate.getDate();
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  return Math.min(startDay, lastDayOfTargetMonth);
}

/**
 * Check if a given date is a monthiversary
 */
export function isMonthiversary(startDate: Date, checkDate: Date): boolean {
  const startDay = startDate.getDate();
  const checkDay = checkDate.getDate();
  
  // Quick check: if days match exactly
  if (startDay === checkDay) {
    return true;
  }
  
  // End-of-month case: if start day is 29-31 and check day is last day of its month
  if (startDay >= 29) {
    const lastDayOfCheckMonth = new Date(
      checkDate.getFullYear(),
      checkDate.getMonth() + 1,
      0
    ).getDate();
    
    return checkDay === lastDayOfCheckMonth && checkDay < startDay;
  }
  
  return false;
}

/**
 * Calculate days between two dates (inclusive of start, exclusive of end)
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const startMs = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const endMs = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return Math.floor((endMs - startMs) / msPerDay);
}

/**
 * Calculate full months between two dates
 */
export function monthsBetween(start: Date, end: Date): number {
  let months = (end.getFullYear() - start.getFullYear()) * 12;
  months += end.getMonth() - start.getMonth();
  
  // Subtract one if we haven't reached the day-of-month yet
  const effectiveDay = getEffectiveMonthDay(start, end.getMonth(), end.getFullYear());
  if (end.getDate() < effectiveDay) {
    months--;
  }
  
  return Math.max(0, months);
}

/**
 * Calculate the next monthiversary date
 */
export function getNextMonthiversary(startDate: Date, fromDate: Date = new Date()): Date {
  const today = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  
  // Check if today is a monthiversary
  if (isMonthiversary(startDate, today)) {
    // Return next month's monthiversary
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const effectiveDay = getEffectiveMonthDay(startDate, nextMonth.getMonth(), nextMonth.getFullYear());
    nextMonth.setDate(effectiveDay);
    return nextMonth;
  }
  
  // Calculate this month's monthiversary
  const thisMonthiversary = new Date(today.getFullYear(), today.getMonth(), 1);
  const effectiveDay = getEffectiveMonthDay(startDate, today.getMonth(), today.getFullYear());
  thisMonthiversary.setDate(effectiveDay);
  
  // If this month's monthiversary hasn't passed, return it
  if (thisMonthiversary > today) {
    return thisMonthiversary;
  }
  
  // Otherwise, return next month's monthiversary
  const nextMonthiversary = new Date(today);
  nextMonthiversary.setMonth(nextMonthiversary.getMonth() + 1);
  const nextEffectiveDay = getEffectiveMonthDay(
    startDate,
    nextMonthiversary.getMonth(),
    nextMonthiversary.getFullYear()
  );
  nextMonthiversary.setDate(nextEffectiveDay);
  
  return nextMonthiversary;
}

/**
 * Calculate the next milestone (3, 6, 12, 24, 36... months or yearly anniversaries)
 */
export function getNextMilestone(startDate: Date, fromDate: Date = new Date()): DateStats['nextMilestone'] {
  const monthsComplete = monthsBetween(startDate, fromDate);
  
  // Milestone markers in months
  const milestones = [1, 3, 6, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120];
  
  // Find next milestone
  const nextMonthMilestone = milestones.find(m => m > monthsComplete);
  
  if (nextMonthMilestone) {
    // Calculate the date of this milestone
    const milestoneDate = new Date(startDate);
    milestoneDate.setMonth(milestoneDate.getMonth() + nextMonthMilestone);
    
    const effectiveDay = getEffectiveMonthDay(
      startDate,
      milestoneDate.getMonth(),
      milestoneDate.getFullYear()
    );
    milestoneDate.setDate(effectiveDay);
    
    const daysUntil = daysBetween(fromDate, milestoneDate);
    
    // Check if this is a year milestone
    if (nextMonthMilestone % 12 === 0) {
      return {
        type: 'years',
        value: nextMonthMilestone / 12,
        date: milestoneDate,
        daysUntil,
      };
    }
    
    return {
      type: 'months',
      value: nextMonthMilestone,
      date: milestoneDate,
      daysUntil,
    };
  }
  
  // If we're beyond all predefined milestones, calculate next year anniversary
  const yearsComplete = Math.floor(monthsComplete / 12);
  const nextYearAnniversary = new Date(startDate);
  nextYearAnniversary.setFullYear(startDate.getFullYear() + yearsComplete + 1);
  
  const daysUntil = daysBetween(fromDate, nextYearAnniversary);
  
  return {
    type: 'years',
    value: yearsComplete + 1,
    date: nextYearAnniversary,
    daysUntil,
  };
}

/**
 * Get comprehensive date statistics
 */
export function getDateStats(startDateStr: string, now: Date = new Date()): DateStats {
  const startDate = new Date(startDateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const daysTogether = daysBetween(startDate, today);
  const monthsTogether = monthsBetween(startDate, today);
  const yearsTogether = Math.floor(monthsTogether / 12);
  
  const isMonthiversaryToday = isMonthiversary(startDate, today);
  const nextMonthiversary = getNextMonthiversary(startDate, today);
  const nextMilestone = getNextMilestone(startDate, today);
  
  return {
    daysTogether,
    monthsTogether,
    yearsTogether,
    nextMilestone,
    isMonthiversaryToday,
    nextMonthiversary,
  };
}

/**
 * Format message template with variable substitution
 */
export function formatMessage(
  template: string,
  stats: DateStats,
  partner1: string,
  partner2: string
): string {
  return template
    .replace(/{partner_name_1}/g, partner1)
    .replace(/{partner_name_2}/g, partner2)
    .replace(/{months_together}/g, stats.monthsTogether.toString())
    .replace(/{days_together}/g, stats.daysTogether.toString())
    .replace(/{years_together}/g, stats.yearsTogether.toString());
}

/**
 * Parse date string in YYYY-MM-DD format, handling timezone correctly
 */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
