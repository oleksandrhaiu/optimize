import { useState, useMemo } from 'react';
import type { Habit, HabitLog } from '@/types';
import { calcDayScore, lastNDates, isHabitScheduledOn, todayStr, formatDate, isHabitDone } from '@/lib/utils';

const STORAGE_KEY = 'lumina.weeklyReview';

function getLastSundayStr(): string {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysBack = dayOfWeek === 0 ? 0 : dayOfWeek;
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - daysBack);
  return formatDate(sunday);
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

const EMPTY_REVIEW: WeeklyReviewData = {
  weekCompletionPct: 0,
  greenDays: 0,
  bestHabits: [],
  totalScheduledDays: 7,
};

export function useWeeklyReview(habits: Habit[], logs: HabitLog[]) {
  const lastSunday = getLastSundayStr();

  // useState so dismissing in one tab reflects in another on next mount
  const [alreadyShown] = useState(() =>
    localStorage.getItem(STORAGE_KEY) === lastSunday,
  );
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = isSunday() && !alreadyShown && habits.length > 0 && !dismissed;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, lastSunday);
    setDismissed(true);
  };

  // Only compute review data when it will actually be shown (Sundays)
  const reviewData: WeeklyReviewData = useMemo(() => {
    if (!shouldShow) return EMPTY_REVIEW;

    const last7 = lastNDates(7);
    const today = todayStr();

    const dayScores = last7.map(date => ({
      date,
      score: calcDayScore(habits, logs, date),
    }));

    const weekCompletionPct = Math.round(
      dayScores.reduce((sum, d) => sum + d.score, 0) / last7.length
    );

    const greenDays = dayScores.filter(d => d.score >= 80).length;

    const habitRates = habits
      .filter(h => !h.is_archived)
      .map(habit => {
        const scheduledDays = last7.filter(date => isHabitScheduledOn(habit, date) && date <= today);
        if (scheduledDays.length === 0) return null;

        const completedDays = scheduledDays.filter(date => {
          const log = logs.find(l => l.habit_id === habit.id && l.date === date);
          return isHabitDone(habit, log?.value);
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
  }, [shouldShow, habits, logs]);

  return { shouldShow, reviewData, dismiss };
}
