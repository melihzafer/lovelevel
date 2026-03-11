# Phase 1: Foundation Modernization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Modernize core dependencies and establish design system foundation for LoveLevel app.

**Architecture:** Upgrade Tailwind CSS v3→v4 with new CSS-first config, replace html2canvas with html-to-image for better performance, update ESLint plugins for React 19 support, create centralized design tokens, and enable React Compiler for auto-memoization.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4, TypeScript 5.9, Zustand 5, Framer Motion 12

---

## Overview

This phase tackles critical infrastructure updates that unlock performance improvements and establish consistency for subsequent phases. Each task is atomic and testable.

**Estimated Duration:** 5-7 days

**Risk Level:** Medium (breaking changes in Tailwind v4)

---

## Task 1: Update Minor Dependencies (Safe Updates)

**Goal:** Update all non-breaking dependencies first to reduce merge conflicts later.

**Files:**
- Modify: `package.json`

**Step 1: Update all safe minor/patch versions**

Run:
```bash
npm update @supabase/supabase-js framer-motion react-router-dom lucide-react nanoid workbox-window @testing-library/react @testing-library/jest-dom @types/node @types/react @types/react-dom autoprefixer postcss tailwindcss typescript typescript-eslint vite vitest workbox-cacheable-response workbox-core workbox-expiration workbox-precaching workbox-routing workbox-strategies
```

Expected: Packages updated to latest compatible versions

**Step 2: Verify app still works**

Run:
```bash
npm run dev
```

Expected: Dev server starts without errors

**Step 3: Run tests**

Run:
```bash
npm test
```

Expected: All tests pass

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: update minor dependencies to latest versions"
```

---

## Task 2: Replace html2canvas with html-to-image

**Goal:** Faster, more reliable image generation for sharing feature.

**Files:**
- Modify: `package.json`
- Modify: `src/pages/Home.tsx`

**Step 1: Install html-to-image**

Run:
```bash
npm uninstall html2canvas @types/html2canvas
npm install html-to-image
```

Expected: html2canvas removed, html-to-image installed

**Step 2: Update Home.tsx imports**

Find in `src/pages/Home.tsx`:
```typescript
import html2canvas from 'html2canvas';
```

Replace with:
```typescript
import { toPng } from 'html-to-image';
```

**Step 3: Update handleShare function**

Find in `src/pages/Home.tsx` (lines ~125-190):
```typescript
const handleShare = async () => {
    if (!shareCardRef.current) return;
    
    setIsSharing(true);
    
    try {
      // 1. Capture the hidden ShareCard
      // Reduced scale to 1 for mobile stability (1080x1920 is already HD)
      const canvas = await html2canvas(shareCardRef.current, {
        scale: 1, 
        backgroundColor: null,
        useCORS: true, 
        logging: false,
        allowTaint: true, // Allow cross-origin images if CORS fails (might accept but not share)
      });

      // 2. Convert to blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png', 0.9);
      });

      if (!blob) throw new Error('Failed to generate image');

      // 3. Create file for sharing
      const file = new File([blob], 'love_journey.png', { type: 'image/png' });

      // 4. Share using Web Share API
      const shareData = {
          files: [file],
          title: 'Our Love Journey',
          text: `Celebrating ${dateStats?.daysTogether} days together! 💕 #LoveLevel`,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Download the image
        // Create a link and click it immediately
        const link = document.createElement('a');
        link.download = `love_level_${dateStats?.daysTogether}_days.png`;
        link.href = canvas.toDataURL('image/png', 0.9);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Share failed:', err);
      // Show user feedback (could add a toast here, but alert is better than silence for now)
      alert(t.shareFailed || 'Could not share image. Try taking a screenshot!'); 

      // Fallback text share if image fail
      if (navigator.share) {
         try {
           await navigator.share({
             title: 'Love Level',
             text: `We've been together for ${dateStats?.daysTogether} days! 💕`,
             url: window.location.href,
           });
         } catch (shareErr) {
           console.error('Fallback share failed:', shareErr);
         }
      }
    } finally {
      setIsSharing(false);
    }
  };
```

Replace with:
```typescript
const handleShare = async () => {
    if (!shareCardRef.current) return;
    
    setIsSharing(true);
    
    try {
      // 1. Capture the hidden ShareCard using html-to-image (faster than html2canvas)
      const dataUrl = await toPng(shareCardRef.current, {
        quality: 0.9,
        pixelRatio: 1,
        cacheBust: true,
      });

      // 2. Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      if (!blob) throw new Error('Failed to generate image');

      // 3. Create file for sharing
      const file = new File([blob], 'love_journey.png', { type: 'image/png' });

      // 4. Share using Web Share API
      const shareData = {
          files: [file],
          title: 'Our Love Journey',
          text: `Celebrating ${dateStats?.daysTogether} days together! 💕 #LoveLevel`,
      };

      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Download the image
        const link = document.createElement('a');
        link.download = `love_level_${dateStats?.daysTogether}_days.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Share failed:', err);
      alert(t.shareFailed || 'Could not share image. Try taking a screenshot!'); 

      // Fallback text share if image fail
      if (navigator.share) {
         try {
           await navigator.share({
             title: 'Love Level',
             text: `We've been together for ${dateStats?.daysTogether} days! 💕`,
             url: window.location.href,
           });
         } catch (shareErr) {
           console.error('Fallback share failed:', shareErr);
         }
      }
    } finally {
      setIsSharing(false);
    }
  };
```

**Step 4: Test sharing functionality**

Run:
```bash
npm run dev
```

Manual test:
1. Navigate to Home page
2. Click share button
3. Verify image generates and share dialog appears

Expected: Share works without errors

**Step 5: Commit**

```bash
git add package.json package-lock.json src/pages/Home.tsx
git commit -m "refactor: replace html2canvas with html-to-image for better performance"
```

---

## Task 3: Update ESLint Plugins

**Goal:** Update ESLint plugins for React 19 support and better hook detection.

**Files:**
- Modify: `package.json`
- Modify: `eslint.config.js` (if exists) or create

**Step 1: Update ESLint plugins**

Run:
```bash
npm install eslint-plugin-react-hooks@latest eslint-plugin-react-refresh@latest globals@latest @eslint/js@latest typescript-eslint@latest --save-dev
```

Expected: Plugins updated to latest versions

**Step 2: Check for ESLint config file**

Run:
```bash
ls eslint.config.js 2>/dev/null || echo "No flat config found, checking .eslintrc*"
ls .eslintrc* 2>/dev/null || echo "No legacy config found"
```

Expected: Identify which config format is used

**Step 3: Run lint to check for new warnings**

Run:
```bash
npm run lint
```

Expected: May show new warnings from updated rules

**Step 4: Fix any new critical warnings**

If new warnings appear, fix them. Common fixes:
- Add missing dependencies to useEffect
- Fix hook rule violations

**Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: update ESLint plugins for React 19 support"
```

---

## Task 4: Create Design Tokens File

**Goal:** Centralize all design tokens for consistent theming across components.

**Files:**
- Create: `src/styles/tokens.css`
- Modify: `src/index.css`

**Step 1: Create tokens directory**

Run:
```bash
mkdir -p src/styles
```

**Step 2: Create tokens.css with all design tokens**

Create file `src/styles/tokens.css`:
```css
/**
 * LoveLevel Design Tokens
 * Single source of truth for all design values
 * 
 * Usage: Import in index.css, reference via var(--token-name)
 */

:root {
  /* ============================================
   * COLOR PALETTE
   * ============================================ */
  
  /* Primary: Romantic Rose/Pink */
  --color-primary-50: #fff0f3;
  --color-primary-100: #ffe4e6;
  --color-primary-200: #fecdd3;
  --color-primary-300: #fda4af;
  --color-primary-400: #fb7185;
  --color-primary-500: #f43f5e;
  --color-primary-600: #e11d48;
  --color-primary-700: #be123c;
  --color-primary-800: #9f1239;
  --color-primary-900: #881337;

  /* Accent: Royal Purple/Violet */
  --color-accent-50: #f5f3ff;
  --color-accent-100: #ede9fe;
  --color-accent-200: #ddd6fe;
  --color-accent-300: #c4b5fd;
  --color-accent-400: #a78bfa;
  --color-accent-500: #8b5cf6;
  --color-accent-600: #7c3aed;
  --color-accent-700: #6d28d9;
  --color-accent-800: #5b21b6;
  --color-accent-900: #4c1d95;

  /* Semantic Colors */
  --color-success: #22c55e;
  --color-success-light: #bbf7d0;
  --color-warning: #f59e0b;
  --color-warning-light: #fef3c7;
  --color-error: #ef4444;
  --color-error-light: #fee2e2;
  --color-info: #3b82f6;
  --color-info-light: #dbeafe;

  /* ============================================
   * BACKGROUND COLORS
   * ============================================ */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-gradient: radial-gradient(circle at 50% 0%, #ffffff 0%, #f1f5f9 100%);

  /* Glass Effect Backgrounds */
  --bg-glass: rgba(255, 255, 255, 0.7);
  --bg-glass-hover: rgba(255, 255, 255, 0.9);
  --bg-glass-border: rgba(255, 255, 255, 0.4);

  /* ============================================
   * TEXT COLORS
   * ============================================ */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  --text-muted: #cbd5e1;
  --text-inverse: #ffffff;

  /* ============================================
   * BORDER COLORS
   * ============================================ */
  --border-color: #e2e8f0;
  --border-color-light: #f1f5f9;
  --border-color-dark: #cbd5e1;

  /* ============================================
   * SPACING SCALE
   * ============================================ */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  /* ============================================
   * TYPOGRAPHY
   * ============================================ */
  --font-family: 'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */

  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-black: 900;

  /* Line Heights */
  --leading-none: 1;
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;

  /* ============================================
   * BORDER RADIUS
   * ============================================ */
  --radius-sm: 0.25rem;  /* 4px */
  --radius-md: 0.5rem;   /* 8px */
  --radius-lg: 0.75rem;  /* 12px */
  --radius-xl: 1rem;     /* 16px */
  --radius-2xl: 1.5rem;  /* 24px */
  --radius-3xl: 2rem;    /* 32px */
  --radius-full: 9999px;

  /* ============================================
   * SHADOWS
   * ============================================ */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);

  /* Colored Shadows */
  --shadow-primary: 0 10px 15px -3px rgb(244 63 94 / 0.2);
  --shadow-accent: 0 10px 15px -3px rgb(139 92 246 / 0.2);

  /* ============================================
   * TRANSITIONS
   * ============================================ */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-slower: 500ms ease;

  /* ============================================
   * Z-INDEX SCALE
   * ============================================ */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-fixed: 30;
  --z-modal-backdrop: 40;
  --z-modal: 50;
  --z-popover: 60;
  --z-tooltip: 70;
  --z-toast: 80;
  --z-max: 9999;

  /* ============================================
   * TOUCH TARGETS (Accessibility)
   * ============================================ */
  --touch-target-min: 44px;
}

/* ============================================
 * DARK MODE OVERRIDES
 * ============================================ */
.dark {
  /* Primary: Muted for dark mode */
  --color-primary-50: #4c0519;
  --color-primary-100: #831843;
  --color-primary-200: #9f1239;
  --color-primary-300: #be123c;
  --color-primary-400: #e11d48;
  --color-primary-500: #f43f5e;
  --color-primary-600: #fb7185;
  --color-primary-700: #fda4af;
  --color-primary-800: #fecdd3;
  --color-primary-900: #ffe4e6;

  /* Accent: Muted for dark mode */
  --color-accent-50: #2e1065;
  --color-accent-100: #4c1d95;
  --color-accent-200: #5b21b6;
  --color-accent-300: #6d28d9;
  --color-accent-400: #7c3aed;
  --color-accent-500: #8b5cf6;
  --color-accent-600: #a78bfa;
  --color-accent-700: #c4b5fd;
  --color-accent-800: #ddd6fe;
  --color-accent-900: #ede9fe;

  /* Backgrounds */
  --bg-primary: #000000;
  --bg-secondary: #0a0a0a;
  --bg-tertiary: #171717;
  --bg-gradient: radial-gradient(circle at 50% 0%, #1a1a1a 0%, #000000 100%);

  /* Glass Effect */
  --bg-glass: rgba(23, 23, 23, 0.6);
  --bg-glass-hover: rgba(23, 23, 23, 0.8);
  --bg-glass-border: rgba(255, 255, 255, 0.1);

  /* Text */
  --text-primary: #fafafa;
  --text-secondary: #a1a1aa;
  --text-tertiary: #71717a;
  --text-muted: #52525b;

  /* Borders */
  --border-color: #262626;
  --border-color-light: #171717;
  --border-color-dark: #404040;

  /* Shadows (darker for dark mode) */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4);
}
```

**Step 3: Update index.css to import tokens**

At the top of `src/index.css`, add:
```css
@import './styles/tokens.css';
```

**Step 4: Verify tokens work**

Run:
```bash
npm run dev
```

Expected: App loads without CSS errors

**Step 5: Commit**

```bash
git add src/styles/tokens.css src/index.css
git commit -m "feat: add centralized design tokens for consistent theming"
```

---

## Task 5: Migrate Tailwind CSS v3 to v4

**Goal:** Upgrade to Tailwind v4 for better performance and CSS-first configuration.

**Files:**
- Modify: `package.json`
- Delete: `tailwind.config.js`
- Create: `src/styles/tailwind.css`
- Modify: `src/index.css`
- Modify: `vite.config.ts`

**⚠️ WARNING: This is a breaking change. Test thoroughly after migration.**

**Step 1: Install Tailwind v4**

Run:
```bash
npm uninstall tailwindcss postcss autoprefixer
npm install tailwindcss@next @tailwindcss/vite@next --save-dev
```

Expected: Tailwind v4 installed

**Step 2: Create new Tailwind CSS file**

Create file `src/styles/tailwind.css`:
```css
@import "tailwindcss";

/* 
 * Tailwind v4 Configuration
 * All customization now done via CSS @theme directive
 */

@theme {
  /* Colors - using our design tokens */
  --color-primary-50: var(--color-primary-50);
  --color-primary-100: var(--color-primary-100);
  --color-primary-200: var(--color-primary-200);
  --color-primary-300: var(--color-primary-300);
  --color-primary-400: var(--color-primary-400);
  --color-primary-500: var(--color-primary-500);
  --color-primary-600: var(--color-primary-600);
  --color-primary-700: var(--color-primary-700);
  --color-primary-800: var(--color-primary-800);
  --color-primary-900: var(--color-primary-900);

  --color-accent-50: var(--color-accent-50);
  --color-accent-100: var(--color-accent-100);
  --color-accent-200: var(--color-accent-200);
  --color-accent-300: var(--color-accent-300);
  --color-accent-400: var(--color-accent-400);
  --color-accent-500: var(--color-accent-500);
  --color-accent-600: var(--color-accent-600);
  --color-accent-700: var(--color-accent-700);
  --color-accent-800: var(--color-accent-800);
  --color-accent-900: var(--color-accent-900);

  /* Custom colors */
  --color-bg-primary: var(--bg-primary);
  --color-bg-secondary: var(--bg-secondary);
  --color-text-primary: var(--text-primary);
  --color-text-secondary: var(--text-secondary);
  --color-border: var(--border-color);

  /* Font family */
  --font-sans: var(--font-family);

  /* Animations */
  --animate-fade-in: fadeIn 0.3s ease-in-out;
  --animate-slide-up: slideUp 0.3s ease-out;
  --animate-bounce-gentle: bounceGentle 0.5s ease-in-out;
  --animate-confetti: confetti 1s ease-out forwards;
  --animate-blob: blob 7s infinite;
}

/* Custom keyframes */
@keyframes fadeIn {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes slideUp {
  0% { transform: translateY(20px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes bounceGentle {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes confetti {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
```

**Step 3: Update vite.config.ts**

Find in `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
```

Replace with:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
```

Find the plugins array and update:
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ... rest of config
})
```

**Step 4: Update index.css**

Replace the entire `src/index.css` with:
```css
@import './styles/tailwind.css';
@import './styles/tokens.css';

@layer base {
  body {
    background: var(--bg-gradient);
    background-color: var(--bg-primary); 
    background-attachment: fixed;
    background-size: cover;
    color: var(--text-primary);
    transition: color 0.5s, background-color 0.5s;
    
    font-family: var(--font-family);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    margin: 0;
    min-height: 100vh;
  }

  ::selection {
    background: var(--color-primary-200);
    color: var(--color-primary-900);
  }

  .dark ::selection {
    background: var(--color-primary-700);
    color: var(--color-primary-50);
  }

  h1, h2, h3, h4, h5, h6 {
    letter-spacing: -0.025em;
    font-weight: 700;
  }

  * {
    outline: none;
  }

  *:focus-visible {
    outline: 2px solid var(--color-primary-400);
    outline-offset: 2px;
  }

  /* Improved Touch Targets */
  button,
  a,
  input[type="checkbox"],
  input[type="radio"] {
    min-height: 44px;
    min-width: 44px;
  }
}

@layer utilities {
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .text-balance {
    text-wrap: balance;
  }

  /* Premium Glassmorphism */
  .glass-effect {
    background: var(--bg-glass);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: 1px solid var(--bg-glass-border);
    box-shadow: var(--shadow-lg);
  }

  /* Card Hover Effects */
  .hover-card {
    transition: all 0.3s ease;
  }

  .hover-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-xl), 0 0 0 1px var(--color-primary-500, 0.1);
  }

  /* Text Gradients */
  .text-gradient {
    background: linear-gradient(to right, var(--color-primary-500), var(--color-accent-500));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .text-gradient-gold {
    background: linear-gradient(to right, #fbbf24, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Animation delays */
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  
  .animation-delay-4000 {
    animation-delay: 4s;
  }

  /* Hide scrollbar */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}
```

**Step 5: Delete old tailwind.config.js**

Run:
```bash
rm tailwind.config.js
```

**Step 6: Test the build**

Run:
```bash
npm run dev
```

Expected: App loads with all styles intact

**Step 7: Run production build**

Run:
```bash
npm run build
```

Expected: Build succeeds without errors

**Step 8: Commit**

```bash
git add package.json package-lock.json src/styles/tailwind.css src/index.css vite.config.ts
git rm tailwind.config.js
git commit -m "feat: migrate to Tailwind CSS v4 with CSS-first configuration"
```

---

## Task 6: Enable React Compiler

**Goal:** Enable React Compiler for automatic memoization and reduced boilerplate.

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`

**Step 1: Install React Compiler plugin**

Run:
```bash
npm install @vitejs/plugin-react-swc@latest --save-dev
```

Expected: Plugin installed

**Step 2: Update vite.config.ts for React Compiler**

Find in `vite.config.ts`:
```typescript
import react from '@vitejs/plugin-react'
```

Replace with:
```typescript
import react from '@vitejs/plugin-react-swc'
```

Update the plugin call:
```typescript
plugins: [
  react({
    // Enable React Compiler (automatic memoization)
    jsxImportSource: 'react',
  }),
  tailwindcss(),
],
```

**Step 3: Test the build**

Run:
```bash
npm run dev
```

Expected: App loads correctly with SWC + React Compiler

**Step 4: Run tests**

Run:
```bash
npm test
```

Expected: All tests pass

**Step 5: Commit**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "feat: enable React Compiler via SWC for automatic memoization"
```

---

## Task 7: Update TypeScript Configuration

**Goal:** Ensure TypeScript config is optimized for React 19 and new tooling.

**Files:**
- Modify: `tsconfig.json`
- Modify: `tsconfig.app.json` (if exists)

**Step 1: Check current TypeScript config**

Run:
```bash
cat tsconfig.json
```

**Step 2: Update tsconfig.json for React 19**

Ensure these settings are present:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**Step 3: Run type check**

Run:
```bash
npm run typecheck
```

Expected: No type errors

**Step 4: Commit**

```bash
git add tsconfig.json
git commit -m "chore: update TypeScript config for React 19 strict mode"
```

---

## Task 8: Final Verification & Cleanup

**Goal:** Ensure everything works together and clean up any remaining issues.

**Step 1: Run full test suite**

Run:
```bash
npm test
```

Expected: All tests pass

**Step 2: Run lint**

Run:
```bash
npm run lint
```

Expected: No errors (warnings acceptable)

**Step 3: Run production build**

Run:
```bash
npm run build
```

Expected: Build succeeds

**Step 4: Preview production build**

Run:
```bash
npm run preview
```

Manual test:
1. Open the preview URL
2. Test all major features:
   - Home page loads
   - Pet page works
   - Challenges page works
   - Settings page works
   - Theme toggle works
   - Share functionality works

**Step 5: Check bundle size**

Run:
```bash
ls -lh dist/assets/
```

Expected: Reasonable bundle sizes (main JS < 500KB)

**Step 6: Final commit**

```bash
git add -A
git commit -m "chore: Phase 1 foundation complete - dependencies updated, Tailwind v4, design tokens"
```

---

## Verification Checklist

After completing all tasks, verify:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` succeeds
- [ ] `npm test` passes all tests
- [ ] `npm run lint` shows no errors
- [ ] Theme toggle (light/dark) works
- [ ] Share functionality works
- [ ] All pages render correctly
- [ ] No console errors in browser
- [ ] Bundle size is reasonable

---

## Rollback Plan

If critical issues arise:

1. **Tailwind v4 issues**: Revert to v3
   ```bash
   git revert HEAD~1  # Revert Tailwind commit
   npm install tailwindcss@3 postcss autoprefixer --save-dev
   ```

2. **React Compiler issues**: Disable it
   ```bash
   git revert HEAD~1  # Revert compiler commit
   npm install @vitejs/plugin-react --save-dev
   ```

3. **html-to-image issues**: Revert to html2canvas
   ```bash
   npm uninstall html-to-image
   npm install html2canvas @types/html2canvas
   ```

---

## Next Steps After Phase 1

Once Phase 1 is complete and verified:

1. **Phase 2**: Architecture refactor (service layer, state separation)
2. **Phase 3**: UI/UX overhaul (component library, standardization)
3. **Phase 4**: Minigame expansion (achievements, new games)
4. **Phase 5**: Advanced PWA (background sync, push notifications)

---

**Plan saved to:** `docs/plans/2026-03-11-phase1-foundation.md`
