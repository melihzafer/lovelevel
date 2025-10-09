# Setup & Deployment Guide

## 🚀 Deployment Options

### Option 1: Netlify (Recommended)

**Why Netlify?**
- Free tier with generous limits
- Automatic HTTPS
- Built-in CI/CD from Git
- Excellent PWA support
- Custom domains

**Steps:**

1. **Via Netlify CLI**
   \`\`\`bash
   # Install Netlify CLI globally
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Build the project
   npm run build
   
   # Deploy
   netlify deploy --prod
   \`\`\`

2. **Via Netlify Dashboard**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your Git repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Via Netlify Drop**
   - Build locally: `npm run build`
   - Go to [Netlify Drop](https://app.netlify.com/drop)
   - Drag and drop the `dist/` folder

**Configuration:**

Create `netlify.toml` in project root (optional):
\`\`\`toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"

[[headers]]
  for = "/manifest.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"
\`\`\`

---

### Option 2: Vercel

**Why Vercel?**
- Excellent Next.js integration (if migrating)
- Fast global CDN
- Automatic HTTPS
- Preview deployments
- Free tier

**Steps:**

1. **Via Vercel CLI**
   \`\`\`bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login
   vercel login
   
   # Deploy
   vercel --prod
   \`\`\`

2. **Via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Import Git repository
   - Framework: Vite
   - Build settings will auto-detect
   - Click "Deploy"

**Configuration:**

Create `vercel.json` (optional):
\`\`\`json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    }
  ]
}
\`\`\`

---

### Option 3: Firebase Hosting

**Why Firebase?**
- Google infrastructure
- Integrated with Firebase services
- Custom domains
- Free SSL
- Excellent caching control

**Steps:**

\`\`\`bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize project
firebase init hosting

# When prompted:
# - Public directory: dist
# - Configure as SPA: Yes
# - Set up automatic builds: No

# Build the app
npm run build

# Deploy
firebase deploy --only hosting
\`\`\`

**Configuration:**

Edit `firebase.json`:
\`\`\`json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/sw.js",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
\`\`\`

---

### Option 4: GitHub Pages

**Why GitHub Pages?**
- Free hosting for public repos
- Direct Git integration
- Custom domains supported

**Steps:**

1. Install GitHub Pages plugin:
   \`\`\`bash
   npm install --save-dev gh-pages
   \`\`\`

2. Update `package.json`:
   \`\`\`json
   {
     "homepage": "https://yourusername.github.io/couplove",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   \`\`\`

3. Deploy:
   \`\`\`bash
   npm run deploy
   \`\`\`

4. Enable GitHub Pages in repo settings → Pages → Source: gh-pages branch

**Note**: Update `vite.config.ts` base path:
\`\`\`typescript
export default defineConfig({
  base: '/couplove/', // Match your repo name
  // ... other config
})
\`\`\`

---

## 🔐 Environment Variables

For future enhancements (cloud sync, analytics, etc.), create `.env`:

\`\`\`bash
# Example for future features
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_SENTRY_DSN=your_sentry_dsn
\`\`\`

**Important**: Never commit `.env` to Git. Use `.env.example` for documentation.

---

## 📱 PWA Requirements

All hosting platforms must provide:

1. **HTTPS** (automatic on all platforms above)
2. **Service Worker** support (automatic)
3. **Manifest** served with correct MIME type

**Verification:**

After deployment, test with:
- Chrome DevTools → Lighthouse → PWA audit
- [PWA Builder](https://www.pwabuilder.com/)
- Install prompt should appear on mobile/desktop

---

## 🧪 Pre-Deployment Checklist

- [ ] Run production build: `npm run build`
- [ ] Test locally: `npm run preview`
- [ ] Check for console errors
- [ ] Test offline mode (DevTools → Application → Offline)
- [ ] Verify Service Worker registration
- [ ] Test on mobile device (use ngrok or local network IP)
- [ ] Run Lighthouse audit (PWA ≥95, Performance ≥90)
- [ ] Test install prompt on desktop and mobile
- [ ] Verify manifest.webmanifest loads correctly
- [ ] Test JSON export/import functionality

---

## 🌍 Custom Domain Setup

### Netlify

1. Go to Site Settings → Domain Management
2. Click "Add custom domain"
3. Follow DNS configuration instructions

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as shown

### Firebase

1. Run `firebase hosting:channel:deploy production --site yourdomain.com`
2. Follow custom domain setup in Firebase Console

---

## 🔄 CI/CD Setup

### GitHub Actions (Example)

Create `.github/workflows/deploy.yml`:

\`\`\`yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Netlify
        uses: nwtgck/actions-netlify@v2
        with:
          publish-dir: './dist'
          production-deploy: true
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
\`\`\`

---

## 📊 Monitoring

### Lighthouse CI

\`\`\`bash
# Install
npm install -g @lhci/cli

# Run
lhci autorun --upload.target=temporary-public-storage
\`\`\`

### Sentry (Error Tracking)

\`\`\`bash
npm install @sentry/react @sentry/vite-plugin
\`\`\`

Add to `src/main.tsx`:
\`\`\`typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
\`\`\`

---

## 🆘 Troubleshooting Deployment

### Build Fails

- Check Node version: `node --version` (must be 20.19+ or 22.12+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for missing dependencies

### Service Worker Not Registering

- Ensure HTTPS (required for SW)
- Check browser console for errors
- Verify `sw.js` is in build output
- Clear cache and hard refresh

### PWA Install Prompt Not Showing

- Verify manifest is valid (DevTools → Application → Manifest)
- Ensure all required icons exist
- Check Service Worker is registered
- Must be on HTTPS (or localhost)
- Some browsers require user engagement before showing prompt

---

**Need help?** Check the main README troubleshooting section or open an issue on GitHub.
