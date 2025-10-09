# Quick Start Guide

## ⚠️ Important: Node.js Version

**Before starting, ensure you have Node.js v20.19+ or v22.12+ installed.**

Check your version:
\`\`\`bash
node --version
\`\`\`

If you're on Node 21.x or older, upgrade first:

### Using nvm (Recommended)
\`\`\`bash
# Install Node 22 (LTS)
nvm install 22
nvm use 22

# Verify
node --version  # Should show v22.x.x
\`\`\`

### Direct Download
Download from [nodejs.org](https://nodejs.org/) - choose the LTS version (20.x or 22.x).

---

## 🚀 5-Minute Setup

\`\`\`bash
# 1. Navigate to project
cd LoveLevel

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open your browser
# Visit: http://localhost:5173
\`\`\`

---

## 📱 First Run

When you open the app:

1. **Onboarding Step 1**: Enter partner names and relationship start date
2. **Onboarding Step 2**: Name your virtual pet
3. **Onboarding Step 3**: Enable notifications (optional)
4. **Welcome!** You're ready to start your journey

---

## ✅ Quick Feature Tour

### Home Page
- See total days together
- View current month count
- Check next milestone countdown

### Challenges
- Browse 20+ pre-loaded challenges
- Filter by category (At Home, Outdoors, Creative, Budget-Friendly)
- Complete challenges to earn XP
- Add notes and memories

### Pet
- Watch your pet grow as you complete challenges
- Level up to unlock items
- Tap to interact (with haptic feedback!)
- Equip accessories and backgrounds

### History
- Timeline of all your completed activities
- Track level-ups and achievements
- Review your journey together

### Settings
- Customize message templates
- Adjust XP rewards
- Toggle light/dark theme
- Export/import your data

---

## 🔧 Common Commands

\`\`\`bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run tests
npm run test:watch       # Watch mode
npm run lint             # Check code quality

# Utilities
npm run format           # Format code with Prettier
npm run typecheck        # Check TypeScript types
\`\`\`

---

## 🎯 Next Steps

### 1. Personalize Your App
- **Settings** → Edit partner names
- **Settings** → Customize anniversary message
- **Challenges** → Add your own custom challenges

### 2. Test PWA Features
\`\`\`bash
# Build and test PWA
npm run build
npm run preview

# In Chrome: Click install icon in address bar
# Test offline: DevTools → Application → Offline
\`\`\`

### 3. Deploy (Optional)
See `setup.md` for deployment guides:
- Netlify (easiest)
- Vercel
- Firebase
- GitHub Pages

---

## 💡 Pro Tips

### Faster Development
\`\`\`bash
# Use pnpm for faster installs (optional)
npm install -g pnpm
pnpm install
pnpm dev
\`\`\`

### Hot Reload Not Working?
- Hard refresh: `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
- Clear browser cache
- Restart dev server

### Test on Mobile Device
1. Find your local IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Start dev server: `npm run dev`
3. On mobile, visit: `http://YOUR_IP:5173`
4. Make sure both devices are on the same WiFi network

### Export Your Data Regularly
- **Settings** → **Export Data**
- Copy the JSON and save it somewhere safe
- Useful for backups or transferring to another device

---

## 🐛 Troubleshooting

### "Node.js version" Error
**Error**: "Vite requires Node.js version 20.19+ or 22.12+"

**Fix**: Upgrade Node.js (see top of this guide)

### Build Fails
\`\`\`bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
\`\`\`

### Port Already in Use
**Error**: "Port 5173 is already in use"

**Fix**: Kill the process or use a different port:
\`\`\`bash
npm run dev -- --port 3000
\`\`\`

### TypeScript Errors
Some minor TS errors are expected during development. The app will still run.
To see all errors:
\`\`\`bash
npm run typecheck
\`\`\`

---

## 📚 Learn More

- **README.md** - Full feature documentation
- **setup.md** - Deployment guides
- **customize.md** - Customization options

---

## 🆘 Need Help?

1. Check the main **README.md** troubleshooting section
2. Review error messages in browser console (F12)
3. Check DevTools → Application → Service Workers for PWA issues
4. Verify you're on Node.js 20.19+ or 22.12+

---

**Ready to track your relationship journey? Let's go! 💕**

\`\`\`bash
npm run dev
\`\`\`

