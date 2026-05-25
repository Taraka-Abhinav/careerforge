-- DEPRECATED: Do not apply. Use supabase/migrations/001_careerforge_core.sql instead.
-- Supabase Authentication and RLS Setup
-- Run this script in your Supabase SQL Editor

-- 1. Enable RLS on existing tables (if they exist)
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS skills ENABLE ROW LEVEL SECURITY;

-- If tables don't exist, here is the schema to create them with RLS

-- Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  name text,
  age integer,
  location text,
  education text,
  school text,
  grad_year text,
  occupation text,
  career text,
  salary text,
  dream_company text,
  work_type text,
  learning_speed text,
  preference text,
  team text,
  discipline text,
  timeline text,
  urgency text,
  projects integer,
  hackathons integer,
  github text,
  internship text,
  readiness_score integer,
  learning_speed_score integer,
  confidence_score integer,
  is_complete boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Progress Table
CREATE TABLE IF NOT EXISTS progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  xp integer DEFAULT 0,
  level integer DEFAULT 1,
  completed_tasks text[] DEFAULT '{}',
  completed_goals text[] DEFAULT '{}',
  completed_challenges text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" 
ON progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" 
ON progress FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" 
ON progress FOR UPDATE 
USING (auth.uid() = user_id);

-- Roadmaps Table
CREATE TABLE IF NOT EXISTS roadmaps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  phase text,
  duration text,
  items jsonb,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roadmaps" 
ON roadmaps FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roadmaps" 
ON roadmaps FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own roadmaps" 
ON roadmaps FOR DELETE 
USING (auth.uid() = user_id);

-- Skills Table (Learning & Known)
CREATE TABLE IF NOT EXISTS skills (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  level text,
  priority text,
  type text CHECK (type IN ('known', 'learning')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own skills" 
ON skills FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own skills" 
ON skills FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own skills" 
ON skills FOR DELETE 
USING (auth.uid() = user_id);

-- Automatic Profile Creation Trigger
-- Automatically creates a profile and progress record when a new user signs up

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  INSERT INTO public.progress (user_id, xp, level)
  VALUES (NEW.id, 0, 1);
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
