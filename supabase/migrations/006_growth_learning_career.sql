-- Growth: learning depth, career outcomes, and checkpoint persistence
-- Additive migration. Run after 005_engagement_monetization_seo.sql.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.learning_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE NOT NULL,
  checkpoint_key TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, module_id, checkpoint_key)
);

CREATE TABLE IF NOT EXISTS public.learning_project_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE NOT NULL,
  project_url TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, module_id)
);

CREATE TABLE IF NOT EXISTS public.career_outcomes (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_url TEXT,
  portfolio_url TEXT,
  target_roles JSONB DEFAULT '[]'::jsonb,
  interview_practice_count INT DEFAULT 0 NOT NULL,
  applications_count INT DEFAULT 0 NOT NULL,
  offers_count INT DEFAULT 0 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS learning_checkpoints_user_module_idx
  ON public.learning_checkpoints(user_id, module_id);
CREATE INDEX IF NOT EXISTS learning_project_submissions_user_idx
  ON public.learning_project_submissions(user_id);

ALTER TABLE public.learning_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_project_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_outcomes ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY learning_checkpoints_all ON public.learning_checkpoints FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY learning_project_submissions_all ON public.learning_project_submissions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY career_outcomes_all ON public.career_outcomes FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
