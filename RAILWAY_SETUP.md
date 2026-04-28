# Railway Deployment Guide for TECHNOVAN API

## Step 1: Push to GitHub

```bash
cd /Users/apple/Documents/GitHub/Technovan
git add -A
git commit -m "Add Dockerfile and deployment config"
git push origin main
```

## Step 2: Set Up Railway

1. Go to https://railway.app
2. **Sign up** with GitHub (recommended)
3. Click **New Project** → **Deploy from GitHub repo**
4. Select your **Technovan** repository
5. Select the **backend/api** directory as the root
6. Click **Deploy**

## Step 3: Configure Environment Variables

In Railway Dashboard:
1. Click your deployed project
2. Go to **Variables** tab
3. Add these environment variables:
   - `DATABASE_URL` = `postgresql://neondb_owner:npg_HXdB7hk8ipVP@ep-quiet-bonus-am4ungig-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `JWT_SECRET` = (any random string, e.g., `your-secret-key-12345`)
   - `NODE_ENV` = `production`
   - `PORT` = `3000`

4. Click **Deploy**

## Step 4: Get Your API URL

1. In Railway Dashboard, find your project
2. Click **Domains** 
3. Copy the auto-generated domain (e.g., `https://technovan-api-prod.railway.app`)
4. Your API is at: `https://your-domain.railway.app/api`

## Step 5: Update Frontend

Update the frontend API URL in `backend/api/public/index.html`:

```javascript
// Change from:
const API='/api';

// To:
const API='https://your-domain.railway.app/api';
```

Then rebuild and deploy to Cloudflare Pages:

```bash
cd /Users/apple/Documents/GitHub/Technovan
rm -rf dist && mkdir -p dist && cp -R backend/api/public/. dist/ && cp -f _headers dist/ && cp -f _redirects dist/ && npx wrangler pages deploy dist --project-name=technovan
```

## Done!

Your full-stack app is now live:
- **Frontend:** https://www.technovand.com (Cloudflare Pages)
- **API:** https://your-railway-domain.railway.app (Railway)
