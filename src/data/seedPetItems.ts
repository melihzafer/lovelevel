import type { PetItem } from '../types/database';

/**
 * Seed data: 30+ pet items
 * - Accessories (hats, glasses, scarves, etc.)
 * - Backgrounds (scenes, colors, themes)
 * - Emotes (expressions, animations)
 */

export const SEED_PET_ITEMS: PetItem[] = [
  // ACCESSORIES (12 items)
  {
    id: 'acc-starter-bow',
    name: 'Red Bow',
    type: 'accessory',
    description: 'A cute red bow to make your pet extra adorable',
    unlockCondition: { type: 'level', value: 1 },
  },
  {
    id: 'acc-sunglasses',
    name: 'Cool Sunglasses',
    type: 'accessory',
    description: 'Too cool for school',
    unlockCondition: { type: 'level', value: 3 },
  },
  {
    id: 'acc-party-hat',
    name: 'Party Hat',
    type: 'accessory',
    description: 'Every day is a celebration!',
    unlockCondition: { type: 'monthiversary', value: 1 },
  },
  {
    id: 'acc-flower-crown',
    name: 'Flower Crown',
    type: 'accessory',
    description: 'A beautiful crown of fresh flowers',
    unlockCondition: { type: 'level', value: 5 },
  },
  {
    id: 'acc-chef-hat',
    name: 'Chef Hat',
    type: 'accessory',
    description: 'Bon appétit!',
    unlockCondition: { type: 'challenge-count', value: 5 },
  },
  {
    id: 'acc-wizard-hat',
    name: 'Wizard Hat',
    type: 'accessory',
    description: 'Magical powers not included',
    unlockCondition: { type: 'level', value: 10 },
  },
  {
    id: 'acc-crown',
    name: 'Royal Crown',
    type: 'accessory',
    description: 'For the royal pet in your life',
    unlockCondition: { type: 'monthiversary', value: 6 },
  },
  {
    id: 'acc-halo',
    name: 'Angel Halo',
    type: 'accessory',
    description: 'Your pet is an angel',
    unlockCondition: { type: 'level', value: 15 },
  },
  {
    id: 'acc-headphones',
    name: 'Headphones',
    type: 'accessory',
    description: 'Vibing to the music',
    unlockCondition: { type: 'challenge-count', value: 10 },
  },
  {
    id: 'acc-pirate-hat',
    name: 'Pirate Hat',
    type: 'accessory',
    description: 'Ahoy, matey!',
    unlockCondition: { type: 'level', value: 20 },
  },
  {
    id: 'acc-santa-hat',
    name: 'Santa Hat',
    type: 'accessory',
    description: 'Ho ho ho!',
    unlockCondition: { type: 'monthiversary', value: 12 },
  },
  {
    id: 'acc-unicorn-horn',
    name: 'Unicorn Horn',
    type: 'accessory',
    description: 'Magical and majestic',
    unlockCondition: { type: 'level', value: 25 },
  },

  // BACKGROUNDS (12 items)
  {
    id: 'bg-default',
    name: 'Cozy Home',
    type: 'background',
    description: 'A warm and comfy home',
    unlockCondition: { type: 'level', value: 1 },
  },
  {
    id: 'bg-park',
    name: 'Park Scene',
    type: 'background',
    description: 'A sunny day at the park',
    unlockCondition: { type: 'level', value: 2 },
  },
  {
    id: 'bg-beach',
    name: 'Beach Paradise',
    type: 'background',
    description: 'Sun, sand, and waves',
    unlockCondition: { type: 'monthiversary', value: 3 },
  },
  {
    id: 'bg-forest',
    name: 'Enchanted Forest',
    type: 'background',
    description: 'Deep in the magical woods',
    unlockCondition: { type: 'level', value: 7 },
  },
  {
    id: 'bg-city',
    name: 'City Lights',
    type: 'background',
    description: 'The bustling cityscape at night',
    unlockCondition: { type: 'challenge-count', value: 8 },
  },
  {
    id: 'bg-space',
    name: 'Outer Space',
    type: 'background',
    description: 'Among the stars',
    unlockCondition: { type: 'level', value: 12 },
  },
  {
    id: 'bg-mountains',
    name: 'Mountain Peak',
    type: 'background',
    description: 'On top of the world',
    unlockCondition: { type: 'monthiversary', value: 6 },
  },
  {
    id: 'bg-cafe',
    name: 'Coffee Shop',
    type: 'background',
    description: 'Cozy café vibes',
    unlockCondition: { type: 'challenge-count', value: 12 },
  },
  {
    id: 'bg-library',
    name: 'Grand Library',
    type: 'background',
    description: 'Surrounded by books',
    unlockCondition: { type: 'level', value: 18 },
  },
  {
    id: 'bg-garden',
    name: 'Secret Garden',
    type: 'background',
    description: 'A hidden oasis',
    unlockCondition: { type: 'monthiversary', value: 9 },
  },
  {
    id: 'bg-winter',
    name: 'Winter Wonderland',
    type: 'background',
    description: 'Snowy and magical',
    unlockCondition: { type: 'monthiversary', value: 12 },
  },
  {
    id: 'bg-rainbow',
    name: 'Rainbow Sky',
    type: 'background',
    description: 'Colors everywhere',
    unlockCondition: { type: 'level', value: 30 },
  },

  // EMOTES (10 items)
  {
    id: 'emote-wave',
    name: 'Wave',
    type: 'emote',
    description: 'A friendly wave',
    unlockCondition: { type: 'level', value: 1 },
  },
  {
    id: 'emote-heart',
    name: 'Heart Eyes',
    type: 'emote',
    description: 'Loving every moment',
    unlockCondition: { type: 'monthiversary', value: 1 },
  },
  {
    id: 'emote-laugh',
    name: 'Big Laugh',
    type: 'emote',
    description: 'LOL!',
    unlockCondition: { type: 'level', value: 4 },
  },
  {
    id: 'emote-dance',
    name: 'Happy Dance',
    type: 'emote',
    description: 'Dancing with joy',
    unlockCondition: { type: 'challenge-count', value: 5 },
  },
  {
    id: 'emote-sleep',
    name: 'Sleepy Zzz',
    type: 'emote',
    description: 'Time for a nap',
    unlockCondition: { type: 'level', value: 6 },
  },
  {
    id: 'emote-think',
    name: 'Thinking',
    type: 'emote',
    description: 'Hmm...',
    unlockCondition: { type: 'level', value: 8 },
  },
  {
    id: 'emote-party',
    name: 'Party Time',
    type: 'emote',
    description: 'Let\'s celebrate!',
    unlockCondition: { type: 'monthiversary', value: 3 },
  },
  {
    id: 'emote-wink',
    name: 'Cheeky Wink',
    type: 'emote',
    description: 'Feeling playful',
    unlockCondition: { type: 'level', value: 11 },
  },
  {
    id: 'emote-sparkle',
    name: 'Sparkle',
    type: 'emote',
    description: 'Shining bright',
    unlockCondition: { type: 'monthiversary', value: 6 },
  },
  {
    id: 'emote-celebrate',
    name: 'Confetti Blast',
    type: 'emote',
    description: 'Big celebration!',
    unlockCondition: { type: 'monthiversary', value: 12 },
  },
];

/**
 * Get items that should be unlocked based on current progress
 */
export function getUnlockedItems(
  level: number,
  monthiversaryCount: number,
  challengeCount: number
): PetItem[] {
  return SEED_PET_ITEMS.map(item => ({
    ...item,
    unlockedAt: isItemUnlocked(item, level, monthiversaryCount, challengeCount)
      ? new Date().toISOString()
      : undefined,
  })).filter(item => item.unlockedAt);
}

/**
 * Check if an item should be unlocked
 */
export function isItemUnlocked(
  item: PetItem,
  level: number,
  monthiversaryCount: number,
  challengeCount: number
): boolean {
  if (!item.unlockCondition) return true;

  const { type, value } = item.unlockCondition;

  switch (type) {
    case 'level':
      return level >= value;
    case 'monthiversary':
      return monthiversaryCount >= value;
    case 'challenge-count':
      return challengeCount >= value;
    default:
      return false;
  }
}

/**
 * Get newly unlocked items after a level up or milestone
 */
export function getNewlyUnlockedItems(
  previousLevel: number,
  newLevel: number,
  monthiversaryCount: number,
  challengeCount: number
): PetItem[] {
  const previouslyUnlocked = getUnlockedItems(previousLevel, monthiversaryCount, challengeCount);
  const currentlyUnlocked = getUnlockedItems(newLevel, monthiversaryCount, challengeCount);

  const previousIds = new Set(previouslyUnlocked.map(i => i.id));
  return currentlyUnlocked.filter(item => !previousIds.has(item.id));
}
