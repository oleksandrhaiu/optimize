import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { currentMonthYear } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

import { StatCard } from '@/components/dashboard/StatCard';
import { CompletionChart } from '@/components/dashboard/CompletionChart';
import { CalorieChart } from '@/components/dashboard/CalorieChart';
import { WeekdayChart } from '@/components/dashboard/WeekdayChart';
import { HeatmapGrid } from '@/components/dashboard/HeatmapGrid';

export const Dashboard: React.FC = () => {
  const { session } = useAuthStore();
  const userId = session?.user.id;
  const [monthYear] = useState(currentMonthYear);

  const { habits, loading: habitsLoading } = useHabits(userId);
  const { logs, loading: logsLoading } = useHabitLogs(userId, monthYear.year, monthYear.month);

  const stats = useDashboardStats(habits, logs, monthYear.year, monthYear.month);
  const loading = habitsLoading || logsLoading;

  const calorieHabit = habits.find(h => h.is_calorie_habit);

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm">Your analytics for {monthYear.month + 1}/{monthYear.year}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Current Streak"
                value={stats.currentStreak}
                unit="days"
                icon="🔥"
                color="amber"
                subtitle="Keep it up!"
              />
              <StatCard
                label="Best Streak"
                value={stats.bestStreak}
                unit="days"
                icon="🏆"
                color="amber"
              />
              <StatCard
                label="Avg Calories"
                value={stats.avgCalories}
                unit="kcal"
                icon="⚡"
                color="blue"
              />
              <StatCard
                label="Green Days"
                value={stats.greenDays}
                unit="days"
                icon="✅"
                color="green"
                subtitle="80%+ completion"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CompletionChart data={stats.dailyStats} />
              <CalorieChart
                data={stats.dailyStats}
                calMin={calorieHabit?.cal_min ?? null}
                calMax={calorieHabit?.cal_max ?? null}
              />
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
              <WeekdayChart weekdayAvg={stats.weekdayAvg} />
              <HeatmapGrid habits={habits} logs={logs} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
