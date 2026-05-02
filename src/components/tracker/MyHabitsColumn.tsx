import React, { useRef, useEffect } from 'react';
import { HabitRow } from './HabitRow';
import { ScorePill } from './ScorePill';
import type { Habit, HabitLog } from '@/types';
import { getDaysArray, dateKey, calcDayScore, todayStr } from '@/lib/utils';

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
  habits,
  logs,
  year,
  month,
  selectedDay,
  onDaySelect,
  onToggle,
  onNote,
  onHabitClick,
}) => {
  const days = getDaysArray(month, year);
  const today = todayStr();
  const selectedDate = dateKey(year, month, selectedDay);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Compute scores
  const dayScores = days.map(d => calcDayScore(habits, logs, dateKey(year, month, d)));

  // Scroll selected day into view
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const btn = container.querySelector(`[data-day="${selectedDay}"]`) as HTMLElement | null;
    if (btn) {
      btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDay, month, year]);

  // Get the day-of-week offset so the grid aligns Mon–Sun
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  // Convert to Mon-based (0=Mon … 6=Sun)
  const offset = (firstDayOfMonth + 6) % 7;

  const todayScore = calcDayScore(habits, logs, selectedDate);
  const greenDays = dayScores.filter(s => s >= 80).length;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Day Picker ──────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
        {/* Month label */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <span className="text-xs font-medium text-text-muted">
            {MONTH_NAMES[month]} {year}
          </span>
          <span className={`text-xs font-mono ${greenDays > 0 ? 'text-accent' : 'text-text-subtle'}`}>
            {greenDays > 0 ? `${greenDays} perfect days` : 'Start tracking!'}
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
          {/* offset empty cells */}
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {days.map((day, i) => {
            const dk = dateKey(year, month, day);
            const isToday = dk === today;
            const isSelected = day === selectedDay;
            const s = dayScores[i];
            const dotColor =
              s === 0 ? '' :
              s >= 80 ? '#00C896' :
              s >= 50 ? '#F5A623' : '#FF5F5F';

            return (
              <button
                key={day}
                data-day={day}
                onClick={() => onDaySelect(day)}
                className={[
                  'relative flex flex-col items-center justify-center gap-0.5 h-9 rounded-lg text-xs font-mono font-medium transition-all duration-150 select-none',
                  isSelected
                    ? 'bg-accent text-bg shadow-glow-accent'
                    : isToday
                    ? 'bg-blue/10 text-blue ring-1 ring-blue/30'
                    : 'text-text-muted hover:bg-white/[0.05] hover:text-text-primary',
                ].join(' ')}
              >
                {day}
                {s > 0 && !isSelected && (
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

      {/* ── Habits List ──────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl shadow-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div>
            <h3 className="font-heading font-semibold text-text-primary text-sm">
              {selectedDate === today ? 'Today' : `${MONTH_NAMES[month]} ${selectedDay}`}
            </h3>
            <p className="text-[11px] text-text-muted mt-0.5">
              {habits.length} habit{habits.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ScorePill score={todayScore} />
        </div>

        <div className="p-2">
          {habits.length === 0 ? (
            <div className="text-center py-8 space-y-1">
              <p className="text-2xl">📝</p>
              <p className="text-text-muted text-sm">No habits yet.</p>
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
