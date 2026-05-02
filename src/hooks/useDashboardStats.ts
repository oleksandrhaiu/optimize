import { useMemo } from 'react';
import type { Habit, HabitLog, DashboardStats } from '@/types';
import {
  buildDailyStats,
  calcCurrentStreak,
  calcBestStreak,
  WEEKDAY_LABELS,
  weekdayIndex,
  parseDate,
} from '@/lib/utils';

export function useDashboardStats(
  habits: Habit[],
  logs: HabitLog[],
  dateRange: string[],
): DashboardStats {
  return useMemo(() => {
    const dailyStats = buildDailyStats(habits, logs, dateRange);
    const currentStreak = calcCurrentStreak(dailyStats);
    const bestStreak = calcBestStreak(dailyStats);

    const calorieHabit = habits.find(h => h.is_calorie_habit);
    const calorieLogs = calorieHabit
      ? logs.filter(l => l.habit_id === calorieHabit.id && parseFloat(l.value) > 0)
      : [];
    const avgCalories =
      calorieLogs.length > 0
        ? Math.round(calorieLogs.reduce((s, l) => s + parseFloat(l.value), 0) / calorieLogs.length)
        : 0;

    const greenDays = dailyStats.filter(d => d.isGreenDay).length;

    // Weekday averages (Mon=0 … Sun=6)
    const weekdayTotals = Array(7).fill(0);
    const weekdayCounts = Array(7).fill(0);
    for (const stat of dailyStats) {
      if (stat.completionPct === 0) continue;
      const idx = weekdayIndex(parseDate(stat.date));
      weekdayTotals[idx] += stat.completionPct;
      weekdayCounts[idx]++;
    }
    const weekdayAvg = weekdayTotals.map((total, i) =>
      weekdayCounts[i] > 0 ? Math.round(total / weekdayCounts[i]) : 0,
    );

    return { currentStreak, bestStreak, avgCalories, greenDays, dailyStats, weekdayAvg };
  }, [habits, logs, dateRange]);
}

export { WEEKDAY_LABELS };
