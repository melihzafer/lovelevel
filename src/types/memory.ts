/**
 * Memory Types
 * Types for the memory timeline system
 */

export type MemoryType = 'milestone' | 'photo' | 'challenge' | 'date' | 'note' | 'trip';

export interface Memory {
  id: string;
  partnership_id: string;
  created_by: string;
  memory_type: MemoryType;
  title: string;
  description?: string;
  date: string; // ISO date string
  photos?: string[];
  location?: {
    name: string;
    lat?: number;
    lng?: number;
  };
  tags?: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  icon: string;
  days_required: number;
  months_required?: number;
}

export const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm1', name: 'First Date', description: 'The day it all began', icon: '💑', days_required: 0 },
  { id: 'm2', name: 'First Week', description: 'Seven days of getting to know each other', icon: '📅', days_required: 7 },
  { id: 'm3', name: 'First Month', description: 'One month milestone', icon: '🌙', days_required: 30 },
  { id: 'm4', name: 'First "I Love You"', description: 'Those three special words', icon: '❤️', days_required: 45 },
  { id: 'm5', name: 'Two Months', description: 'Two months together', icon: '💕', days_required: 60 },
  { id: 'm6', name: 'Three Months', description: 'Quarter year milestone', icon: '🌟', days_required: 90 },
  { id: 'm7', name: 'Six Months', description: 'Half a year together!', icon: '🎊', days_required: 182 },
  { id: 'm8', name: 'First Trip', description: 'Your first adventure together', icon: '✈️', days_required: 200 },
  { id: 'm9', name: 'One Year', description: 'A whole year of love!', icon: '🎂', days_required: 365 },
  { id: 'm10', name: '1.5 Years', description: 'Eighteen months of happiness', icon: '🌷', days_required: 547 },
  { id: 'm11', name: 'Two Years', description: 'Two wonderful years!', icon: '🎉', days_required: 730 },
  { id: 'm12', name: 'Moved In Together', description: 'Taking the next big step', icon: '🏠', days_required: 400 },
  { id: 'm13', name: 'Got Engaged', description: 'The proposal!', icon: '💍', days_required: 500 },
  { id: 'm14', name: 'Three Years', description: 'Three years of love', icon: '💝', days_required: 1095 },
  { id: 'm15', name: 'Four Years', description: 'Four years strong!', icon: '🌹', days_required: 1460 },
  { id: 'm16', name: 'Five Years', description: 'Half a decade together!', icon: '🏆', days_required: 1825 },
];

export const MEMORY_TYPE_INFO: Record<MemoryType, { label: string; icon: string; color: string }> = {
  milestone: { label: 'Milestone', icon: '🏆', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  photo: { label: 'Photo', icon: '📷', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  challenge: { label: 'Challenge', icon: '✅', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  date: { label: 'Date', icon: '💑', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400' },
  note: { label: 'Note', icon: '📝', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  trip: { label: 'Trip', icon: '✈️', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
};