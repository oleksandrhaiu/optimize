import React, { useRef, useEffect } from 'react';
import { HabitRow } from './HabitRow';
import type { Habit, HabitLog } from '@/types';
import { getDaysArray, dateKey, calcDayScore, todayStr, isHabitDone, isHabitScheduledOn } from '@/lib/utils';
import { clx } from '@/lib/utils';

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
  const selectedDayRef = useRef<HTMLButtonElement>(null);
  
  // Scroll to selected day on mount
  useEffect(() => {
    if (selectedDayRef.current) {
      selectedDayRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedDay, month, year]);

  const days = getDaysArray(month, year);
  const today = todayStr();
  const selectedDate = dateKey(year, month, selectedDay);

  const dayScores = days.map(d => calcDayScore(habits, logs, dateKey(year, month, d)));
  const todayScore = calcDayScore(habits, logs, selectedDate);
  const greenDays = dayScores.filter(s => s >= 80).length;

  const scheduledHabits = habits.filter(h => !h.is_archived && isHabitScheduledOn(h, selectedDate));

  const completedToday = scheduledHabits.filter(h => {
    const log = logs.find(l => l.habit_id === h.id && l.date === selectedDate);
    return isHabitDone(h, log?.value);
  }).length;

  const progressPct = scheduledHabits.length > 0 ? Math.round((completedToday / scheduledHabits.length) * 100) : 0;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const offset = (firstDayOfMonth + 6) % 7;

  // Score label
  const scoreColor = todayScore >= 80 ? '#10B981' : todayScore >= 50 ? '#F59E0B' : todayScore > 0 ? '#EF4444' : undefined;

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">

      {/* ── Calendar Strip ─────────────────────────────────────────── */}
      <div className="mb-2">
        <div className="flex items-center justify-between px-2 mb-3">
          <span className="text-sm font-semibold text-text-primary font-heading tracking-wide">
            {MONTH_NAMES[month]} {year}
          </span>
          <span className="text-xs font-medium text-text-subtle">
            {greenDays > 0 ? `${greenDays} perfect days` : 'Start tracking!'}
          </span>
        </div>

        {/* Scrollable Weekly Strip */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 px-2 pb-2 snap-x snap-mandatory">
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
            
            const dateObj = new Date(year, month, day);
            const dowLabel = DAY_LABELS[(dateObj.getDay() + 6) % 7]; // 0=Mon, 6=Sun

            return (
              <button
                key={day}
                ref={isSelected ? selectedDayRef : null}
                data-day={day}
                onClick={() => onDaySelect(day)}
                className={clx(
                  'flex-shrink-0 flex flex-col items-center justify-center w-[52px] h-[64px] rounded-2xl snap-center',
                  'transition-all duration-200 select-none relative',
                  isSelected
                    ? 'bg-accent/20 border border-accent/40 shadow-sm'
                    : isToday
                      ? 'bg-bg border border-border hover:bg-card'
                      : 'bg-card border border-border/50 hover:border-text-muted',
                )}
              >
                <span className={clx(
                  "text-[10px] font-semibold uppercase tracking-wider mb-0.5",
                  isSelected ? "text-accent" : "text-text-subtle"
                )}>
                  {dowLabel}
                </span>
                <span className={clx(
                  "text-lg font-heading font-bold",
                  isSelected ? "text-text-primary" : isToday ? "text-text-primary" : "text-text-muted"
                )}>
                  {day}
                </span>
                
                {/* Score Dot */}
                {s > 0 && dotColor && (
                  <span
                    className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: dotColor, opacity: isSelected ? 1 : 0.7 }}
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
                {completedToday}/{scheduledHabits.length} completed
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
          {scheduledHabits.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-3xl">📝</p>
              <p className="text-text-muted text-sm font-medium">No habits yet</p>
              <p className="text-text-subtle text-xs">Add some in Settings.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {scheduledHabits.map(habit => (
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
