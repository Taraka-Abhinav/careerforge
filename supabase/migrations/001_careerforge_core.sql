-- CareerForge unified schema (apply this only; do not use supabase_setup.sql)
-- Run in Supabase SQL Editor or via CLI

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- RESET: drop legacy / partial tables (fixes "uuid and bigint" FK errors)
--
-- Cause: CREATE TABLE IF NOT EXISTS skips tables that already exist with wrong
-- column types (e.g. skills.id as BIGINT from an older schema). New FKs then
-- fail because learning_modules.skill_id is UUID but skills.id is BIGINT.
--
-- This removes data in these tables. Auth users are kept; re-run onboarding
-- after migrate. Comment out this block only if you have a custom data migration.
-- =============================================================================
DROP TABLE IF EXISTS public.challenge_completions CASCADE;
DROP TABLE IF EXISTS public.quiz_attempts CASCADE;
DROP TABLE IF EXISTS public.user_module_progress CASCADE;
DROP TABLE IF EXISTS public.xp_events CASCADE;
DROP TABLE IF EXISTS public.learning_modules CASCADE;
DROP TABLE IF EXISTS public.challenges CASCADE;
DROP TABLE IF EXISTS public.missions CASCADE;
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.roadmaps CASCADE;
DROP TABLE IF EXISTS public.progress CASCADE;
DROP TABLE IF EXISTS public.challenge_catalog CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Profiles (auth-aligned)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  age INT,
  location TEXT,
  country TEXT,
  education TEXT,
  school TEXT,
  grad_year TEXT,
  occupation TEXT,
  learning_style JSONB DEFAULT '[]'::jsonb NOT NULL,
  preference TEXT,
  work_type TEXT DEFAULT 'Remote',
  personality JSONB DEFAULT '{}'::jsonb,
  projects_count INT DEFAULT 0,
  hackathons_count INT DEFAULT 0,
  github_url TEXT,
  internship TEXT,
  commitment_level TEXT,
  urgency TEXT,
  analysis JSONB DEFAULT '{}'::jsonb,
  is_complete BOOLEAN DEFAULT false,
  notification_settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Roadmaps
CREATE TABLE public.roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  career_goal TEXT NOT NULL,
  target_salary TEXT,
  dream_company TEXT,
  hours_per_week INT DEFAULT 20,
  hours_per_day INT DEFAULT 4,
  timeline TEXT,
  current_phase TEXT DEFAULT 'Phase 1',
  phases JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  generated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Skills
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  skill_name TEXT NOT NULL,
  skill_slug TEXT,
  skill_type TEXT NOT NULL CHECK (skill_type IN ('known', 'learning')),
  status TEXT NOT NULL DEFAULT 'Locked' CHECK (status IN ('Locked', 'Learning', 'Practicing', 'Assessing', 'Mastered')),
  level_or_priority TEXT NOT NULL DEFAULT 'Must Learn',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Learning modules (per skill)
CREATE TABLE public.learning_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lesson', 'practice', 'quiz', 'assessment', 'project')),
  sort_order INT DEFAULT 0,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_reward INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ
);

-- User module progress
CREATE TABLE public.user_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, module_id)
);

-- Daily missions
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  target_ref TEXT,
  is_completed BOOLEAN DEFAULT false,
  xp_reward INT NOT NULL DEFAULT 20,
  completed_at TIMESTAMPTZ
);

-- Weekly goals
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  title TEXT NOT NULL,
  target_count INT NOT NULL,
  current_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
  xp_reward INT NOT NULL DEFAULT 100
);

-- Challenge catalog (global templates)
CREATE TABLE public.challenge_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  xp_reward INT NOT NULL DEFAULT 50,
  starter_code TEXT,
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true
);

-- Per-user assigned challenges
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  catalog_id UUID REFERENCES public.challenge_catalog(id),
  skill_id UUID REFERENCES public.skills(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INT NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'failed')),
  content JSONB DEFAULT '{}'::jsonb,
  submission JSONB,
  assigned_date DATE DEFAULT CURRENT_DATE,
  completed_at TIMESTAMPTZ
);

-- Challenge completions (idempotency)
CREATE TABLE public.challenge_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  submission JSONB,
  passed BOOLEAN NOT NULL DEFAULT false,
  xp_earned INT DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, challenge_id)
);

-- Quiz attempts
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.learning_modules(id) ON DELETE CASCADE,
  score INT NOT NULL,
  answers JSONB,
  xp_earned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- XP events (idempotency audit)
CREATE TABLE public.xp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  amount INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, source_type, source_id)
);

-- Progress aggregate
CREATE TABLE public.progress (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  xp INT DEFAULT 0 NOT NULL,
  level INT DEFAULT 1 NOT NULL,
  streak_days INT DEFAULT 0 NOT NULL,
  last_active_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

-- Policies: own data only
DO $$ BEGIN
  CREATE POLICY profiles_select ON public.profiles FOR SELECT USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY roadmaps_all ON public.roadmaps FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY skills_all ON public.skills FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY missions_all ON public.missions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY goals_all ON public.goals FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY challenges_all ON public.challenges FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY challenge_completions_all ON public.challenge_completions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY quiz_attempts_all ON public.quiz_attempts FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY xp_events_all ON public.xp_events FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY progress_all ON public.progress FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY user_module_progress_all ON public.user_module_progress FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY challenge_catalog_read ON public.challenge_catalog FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Learning modules: readable if user owns parent skill
DO $$ BEGIN
  CREATE POLICY learning_modules_select ON public.learning_modules FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.skills s WHERE s.id = skill_id AND s.user_id = auth.uid())
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Auto-create profile + progress on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, is_complete)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), false)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.progress (user_id, xp, level, streak_days)
  VALUES (NEW.id, 0, 1, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed challenge catalog
INSERT INTO public.challenge_catalog (category, title, description, difficulty, xp_reward, starter_code, test_cases)
VALUES
  ('Coding', 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'Easy', 50,
   'function twoSum(nums, target) {\n  // your code\n}',
   '[{"input":{"nums":[2,7,11,15],"target":9},"expected":[0,1]}]'::jsonb),
  ('Debugging', 'Fix Off-by-One', 'Fix the loop so it returns the sum 1..n correctly.', 'Medium', 75,
   'function sumToN(n) {\n  let s = 0;\n  for (let i = 0; i < n; i++) s += i;\n  return s;\n}',
   '[{"input":{"n":5},"expected":15}]'::jsonb),
  ('Logic', 'FizzBuzz Variant', 'Return "Fizz" if divisible by 3, "Buzz" by 5, "FizzBuzz" by both, else the number.', 'Easy', 40,
   'function fizzBuzz(n) {\n  // your code\n}',
   '[{"input":{"n":15},"expected":"FizzBuzz"},{"input":{"n":9},"expected":"Fizz"}]'::jsonb),
  ('Database', 'Count Active Users', 'Simulate SQL logic: count items where status is active.', 'Medium', 60,
   'function countActive(rows) {\n  // rows: {status:string}[]\n}',
   '[{"input":{"rows":[{"status":"active"},{"status":"inactive"},{"status":"active"}]},"expected":2}]'::jsonb),
  ('Frontend', 'Flatten DOM Tree', 'Convert nested children array to flat list of ids.', 'Hard', 100,
   'function flattenIds(node) {\n  // node: {id, children?:[]}\n}',
   '[{"input":{"node":{"id":"a","children":[{"id":"b"},{"id":"c","children":[{"id":"d"}]}]}},"expected":["a","b","c","d"]}]'::jsonb)
ON CONFLICT DO NOTHING;
