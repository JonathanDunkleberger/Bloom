-- Migration 004: Urge entries table for persistent urge journal data
-- Run this in Supabase SQL Editor

-- Stores each urge event with method used, trigger tags, and optional journal note
CREATE TABLE IF NOT EXISTS urge_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  method TEXT NOT NULL CHECK (method IN ('breathe', 'write', 'redirect')),
  tags TEXT[] DEFAULT '{}',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_urge_entries_user ON urge_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_urge_entries_habit ON urge_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_urge_entries_created ON urge_entries(created_at);

-- RLS (service-role key bypasses, but good practice)
ALTER TABLE urge_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own urge entries"
  ON urge_entries FOR SELECT
  USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can insert own urge entries"
  ON urge_entries FOR INSERT
  WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'sub');
