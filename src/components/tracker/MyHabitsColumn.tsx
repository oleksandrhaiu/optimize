import React, { useRef, useEffect } from 'react';
import { HabitRow } from './HabitRow';
import type { Habit, HabitLog } from '@/types';
import { getDaysArray, dateKey, calcDayScore, todayStr } from '@/lib/utils';
import { clx } from '@/lib/utils';
import { ListChecks } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface MyHabitsColumnProps {
  habits: Habit[];
  logs: HabitLog[];
  year: number;
  month: number;
  selectedDay: number;
  onDaySelect: (day: number) => void;
  onToggle: (habitId: string, date: string, value: string) => void;
  onNote?: (habitId: string, date: string, note: string) => void;
  onHabitClick?: (habit: Habit) => void;
}

export const MyHabitsColumn: React.FC<MyHabitsColumnProps> = ({
  habits, logs, year, month, selectedDay, onDaySelect, onToggle, onNote, onHabitClick,
}) => {
  const days = getDaysArray(month, year);
  const today = todayStr();
  const selectedDate = dateKey(year, month, selectedDay);

  const dayScores = days.map(d => calcDayScore(habits, logs, dateKey(year, month, d)));
  const todayScore = calcDayScore(habits, logs, selectedDate);
  const greenDays = dayScores.filter(s => s >= 80).length;

  const completedToday = habits.filter(h => {
    const log = logs.find(l => l.habit_id === h.id && l.date === selectedDate);
    if (!log) return false;
    return h.type === 'checkbox' ? log.value === 'true' : parseFloat(log.value) > 0;
  }).length;

  const progressPct = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const offset = (firstDayOfMonth + 6) % 7;

  // Score label
  const scoreColor = todayScore >= 80 ? '#10B981' : todayScore >= 50 ? '#F59E0B' : todayScore > 0 ? '#EF4444' : undefined;

  return (
    <div className="flex flex-col gap-3">

      {/* ── Calendar ─────────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgb(12,13,22)',
          border: '1px solid rgb(28,30,52)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Month header */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2">
          <span className="text-xs font-semibold text-text-muted font-heading tracking-wide">
            {MONTH_NAMES[month]} {year}
          </span>
          <span
            className="text-xs font-mono font-medium"
            style={{ color: greenDays > 0 ? '#10B981' : 'rgb(62,66,104)' }}
          >
            {greenDays > 0 ? `${greenDays} perfect` : 'Start tracking!'}
          </span>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-0.5 px-2 mb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-text-subtle py-0.5">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5 px-2 pb-3">
          {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
          {days.map((day, i) => {
            const dk = dateKey(year, month, day);
            const isToday = dk === today;
            const isSelected = day === selectedDay;
            const s = dayScores[i];
            const dotColor =
              s === 0    ? null
              : s >= 80  ? '#10B981'
              : s >= 50  ? '#F59E0B'
              : '#EF4444';

            return (
              <button
                key={day}
                data-day={day}
                onClick={() => onDaySelect(day)}
                className={clx(
                  'relative flex flex-col items-center justify-center gap-0.5 h-9 rounded-xl',
                  'text-xs font-mono font-medium transition-all duration-200 select-none',
                  isSelected
                    ? 'text-white'
                    : isToday
                      ? 'text-violet'
                      : 'text-text-muted hover:text-text-primary',
                )}
                style={
                  isSelected
                    ? {
                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
                        boxShadow: '0 0 12px rgba(139,92,246,0.4)',
                      }
                    : isToday
                      ? {
                          background: 'rgba(139,92,246,0.1)',
                          boxShadow: '0 0 0 1px rgba(139,92,246,0.25)',
                        }
                      : undefined
                }
              >
                {day}
                {s > 0 && !isSelected && dotColor && (
                  <span
                    className="absolute bottom-1 w-1 h-1 rounded-full"
                    style={{ backgroundColor: dotColor }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Habits List ──────────────────────────────────────── */}
      <div
        className="rounded-2xl"
        style={{
          background: 'rgb(12,13,22)',
          border: '1px solid rgb(28,30,52)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-2.5">
            <div>
              <h3 className="font-heading font-semibold text-text-primary text-sm">
                {selectedDate === today ? 'Today' : `${MONTH_NAMES[month]} ${selectedDay}`}
              </h3>
              <p className="text-[11px] text-text-muted mt-0.5">
                {completedToday}/{habits.length} completed
              </p>
            </div>
            {todayScore > 0 && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold"
                style={{
                  background: `${scoreColor}18`,
                  color: scoreColor,
                  border: `1px solid ${scoreColor}30`,
                }}
              >
                {todayScore}%
              </div>
            )}
          </div>

          {/* Progress bar */}
          {habits.length > 0 && (
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgb(28,30,52)' }}>
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPct}%`,
                  background: progressPct >= 80
                    ? 'linear-gradient(90deg, #10B981, #34D399)'
                    : progressPct >= 50
                      ? 'linear-gradient(90deg, #F59E0B, #FCD34D)'
                      : 'linear-gradient(90deg, #8B5CF6, #A78BFA)',
                }}
              />
            </div>
          )}
        </div>

        {/* Habit rows */}
        <div className="p-2">
          {habits.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="flex justify-center mb-1 text-text-subtle">
                <ListChecks size={36} strokeWidth={1.5} />
              </div>
              <p className="text-text-muted text-sm font-medium">No habits yet</p>
              <p className="text-text-subtle text-xs">Add some in Settings.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {habits.map(habit => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  date={selectedDate}
                  log={logs.find(l => l.habit_id === habit.id && l.date === selectedDate)}
                  onToggle={onToggle}
                  onNote={onNote}
                  onNameClick={onHabitClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
