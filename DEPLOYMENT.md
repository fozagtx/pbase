# Deployment Guide

## Vercel Deployment (Recommended)

### GitHub Import Settings

When importing your repository to Vercel:

**Framework Preset:** Vite

**Root Directory:** `apps/frontend` ⚠️ Important!

**Build Settings:**
- Leave default (handled by vercel.json)

**Important:** The project includes a `vercel.json` file that handles:
- Yarn workspace installation from monorepo root
- Proper build command execution
- This ensures `@repo/config-contract` dependency is resolved

### Environment Variables

Add in Vercel dashboard under Settings → Environment Variables:

```
VITE_THOR_URL=https://testnet.vechain.org
```

### Why Root Directory = `apps/frontend`?

Your project is a monorepo with this structure:
```
pbase/
├── apps/
│   ├── contracts/
│   └── frontend/    ← Deploy this
├── packages/
└── ...
```

Since the frontend app is in `apps/frontend`, you MUST set this as the root directory. Otherwise Vercel will try to build from the project root and fail.

### Step-by-Step Vercel Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your GitHub repo
   - Configure settings:
     - **Root Directory:** `apps/frontend`
     - **Framework:** Vite
     - **Build Command:** `yarn build`
     - **Output Directory:** `dist`

3. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add: `VITE_THOR_URL` = `https://testnet.vechain.org`

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🚀

---

## Netlify Deployment (Alternative)

### Option 1: Drag and Drop (Fastest)
1. Build locally: `cd apps/frontend && yarn build`
2. Go to https://app.netlify.com/drop
3. Drag the `apps/frontend/dist` folder
4. Done!

### Option 2: CLI Deployment
```bash
cd apps/frontend
./deploy.sh
```

### Option 3: GitHub Integration
1. Push to GitHub
2. Go to https://app.netlify.com/
3. Click "Add new site" → "Import an existing project"
4. Configure:
   - **Base directory:** `apps/frontend`
   - **Build command:** `yarn build`
   - **Publish directory:** `dist`
5. Add environment variable: `VITE_THOR_URL=https://testnet.vechain.org`

---

## Important Notes

### Package Manager
- ✅ **Use Yarn** - Your project has `yarn.lock`
- ❌ Don't use npm - This will cause dependency issues

### Monorepo Structure
Since this is a monorepo (multiple apps/packages), you must specify the root directory as `apps/frontend` when deploying. The deployment platform needs to know which app to build.

### Environment Variables
Always set `VITE_THOR_URL=https://testnet.vechain.org` in your deployment platform's environment variables.

---

## Troubleshooting

**Build fails with "command not found":**
- Make sure you selected Yarn as package manager
- Check that root directory is `apps/frontend`

**Missing environment variables:**
- Add `VITE_THOR_URL` in deployment settings
- Restart the build

**Import errors for `@repo/config-contract`:**
- This is handled by yarn workspaces
- Make sure yarn.lock is committed
- Vercel/Netlify will install all workspace dependencies

---

## Contract Address

Make sure your deployed frontend points to the correct contract:
- **Network:** VeChain Testnet
- **Contract Address:** `0xdf2a8b836baacb63fc6c1ccd51e7cbecec0df30e`

This is configured in `packages/config-contract/config.ts`
