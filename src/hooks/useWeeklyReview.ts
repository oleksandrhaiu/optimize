import { useState, useMemo } from 'react';
import type { Habit, HabitLog } from '@/types';
import { calcDayScore, lastNDates, isHabitScheduledOn, todayStr } from '@/lib/utils';

const STORAGE_KEY = 'lumina.weeklyReview';

function getLastSundayStr(): string {
  const today = new Date();
  // 0=Sun in JS
  const dayOfWeek = today.getDay();
  // Days since last Sunday (if today is Sunday, it's 0 days ago)
  const daysBack = dayOfWeek === 0 ? 0 : dayOfWeek;
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - daysBack);
  return sunday.toISOString().slice(0, 10);
}

function isSunday(): boolean {
  return new Date().getDay() === 0;
}

interface WeeklyReviewData {
  weekCompletionPct: number;
  greenDays: number;
  bestHabits: Array<{ habit: Habit; completionRate: number }>;
  totalScheduledDays: number;
}

export function useWeeklyReview(habits: Habit[], logs: HabitLog[]) {
  const lastSunday = getLastSundayStr();
  const alreadyShownThisWeek = localStorage.getItem(STORAGE_KEY) === lastSunday;

  const [dismissed, setDismissed] = useState(false);
  // Show only on Sundays, if not already shown this week, and if user has some habits
  const shouldShow = isSunday() && !alreadyShownThisWeek && habits.length > 0 && !dismissed;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, lastSunday);
    setDismissed(true);
  };

  const reviewData: WeeklyReviewData = useMemo(() => {
    // Last 7 days (the current week)
    const last7 = lastNDates(7);
    const today = todayStr();

    // Calculate day scores
    const dayScores = last7.map(date => ({
      date,
      score: calcDayScore(habits, logs, date),
    }));

    const weekCompletionPct = Math.round(
      dayScores.reduce((sum, d) => sum + d.score, 0) / last7.length
    );

    const greenDays = dayScores.filter(d => d.score >= 80).length;

    // Per-habit completion rates for this week
    const habitRates = habits
      .filter(h => !h.is_archived)
      .map(habit => {
        const scheduledDays = last7.filter(date => isHabitScheduledOn(habit, date) && date <= today);
        if (scheduledDays.length === 0) return null;

        const completedDays = scheduledDays.filter(date => {
          const log = logs.find(l => l.habit_id === habit.id && l.date === date);
          if (!log) return false;
          if (habit.type === 'checkbox') return log.value === 'true';
          const num = parseFloat(log.value);
          if (habit.goal) return num >= habit.goal;
          return num > 0;
        });

        return {
          habit,
          completionRate: Math.round((completedDays.length / scheduledDays.length) * 100),
        };
      })
      .filter(Boolean) as Array<{ habit: Habit; completionRate: number }>;

    const bestHabits = [...habitRates]
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);

    return {
      weekCompletionPct,
      greenDays,
      bestHabits,
      totalScheduledDays: last7.length,
    };
  }, [habits, logs]);

  return { shouldShow, reviewData, dismiss };
}
