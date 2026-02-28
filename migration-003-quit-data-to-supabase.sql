-- ============================================================
-- Migration 003: Move localStorage data to Supabase
-- Adds quit_progress, user_inventory, user_preferences tables
-- Adds is_paused column to habits
-- Run this in the Supabase SQL Editor.
-- ============================================================

-- ============================================================
-- 1. ADD is_paused TO HABITS
-- ============================================================
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS is_paused boolean NOT NULL DEFAULT false;

-- ============================================================
-- 2. QUIT_PROGRESS (one row per quit-type habit)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.quit_progress (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,                -- clerk_id
  habit_id    uuid NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  quit_date   text NOT NULL,                -- ISO date string (YYYY-MM-DD)
  daily_cost  real NOT NULL DEFAULT 0,      -- $ saved per day
  reason      text NOT NULL DEFAULT '',     -- personal motivation
  urges       jsonb NOT NULL DEFAULT '[]',  -- array of ISO date strings
  best_streak int NOT NULL DEFAULT 0,       -- survives relapse resets
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, habit_id)
);

CREATE INDEX IF NOT EXISTS idx_quit_progress_user_id ON public.quit_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_quit_progress_habit_id ON public.quit_progress (habit_id);

-- ============================================================
-- 3. USER_INVENTORY (owned shop items)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     text NOT NULL,                -- clerk_id
  item_id     text NOT NULL,                -- shop item identifier
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON public.user_inventory (user_id);

-- ============================================================
-- 4. USER_PREFERENCES (per-user settings: paused habits,
--    milestone coins, stage drops, dark mode, season, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               text UNIQUE NOT NULL,   -- clerk_id
  dark_mode             boolean NOT NULL DEFAULT false,
  season                text NOT NULL DEFAULT 'summer',
  earned_milestone_coins jsonb NOT NULL DEFAULT '{}',
  stage_drops           jsonb NOT NULL DEFAULT '{}',
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences (user_id);

-- ============================================================
-- 5. UPDATED_AT TRIGGERS for new tables
-- ============================================================
CREATE TRIGGER set_quit_progress_updated_at
  BEFORE UPDATE ON public.quit_progress
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 6. ROW LEVEL SECURITY for new tables
-- ============================================================

-- QUIT_PROGRESS
ALTER TABLE public.quit_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quit progress"
  ON public.quit_progress FOR SELECT
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can insert own quit progress"
  ON public.quit_progress FOR INSERT
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can update own quit progress"
  ON public.quit_progress FOR UPDATE
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can delete own quit progress"
  ON public.quit_progress FOR DELETE
  USING (user_id = requesting_user_id());

-- USER_INVENTORY
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inventory"
  ON public.user_inventory FOR SELECT
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can insert own inventory"
  ON public.user_inventory FOR INSERT
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can delete own inventory"
  ON public.user_inventory FOR DELETE
  USING (user_id = requesting_user_id());

-- USER_PREFERENCES
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (user_id = requesting_user_id());

CREATE POLICY "Users can insert own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (user_id = requesting_user_id());

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (user_id = requesting_user_id());
