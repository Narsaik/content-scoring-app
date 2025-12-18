-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT,
  director_key TEXT UNIQUE NOT NULL,
  voter_key TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content items table
CREATE TABLE IF NOT EXISTS content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  title TEXT,
  link TEXT NOT NULL,
  creator_name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  current_vote_count INTEGER DEFAULT 0,
  average_score DECIMAL(3,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'voting', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_item_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
  voter_session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_item_id, voter_session_id) -- Prevent duplicate votes from same voter
);

-- Editor scores table
CREATE TABLE IF NOT EXISTS editor_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  creator_name TEXT NOT NULL,
  total_content_count INTEGER NOT NULL,
  average_score DECIMAL(3,2) NOT NULL,
  total_votes INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, creator_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_items_session_id ON content_items(session_id);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_votes_content_item_id ON votes(content_item_id);
CREATE INDEX IF NOT EXISTS idx_votes_session_id ON votes(session_id);
CREATE INDEX IF NOT EXISTS idx_editor_scores_session_id ON editor_scores(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_director_key ON sessions(director_key);
CREATE INDEX IF NOT EXISTS idx_sessions_voter_key ON sessions(voter_key);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate average score for content item
CREATE OR REPLACE FUNCTION calculate_content_average_score(content_item_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_score DECIMAL(3,2);
BEGIN
  SELECT COALESCE(AVG(score), 0) INTO avg_score
  FROM votes
  WHERE content_item_id = content_item_uuid;
  
  UPDATE content_items
  SET average_score = avg_score,
      current_vote_count = (SELECT COUNT(*) FROM votes WHERE content_item_id = content_item_uuid)
  WHERE id = content_item_uuid;
  
  RETURN avg_score;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security (optional, can be disabled if not needed)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_scores ENABLE ROW LEVEL SECURITY;

-- Policies to allow public read/write (since we're using keys for access control)
CREATE POLICY "Allow public read on sessions" ON sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read on content_items" ON content_items FOR SELECT USING (true);
CREATE POLICY "Allow public read on votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Allow public read on editor_scores" ON editor_scores FOR SELECT USING (true);
CREATE POLICY "Allow public insert on sessions" ON sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on content_items" ON content_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on votes" ON votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert on editor_scores" ON editor_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on sessions" ON sessions FOR UPDATE USING (true);
CREATE POLICY "Allow public update on content_items" ON content_items FOR UPDATE USING (true);

