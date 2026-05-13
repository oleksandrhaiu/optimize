import type { MonthYear, CalorieZone, Habit, HabitLog, DailyStats } from '@/types';

// ─── Date helpers ─────────────────────────────────────────────────────────────

/** Returns today's date as YYYY-MM-DD in local time */
export function todayStr(): string {
  return formatDate(new Date());
}

/** Formats a Date to YYYY-MM-DD in local time */
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses YYYY-MM-DD string to local Date (avoids UTC midnight offset) */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Returns number of days in a given month */
export function daysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Returns array of day numbers [1..n] for a month */
export function getDaysArray(month: number, year: number): number[] {
  const count = daysInMonth(month, year);
  return Array.from({ length: count }, (_, i) => i + 1);
}

/** Returns YYYY-MM-DD string for a given day in a month/year */
export function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Returns MonthYear for today */
export function currentMonthYear(): MonthYear {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

/** Short month name */
export function monthName(month: number): string {
  return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
}

/** Day of week short names Mon–Sun (0=Mon) */
export const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Returns 0=Mon … 6=Sun for a Date */
export function weekdayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Last N dates as YYYY-MM-DD ending today */
export function lastNDates(n: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(formatDate(d));
  }
  return dates;
}

/**
 * Returns true if a habit is scheduled on the given date.
 * Takes frequency and frequency_days into account.
 */
export function isHabitScheduledOn(habit: Habit, dateStr: string): boolean {
  // If date is before the habit was even created, it's not scheduled
  if (habit.created_at) {
    const localCreatedDateStr = formatDate(new Date(habit.created_at));
    if (dateStr < localCreatedDateStr) {
      return false;
    }
  }

  const date = parseDate(dateStr);
  const dow = weekdayIndex(date); // 0=Mon..6=Sun
  switch (habit.frequency ?? 'daily') {
    case 'daily':    return true;
    case 'weekdays': return dow <= 4; // Mon–Fri
    case 'weekends': return dow >= 5; // Sat–Sun
    case 'custom':   return Array.isArray(habit.frequency_days) && habit.frequency_days.includes(dow);
    default:         return true;
  }
}

/** All dates between startDate and endDate (inclusive) */
export function getDatesInRange(startStr: string, endStr: string): string[] {
  const start = parseDate(startStr);
  const end = parseDate(endStr);
  const dates: string[] = [];
  const cur = new Date(start);

  while (cur <= end) {
    dates.push(formatDate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// ─── Score calculation ────────────────────────────────────────────────────────

export function isHabitDone(habit: Habit, value: string | null | undefined): boolean {
  if (!value) return false;
  if (habit.type === 'checkbox') return value === 'true';
  const num = parseFloat(value);
  if (isNaN(num)) return false;
  
  if (habit.is_calorie_habit && habit.cal_min != null) {
    return num >= habit.cal_min;
  }
  if (habit.goal != null && habit.goal > 0) {
    return num >= habit.goal;
  }
  return num > 0;
}

/**
 * Calculates the daily completion percentage for a set of habits and logs.
 * Only considers habits scheduled for that specific date (respects frequency).
 * Checkbox: true = done. Numeric: respects cal_min or goal if present, otherwise > 0.
 */
export function calcDayScore(habits: Habit[], logs: HabitLog[], dateStr: string): number {
  const scheduled = habits.filter(h => !h.is_archived && isHabitScheduledOn(h, dateStr));
  if (scheduled.length === 0) return 0;
  const logMap = new Map(logs.filter(l => l.date === dateStr).map(l => [l.habit_id, l.value]));
  let done = 0;
  for (const h of scheduled) {
    const val = logMap.get(h.id);
    if (isHabitDone(h, val)) done++;
  }
  return Math.round((done / scheduled.length) * 100);
}

/** Calculates scores for the last 7 days */
export function calcWeekScores(habits: Habit[], logs: HabitLog[]): number[] {
  return lastNDates(7).map(date => calcDayScore(habits, logs, date));
}

// ─── Calorie zone ─────────────────────────────────────────────────────────────

export function getCalorieZone(value: number, calMin: number | null, calMax: number | null): CalorieZone {
  if (calMin === null || calMax === null) return 'none';
  if (value >= calMin && value <= calMax) return 'green';
  if (value < calMin) return 'amber';
  return 'red';
}

// ─── Dashboard stats ──────────────────────────────────────────────────────────

export function buildDailyStats(
  habits: Habit[],
  logs: HabitLog[],
  dateRange: string[], // YYYY-MM-DD strings
): DailyStats[] {
  const calorieHabit = habits.find(h => h.is_calorie_habit);

  return dateRange.map(dateStr => {
    const pct = calcDayScore(habits, logs, dateStr);
    let calories: number | null = null;
    if (calorieHabit) {
      const log = logs.find(l => l.habit_id === calorieHabit.id && l.date === dateStr);
      if (log) calories = parseFloat(log.value) || null;
    }
    return { date: dateStr, completionPct: pct, calories, isGreenDay: pct >= 80 };
  });
}

export function calcCurrentStreak(dailyStats: DailyStats[]): number {
  const today = todayStr();
  const sorted = [...dailyStats].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const s of sorted) {
    if (s.date > today) continue;
    if (s.isGreenDay) streak++;
    else break;
  }
  return streak;
}

export function calcBestStreak(dailyStats: DailyStats[]): number {
  const sorted = [...dailyStats].sort((a, b) => a.date.localeCompare(b.date));
  let best = 0;
  let cur = 0;
  for (const s of sorted) {
    if (s.isGreenDay) { cur++; best = Math.max(best, cur); }
    else cur = 0;
  }
  return best;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

export const AVATAR_COLORS = [
  '#00C896', '#4B9EFF', '#F5A623', '#FF5F5F',
  '#A78BFA', '#34D399', '#FB923C', '#60A5FA',
];

export function randomAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

/** Generates initials from a username */
export function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

// ─── Misc ─────────────────────────────────────────────────────────────────────

/** Generates a random invite token */
export function generateToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(18)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function clx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Streak shield ────────────────────────────────────────────────────────────

/**
 * Calculates streak with shield protection.
 * Shield rule: 1 missed scheduled day per 7-day window doesn't break the streak.
 * shield_used_at tracks when the last shield was consumed.
 */
export function getStreakWithShield(
  habits: Habit[],
  logs: HabitLog[],
  shieldUsedAt: string | null,
): { streak: number; shieldActive: boolean; shieldAvailable: boolean } {
  const today = todayStr();
  const dates = lastNDates(90); // look back 90 days
  
  let streak = 0;
  let shieldUsed = false;
  const shieldCooldownDays = 7;

  // Check if shield is available (not used in last 7 days)
  const shieldAvailable = !shieldUsedAt || (
    (parseDate(today).getTime() - parseDate(shieldUsedAt).getTime()) / 86400000 >= shieldCooldownDays
  );

  for (let i = dates.length - 1; i >= 0; i--) {
    const date = dates[i];
    if (date > today) continue;

    // Check if any habit is scheduled this day
    const scheduledHabits = habits.filter(h => !h.is_archived && isHabitScheduledOn(h, date));
    if (scheduledHabits.length === 0) continue; // skip unscheduled days

    const score = calcDayScore(habits, logs, date);
    
    if (score >= 80) {
      streak++;
    } else if (!shieldUsed && shieldAvailable) {
      // Use shield for this one miss
      shieldUsed = true;
      streak++;
    } else {
      break;
    }
  }

  return { streak, shieldActive: shieldUsed, shieldAvailable };
}

// ─── Streak milestones ────────────────────────────────────────────────────────

const STREAK_MILESTONES = [7, 14, 30, 60, 100, 365];

export function checkStreakMilestone(streak: number): number | null {
  return STREAK_MILESTONES.includes(streak) ? streak : null;
}
