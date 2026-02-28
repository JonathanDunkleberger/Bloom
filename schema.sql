-- ============================================================
-- Bloom – Supabase Database Schema (v2 – creature/terrarium theme)
-- Run this in the Supabase SQL Editor to set up all tables.
-- ============================================================

-- 0. Extensions
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES
-- ============================================================
create table if not exists public.profiles (
  id           uuid primary key default gen_random_uuid(),
  clerk_id     text unique not null,
  email        text not null,
  display_name text,
  avatar_url   text,
  tier         text not null default 'free' check (tier in ('free', 'pro')),
  coins        int not null default 0,
  streak_freezes jsonb not null default '{}',
  stripe_customer_id     text,
  stripe_subscription_id text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_profiles_clerk_id on public.profiles (clerk_id);

-- ============================================================
-- 2. HABITS
-- ============================================================
create table if not exists public.habits (
  id           uuid primary key default gen_random_uuid(),
  user_id      text not null,              -- clerk_id from auth
  name         text not null,
  color        text not null default '#6366f1',
  icon_name    text not null default 'Target',
  category     text not null default 'general',
  is_archived  boolean not null default false,
  is_paused    boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists idx_habits_user_id on public.habits (user_id);

-- ============================================================
-- 3. HABIT_LOGS  (one row = one check-in per day)
-- ============================================================
create table if not exists public.habit_logs (
  id        uuid primary key default gen_random_uuid(),
  habit_id  uuid not null references public.habits(id) on delete cascade,
  log_date  date not null default current_date,
  value     real default 1,
  created_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create index if not exists idx_habit_logs_habit_id on public.habit_logs (habit_id);
create index if not exists idx_habit_logs_date on public.habit_logs (log_date);

-- ============================================================
-- 4. RELAPSE_EVENTS  (quit-type habits only)
-- ============================================================
create table if not exists public.relapse_events (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid not null references public.habits(id) on delete cascade,
  intensity  int not null default 5 check (intensity between 1 and 10),
  note       text,
  created_at timestamptz not null default now()
);

create index if not exists idx_relapse_events_habit_id on public.relapse_events (habit_id);

-- ============================================================
-- 5. MILESTONES
-- ============================================================
create table if not exists public.milestones (
  id              uuid primary key default gen_random_uuid(),
  habit_id        uuid not null references public.habits(id) on delete cascade,
  milestone_type  text not null default 'streak',
  value           int not null,
  seen            boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists idx_milestones_habit_id on public.milestones (habit_id);

-- ============================================================
-- 6. QUIT_PROGRESS (one row per quit-type habit)
-- ============================================================
create table if not exists public.quit_progress (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  habit_id    uuid not null references public.habits(id) on delete cascade,
  quit_date   text not null,
  daily_cost  real not null default 0,
  reason      text not null default '',
  urges       jsonb not null default '[]',
  best_streak int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, habit_id)
);

create index if not exists idx_quit_progress_user_id on public.quit_progress (user_id);
create index if not exists idx_quit_progress_habit_id on public.quit_progress (habit_id);

-- ============================================================
-- 7. USER_INVENTORY (owned shop items)
-- ============================================================
create table if not exists public.user_inventory (
  id          uuid primary key default gen_random_uuid(),
  user_id     text not null,
  item_id     text not null,
  created_at  timestamptz not null default now(),
  unique (user_id, item_id)
);

create index if not exists idx_user_inventory_user_id on public.user_inventory (user_id);

-- ============================================================
-- 8. USER_PREFERENCES (per-user settings)
-- ============================================================
create table if not exists public.user_preferences (
  id                    uuid primary key default gen_random_uuid(),
  user_id               text unique not null,
  dark_mode             boolean not null default false,
  season                text not null default 'summer',
  earned_milestone_coins jsonb not null default '{}',
  stage_drops           jsonb not null default '{}',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_user_preferences_user_id on public.user_preferences (user_id);

-- ============================================================
-- 9. UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_habits_updated_at
  before update on public.habits
  for each row execute function public.handle_updated_at();

create trigger set_quit_progress_updated_at
  before update on public.quit_progress
  for each row execute function public.handle_updated_at();

create trigger set_user_preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 7. ROW LEVEL SECURITY
-- ============================================================

create or replace function public.requesting_user_id()
returns text as $$
  select coalesce(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  );
$$ language sql stable;

-- PROFILES
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (clerk_id = requesting_user_id());

create policy "Users can update own profile"
  on public.profiles for update
  using (clerk_id = requesting_user_id());

-- HABITS
alter table public.habits enable row level security;

create policy "Users can view own habits"
  on public.habits for select
  using (user_id = requesting_user_id());

create policy "Users can insert own habits"
  on public.habits for insert
  with check (user_id = requesting_user_id());

create policy "Users can update own habits"
  on public.habits for update
  using (user_id = requesting_user_id());

create policy "Users can delete own habits"
  on public.habits for delete
  using (user_id = requesting_user_id());

-- HABIT_LOGS
alter table public.habit_logs enable row level security;

create policy "Users can view own logs"
  on public.habit_logs for select
  using (habit_id in (select id from public.habits where user_id = requesting_user_id()));

create policy "Users can insert own logs"
  on public.habit_logs for insert
  with check (habit_id in (select id from public.habits where user_id = requesting_user_id()));

create policy "Users can delete own logs"
  on public.habit_logs for delete
  using (habit_id in (select id from public.habits where user_id = requesting_user_id()));

-- RELAPSE_EVENTS
alter table public.relapse_events enable row level security;

create policy "Users can view own relapses"
  on public.relapse_events for select
  using (habit_id in (select id from public.habits where user_id = requesting_user_id()));

create policy "Users can insert own relapses"
  on public.relapse_events for insert
  with check (habit_id in (select id from public.habits where user_id = requesting_user_id()));

-- MILESTONES
alter table public.milestones enable row level security;

create policy "Users can view own milestones"
  on public.milestones for select
  using (habit_id in (select id from public.habits where user_id = requesting_user_id()));

create policy "Users can insert own milestones"
  on public.milestones for insert
  with check (habit_id in (select id from public.habits where user_id = requesting_user_id()));

create policy "Users can update own milestones"
  on public.milestones for update
  using (habit_id in (select id from public.habits where user_id = requesting_user_id()));

-- QUIT_PROGRESS
alter table public.quit_progress enable row level security;

create policy "Users can view own quit progress"
  on public.quit_progress for select
  using (user_id = requesting_user_id());

create policy "Users can insert own quit progress"
  on public.quit_progress for insert
  with check (user_id = requesting_user_id());

create policy "Users can update own quit progress"
  on public.quit_progress for update
  using (user_id = requesting_user_id());

create policy "Users can delete own quit progress"
  on public.quit_progress for delete
  using (user_id = requesting_user_id());

-- USER_INVENTORY
alter table public.user_inventory enable row level security;

create policy "Users can view own inventory"
  on public.user_inventory for select
  using (user_id = requesting_user_id());

create policy "Users can insert own inventory"
  on public.user_inventory for insert
  with check (user_id = requesting_user_id());

create policy "Users can delete own inventory"
  on public.user_inventory for delete
  using (user_id = requesting_user_id());

-- USER_PREFERENCES
alter table public.user_preferences enable row level security;

create policy "Users can view own preferences"
  on public.user_preferences for select
  using (user_id = requesting_user_id());

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (user_id = requesting_user_id());

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (user_id = requesting_user_id());

-- ============================================================
-- MIGRATION: If upgrading from v1, run these ALTER statements:
-- ============================================================
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins int NOT NULL DEFAULT 0;
-- ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS color text NOT NULL DEFAULT '#6366f1';
-- ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS icon_name text NOT NULL DEFAULT 'Target';
-- ALTER TABLE public.habits DROP COLUMN IF EXISTS plant_type;
-- ALTER TABLE public.habits DROP COLUMN IF EXISTS icon;
-- ALTER TABLE public.habits DROP COLUMN IF EXISTS habit_group;
-- ALTER TABLE public.habits DROP COLUMN IF EXISTS habit_type;
-- ALTER TABLE public.habits DROP COLUMN IF EXISTS description;
-- ALTER TABLE public.habits DROP COLUMN IF EXISTS frequency;
-- ALTER TABLE public.habits DROP COLUMN IF EXISTS custom_days;
-- ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_freezes jsonb NOT NULL DEFAULT '{}';
