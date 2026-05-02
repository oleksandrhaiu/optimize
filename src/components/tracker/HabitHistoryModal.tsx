import React, { useEffect, useRef, useState } from 'react';
import type { Habit, HabitLog } from '@/types';
import { clx, dateKey, calcDayScore } from '@/lib/utils';

interface HabitHistoryModalProps {
  habit: Habit;
  logs: HabitLog[];
  onClose: () => void;
}

function getLast30Days(): string[] {
  const days: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export const HabitHistoryModal: React.FC<HabitHistoryModalProps> = ({ habit, logs, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', fn);
    return () => document.removeEventListener('keydown', fn);
  }, [onClose]);

  const days = getLast30Days();
  const habitLogs = logs.filter(l => l.habit_id === habit.id);

  // Build per-day data
  const dayData = days.map(date => {
    const log = habitLogs.find(l => l.date === date);
    let done = false;
    let value: number | null = null;
    if (log) {
      done = habit.type === 'checkbox' ? log.value === 'true' : parseFloat(log.value) > 0;
      if (habit.type === 'numeric') value = parseFloat(log.value) || null;
    }
    return { date, done, value, note: log?.note ?? null };
  });

  // Stats
  const doneDays    = dayData.filter(d => d.done).length;
  const streak      = calcCurrentStreak(dayData.map(d => d.done));
  const values      = dayData.filter(d => d.value != null).map(d => d.value!);
  const avgValue    = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : null;

  // Week labels
  const weekLabels = ['', '', '', '', '', '', ''];
  const DAY_LABELS = ['M','T','W','T','F','S','S'];

  return (
    <div ref={overlayRef} className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={e => { if (e.target === overlayRef.current) onClose(); }}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-card animate-slide-up max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            {habit.icon && <span className="text-2xl">{habit.icon}</span>}
            <div>
              <h2 className="font-heading font-semibold text-text-primary">{habit.name}</h2>
              <p className="text-xs text-text-muted">{habit.type}{habit.unit ? ` · ${habit.unit}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-subtle hover:text-text-muted p-2 rounded-lg hover:bg-white/[0.05] transition-all">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '30d rate', value: `${Math.round((doneDays / 30) * 100)}%` },
              { label: 'Streak',   value: `${streak}d` },
              { label: habit.type === 'numeric' ? 'Avg' : 'Done', value: avgValue ? `${avgValue}${habit.unit ? ` ${habit.unit}` : ''}` : `${doneDays}` },
            ].map(s => (
              <div key={s.label} className="bg-bg rounded-xl p-3 text-center">
                <p className="text-lg font-heading font-bold text-text-primary">{s.value}</p>
                <p className="text-[10px] text-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Heatmap — 30 days */}
          <div>
            <p className="text-xs font-medium text-text-muted mb-2">Last 30 days</p>
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
              {dayData.map(({ date, done, value }) => (
                <div key={date}
                  title={`${date}${value != null ? `: ${value}${habit.unit ? ' ' + habit.unit : ''}` : ''}`}
                  className={clx(
                    'aspect-square rounded-md transition-all',
                    done ? 'bg-accent-green/70' : 'bg-border/40',
                  )}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          {dayData.some(d => d.note) && (
            <div>
              <p className="text-xs font-medium text-text-muted mb-2">Recent notes</p>
              <div className="space-y-2">
                {dayData.filter(d => d.note).slice(-5).reverse().map(d => (
                  <div key={d.date} className="bg-bg rounded-xl px-3 py-2">
                    <p className="text-[10px] text-text-subtle mb-1">{d.date}</p>
                    <p className="text-xs text-text-primary">{d.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function calcCurrentStreak(done: boolean[]): number {
  let streak = 0;
  for (let i = done.length - 1; i >= 0; i--) {
    if (done[i]) streak++;
    else break;
  }
  return streak;
}
