-- Run this in your Supabase SQL Editor (supabase.com → your project → SQL Editor)

CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  pin_hash TEXT NOT NULL,
  progress JSONB DEFAULT '{"version":1,"lessons":{},"jlpt":{}}',
  time_data JSONB DEFAULT '{"sessions":[],"totalMinutes":0}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
