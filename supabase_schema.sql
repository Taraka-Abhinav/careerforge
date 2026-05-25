-- DEPRECATED: Use supabase/migrations/001_careerforge_core.sql instead.
-- CAREERFORGE COMPREHENSIVE SCHEMA REDESIGN

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INT,
    location TEXT,
    education TEXT,
    school TEXT,
    grad_year TEXT,
    occupation TEXT,
    learning_style JSONB DEFAULT '[]'::jsonb NOT NULL,
    preference TEXT,
    github_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create ROADMAPS Table
CREATE TABLE IF NOT EXISTS public.roadmaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
    career_goal TEXT NOT NULL,
    target_salary TEXT,
    dream_company TEXT,
    hours_per_week INT DEFAULT 20,
    hours_per_day INT DEFAULT 4,
    timeline TEXT,
    current_phase TEXT NOT NULL DEFAULT 'Phase 1',
    status TEXT NOT NULL DEFAULT 'active',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create SKILLS Table (Taxonomy & States)
CREATE TABLE public.skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill_name TEXT NOT NULL,
    skill_type TEXT NOT NULL CHECK (skill_type IN ('known', 'learning')),
    status TEXT NOT NULL DEFAULT 'Locked' CHECK (status IN ('Locked', 'Learning', 'Practicing', 'Assessing', 'Mastered')),
    level_or_priority TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create LEARNING_MODULES Table
CREATE TABLE public.learning_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('lesson', 'practice', 'quiz', 'assessment', 'project')),
    content JSONB NOT NULL,
    xp_reward INT NOT NULL DEFAULT 10,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 5. Create MISSIONS Table (Daily)
CREATE TABLE public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    xp_reward INT NOT NULL DEFAULT 20,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Create GOALS Table (Weekly)
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    week_start DATE NOT NULL,
    title TEXT NOT NULL,
    target_count INT NOT NULL,
    current_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed')),
    xp_reward INT NOT NULL DEFAULT 100
);

-- 7. Create CHALLENGES Table
CREATE TABLE public.challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    skill_id UUID REFERENCES public.skills(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- Coding, System Design, Debugging, etc.
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    xp_reward INT NOT NULL DEFAULT 50,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'completed', 'failed')),
    submission JSONB,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. Create PROGRESS Table (Aggregated XP and Level Engine)
CREATE TABLE IF NOT EXISTS public.progress (
    user_id TEXT PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    xp INT DEFAULT 0 NOT NULL,
    level INT DEFAULT 1 NOT NULL,
    streak_days INT DEFAULT 0 NOT NULL,
    last_active_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.profiles FOR ALL USING (true);

-- Repeat permissive for demo
CREATE POLICY "Allow public read access" ON public.roadmaps FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.roadmaps FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.skills FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.learning_modules FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.learning_modules FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.missions FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.missions FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.goals FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.goals FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.challenges FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.challenges FOR ALL USING (true);
CREATE POLICY "Allow public read access" ON public.progress FOR SELECT USING (true);
CREATE POLICY "Allow public write access" ON public.progress FOR ALL USING (true);
