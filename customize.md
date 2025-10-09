# Customization Guide

## 🎨 Visual Customization

### Theme Colors

Edit `src/index.css` to customize the color palette:

\`\`\`css
@layer base {
  :root {
    /* Primary color - Used for buttons, accents, progress bars */
    --color-primary-50: #fef2f4;
    --color-primary-500: #e7507a;  /* Main pink */
    --color-primary-600: #d43063;
    --color-primary-900: #7e1d42;

    /* Accent color - Used for secondary elements */
    --color-accent-50: #faf5ff;
    --color-accent-500: #a855f7;  /* Purple */
    --color-accent-900: #581c87;

    /* Background and text */
    --bg-primary: #ffffff;
    --bg-secondary: #fef2f4;
    --text-primary: #1f2937;
    --text-secondary: #6b7280;
    --border-color: #f3e8ff;
  }

  .dark {
    /* Dark theme overrides */
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --border-color: #334155;
  }
}
\`\`\`

**Color Scheme Examples:**

1. **Romantic Red & Gold**
   \`\`\`css
   --color-primary-500: #dc2626;  /* Red */
   --color-accent-500: #f59e0b;   /* Gold */
   \`\`\`

2. **Ocean Blue & Teal**
   \`\`\`css
   --color-primary-500: #0ea5e9;  /* Sky blue */
   --color-accent-500: #14b8a6;   /* Teal */
   \`\`\`

3. **Sunset Orange & Pink**
   \`\`\`css
   --color-primary-500: #f97316;  /* Orange */
   --color-accent-500: #ec4899;   /* Pink */
   \`\`\`

---

## 📝 Message Templates

### Default Template

The default anniversary message in `src/types/database.ts`:

\`\`\`typescript
messageTemplate: 'Happy {months_together} month anniversary! 💕 {days_together} days of love and counting!'
\`\`\`

### Available Variables

| Variable | Description | Example |
|----------|-------------|---------|
| \`{partner_name_1}\` | First partner's name | "Alex" |
| \`{partner_name_2}\` | Second partner's name | "Sam" |
| \`{months_together}\` | Months as a couple | "6" |
| \`{days_together}\` | Total days together | "182" |

### Custom Template Examples

**Romantic:**
\`\`\`
{partner_name_1} & {partner_name_2} - {months_together} months of pure magic! ✨
Here's to {days_together} days of laughter, love, and adventure! 💕
\`\`\`

**Playful:**
\`\`\`
🎉 MONTHIVERSARY ALERT! 🎉
{partner_name_1} + {partner_name_2} = {months_together} months of awesome!
That's {days_together} days of tolerating each other's weirdness 😄❤️
\`\`\`

**Minimalist:**
\`\`\`
{months_together} months. {days_together} days. Still going strong. 💪❤️
\`\`\`

**Emoji-Heavy:**
\`\`\`
🎊 {months_together} months 🎊
👫 {days_together} days 👫
💑 Forever to go! 💕
\`\`\`

### Editing Templates

Users can edit templates in **Settings** → **Anniversary Message Template**.

To change the default, edit `src/types/database.ts`:

\`\`\`typescript
export const DEFAULT_SETTINGS: Settings = {
  // ... other settings
  messageTemplate: 'Your custom default message here!',
  // ... rest of settings
};
\`\`\`

---

## 🎮 XP & Leveling System

### Default Values

Located in `src/types/database.ts`:

\`\`\`typescript
export const DEFAULT_SETTINGS: Settings = {
  xpPerChallenge: 20,
  xpPerPetTask: 10,
  xpPerMonthiversary: 100,
  levelCurveMultiplier: 1.15,
  // ... other settings
};
\`\`\`

### Customizing XP Rewards

**Fast Progression** (quick leveling):
\`\`\`typescript
xpPerChallenge: 50,          // More XP per challenge
xpPerMonthiversary: 200,     // Bigger monthiversary bonus
levelCurveMultiplier: 1.1,   // Easier level-ups
\`\`\`

**Slow Progression** (gradual leveling):
\`\`\`typescript
xpPerChallenge: 10,          // Less XP per challenge
xpPerMonthiversary: 50,      // Smaller monthiversary bonus
levelCurveMultiplier: 1.25,  // Harder level-ups
\`\`\`

**Balanced** (default):
\`\`\`typescript
xpPerChallenge: 20,
xpPerMonthiversary: 100,
levelCurveMultiplier: 1.15,
\`\`\`

### Level Curve Formula

The formula in `src/lib/xpSystem.ts`:

\`\`\`typescript
export function calculateRequiredXP(level: number, multiplier: number = 1.15): number {
  return Math.round(100 * level * Math.pow(multiplier, level - 1));
}
\`\`\`

**Level Progression Examples:**

| Multiplier | Level 1→2 | Level 5→6 | Level 10→11 | Level 20→21 |
|------------|-----------|-----------|-------------|-------------|
| 1.10 | 100 | 146 | 236 | 613 |
| 1.15 (default) | 100 | 175 | 363 | 1533 |
| 1.20 | 100 | 207 | 516 | 3461 |

### Adding New XP Sources

Edit `src/store/index.ts` to add custom XP triggers:

\`\`\`typescript
// Example: XP for daily login
export const useDailyRewardStore = create((set, get) => ({
  lastLogin: null,
  
  claimDailyReward: async () => {
    const lastLogin = get().lastLogin;
    const now = new Date();
    
    // Check if 24 hours passed
    if (!lastLogin || (now - lastLogin) > 86400000) {
      const petStore = usePetStore.getState();
      await petStore.gainXP(15, 'daily-login');
      set({ lastLogin: now });
    }
  },
}));
\`\`\`

---

## 🎯 Challenge Customization

### Editing Seed Challenges

Edit `src/data/seedChallenges.ts` to modify default challenges:

\`\`\`typescript
export const seedChallenges: Omit<Challenge, 'createdAt'>[] = [
  {
    id: nanoid(),
    title: 'Cook a meal together',
    description: 'Plan, shop, and cook a delicious meal as a team',
    category: 'at-home',
    tags: ['cooking', 'teamwork', 'food'],
    estimate: {
      minutes: 90,
      costUSD: 30,
    },
  },
  // ... add more challenges
];
\`\`\`

### Challenge Categories

Available categories in `src/types/database.ts`:

\`\`\`typescript
category: 'at-home' | 'outdoors' | 'creative' | 'budget-friendly' | 'custom';
\`\`\`

**Adding New Categories:**

1. Update the type in `src/types/database.ts`:
   \`\`\`typescript
   category: 'at-home' | 'outdoors' | 'creative' | 'budget-friendly' | 'adventure' | 'custom';
   \`\`\`

2. Update category filter in `src/pages/Challenges.tsx`:
   \`\`\`typescript
   const categories = [
     { value: 'all', label: 'All', emoji: '🎯' },
     { value: 'at-home', label: 'At Home', emoji: '🏠' },
     { value: 'outdoors', label: 'Outdoors', emoji: '🌳' },
     { value: 'creative', label: 'Creative', emoji: '🎨' },
     { value: 'budget-friendly', label: 'Budget', emoji: '💰' },
     { value: 'adventure', label: 'Adventure', emoji: '🗺️' },  // New
     { value: 'custom', label: 'Custom', emoji: '✨' },
   ];
   \`\`\`

---

## 🐾 Pet Customization

### Default Pet Items

Edit `src/data/seedPetItems.ts`:

\`\`\`typescript
export const seedPetItems: PetItem[] = [
  {
    id: nanoid(),
    name: '🎩',  // Emoji for the item
    type: 'accessory',
    description: 'Classic top hat',
    unlockCondition: {
      type: 'level',
      value: 5,
    },
  },
  // ... add more items
];
\`\`\`

### Item Types

| Type | Description | Example |
|------|-------------|---------|
| \`accessory\` | Wearable items | Hats, glasses, scarves |
| \`background\` | Scene backgrounds | Landscapes, patterns |
| \`emote\` | Expressions/actions | Hearts, stars, sparkles |

### Unlock Conditions

\`\`\`typescript
unlockCondition: {
  type: 'level' | 'monthiversary' | 'challenge-count',
  value: number,
}
\`\`\`

**Examples:**

\`\`\`typescript
// Unlock at level 10
{ type: 'level', value: 10 }

// Unlock at 6 month anniversary
{ type: 'monthiversary', value: 6 }

// Unlock after 50 challenges
{ type: 'challenge-count', value: 50 }
\`\`\`

### Pet Moods

Edit mood logic in `src/pages/Pet.tsx`:

\`\`\`typescript
const getMoodEmoji = (mood: PetMood) => {
  switch (mood) {
    case 'happy': return '😊';
    case 'chill': return '😌';
    case 'sleepy': return '😴';
    // Add new moods:
    case 'excited': return '🤩';
    case 'playful': return '😜';
    default: return '🙂';
  }
};
\`\`\`

Don't forget to update the type in `src/types/database.ts`:

\`\`\`typescript
export type PetMood = 'happy' | 'chill' | 'sleepy' | 'excited' | 'playful';
\`\`\`

---

## 🔔 Notification Customization

### Notification Messages

Edit `src/sw.ts` for Service Worker notifications:

\`\`\`typescript
// Monthiversary notification
self.registration.showNotification('Happy Monthiversary! 💕', {
  body: 'Celebrate your special day together!',
  icon: '/icons/icon-192.png',
  badge: '/icons/badge-72.png',
  tag: 'monthiversary',
  requireInteraction: true,
  actions: [
    { action: 'view', title: 'View' },
    { action: 'dismiss', title: 'Later' },
  ],
});
\`\`\`

### Notification Timing

Edit check frequency in `src/sw.ts`:

\`\`\`typescript
// Check every 12 hours (in milliseconds)
const CHECK_INTERVAL = 12 * 60 * 60 * 1000;  // Default

// More frequent (every 6 hours)
const CHECK_INTERVAL = 6 * 60 * 60 * 1000;

// Less frequent (daily)
const CHECK_INTERVAL = 24 * 60 * 60 * 1000;
\`\`\`

---

## 📱 PWA Customization

### App Name & Description

Edit `public/manifest.webmanifest`:

\`\`\`json
{
  "name": "coupLOVE - Relationship Companion",
  "short_name": "coupLOVE",
  "description": "Track your relationship journey with challenges and a virtual pet",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#e7507a",
  "background_color": "#ffffff"
}
\`\`\`

### App Icons

Replace icons in `public/icons/`:
- `icon-192.png` (192x192) - Standard icon
- `icon-512.png` (512x512) - High-res icon
- `icon-maskable.png` (512x512) - Android adaptive icon

**Tools for Icon Generation:**
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

### Splash Screen (iOS)

Add to `index.html`:

\`\`\`html
<link rel="apple-touch-icon" href="/icons/icon-192.png">
<link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px)">
<!-- Add more sizes for different devices -->
\`\`\`

---

## 🧪 Testing Custom Changes

After making customizations:

1. **Clear cache**: DevTools → Application → Clear storage
2. **Rebuild**: `npm run build`
3. **Preview**: `npm run preview`
4. **Test offline**: DevTools → Application → Service Workers → Offline
5. **Lighthouse audit**: DevTools → Lighthouse → PWA

---

## 💡 Advanced Customization

### Adding New Pages

1. Create page in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`:
   \`\`\`typescript
   const NewPage = lazy(() => import('./pages/NewPage'));
   
   // In Routes
   <Route path="/new" element={<NewPage />} />
   \`\`\`
3. Add navigation in `src/components/BottomNav.tsx`

### Custom Animations

Using Framer Motion:

\`\`\`typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.8 }}
  transition={{ duration: 0.3 }}
>
  Your content
</motion.div>
\`\`\`

### Custom Zustand Store

\`\`\`typescript
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
\`\`\`

---

**Questions?** Check the main README or open an issue on GitHub!
