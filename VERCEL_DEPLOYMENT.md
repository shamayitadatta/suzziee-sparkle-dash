# Vercel Deployment Guide

## Setup Instructions

### 1. Prerequisites
- GitHub repository created with this code pushed
- Vercel account (https://vercel.com)

### 2. Deploy to Vercel

#### Option A: Deploy from GitHub (Recommended)
1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Connect your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`
5. Configure environment variables (see section below)
6. Click "Deploy"

#### Option B: Deploy with CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### 3. Environment Variables

Add these to Vercel project settings under **Settings → Environment Variables**:

| Variable | Value | Required |
|----------|-------|----------|
| `VITE_API_HOST` | Your API endpoint | No (optional) |
| `NODE_ENV` | `production` | Auto-set |

### 4. Deployment Configuration

The `vercel.json` file contains:
- **buildCommand**: `npm run build` - Builds your React app
- **outputDirectory**: `.output/public` - Where built files are served from
- **rewrites**: Routes all requests to `index.html` (fixes 404 errors)
- **headers**: Caches assets for performance

### 5. Troubleshooting

**404 Errors:**
- ✅ Fixed by the rewrite rule in `vercel.json`
- Ensure `vercel.json` is in the root directory

**Build Fails:**
- Check disk space: `npm run build` requires ~500MB
- Clear cache: `rm -rf node_modules .output && npm install`
- Check Node version: Vercel uses Node 20.x by default

**Missing Assets:**
- Ensure `.output/public` directory is generated
- Check that CSS/JS files are built correctly

### 6. Post-Deployment

- Check deployment logs in Vercel dashboard
- Visit your domain to verify the app loads
- Test client-side routing (navigate between pages)
- Monitor performance in Vercel Analytics dashboard

## Local Testing

Before deploying, test locally:
```bash
npm run build
npm run preview
```

This runs a local preview of the production build.
