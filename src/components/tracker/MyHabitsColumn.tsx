import React from 'react';
import { HabitRow } from './HabitRow';
import { ScorePill } from './ScorePill';
import { Card } from '@/components/ui/Card';
import type { Habit, HabitLog } from '@/types';
import { getDaysArray, dateKey, calcDayScore, todayStr } from '@/lib/utils';

interface MyHabitsColumnProps {
  habits: Habit[];
  logs: HabitLog[];
  year: number;
  month: number;
  selectedDay: number;
  onDaySelect: (day: number) => void;
  onToggle: (habitId: string, date: string, value: string) => void;
}

export const MyHabitsColumn: React.FC<MyHabitsColumnProps> = ({
  habits,
  logs,
  year,
  month,
  selectedDay,
  onDaySelect,
  onToggle,
}) => {
  const days = getDaysArray(month, year);
  const today = todayStr();
  const selectedDate = dateKey(year, month, selectedDay);

  // Score for each day
  const dayScores = days.map(d => calcDayScore(habits, logs, dateKey(year, month, d)));

  return (
    <div className="flex flex-col gap-4">
      {/* Day picker */}
      <Card padding="sm">
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {days.map((day, i) => {
            const dk = dateKey(year, month, day);
            const isToday = dk === today;
            const isSelected = day === selectedDay;
            const score = dayScores[i];
            const hasDot = score > 0;

            return (
              <button
                key={day}
                onClick={() => onDaySelect(day)}
                className={`
                  flex-shrink-0 flex flex-col items-center gap-0.5 w-9 py-2 rounded-lg transition-all duration-150
                  ${isSelected
                    ? 'bg-accent-green/15 ring-1 ring-accent-green/40'
                    : isToday
                      ? 'bg-blue/10 ring-1 ring-blue/30'
                      : 'hover:bg-white/[0.04]'
                  }
                `}
              >
                <span className={`font-mono text-xs font-medium ${isSelected ? 'text-accent-green' : isToday ? 'text-blue' : 'text-text-muted'}`}>
                  {day}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full ${hasDot ? (score >= 80 ? 'bg-accent-green' : score >= 50 ? 'bg-amber' : 'bg-red') : 'bg-transparent'}`} />
              </button>
            );
          })}
        </div>
      </Card>

      {/* Habits for selected day */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-text-primary text-sm">
            {selectedDate === today ? 'Today' : `Day ${selectedDay}`}
          </h3>
          <ScorePill score={calcDayScore(habits, logs, selectedDate)} />
        </div>
        {habits.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-4">
            No habits yet. Add some in Settings.
          </p>
        ) : (
          <div className="space-y-0.5">
            {habits.map(habit => (
              <HabitRow
                key={habit.id}
                habit={habit}
                date={selectedDate}
                log={logs.find(l => l.habit_id === habit.id && l.date === selectedDate)}
                onToggle={onToggle}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Monthly score summary */}
      <Card padding="sm">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-xs text-text-muted font-medium">Monthly Overview</span>
          <span className="text-xs font-mono text-accent-green">
            {dayScores.filter(s => s >= 80).length} green days
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            const s = dayScores[i];
            const color = s === 0 ? 'bg-border' : s >= 80 ? 'bg-accent-green' : s >= 50 ? 'bg-amber' : 'bg-red';
            return (
              <button
                key={day}
                onClick={() => onDaySelect(day)}
                title={`Day ${day}: ${s}%`}
                className={`h-2 rounded-sm ${color} opacity-80 hover:opacity-100 transition-opacity`}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
};
