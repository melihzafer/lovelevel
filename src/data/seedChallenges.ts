import type { Challenge } from '../types/database';
import { nanoid } from 'nanoid';

/**
 * Tohum verisi: 4 kategoride 20 zorluk
 * - Evde (5 zorluk)
 * - Açık Havada (5 zorluk)
 * - Yaratıcı (5 zorluk)
 * - Bütçe Dostu (5 zorluk)
 * 
 * Zorluk ID'leri i18n.ts'de çevirileri aramak için kullanılır
 */

export const SEED_CHALLENGES: (Omit<Challenge, 'id' | 'createdAt'> & { challengeId: string })[] = [
  // EVDE
  {
    challengeId: 'cook-recipe',
    title: 'Cook a New Recipe Together',
    description: 'Pick a cuisine you\'ve never tried before and cook it from scratch. Take turns being the head chef!',
    category: 'at-home',
    tags: ['cooking', 'food', 'teamwork'],
    estimate: { minutes: 90, costUSD: 25 },
  },
  {
    challengeId: 'blanket-fort',
    title: 'Build a Blanket Fort',
    description: 'Channel your inner kids! Build an epic blanket fort and watch a movie inside it with snacks.',
    category: 'at-home',
    tags: ['cozy', 'playful', 'movies'],
    estimate: { minutes: 60, costUSD: 0 },
  },
  {
    challengeId: 'spa-night',
    title: 'Spa Night at Home',
    description: 'Give each other massages, do face masks, light candles, and play relaxing music.',
    category: 'at-home',
    tags: ['relaxation', 'wellness', 'pampering'],
    estimate: { minutes: 120, costUSD: 15 },
  },
  {
    challengeId: 'game-tournament',
    title: 'Game Tournament',
    description: 'Have a best-of-7 tournament with board games, card games, or video games. Winner picks dinner!',
    category: 'at-home',
    tags: ['games', 'competitive', 'fun'],
    estimate: { minutes: 180, costUSD: 0 },
  },
  {
    challengeId: 'karaoke-night',
    title: 'Karaoke Night',
    description: 'Belt out your favorite songs together! Use YouTube karaoke tracks or a karaoke app.',
    category: 'at-home',
    tags: ['music', 'singing', 'laughter'],
    estimate: { minutes: 90, costUSD: 0 },
  },

  // AÇIK HAVADA
  {
    challengeId: 'sunrise-hike',
    title: 'Sunrise or Sunset Hike',
    description: 'Wake up early or stay out late to catch a beautiful sunrise or sunset from a scenic spot.',
    category: 'outdoors',
    tags: ['nature', 'hiking', 'photography'],
    estimate: { minutes: 150, costUSD: 0 },
  },
  {
    challengeId: 'picnic-park',
    title: 'Picnic in the Park',
    description: 'Pack your favorite snacks, bring a blanket, and enjoy an outdoor meal together.',
    category: 'outdoors',
    tags: ['food', 'nature', 'relaxation'],
    estimate: { minutes: 120, costUSD: 20 },
  },
  {
    challengeId: 'bike-adventure',
    title: 'Bike Ride Adventure',
    description: 'Explore a new trail or neighborhood on bikes. Stop for ice cream along the way!',
    category: 'outdoors',
    tags: ['exercise', 'adventure', 'exploration'],
    estimate: { minutes: 180, costUSD: 10 },
  },
  {
    challengeId: 'stargazing',
    title: 'Stargazing Session',
    description: 'Find a dark spot away from city lights, bring a blanket, and identify constellations together.',
    category: 'outdoors',
    tags: ['astronomy', 'romantic', 'peaceful'],
    estimate: { minutes: 120, costUSD: 0 },
  },
  {
    challengeId: 'farmers-market',
    title: 'Farmers Market Morning',
    description: 'Visit your local farmers market, try new fruits or treats, and support local vendors.',
    category: 'outdoors',
    tags: ['food', 'community', 'morning'],
    estimate: { minutes: 120, costUSD: 30 },
  },

  // YARATICI
  {
    challengeId: 'paint-together',
    title: 'Paint Together',
    description: 'Get canvas and paints and create artwork side-by-side. No art experience needed!',
    category: 'creative',
    tags: ['art', 'painting', 'expression'],
    estimate: { minutes: 120, costUSD: 25 },
  },
  {
    challengeId: 'love-letters',
    title: 'Write Love Letters',
    description: 'Each write a heartfelt letter to the other, then exchange and read them aloud.',
    category: 'creative',
    tags: ['writing', 'romantic', 'heartfelt'],
    estimate: { minutes: 45, costUSD: 0 },
  },
  {
    challengeId: 'couples-playlist',
    title: 'Create a Couples Playlist',
    description: 'Take turns adding songs that remind you of each other or your journey together.',
    category: 'creative',
    tags: ['music', 'memories', 'nostalgia'],
    estimate: { minutes: 60, costUSD: 0 },
  },
  {
    challengeId: 'scrapbook',
    title: 'Make a Scrapbook',
    description: 'Collect photos, ticket stubs, and mementos to create a physical scrapbook of your memories.',
    category: 'creative',
    tags: ['crafts', 'memories', 'keepsake'],
    estimate: { minutes: 180, costUSD: 20 },
  },
  {
    challengeId: 'learn-dance',
    title: 'Learn a Dance Together',
    description: 'Pick a dance style (salsa, swing, hip-hop) and learn it together via YouTube tutorials.',
    category: 'creative',
    tags: ['dance', 'movement', 'learning'],
    estimate: { minutes: 90, costUSD: 0 },
  },

  // BÜTÇE DOSTU
  {
    challengeId: 'museum-day',
    title: 'Free Museum or Gallery Day',
    description: 'Many museums offer free admission days. Explore art, history, or science together!',
    category: 'budget-friendly',
    tags: ['culture', 'learning', 'free'],
    estimate: { minutes: 180, costUSD: 0 },
  },
  {
    challengeId: 'walking-tour',
    title: 'Walking Tour of Your City',
    description: 'Be tourists in your own city! Walk through neighborhoods you\'ve never explored before.',
    category: 'budget-friendly',
    tags: ['exploration', 'walking', 'local'],
    estimate: { minutes: 150, costUSD: 0 },
  },
  {
    challengeId: 'photo-hunt',
    title: 'Photo Scavenger Hunt',
    description: 'Create a list of things to find and photograph around your area. Make it silly or romantic!',
    category: 'budget-friendly',
    tags: ['photography', 'adventure', 'playful'],
    estimate: { minutes: 120, costUSD: 0 },
  },
  {
    challengeId: 'volunteer',
    title: 'Volunteer Together',
    description: 'Give back to your community by volunteering at a local charity, shelter, or food bank.',
    category: 'budget-friendly',
    tags: ['community', 'giving-back', 'meaningful'],
    estimate: { minutes: 180, costUSD: 0 },
  },
  {
    challengeId: 'window-shopping',
    title: 'Window Shopping & Dreaming',
    description: 'Browse shops or online stores and show each other things you\'d love to have "someday."',
    category: 'budget-friendly',
    tags: ['shopping', 'dreaming', 'casual'],
    estimate: { minutes: 90, costUSD: 0 },
  },
];

/**
 * ID'ler ve zaman damgalarıyla Challenge nesneleri oluştur
 */
export function generateSeedChallenges(): Challenge[] {
  return SEED_CHALLENGES.map((challenge) => ({
    ...challenge,
    id: nanoid(),
    createdAt: new Date().toISOString(),
  }));
}

/**
 * Tohum zorluklarını veritabanına ekle
 */
export async function seedChallenges(db: { addChallenge: (challenge: Challenge) => Promise<void> }) {
  const challenges = generateSeedChallenges();
  for (const challenge of challenges) {
    await db.addChallenge(challenge);
  }
  return challenges.length;
}
