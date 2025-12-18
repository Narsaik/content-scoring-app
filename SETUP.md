# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Supabase**
   - Create account at [supabase.com](https://supabase.com)
   - Create a new project
   - Go to SQL Editor
   - Copy and paste the contents of `supabase/schema.sql`
   - Run the SQL script

3. **Enable Realtime**
   - Go to Database > Replication in Supabase dashboard
   - Enable replication for:
     - `sessions`
     - `content_items`
     - `votes`

4. **Configure Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials:
     - `NEXT_PUBLIC_SUPABASE_URL`: Found in Project Settings > API
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Found in Project Settings > API
     - `SUPABASE_SERVICE_ROLE_KEY`: Found in Project Settings > API (keep this secret!)

5. **Run Development Server**
   ```bash
   npm run dev
   ```

6. **Open Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Deploy

3. **Update Supabase RLS Policies (if needed)**
   - The schema includes RLS policies that allow public access
   - For production, you may want to restrict access further
   - The current setup uses keys for access control

## Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and keys are correct
- Check that the schema has been applied
- Ensure tables exist in your Supabase project

### Realtime Not Working
- Verify Realtime is enabled for the required tables
- Check browser console for WebSocket errors
- Ensure you're using the correct Supabase URL

### Voting Not Updating
- Check that votes are being inserted into the database
- Verify the realtime subscription is active
- Check browser console for errors

## Security Considerations

- Director and voter keys are long random strings - treat them as secrets
- The service role key should NEVER be exposed to the client
- Consider adding rate limiting for vote submissions in production
- For sensitive data, consider implementing additional authentication

