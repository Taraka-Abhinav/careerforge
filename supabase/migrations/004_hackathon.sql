-- CareerForge Hackathon registrations
CREATE TABLE IF NOT EXISTS public.hackathon_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_id TEXT NOT NULL DEFAULT 'careerforge-2026-spring',
  team_name TEXT NOT NULL,
  track TEXT NOT NULL CHECK (track IN ('AI/ML', 'Web3', 'Full Stack', 'DevOps', 'Cybersecurity', 'Open Innovation')),
  mode TEXT NOT NULL DEFAULT 'solo' CHECK (mode IN ('solo', 'team')),
  teammate_emails TEXT,
  project_title TEXT,
  status TEXT NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'submitted', 'finalist', 'winner')),
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, event_id)
);

ALTER TABLE public.hackathon_registrations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY hackathon_reg_own ON public.hackathon_registrations FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
