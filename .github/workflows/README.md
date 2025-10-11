# Deployment Workflows

## Branch Strategy

### Dev Branch → GitHub Pages
- **Branch**: `dev`
- **Workflow**: `.github/workflows/deploy-dev.yml`
- **URL**: https://melihzafer.github.io/lovelevel/
- **Trigger**: Automatic on push to `dev`
- **Build**: 
  - `npm ci` (clean install)
  - `npm run build` (Vite production build)
  - Adds `.nojekyll` to prevent Jekyll processing
  - Deploys `dist/` directory to GitHub Pages

### Main Branch → Netlify
- **Branch**: `main`
- **Config**: `netlify.toml`
- **URL**: Custom Netlify domain
- **Trigger**: Automatic on push to `main`
- **Build**: Configured in Netlify dashboard and `netlify.toml`

## Workflow Details

### GitHub Actions (dev branch)
The workflow uses GitHub's official actions:
- `actions/checkout@v4` - Clone repository
- `actions/setup-node@v4` - Setup Node.js 20 with npm cache
- `actions/upload-pages-artifact@v3` - Upload build artifact
- `actions/deploy-pages@v4` - Deploy to GitHub Pages

**Important**: 
- `.nojekyll` file is added to `dist/` after build
- This prevents GitHub Pages from ignoring files with `_` prefix
- Without it, Vite assets like `_app` won't be served

### Permissions
The workflow requires specific permissions:
- `contents: read` - Read repository content
- `pages: write` - Write to GitHub Pages
- `id-token: write` - Generate deployment token

### Concurrency
Only one deployment runs at a time:
- New pushes cancel in-progress deployments
- Prevents race conditions and conflicts

## Vite Configuration

Both branches use the same `vite.config.ts`:
```typescript
base: '/lovelevel/' // GitHub Pages subpath
```

For Netlify (main branch), the base path is overridden in `netlify.toml` to use root path `/`.

## Testing Deployments

### Dev (GitHub Pages)
1. Push to `dev` branch
2. Check Actions tab: https://github.com/melihzafer/lovelevel/actions
3. Wait for workflow completion (~2-3 minutes)
4. Visit: https://melihzafer.github.io/lovelevel/

### Main (Netlify)
1. Push to `main` branch
2. Check Netlify dashboard
3. Wait for build completion
4. Visit your Netlify URL

## Troubleshooting

### GitHub Pages Issues
- **404 on assets**: Ensure `.nojekyll` exists in `dist/`
- **Workflow fails**: Check Node.js version compatibility
- **Permissions error**: Enable GitHub Pages in repository settings

### Netlify Issues
- **Build fails**: Check `netlify.toml` configuration
- **Wrong base path**: Ensure `VITE_BASE` environment variable is set
- **Missing files**: Verify `dist/` directory contents

## Setup Requirements

### GitHub Pages (First Time)
1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Push to `dev` branch to trigger first deployment

### Netlify (First Time)
1. Connect repository to Netlify
2. Branch: `main`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Set environment variable: `VITE_BASE=/`
