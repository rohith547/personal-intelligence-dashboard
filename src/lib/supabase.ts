import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://memiakngaeadoenvmxnh.supabase.co'
const supabaseAnonKey = 'sb_publishable_o5fvv7D7P3fe73XLWfggtg_s5B51NpX'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
-- Run in Supabase Dashboard > SQL Editor > New Query

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'personal',
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_tasks" ON tasks FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  notes TEXT,
  sleep_hours NUMERIC,
  activities TEXT[],
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_mood" ON mood_entries FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS fitness_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  calories INTEGER,
  intensity TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fitness_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_fitness" ON fitness_entries FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS spending_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'expense',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE spending_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_spending" ON spending_entries FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_notes" ON notes FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS learning_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  topic TEXT NOT NULL,
  source TEXT,
  duration INTEGER,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE learning_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_learning" ON learning_entries FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS reading_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  status TEXT DEFAULT 'want-to-read',
  pages_total INTEGER,
  pages_read INTEGER DEFAULT 0,
  rating INTEGER,
  genre TEXT,
  notes TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE reading_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_reading" ON reading_entries FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal',
  target_date DATE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_goals" ON goals FOR ALL USING (auth.uid() = user_id);
*/
