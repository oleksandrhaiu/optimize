-- ============================================================
-- Habit Tracker – Full Schema (v2)
-- Run this in your Supabase SQL Editor
-- Drop old tables first if you're starting fresh:
-- DROP SCHEMA public CASCADE; CREATE SCHEMA public;
-- ============================================================

create extension if not exists "pgcrypto";

-- ─── Grants ───────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated, service_role;

alter default privileges in schema public
  grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on routines  to anon, authenticated, service_role;


-- ─── users ────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text not null unique,
  email         text not null,
  avatar_color  text not null default '#00C896',
  last_seen_at  timestamptz,                          -- for "last seen X ago"
  created_at    timestamptz not null default now()
);

-- ─── habits ───────────────────────────────────────────────────────────────────
create table if not exists public.habits (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.users(id) on delete cascade,
  name              text not null,
  type              text not null check (type in ('checkbox', 'numeric')),
  unit              text,                             -- e.g. 'glasses', 'km', 'kcal'
  icon              text,
  "order"           integer not null default 0,
  cal_min           numeric,
  cal_max           numeric,
  is_calorie_habit  boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists habits_user_id_idx on public.habits(user_id);

-- ─── habit_logs ───────────────────────────────────────────────────────────────
create table if not exists public.habit_logs (
  id         uuid primary key default gen_random_uuid(),
  habit_id   uuid not null references public.habits(id) on delete cascade,
  user_id    uuid not null references public.users(id) on delete cascade,
  date       date not null,
  value      text not null,
  created_at timestamptz not null default now(),
  unique(habit_id, date)
);

create index if not exists habit_logs_user_date_idx on public.habit_logs(user_id, date);
create index if not exists habit_logs_habit_id_idx  on public.habit_logs(habit_id);

-- ─── friendships ──────────────────────────────────────────────────────────────
create table if not exists public.friendships (
  id         uuid primary key default gen_random_uuid(),
  user_a_id  uuid not null references public.users(id) on delete cascade,
  user_b_id  uuid not null references public.users(id) on delete cascade,
  status     text not null check (status in ('pending', 'accepted')) default 'accepted',
  created_at timestamptz not null default now(),
  unique(user_a_id, user_b_id)
);

create index if not exists friendships_user_a_idx on public.friendships(user_a_id);
create index if not exists friendships_user_b_idx on public.friendships(user_b_id);

-- ─── invite_tokens ────────────────────────────────────────────────────────────
create table if not exists public.invite_tokens (
  id               uuid primary key default gen_random_uuid(),
  creator_user_id  uuid not null references public.users(id) on delete cascade,
  token            text not null unique,
  used             boolean not null default false,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.users         enable row level security;
alter table public.habits        enable row level security;
alter table public.habit_logs    enable row level security;
alter table public.friendships   enable row level security;
alter table public.invite_tokens enable row level security;

-- ─── Helper: are_friends(uid_a, uid_b) ───────────────────────────────────────
create or replace function public.are_friends(uid_a uuid, uid_b uuid)
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.friendships
    where status = 'accepted'
      and ((user_a_id = uid_a and user_b_id = uid_b)
        or (user_a_id = uid_b and user_b_id = uid_a))
  );
$$;

-- ─── users RLS ────────────────────────────────────────────────────────────────
create policy "Users: read any" on public.users
  for select using (auth.uid() is not null);

create policy "Users: insert own" on public.users
  for insert with check (auth.uid() = id);

create policy "Users: update own" on public.users
  for update using (auth.uid() = id);

-- ─── habits RLS ───────────────────────────────────────────────────────────────
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

-- ─── habit_logs RLS ───────────────────────────────────────────────────────────
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

-- ─── friendships RLS ──────────────────────────────────────────────────────────
create policy "Friends: read own" on public.friendships
  for select using (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Friends: insert" on public.friendships
  for insert with check (auth.uid() = user_a_id or auth.uid() = user_b_id);

create policy "Friends: delete own" on public.friendships
  for delete using (auth.uid() = user_a_id or auth.uid() = user_b_id);

-- ─── invite_tokens RLS ────────────────────────────────────────────────────────
create policy "Tokens: read any" on public.invite_tokens
  for select using (auth.uid() is not null);

create policy "Tokens: insert own" on public.invite_tokens
  for insert with check (auth.uid() = creator_user_id);

create policy "Tokens: update any" on public.invite_tokens
  for update using (auth.uid() is not null);

-- ============================================================
-- Realtime
-- ============================================================
alter publication supabase_realtime add table public.habit_logs;
alter publication supabase_realtime add table public.habits;
alter publication supabase_realtime add table public.users;
