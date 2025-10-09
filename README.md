# LoveLevel 💕

> Your relationship journey companion - An offline-first PWA for couples



A delightful Progressive Web App featuring a relationship day counter, monthly anniversary celebrations, a challenge checklist with notes & animations, and a nameable, growing virtual pet with unlockable items and milestone effects.Currently, two official plugins are available:



---- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## ✨ Features

## React Compiler

### 📅 Relationship Day Counter

- Track total days together with live updatingThe React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

- View current month count and relationship milestones

- Handles leap years, DST shifts, and timezone changes## Expanding the ESLint configuration

- Automatic monthiversary detection with EOM logic

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

### 🎉 Monthly Anniversary Celebrations

- Monthiversary detection (same day-of-month, with EOM handling)```js

- Celebratory screen with confetti animationsexport default defineConfig([

- Customizable message templates with variables  globalIgnores(['dist']),

- Web Share API integration (with clipboard fallback)  {

- Optional notifications (web push with graceful fallbacks)    files: ['**/*.{ts,tsx}'],

    extends: [

### ✅ Challenges & Activities      // Other configs...

- 20+ seeded challenges across categories (At Home, Outdoors, Creative, Budget-Friendly, Custom)

- Completion tracking with notes (markdown-lite support)      // Remove tseslint.configs.recommended and replace with this

- Filters by status, category, and search      tseslint.configs.recommendedTypeChecked,

- Micro-animations on completion      // Alternatively, use this for stricter rules

- XP rewards for virtual pet      tseslint.configs.strictTypeChecked,

      // Optionally, add this for stylistic rules

### 🐾 Virtual Pet ("Our Buddy")      tseslint.configs.stylisticTypeChecked,

- Name your relationship companion

- Level-up system with XP from challenges      // Other configs...

- Multiple moods (happy, chill, sleepy)    ],

- Unlockable items (accessories, backgrounds, emotes)    languageOptions: {

- Item equipping and customization      parserOptions: {

- Tap interactions with haptic feedback        project: ['./tsconfig.node.json', './tsconfig.app.json'],

- Milestone celebrations at key anniversaries        tsconfigRootDir: import.meta.dirname,

      },

### ⚙️ Settings & Data      // other options...

- Partner names and relationship start date    },

- Theme toggle (system, light, dark)  },

- Notification preferences])

- XP/leveling curve customization```

- **JSON export/import** for backup and device transfer

- Privacy-first: all data stored locallyYou can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:



---```js

// eslint.config.js

## 🛠 Tech Stackimport reactX from 'eslint-plugin-react-x'

import reactDom from 'eslint-plugin-react-dom'

| Layer | Technology |

|-------|-----------|export default defineConfig([

| **Framework** | React 18 + TypeScript |  globalIgnores(['dist']),

| **Build Tool** | Vite 6 |  {

| **Routing** | React Router 7 |    files: ['**/*.{ts,tsx}'],

| **State Management** | Zustand |    extends: [

| **Styling** | TailwindCSS + CSS Variables |      // Other configs...

| **Animations** | Framer Motion |      // Enable lint rules for React

| **Data Storage** | IndexedDB (via `idb`) |      reactX.configs['recommended-typescript'],

| **PWA** | Workbox (injectManifest) + vite-plugin-pwa |      // Enable lint rules for React DOM

| **Testing** | Vitest + @testing-library/react |      reactDom.configs.recommended,

| **Notifications** | Web Notifications API + Push API |    ],

    languageOptions: {

---      parserOptions: {

        project: ['./tsconfig.node.json', './tsconfig.app.json'],

## 📋 Prerequisites        tsconfigRootDir: import.meta.dirname,

      },

⚠️ **Important**: Node.js v20.19+ or v22.12+ required (Vite 6 requirement)      // other options...

    },

Current known issue: Node.js 21.x is not compatible with Vite 6. Please upgrade to Node 20.19+ or 22.12+.  },

])

---```


## 🚀 Getting Started

### Installation

\`\`\`bash
```bash
# Navigate to project
cd LoveLevel

# Install dependencies
npm install
```
\`\`\`

### Development

\`\`\`bash
# Start dev server (hot reload enabled)
npm run dev

# Open http://localhost:5173
\`\`\`

### Production Build

\`\`\`bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Open http://localhost:4173
\`\`\`

### Testing

\`\`\`bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
\`\`\`

---

## 📱 PWA Testing

### Install the App

1. Build and preview: \`npm run build && npm run preview\`
2. Navigate to \`http://localhost:4173\` in Chrome/Edge
3. Look for the **install prompt** in the address bar
4. Click "Install" to add to home screen

### Test Offline

1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Refresh - app still works!

### iOS Safari

1. Deploy to HTTPS hosting (Netlify, Vercel, etc.)
2. Visit URL in Safari
3. Tap Share → Add to Home Screen

---

## 🗂 Project Structure

\`\`\`
coupLOVE/
├── src/
│   ├── components/      # UI components
│   ├── pages/           # Route pages
│   ├── lib/             # Core logic (db, dateUtils, xpSystem)
│   ├── store/           # Zustand stores
│   ├── types/           # TypeScript schemas
│   ├── data/            # Seed data
│   ├── sw.ts            # Service Worker
│   └── main.tsx         # Entry point
├── public/
│   └── icons/           # PWA icons
├── vite.config.ts       # Vite + PWA config
└── tailwind.config.js   # Theme configuration
\`\`\`

---

## 🎨 Customization

### Message Templates

Edit in **Settings** → **Anniversary Message Template**.

Variables: \`{partner_name_1}\`, \`{partner_name_2}\`, \`{months_together}\`, \`{days_together}\`

### XP & Leveling

Adjust in **Settings** → **Pet Progression**:
- XP per Challenge: Default 20
- XP per Monthiversary: Default 100
- Level Curve Multiplier: Default 1.15

Formula: \`requiredXP = round(100 * level * multiplier^(level-1))\`

### Theme Colors

Edit \`src/index.css\` CSS variables in \`:root\` and \`.dark\` selectors.

---

## 📊 Key Algorithms

### Monthiversary Logic

Handles end-of-month edge cases:
- Jan 31 start → Feb 28/29, Mar 31, Apr 30, etc.
- Uses last day of month when start day doesn't exist

### XP Leveling

\`\`\`typescript
// Formula: requiredXP = round(100 * level * multiplier^(level-1))
// Example (multiplier=1.15):
Level 1→2: 100 XP
Level 2→3: 115 XP
Level 5→6: 175 XP
Level 10→11: 363 XP
\`\`\`

---

## 🔒 Privacy

- **100% local-first**: All data in IndexedDB
- **No external servers**: Works completely offline
- **No analytics**: Your data never leaves your device
- **Export control**: Manual JSON backups

---

## 🌐 Deployment

### Netlify

\`\`\`bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
\`\`\`

### Vercel

\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

**Requirement**: HTTPS (automatically provided by hosting platforms)

---

## ✅ Testing Checklist

- [ ] Installs locally without errors
- [ ] Service Worker registers in production build
- [ ] Works offline after cache warmup
- [ ] Day counter accurate (leap years, DST)
- [ ] Monthiversary logic correct (EOM handling)
- [ ] Challenge completion flow works (animation, notes, XP)
- [ ] Pet leveling and item unlocks function
- [ ] JSON export/import succeeds
- [ ] Lighthouse PWA ≥95, Performance ≥90

---

## 🐛 Troubleshooting

### Node Version Error

**Error**: "Vite requires Node.js version 20.19+ or 22.12+"

**Solution**: Upgrade Node.js to v20.19+ or v22.12+
\`\`\`bash
# Using nvm
nvm install 22
nvm use 22
\`\`\`

### PWA Won't Install

- Use HTTPS or localhost
- Check DevTools → Application → Manifest
- Verify Service Worker is registered
- Hard refresh (Ctrl+Shift+R)

### Offline Mode Not Working

- Build production version first (\`npm run build\`)
- Service Worker only active in production
- Check DevTools → Application → Service Workers

---

## 🎯 Roadmap

Future enhancements:
- Cloud sync (optional, privacy-respecting)
- Photo uploads for challenges
- Analytics dashboard
- Couples journal
- More pet species
- Achievement system

---

## 📄 License

MIT License

---

## 🙏 Acknowledgments

Built with: React, Vite, Tailwind CSS, Framer Motion, Zustand, idb, Workbox

---

**Made with 💕 for couples everywhere**

_May your relationship be filled with love, laughter, and countless challenges conquered together!_ 🎉
