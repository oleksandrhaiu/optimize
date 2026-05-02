-- ============================================================
-- Habit Tracker – Migration v2
-- Run this in your Supabase SQL Editor
-- Safe to run on existing database — uses IF NOT EXISTS / IF EXISTS
-- ============================================================

-- ─── 1. Alter users: add last_seen_at ─────────────────────────────────────────
alter table public.users
  add column if not exists last_seen_at timestamptz;

-- ─── 2. Alter habits: rename group → unit ─────────────────────────────────────
-- Add new column first
alter table public.habits
  add column if not exists unit text;

-- Copy existing data from group → unit (if group column still exists)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'habits' and column_name = 'group'
  ) then
    update public.habits set unit = "group" where unit is null and "group" is not null;
    alter table public.habits drop column if exists "group";
  end if;
end $$;

-- ─── 3. Drop old RLS policies (safe) ──────────────────────────────────────────
drop policy if exists "Users: read any"    on public.users;
drop policy if exists "Users: insert own"  on public.users;
drop policy if exists "Users: update own"  on public.users;

drop policy if exists "Habits: read own"   on public.habits;
drop policy if exists "Habits: read friend" on public.habits;
drop policy if exists "Habits: insert own" on public.habits;
drop policy if exists "Habits: update own" on public.habits;
drop policy if exists "Habits: delete own" on public.habits;

drop policy if exists "Logs: read own"     on public.habit_logs;
drop policy if exists "Logs: read friend"  on public.habit_logs;
drop policy if exists "Logs: insert own"   on public.habit_logs;
drop policy if exists "Logs: upsert own"   on public.habit_logs;
drop policy if exists "Logs: delete own"   on public.habit_logs;

drop policy if exists "Friends: read own"  on public.friendships;
drop policy if exists "Friends: insert"    on public.friendships;
drop policy if exists "Friends: delete own" on public.friendships;

drop policy if exists "Tokens: read any"   on public.invite_tokens;
drop policy if exists "Tokens: insert own" on public.invite_tokens;
drop policy if exists "Tokens: update any" on public.invite_tokens;

-- ─── 4. Recreate RLS policies ─────────────────────────────────────────────────

-- users
create policy "Users: read any" on public.users
  for select using (auth.uid() is not null);

create policy "Users: insert own" on public.users
  for insert with check (auth.uid() = id);

create policy "Users: update own" on public.users
  for update using (auth.uid() = id);

-- habits
create policy "Habits: read own" on public.habits
  for select using (auth.uid() = user_id);

create policy "Habits: read friend" on public.habits
  for select using (public.are_friends(auth.uid(), user_id));

create policy "Habits: insert own" on public.habits
  for insert with check (auth.uid() = user_id);

create policy "Habits: update own" on public.habits
  for update using (auth.uid() = user_id);

create policy "Habits: delete own" on public.habits
  for delete using (auth.uid() = user_id);

-- habit_logs
create policy "Logs: read own" on public.habit_logs
  for select using (auth.uid() = user_id);

create policy "Logs: read friend" on public.habit_logs
  for select using (public.are_friends(auth.uid(), user_id));

create policy "Logs: insert own" on public.habit_logs
  for insert with check (auth.uid() = user_id);

create policy "Logs: upsert own" on public.habit_logs
  for update using (auth.uid() = user_id);

create policy "Logs: delete own" on public.habit_logs
  for delete using (auth.uid() = user_id);

-- friendships
create policy "Friends: read own" on public.friendships
  for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Friends: insert" on public.friendships
  for insert with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Friends: delete own" on public.friendships
  for delete using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- invite_tokens
create policy "Tokens: read any" on public.invite_tokens
  for select using (auth.uid() is not null);

create policy "Tokens: insert own" on public.invite_tokens
  for insert with check (auth.uid() = creator_user_id);

create policy "Tokens: update any" on public.invite_tokens
  for update using (auth.uid() is not null);

-- ─── 5. Enable Realtime on users ──────────────────────────────────────────────
-- (habit_logs and habits should already be added, adding users)
alter publication supabase_realtime add table public.users;
