-- ============================================================
-- Lumina – Migration v3: Habits Overhaul
-- Run in Supabase Dashboard → SQL Editor
-- Safe to run on existing database (uses IF NOT EXISTS)
-- ============================================================

-- ─── 1. Alter habits table ────────────────────────────────────────────────────

-- Habit frequency: daily | weekdays | weekends | custom
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'daily'
  CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom'));

-- Custom frequency days: array of 0=Mon..6=Sun
-- e.g. [0,1,2,3,4] = Monday–Friday
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS frequency_days INTEGER[] DEFAULT NULL;

-- Privacy toggle: false = visible to friends, true = hidden
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN NOT NULL DEFAULT FALSE;

-- Archive: soft-delete, history preserved
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Streak shield: tracks when last shield was used (1 per 7 days)
ALTER TABLE public.habits
  ADD COLUMN IF NOT EXISTS streak_shield_used_at DATE DEFAULT NULL;

-- ─── 2. Update RLS: friends cannot see private or archived habits ─────────────

-- Drop existing friend-read policy
DROP POLICY IF EXISTS "Habits: read friend" ON public.habits;

-- Recreate with privacy + archive filter
CREATE POLICY "Habits: read friend" ON public.habits
  FOR SELECT USING (
    public.are_friends(auth.uid(), user_id)
    AND is_private = FALSE
    AND is_archived = FALSE
  );

-- ─── 3. Index for faster archived habit queries ───────────────────────────────
CREATE INDEX IF NOT EXISTS habits_user_archived_idx
  ON public.habits(user_id, is_archived);

-- ─── Done ─────────────────────────────────────────────────────────────────────
-- After running this migration, restart your app to pick up the new columns.
