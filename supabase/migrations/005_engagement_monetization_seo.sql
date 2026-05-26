-- CareerForge engagement, monetization prep, analytics, and SEO architecture
-- Additive migration only. Run after 004_hackathon.sql.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Streak extensions on the existing progress aggregate.
ALTER TABLE public.progress
  ADD COLUMN IF NOT EXISTS weekly_streak INT DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS longest_streak INT DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS last_weekly_active DATE;

-- Persist generated daily/weekly quiz decks so questions and scoring are auditable.
CREATE TABLE IF NOT EXISTS public.quiz_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  deck_key TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('daily', 'weekly')),
  quiz_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  career_goal TEXT,
  focus_skill TEXT,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  pass_threshold INT NOT NULL DEFAULT 70,
  xp_reward INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, deck_key)
);

ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS deck_id TEXT,
  ADD COLUMN IF NOT EXISTS quiz_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS mode TEXT,
  ADD COLUMN IF NOT EXISTS passed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS career_goal TEXT,
  ADD COLUMN IF NOT EXISTS focus_skill TEXT;

-- Persist daily personalized challenge assignments, independent of the static arena bank.
CREATE TABLE IF NOT EXISTS public.daily_challenge_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  slot INT NOT NULL CHECK (slot BETWEEN 1 AND 6),
  challenge_key TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  title TEXT NOT NULL,
  xp_reward INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, challenge_date, challenge_key)
);

-- Generic challenge completion persistence for arena/static challenges and generated tasks.
CREATE TABLE IF NOT EXISTS public.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_key TEXT NOT NULL,
  challenge_type TEXT,
  difficulty TEXT,
  submission JSONB,
  passed BOOLEAN NOT NULL DEFAULT false,
  xp_earned INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, challenge_key)
);

-- Engagement analytics event log. Enables DAU/WAU/MAU, retention, completions, and learning time.
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_seconds INT DEFAULT 0 NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Subscription architecture only. No payment providers are connected here.
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  provider TEXT,
  provider_customer_id TEXT,
  provider_subscription_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  feature_key TEXT NOT NULL,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  used_count INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, feature_key, usage_date)
);

-- Reusable public SEO content architecture. Populate intentionally, not in bulk.
CREATE TABLE IF NOT EXISTS public.public_content_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('career', 'skill')),
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_published BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(resource_type, slug)
);

ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS metric TEXT DEFAULT 'lesson' NOT NULL,
  ADD COLUMN IF NOT EXISTS target_ref TEXT,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS goals_user_week_metric_idx
  ON public.goals(user_id, week_start, metric);

CREATE INDEX IF NOT EXISTS quiz_attempts_user_deck_idx
  ON public.quiz_attempts(user_id, deck_id, created_at DESC);
CREATE INDEX IF NOT EXISTS challenge_attempts_user_passed_idx
  ON public.challenge_attempts(user_id, passed, completed_at DESC);
CREATE INDEX IF NOT EXISTS activity_events_user_date_idx
  ON public.activity_events(user_id, event_date, event_type);
CREATE INDEX IF NOT EXISTS daily_challenges_user_date_idx
  ON public.daily_challenge_assignments(user_id, challenge_date);
CREATE INDEX IF NOT EXISTS public_content_resources_lookup_idx
  ON public.public_content_resources(resource_type, slug, is_published);

ALTER TABLE public.quiz_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_content_resources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY quiz_decks_all ON public.quiz_decks FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY daily_challenge_assignments_all ON public.daily_challenge_assignments FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY challenge_attempts_all ON public.challenge_attempts FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY activity_events_all ON public.activity_events FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY subscriptions_all ON public.subscriptions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY feature_usage_all ON public.feature_usage FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY public_content_resources_read ON public.public_content_resources FOR SELECT USING (is_published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
