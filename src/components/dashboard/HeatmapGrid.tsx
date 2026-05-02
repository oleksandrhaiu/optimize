import React, { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { dateKey, calcDayScore } from '@/lib/utils';
import type { Habit, HabitLog } from '@/types';

interface Props {
  habits: Habit[];
  logs: HabitLog[];
}

export const HeatmapGrid: React.FC<Props> = ({ habits, logs }) => {
  const weeks = useMemo(() => {
    // Generate last 52 weeks
    const today = new Date();
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const start = new Date(end);
    start.setDate(start.getDate() - 52 * 7);

    // Group into weeks (arrays of 7 dates)
    const result: string[][] = [];
    let currentWeek: string[] = [];

    const cur = new Date(start);
    // Align to Sunday/Monday depending on locale. Here we just take 364 days.
    while (cur <= end) {
      currentWeek.push(dateKey(cur.getFullYear(), cur.getMonth(), cur.getDate()));
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
      cur.setDate(cur.getDate() + 1);
    }
    if (currentWeek.length > 0) result.push(currentWeek);
    return result;
  }, []);

  const getHeatmapColor = (score: number) => {
    if (score === 0) return 'heatmap-0';
    if (score < 25) return 'heatmap-1';
    if (score < 50) return 'heatmap-2';
    if (score < 80) return 'heatmap-3';
    return 'heatmap-4';
  };

  return (
    <Card className="overflow-x-auto">
      <h3 className="text-text-primary font-medium text-sm mb-4">Activity Heatmap</h3>
      <div className="flex gap-1 min-w-max pb-2">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((dateStr) => {
              const score = calcDayScore(habits, logs, dateStr);
              return (
                <div
                  key={dateStr}
                  className={`heatmap-cell ${getHeatmapColor(score)}`}
                  title={`${dateStr}: ${score}%`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </Card>
  );
};
