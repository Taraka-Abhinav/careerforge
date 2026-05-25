-- Phase 2: StarM AI, skill notes, profile enhancements
-- Run after 001_careerforge_core.sql

-- StarM daily questions (3 per user per day)
CREATE TABLE IF NOT EXISTS public.starm_daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_date DATE NOT NULL DEFAULT CURRENT_DATE,
  slot INT NOT NULL CHECK (slot BETWEEN 1 AND 3),
  skill_name TEXT NOT NULL,
  prompt TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INT NOT NULL,
  explanation TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, question_date, slot)
);

CREATE TABLE IF NOT EXISTS public.starm_daily_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.starm_daily_questions(id) ON DELETE CASCADE NOT NULL,
  selected_index INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  xp_earned INT DEFAULT 0,
  answered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, question_id)
);

-- AI-generated skill notes (StarM)
CREATE TABLE IF NOT EXISTS public.skill_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_slug TEXT NOT NULL,
  skill_name TEXT NOT NULL,
  career_goal TEXT NOT NULL,
  sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, skill_slug)
);

-- Highlight coach log (optional analytics)
CREATE TABLE IF NOT EXISTS public.starm_coach_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_slug TEXT,
  selected_text TEXT NOT NULL,
  explanation TEXT NOT NULL,
  follow_up_questions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.starm_daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starm_daily_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starm_coach_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY starm_questions_all ON public.starm_daily_questions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY starm_responses_all ON public.starm_daily_responses FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY skill_notes_all ON public.skill_notes FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY starm_coach_all ON public.starm_coach_sessions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
