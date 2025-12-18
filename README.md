# Content Scoring Application

A real-time content scoring application for team meetings where social media posts are reviewed and scored anonymously (0-10). Directors control the session flow, and results are aggregated per content creator with director-only access.

## Features

- **Anonymous Voting**: Team members vote anonymously without authentication
- **Real-time Updates**: Live score updates using Supabase Realtime
- **Director Control**: Directors control which content is being voted on
- **1-Minute Voting Windows**: Timed voting periods for each piece of content
- **Editor Performance Tracking**: Aggregate scores per content creator (director-only)
- **No Authentication Required**: Simple URL-based access with secret keys

## Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Realtime subscriptions
- **Styling**: Tailwind CSS with shadcn/ui components
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### Installation

1. Clone the repository and navigate to the project:

```bash
cd content-scoring-app
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:

   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the schema from `supabase/schema.sql`
   - Enable Realtime for the following tables:
     - `sessions`
     - `content_items`
     - `votes`

4. Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

5. Run the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating a Session

1. Go to the home page
2. Enter a session name
3. Paste content links (one per line) - Google Drive links work well
4. Optionally enter creator names (one per line, same order as links)
5. Click "Create Session"
6. You'll be redirected to the director panel with a voter URL to share

### Director View

- Share the voter URL with your team
- Click "Next Content" to advance to the next piece of content
- Each content item has a 1-minute voting window
- After all content is reviewed, click "View Editor Scores" to see performance summaries

### Voter View

- Access via the voter URL (no login required)
- View the current content being reviewed
- Vote using the 0-10 slider
- See real-time results after voting ends

### Results View

- Directors can access results via the director key
- View all content with individual vote breakdowns
- See editor performance summaries

## Database Schema

The application uses four main tables:

- `sessions`: Meeting sessions with director and voter keys
- `content_items`: Content pieces to be reviewed
- `votes`: Anonymous votes (0-10)
- `editor_scores`: Aggregated scores per content creator

See `supabase/schema.sql` for the complete schema.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The application will automatically build and deploy.

## Security Notes

- Director and voter keys are long random strings that provide access control
- No user authentication is required
- Votes are anonymous (only session IDs are stored)
- Directors can see all votes but not who voted
- Rate limiting should be added in production for vote submissions

## License

MIT

