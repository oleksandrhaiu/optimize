import type { Habit, HabitLog } from '@/types';
import { todayStr, formatDate, lastNDates, isHabitScheduledOn, isHabitDone, calcDayScore } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SmartReturnState = 'none' | 'drift' | 'reset';

export interface SmartReturn {
  state: SmartReturnState;
  gapDays: number;
  /** The single best habit to start with today, based on historical completion */
  suggestedHabit: Habit | null;
  suggestedHabitRate: number; // 0-100% historical completion
  /** Habits the user missed yesterday (for "Never Miss Twice" highlighting) */
  neverMissTwiceHabitIds: Set<string>;
}

// ─── Core algorithm ───────────────────────────────────────────────────────────

/**
 * Behavioral psychology-based smart return system.
 *
 * "Never miss twice" (James Clear): Missing once is human. Twice starts a habit.
 * "Self-compassion" (Neff): Non-judgmental return → better long-term adherence.
 * "Implementation intention": ONE specific action removes decision paralysis.
 */
export function calcSmartReturn(habits: Habit[], logs: HabitLog[]): SmartReturn {
  const today = todayStr();
  const activeHabits = habits.filter(h => !h.is_archived);

  const NONE: SmartReturn = {
    state: 'none',
    gapDays: 0,
    suggestedHabit: null,
    suggestedHabitRate: 0,
    neverMissTwiceHabitIds: new Set(),
  };

  if (activeHabits.length === 0) return NONE;

  // ── 1. Never Miss Twice detection ────────────────────────────────────────────
  // Find habits the user MISSED yesterday but can complete TODAY
  const yesterday = formatDate(new Date(Date.now() - 86400000));
  const neverMissTwiceHabitIds = new Set<string>();

  for (const h of activeHabits) {
    if (!isHabitScheduledOn(h, yesterday)) continue;
    if (!isHabitScheduledOn(h, today)) continue;
    const yLog = logs.find(l => l.habit_id === h.id && l.date === yesterday);
    const tLog = logs.find(l => l.habit_id === h.id && l.date === today);
    const missedYesterday = !isHabitDone(h, yLog?.value);
    const doneToday = isHabitDone(h, tLog?.value);
    if (missedYesterday && !doneToday) {
      neverMissTwiceHabitIds.add(h.id);
    }
  }

  // ── 2. Measure gap — walk back from yesterday ─────────────────────────────
  const dates = lastNDates(45); // look back up to 45 days
  let gapDays = 0;
  let foundActivity = false;

  for (let i = dates.length - 2; i >= 0; i--) { // start from yesterday
    const date = dates[i];
    const hasScheduled = activeHabits.some(h => isHabitScheduledOn(h, date));
    if (!hasScheduled) continue; // skip days with no scheduled habits

    const score = calcDayScore(activeHabits, logs, date);
    if (score === 0) {
      gapDays++;
    } else {
      foundActivity = true;
      break;
    }
  }

  // No gap or already active today (they've already started their comeback)
  if (gapDays === 0) {
    return { ...NONE, neverMissTwiceHabitIds };
  }

  // Determine state
  // DRIFT: 2–7 days missed → gentle nudge with ONE suggestion
  // RESET: 8+ days missed → warm "fresh start" message
  const state: SmartReturnState = gapDays >= 8 ? 'reset' : gapDays >= 2 ? 'drift' : 'none';
  if (state === 'none') {
    return { ...NONE, neverMissTwiceHabitIds };
  }

  // ── 3. Find best suggested habit for today ───────────────────────────────
  // Score each habit by: scheduled today + historical completion rate
  const lookback = lastNDates(30); // 30-day history for rate calculation
  const todayScheduled = activeHabits.filter(h => isHabitScheduledOn(h, today));

  let suggestedHabit: Habit | null = null;
  let suggestedHabitRate = 0;

  for (const h of todayScheduled) {
    // Skip if already done today
    const todayLog = logs.find(l => l.habit_id === h.id && l.date === today);
    if (isHabitDone(h, todayLog?.value)) continue;

    const scheduledDays = lookback.filter(d => isHabitScheduledOn(h, d));
    if (scheduledDays.length === 0) continue;

    const completedDays = scheduledDays.filter(d => {
      const log = logs.find(l => l.habit_id === h.id && l.date === d);
      return isHabitDone(h, log?.value);
    });

    const rate = Math.round((completedDays.length / scheduledDays.length) * 100);

    // Pick the habit with highest historical rate (most reliable = easiest win)
    if (rate > suggestedHabitRate) {
      suggestedHabitRate = rate;
      suggestedHabit = h;
    }
  }

  return {
    state,
    gapDays,
    suggestedHabit,
    suggestedHabitRate,
    neverMissTwiceHabitIds,
  };
}
