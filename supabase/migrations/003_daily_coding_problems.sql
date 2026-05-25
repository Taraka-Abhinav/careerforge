-- Daily real-world coding problems (StarM Daily Code)
CREATE TABLE IF NOT EXISTS public.starm_daily_coding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  question_date DATE NOT NULL DEFAULT CURRENT_DATE,
  slot INT NOT NULL CHECK (slot BETWEEN 1 AND 3),
  skill_name TEXT NOT NULL,
  title TEXT NOT NULL,
  scenario TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT DEFAULT 'Medium',
  starter_code TEXT NOT NULL,
  test_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  hints JSONB DEFAULT '[]'::jsonb,
  xp_reward INT NOT NULL DEFAULT 40,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, question_date, slot)
);

CREATE TABLE IF NOT EXISTS public.starm_daily_coding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  problem_id UUID REFERENCES public.starm_daily_coding(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  xp_earned INT DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, problem_id)
);

ALTER TABLE public.starm_daily_coding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.starm_daily_coding_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY starm_daily_coding_all ON public.starm_daily_coding FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY starm_daily_coding_sub_all ON public.starm_daily_coding_submissions FOR ALL USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
