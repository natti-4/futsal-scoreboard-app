-- Futsal Scoreboard Database Schema
-- Players table
CREATE TABLE IF NOT EXISTS public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  total_goals INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_name TEXT NOT NULL DEFAULT 'My Team',
  opponent_name TEXT NOT NULL,
  team_score INTEGER NOT NULL DEFAULT 0,
  opponent_score INTEGER NOT NULL DEFAULT 0,
  team_fouls INTEGER DEFAULT 0,
  opponent_fouls INTEGER DEFAULT 0,
  match_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_seconds INTEGER DEFAULT 0,
  photo_url TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('live', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Match events table (goals, fouls, substitutions)
CREATE TABLE IF NOT EXISTS public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'foul', 'substitution')),
  team TEXT NOT NULL CHECK (team IN ('team', 'opponent')),
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  timestamp_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Match scorers (linking players to goals in a match)
CREATE TABLE IF NOT EXISTS public.match_scorers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  goals INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, player_id)
);

-- Enable Row Level Security (public access for now - no auth required)
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_scorers ENABLE ROW LEVEL SECURITY;

-- Public access policies (for anonymous use)
CREATE POLICY "Allow public read players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public insert players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete players" ON public.players FOR DELETE USING (true);

CREATE POLICY "Allow public read matches" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert matches" ON public.matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update matches" ON public.matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete matches" ON public.matches FOR DELETE USING (true);

CREATE POLICY "Allow public read match_events" ON public.match_events FOR SELECT USING (true);
CREATE POLICY "Allow public insert match_events" ON public.match_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update match_events" ON public.match_events FOR UPDATE USING (true);
CREATE POLICY "Allow public delete match_events" ON public.match_events FOR DELETE USING (true);

CREATE POLICY "Allow public read match_scorers" ON public.match_scorers FOR SELECT USING (true);
CREATE POLICY "Allow public insert match_scorers" ON public.match_scorers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update match_scorers" ON public.match_scorers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete match_scorers" ON public.match_scorers FOR DELETE USING (true);

-- Function to update player total goals
CREATE OR REPLACE FUNCTION update_player_total_goals()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.players 
    SET total_goals = total_goals + NEW.goals,
        updated_at = now()
    WHERE id = NEW.player_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.players 
    SET total_goals = total_goals - OLD.goals + NEW.goals,
        updated_at = now()
    WHERE id = NEW.player_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.players 
    SET total_goals = total_goals - OLD.goals,
        updated_at = now()
    WHERE id = OLD.player_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update player goals
DROP TRIGGER IF EXISTS trigger_update_player_goals ON public.match_scorers;
CREATE TRIGGER trigger_update_player_goals
AFTER INSERT OR UPDATE OR DELETE ON public.match_scorers
FOR EACH ROW EXECUTE FUNCTION update_player_total_goals();

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_match_events_match_id ON public.match_events(match_id);
CREATE INDEX IF NOT EXISTS idx_match_scorers_match_id ON public.match_scorers(match_id);
CREATE INDEX IF NOT EXISTS idx_match_scorers_player_id ON public.match_scorers(player_id);
CREATE INDEX IF NOT EXISTS idx_players_is_active ON public.players(is_active);
