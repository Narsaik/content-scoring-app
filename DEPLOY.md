# Vercel Deployment Guide

## Prerequisites

1. **GitHub Account** - Your code needs to be in a Git repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Supabase Project** - Already set up with schema applied

## Step 1: Initialize Git Repository (if not already done)

```bash
cd content-scoring-app
git init
git add .
git commit -m "Initial commit - Content Scoring App"
```

## Step 2: Push to GitHub

1. Create a new repository on GitHub
2. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

5. **Add Environment Variables**:
   Click "Environment Variables" and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` = Your Supabase service role key (keep secret!)

6. Click **"Deploy"**

### Option B: Via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Link to existing project? No (first time)
   - Project name: content-scoring-app (or your choice)
   - Directory: ./
   - Override settings? No

5. Add environment variables:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

1. After deployment, Vercel will provide you with a URL like:
   `https://content-scoring-app.vercel.app`

2. Visit the URL and test:
   - Create a new session
   - Share the voter URL
   - Test voting functionality

## Environment Variables Reference

Make sure these are set in Vercel:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase Dashboard → Settings → API → anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret!) | Supabase Dashboard → Settings → API → service_role key |

## Post-Deployment Checklist

- [ ] Verify the app loads at your Vercel URL
- [ ] Test creating a new session
- [ ] Test voting functionality
- [ ] Verify real-time updates work
- [ ] Check that Supabase Realtime is enabled
- [ ] Test director panel access
- [ ] Test results page

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18+ by default)
- Check build logs in Vercel dashboard

### Environment Variables Not Working
- Ensure variables are set for "Production", "Preview", and "Development"
- Restart deployment after adding variables
- Check variable names match exactly (case-sensitive)

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure schema has been applied

### Realtime Not Working
- Verify Realtime is enabled in Supabase dashboard
- Check WebSocket connections in browser console
- Ensure Supabase URL uses `https://` protocol

## Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Follow DNS configuration instructions

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

No additional configuration needed!

