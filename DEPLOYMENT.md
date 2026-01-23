# Deployment Guide

This project is configured for automatic deployment to Vercel on every push to the `main` branch.

## Quick Setup (Recommended)

### Option 1: Vercel GitHub Integration (Easiest)

1. **Sign in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "Add New Project"
   - Select "Import Git Repository"
   - Choose: `LuuNguyen0811/hipvan_canvas_drag`
   - Click "Import"

3. **Configure & Deploy**
   - Framework: Next.js (auto-detected)
   - Leave default settings
   - Click "Deploy"

4. **Automatic Deployments**
   - ✅ Every push to `main` → Production deployment
   - ✅ Every PR → Preview deployment
   - ✅ Automatic HTTPS
   - ✅ Custom domain support (optional)

**That's it!** Your site will be live at: `https://your-project.vercel.app`

---

## Option 2: GitHub Actions (Advanced)

If you prefer more control via GitHub Actions:

### Setup Steps:

1. **Get Vercel Tokens**
   ```bash
   # Install Vercel CLI if not already installed
   npm i -g vercel
   
   # Login to Vercel
   vercel login
   
   # Link project
   vercel link
   
   # Get tokens
   vercel project ls
   ```

2. **Add GitHub Secrets**
   - Go to your GitHub repo: Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Get from Vercel Dashboard → Settings → Tokens
     - `VERCEL_ORG_ID`: Found in `.vercel/project.json` after running `vercel link`
     - `VERCEL_PROJECT_ID`: Found in `.vercel/project.json` after running `vercel link`

3. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add auto-deployment configuration"
   git push origin main
   ```

4. **Verify**
   - Check GitHub Actions tab in your repository
   - Workflow will run on every push to main

---

## Manual Deployment

If you want to deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Environment Variables

If your app needs environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add your variables (e.g., `API_KEY`, `DATABASE_URL`)
3. Redeploy for changes to take effect

---

## Custom Domain

To add a custom domain:

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain
3. Update DNS settings as instructed

---

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Ensure all dependencies are in `package.json`
- Test build locally: `npm run build`

### Environment Issues
- Verify environment variables are set correctly
- Check Vercel Dashboard → Settings → Environment Variables

### GitHub Integration Issues
- Re-install Vercel GitHub app
- Check repository permissions

---

## Current Configuration

- ✅ `vercel.json` - Vercel configuration
- ✅ `.github/workflows/deploy.yml` - GitHub Actions workflow
- ✅ Automatic deployment on push to `main`
- ✅ Preview deployments for PRs
