# Deployment Configuration

## Overview
This project uses a dual-deployment strategy:
- **Dev branch** → GitHub Pages (https://melihzafer.github.io/lovelevel/)
- **Main branch** → Netlify (custom domain)

## Why Two Deployments?

### Dev Branch (GitHub Pages)
- **Purpose**: Development testing and preview
- **Updates**: Automatic on every push to `dev`
- **Use case**: Test features before merging to main
- **Base path**: `/lovelevel/` (GitHub Pages subpath)

### Main Branch (Netlify)
- **Purpose**: Production deployment
- **Updates**: Automatic on every push to `main`
- **Use case**: Stable, tested features for users
- **Base path**: `/` (root domain)

## Files Explained

### `.github/workflows/deploy-dev.yml`
GitHub Actions workflow that:
1. Triggers on push to `dev` branch
2. Installs dependencies with `npm ci`
3. Builds production bundle with `npm run build`
4. **Adds `.nojekyll` file** to prevent Jekyll from ignoring `_` prefixed files
5. Deploys to GitHub Pages

**Why `.nojekyll` is critical:**
- Vite generates files with `_` prefix (like `_app`)
- GitHub Pages uses Jekyll by default
- Jekyll ignores files starting with `_`
- Without `.nojekyll`, your app breaks with 404 errors on assets

### `netlify.toml`
Netlify configuration that:
1. Uses `npm run build:netlify` command
2. Sets base path to `/` instead of `/lovelevel/`
3. Handles SPA routing (redirects all to index.html)
4. Adds security headers

### `vite.config.ts`
Main build configuration:
- Default `base: '/lovelevel/'` for GitHub Pages
- Overridden by `vite.config.netlify.ts` for Netlify builds

### `vite.config.netlify.ts`
Netlify-specific configuration:
- Sets `base: '/'` for root domain deployment
- Used by `npm run build:netlify` command

## Workflow

### Development Cycle
```bash
# Work on dev branch
git checkout dev

# Make changes, commit
git add .
git commit -m "feat: add new feature"

# Push to GitHub
git push origin dev

# Automatic deployment to GitHub Pages starts
# Visit: https://melihzafer.github.io/lovelevel/
```

### Production Release
```bash
# After testing on dev, merge to main
git checkout main
git merge dev

# Push to GitHub
git push origin main

# Automatic deployment to Netlify starts
# Visit your Netlify URL
```

## Setup Checklist

### GitHub Pages (One-time setup)
- [x] Create `.github/workflows/deploy-dev.yml`
- [ ] Go to repository Settings → Pages
- [ ] Set Source to "GitHub Actions"
- [ ] Push to `dev` branch to trigger first deployment
- [ ] Wait 2-3 minutes for deployment
- [ ] Visit: https://melihzafer.github.io/lovelevel/

### Netlify (One-time setup)
- [x] Create `netlify.toml` configuration
- [x] Create `vite.config.netlify.ts`
- [x] Add `build:netlify` script to `package.json`
- [ ] Connect repository to Netlify
- [ ] Set branch to `main`
- [ ] Set build command to `npm run build:netlify`
- [ ] Set publish directory to `dist`
- [ ] Push to `main` branch
- [ ] Visit your Netlify URL

## Troubleshooting

### GitHub Pages shows 404 on assets
**Cause**: Missing `.nojekyll` file
**Solution**: The workflow now automatically adds it. Redeploy by pushing to `dev`.

### GitHub Actions workflow fails
**Cause**: Missing permissions
**Solution**: 
1. Go to Settings → Actions → General
2. Under "Workflow permissions", select "Read and write permissions"
3. Enable "Allow GitHub Actions to create and approve pull requests"

### Netlify build fails
**Cause**: Missing `vite.config.netlify.ts` or wrong command
**Solution**: 
1. Verify `vite.config.netlify.ts` exists
2. Check `package.json` has `"build:netlify": "vite build --config vite.config.netlify.ts"`
3. Netlify settings use `npm run build:netlify`

### App works on dev but not on main
**Cause**: Different base paths
**Solution**: 
- Dev: Uses `/lovelevel/` (GitHub Pages subpath)
- Main: Uses `/` (Netlify root domain)
- Both are correct for their platforms

## Monitoring

### GitHub Pages Deployment
- Check status: https://github.com/melihzafer/lovelevel/actions
- View logs: Click on the workflow run
- Typical duration: 2-3 minutes

### Netlify Deployment
- Check status: Netlify dashboard
- View logs: Click on the deploy
- Typical duration: 1-2 minutes

## Best Practices

1. **Always test on dev first**
   - Push to `dev` branch
   - Test on GitHub Pages
   - Verify everything works

2. **Merge to main only when stable**
   - Dev deployment successful
   - Features tested and verified
   - No critical bugs

3. **Keep branches in sync**
   - Regularly merge main back to dev
   - Avoid large divergence
   - Use pull requests for reviews

4. **Monitor deployments**
   - Check GitHub Actions for dev
   - Check Netlify dashboard for main
   - Review logs if issues occur

## Quick Commands

```bash
# Check current branch
git branch

# Switch to dev
git checkout dev

# Switch to main
git checkout main

# View deployment status
# GitHub: https://github.com/melihzafer/lovelevel/actions
# Netlify: Check your dashboard

# Force redeploy dev
git commit --allow-empty -m "trigger deploy"
git push origin dev

# Force redeploy main
git commit --allow-empty -m "trigger deploy"
git push origin main
```

## Summary

✅ **Dev branch**: Automatic deployment to GitHub Pages with `.nojekyll`
✅ **Main branch**: Automatic deployment to Netlify with custom domain
✅ **No manual intervention**: Push and deploy automatically
✅ **Separate testing**: Test on dev before releasing to main
