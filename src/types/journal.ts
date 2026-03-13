/**
 * Journal Types
 * Types for the couple journal system
 */

export type JournalMood = 'happy' | 'love' | 'excited' | 'grateful' | 'reflective' | 'sad' | 'stressed';

export interface JournalEntry {
  id: string;
  partnership_id: string;
  author_id: string;
  title: string;
  content: string;
  mood?: JournalMood;
  tags?: string[];
  photos?: string[]; // URLs to photos
  is_private: boolean; // If true, only author can see
  created_at: string;
  updated_at: string;
}

export interface JournalPrompt {
  id: string;
  text: string;
  category: 'reflection' | 'gratitude' | 'goals' | 'memories' | 'dreams';
}

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Reflection
  { id: 'p1', text: 'What made you smile today?', category: 'reflection' },
  { id: 'p2', text: 'What did you learn about yourself this week?', category: 'reflection' },
  { id: 'p3', text: 'What challenge did you overcome recently?', category: 'reflection' },
  { id: 'p4', text: 'How have you grown since we met?', category: 'reflection' },
  
  // Gratitude
  { id: 'p5', text: 'What are you most grateful for in our relationship?', category: 'gratitude' },
  { id: 'p6', text: 'What small thing did your partner do that made you happy?', category: 'gratitude' },
  { id: 'p7', text: 'What aspect of your life do you appreciate most right now?', category: 'gratitude' },
  { id: 'p8', text: 'Write a thank you note to your partner.', category: 'gratitude' },
  
  // Goals
  { id: 'p9', text: 'What goals do you want to achieve together this month?', category: 'goals' },
  { id: 'p10', text: 'What personal goal are you working on?', category: 'goals' },
  { id: 'p11', text: 'Where do you see us in 5 years?', category: 'goals' },
  { id: 'p12', text: 'What new experience do you want to try together?', category: 'goals' },
  
  // Memories
  { id: 'p13', text: 'What\'s your favorite memory of us?', category: 'memories' },
  { id: 'p14', text: 'What was your first impression of me?', category: 'memories' },
  { id: 'p15', text: 'Describe our best date so far.', category: 'memories' },
  { id: 'p16', text: 'What moment made you fall in love?', category: 'memories' },
  
  // Dreams
  { id: 'p17', text: 'What\'s your dream vacation destination?', category: 'dreams' },
  { id: 'p18', text: 'What kind of home do you imagine for us?', category: 'dreams' },
  { id: 'p19', text: 'If you could do anything together, what would it be?', category: 'dreams' },
  { id: 'p20', text: 'What adventure do you want to go on next?', category: 'dreams' },
];

export const MOOD_EMOJIS: Record<JournalMood, string> = {
  happy: '😊',
  love: '❤️',
  excited: '🎉',
  grateful: '🙏',
  reflective: '🤔',
  sad: '😢',
  stressed: '😓',
};

export const MOOD_COLORS: Record<JournalMood, string> = {
  happy: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  love: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  excited: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  grateful: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  reflective: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sad: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  stressed: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};