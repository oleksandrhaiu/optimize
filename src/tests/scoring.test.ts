import { describe, it, expect } from 'vitest';
import {
  calcDayScore,
  calcWeekScores,
  buildDailyStats,
  calcCurrentStreak,
  calcBestStreak,
  getCalorieZone,
} from '@/lib/utils';
import type { Habit, HabitLog } from '@/types';

// ─── Test fixtures ────────────────────────────────────────────────────────────

const makeHabit = (overrides: Partial<Habit> = {}): Habit => ({
  id: 'h1',
  user_id: 'u1',
  name: 'Test',
  type: 'checkbox',
  icon: null,
  unit: null,
  goal: null,
  cal_min: null,
  cal_max: null,
  is_calorie_habit: false,
  order: 0,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

const makeLog = (overrides: Partial<HabitLog> = {}): HabitLog => ({
  id: 'l1',
  habit_id: 'h1',
  user_id: 'u1',
  date: '2024-06-01',
  value: 'true',
  note: null,
  created_at: '2024-06-01T00:00:00Z',
  ...overrides,
});

// ─── calcDayScore ─────────────────────────────────────────────────────────────
describe('calcDayScore', () => {
  it('returns 0 when no habits', () => {
    expect(calcDayScore([], [], '2024-06-01')).toBe(0);
  });

  it('returns 100 when single checkbox habit is done', () => {
    const habits = [makeHabit()];
    const logs   = [makeLog({ value: 'true' })];
    expect(calcDayScore(habits, logs, '2024-06-01')).toBe(100);
  });

  it('returns 0 when checkbox is false', () => {
    const habits = [makeHabit()];
    const logs   = [makeLog({ value: 'false' })];
    expect(calcDayScore(habits, logs, '2024-06-01')).toBe(0);
  });

  it('returns 50 when 1 of 2 checkbox habits is done', () => {
    const habits = [
      makeHabit({ id: 'h1' }),
      makeHabit({ id: 'h2' }),
    ];
    const logs = [makeLog({ habit_id: 'h1', value: 'true' })];
    expect(calcDayScore(habits, logs, '2024-06-01')).toBe(50);
  });

  it('returns 100 for numeric habit with value > 0', () => {
    const habits = [makeHabit({ id: 'h1', type: 'numeric' })];
    const logs   = [makeLog({ value: '2000' })];
    expect(calcDayScore(habits, logs, '2024-06-01')).toBe(100);
  });

  it('returns 0 for numeric habit with value 0', () => {
    const habits = [makeHabit({ id: 'h1', type: 'numeric' })];
    const logs   = [makeLog({ value: '0' })];
    expect(calcDayScore(habits, logs, '2024-06-01')).toBe(0);
  });

  it('ignores logs from different dates', () => {
    const habits = [makeHabit()];
    const logs   = [makeLog({ date: '2024-06-02', value: 'true' })];
    expect(calcDayScore(habits, logs, '2024-06-01')).toBe(0);
  });

  it('rounds to integer', () => {
    const habits = [
      makeHabit({ id: 'h1' }),
      makeHabit({ id: 'h2' }),
      makeHabit({ id: 'h3' }),
    ];
    // 1/3 = 33.33... → rounds to 33
    const logs = [makeLog({ habit_id: 'h1', value: 'true' })];
    expect(calcDayScore(habits, logs, '2024-06-01')).toBe(33);
  });
});

// ─── getCalorieZone ───────────────────────────────────────────────────────────
describe('getCalorieZone', () => {
  it('returns "none" when no limits set', () => {
    expect(getCalorieZone(2000, null, null)).toBe('none');
  });
  it('returns "green" when in range', () => {
    expect(getCalorieZone(2000, 1800, 2200)).toBe('green');
  });
  it('returns "green" at exact min', () => {
    expect(getCalorieZone(1800, 1800, 2200)).toBe('green');
  });
  it('returns "green" at exact max', () => {
    expect(getCalorieZone(2200, 1800, 2200)).toBe('green');
  });
  it('returns "amber" when below min', () => {
    expect(getCalorieZone(1500, 1800, 2200)).toBe('amber');
  });
  it('returns "red" when above max', () => {
    expect(getCalorieZone(2500, 1800, 2200)).toBe('red');
  });
});

// ─── buildDailyStats ─────────────────────────────────────────────────────────
describe('buildDailyStats', () => {
  it('returns correct length', () => {
    const dates = ['2024-06-01', '2024-06-02', '2024-06-03'];
    const result = buildDailyStats([], [], dates);
    expect(result).toHaveLength(3);
  });

  it('marks isGreenDay when score >= 80', () => {
    const habits = [makeHabit({ id: 'h1' })];
    const logs   = [makeLog({ date: '2024-06-01', value: 'true' })];
    const stats  = buildDailyStats(habits, logs, ['2024-06-01']);
    expect(stats[0].isGreenDay).toBe(true);
    expect(stats[0].completionPct).toBe(100);
  });

  it('marks isGreenDay=false when score < 80', () => {
    const habits = [makeHabit({ id: 'h1' }), makeHabit({ id: 'h2' })];
    const logs   = [makeLog({ date: '2024-06-01', value: 'true' })];
    const stats  = buildDailyStats(habits, logs, ['2024-06-01']);
    expect(stats[0].isGreenDay).toBe(false); // 50%
  });

  it('extracts calorie value from calorie habit', () => {
    const calHabit = makeHabit({ id: 'cal', type: 'numeric', is_calorie_habit: true });
    const logs = [makeLog({ habit_id: 'cal', date: '2024-06-01', value: '1950' })];
    const stats = buildDailyStats([calHabit], logs, ['2024-06-01']);
    expect(stats[0].calories).toBe(1950);
  });
});

// ─── calcCurrentStreak ───────────────────────────────────────────────────────
describe('calcCurrentStreak', () => {
  it('returns 0 when no green days', () => {
    const stats = [{ date: '2024-06-01', completionPct: 50, isGreenDay: false, calories: null }];
    expect(calcCurrentStreak(stats)).toBe(0);
  });

  it('counts consecutive green days ending today', () => {
    const today = new Date();
    const mkDate = (daysAgo: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };
    const stats = [
      { date: mkDate(0), completionPct: 100, isGreenDay: true, calories: null },
      { date: mkDate(1), completionPct: 100, isGreenDay: true, calories: null },
      { date: mkDate(2), completionPct: 100, isGreenDay: true, calories: null },
      { date: mkDate(3), completionPct: 50, isGreenDay: false, calories: null },
    ];
    expect(calcCurrentStreak(stats)).toBe(3);
  });

  it('breaks streak on non-green day', () => {
    const today = new Date();
    const mkDate = (daysAgo: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return d.toISOString().split('T')[0];
    };
    const stats = [
      { date: mkDate(0), completionPct: 100, isGreenDay: true, calories: null },
      { date: mkDate(1), completionPct: 0,   isGreenDay: false, calories: null },
      { date: mkDate(2), completionPct: 100, isGreenDay: true, calories: null },
    ];
    expect(calcCurrentStreak(stats)).toBe(1);
  });
});

// ─── calcBestStreak ───────────────────────────────────────────────────────────
describe('calcBestStreak', () => {
  it('returns 0 with no data', () => {
    expect(calcBestStreak([])).toBe(0);
  });

  it('returns best consecutive run', () => {
    const stats = [
      { date: '2024-01-01', completionPct: 100, isGreenDay: true,  calories: null },
      { date: '2024-01-02', completionPct: 100, isGreenDay: true,  calories: null },
      { date: '2024-01-03', completionPct: 0,   isGreenDay: false, calories: null },
      { date: '2024-01-04', completionPct: 100, isGreenDay: true,  calories: null },
      { date: '2024-01-05', completionPct: 100, isGreenDay: true,  calories: null },
      { date: '2024-01-06', completionPct: 100, isGreenDay: true,  calories: null },
    ];
    expect(calcBestStreak(stats)).toBe(3);
  });

  it('handles all green days', () => {
    const stats = Array.from({ length: 10 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      completionPct: 100,
      isGreenDay: true,
      calories: null,
    }));
    expect(calcBestStreak(stats)).toBe(10);
  });
});
