import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { supabase } from '@/lib/supabase';
import { formatDate, todayStr, currentMonthYear, getDatesInRange } from '@/lib/utils';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { clx } from '@/lib/utils';
import { exportHabitsCsv } from '@/lib/exportCsv';
import type { HabitLog } from '@/types';

import { StatCard } from '@/components/dashboard/StatCard';
import { CompletionChart } from '@/components/dashboard/CompletionChart';
import { CalorieChart } from '@/components/dashboard/CalorieChart';
import { WeekdayChart } from '@/components/dashboard/WeekdayChart';
import { HeatmapGrid } from '@/components/dashboard/HeatmapGrid';

type Range = 'week' | 'month' | 'year' | 'all';

const RANGES: { id: Range; label: string }[] = [
  { id: 'week',  label: '7 days' },
  { id: 'month', label: 'Month' },
  { id: 'year',  label: 'Year' },
  { id: 'all',   label: 'All time' },
];

function getDateRangeInfo(range: Range): { startDate: string; endDate: string; dates: string[] } {
  const today = new Date();
  const endDate = formatDate(today);
  let startDate: string;

  if (range === 'week') {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    startDate = formatDate(d);
  } else if (range === 'month') {
    startDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  } else if (range === 'year') {
    startDate = `${today.getFullYear()}-01-01`;
  } else {
    // All time - find earliest log or just 1 year back for now
    const d = new Date(today);
    d.setFullYear(d.getFullYear() - 1);
    startDate = formatDate(d);
  }

  return { startDate, endDate, dates: getDatesInRange(startDate, endDate) };
}

export const Dashboard: React.FC = () => {
  const { session } = useAuthStore();
  const userId = session?.user.id;
  const { year, month } = currentMonthYear();

  const { habits, loading: habitsLoading } = useHabits(userId);
  const [range, setRange] = useState<Range>('month');
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    setLogsLoading(true);
    const { startDate, endDate } = getDateRangeInfo(range);
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    setLogs((data as HabitLog[]) ?? []);
    setLogsLoading(false);
  }, [userId, range]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const rangeInfo = getDateRangeInfo(range);
  const stats = useDashboardStats(habits, logs, rangeInfo.dates);
  const loading = habitsLoading || logsLoading;
  const calorieHabit = habits.find(h => h.is_calorie_habit);

  const rangeLabel = {
    week: 'last 7 days',
    month: `${new Date(year, month, 1).toLocaleString('default', { month: 'long' })} ${year}`,
    year: String(year),
    all: 'last year',
  }[range];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Dashboard</h1>
            <p className="text-text-muted text-sm mt-0.5">Analytics for {rangeLabel}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* CSV Export */}
            <button
              onClick={() => exportHabitsCsv(habits, logs)}
              disabled={logs.length === 0}
              title="Export CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 text-xs text-text-muted hover:text-text-primary hover:border-border transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Export CSV
            </button>
          {/* Range switcher */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl p-1">
            {RANGES.map(r => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                className={clx(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                  range === r.id
                    ? 'bg-accent-green text-bg shadow-glow-green'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                {r.label}
              </button>
            ))}
          </div> {/* end range switcher */}
          </div> {/* end flex gap-2 */}
        </div>

        {/* Stat Cards */}
        <div className={clx(
          "grid gap-4",
          calorieHabit ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
        )}>
          {loading ? (
            [1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)
          ) : (
            <>
              <StatCard label="Current Streak" value={stats.currentStreak} unit="days" icon="🔥" color="amber" subtitle="Keep it up!" />
              <StatCard label="Best Streak" value={stats.bestStreak} unit="days" icon="🏆" color="amber" />
              {calorieHabit && (
                <StatCard label="Avg Calories" value={stats.avgCalories} unit="kcal" icon="⚡" color="blue" />
              )}
              <StatCard label="Green Days" value={stats.greenDays} unit="days" icon="✅" color="green" subtitle="80%+ completion" />
            </>
          )}
        </div>

        {/* Charts */}
        <div className={loading ? 'space-y-6' : 'space-y-6 animate-fade-in'}>
          <div className={clx("grid gap-6", calorieHabit ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
            {loading ? (
              <><Skeleton className="h-64 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></>
            ) : (
              <>
                <CompletionChart data={stats.dailyStats} />
                {calorieHabit && (
                  <CalorieChart
                    data={stats.dailyStats}
                    calMin={calorieHabit?.cal_min ?? null}
                    calMax={calorieHabit?.cal_max ?? null}
                  />
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
            {loading ? (
              <><Skeleton className="h-48 rounded-2xl" /><Skeleton className="h-48 rounded-2xl" /></>
            ) : (
              <>
                <WeekdayChart weekdayAvg={stats.weekdayAvg} />
                <HeatmapGrid habits={habits} logs={logs} />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
