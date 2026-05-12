import React, { useState, useCallback } from 'react';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { NumericInput } from '@/components/ui/NumericInput';
import { useAuthStore } from '@/store/authStore';
import { playSound } from '@/lib/sounds';
import type { Habit, HabitLog } from '@/types';
import { clx } from '@/lib/utils';

interface HabitRowProps {
  habit: Habit;
  date: string;
  log: HabitLog | undefined;
  onToggle: (habitId: string, date: string, value: string) => void;
  onNote?: (habitId: string, date: string, note: string) => void;
  onNameClick?: (habit: Habit) => void;
  readOnly?: boolean;
}

export const HabitRow: React.FC<HabitRowProps> = ({
  habit, date, log, onToggle, onNote, onNameClick, readOnly = false,
}) => {
  const [showNote, setShowNote] = useState(false);
  const [noteText, setNoteText] = useState(log?.note ?? '');
  const [justCompleted, setJustCompleted] = useState(false);

  const checked      = log?.value === 'true';
  const numericValue = log ? (parseFloat(log.value) || null) : null;
  const unit         = habit.unit ?? undefined;
  const step         = unit === 'ml' ? 50 : ['L', 'km', 'mi', 'hrs'].includes(unit ?? '') ? 0.1 : 1;

  const hasGoal  = habit.goal != null && habit.goal > 0 && habit.type === 'numeric';
  const progress = hasGoal ? Math.min(100, Math.round(((numericValue ?? 0) / habit.goal!) * 100)) : null;
  const goalMet  = progress !== null && progress >= 100;

  const { profile } = useAuthStore();

  const handleCheckbox = useCallback((v: boolean) => {
    playSound(v ? 'pop' : 'unpop', profile?.sound_enabled);
    onToggle(habit.id, date, v ? 'true' : 'false');
    if (v) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }
  }, [habit.id, date, onToggle, profile?.sound_enabled]);

  const handleNumeric = useCallback((v: number | null) => {
    if (v !== null) {
      if (v > (numericValue ?? 0)) playSound('pop', profile?.sound_enabled);
      else if (v < (numericValue ?? 0)) playSound('unpop', profile?.sound_enabled);
      onToggle(habit.id, date, String(v));
    }
  }, [habit.id, date, numericValue, onToggle, profile?.sound_enabled]);

  const handleNoteSave = useCallback(() => {
    onNote?.(habit.id, date, noteText);
    setShowNote(false);
  }, [habit.id, date, noteText, onNote]);

  const isDone = checked || (habit.type === 'numeric' && (numericValue ?? 0) > 0);

  return (
    <div className="group">
      <div
        className={clx(
          'flex items-center justify-between gap-3 px-3 py-3.5 sm:py-3 rounded-xl transition-all duration-300',
          !readOnly && 'hover:bg-white/[0.025]',
          justCompleted && 'bg-emerald-500/5',
        )}
        style={
          isDone && !readOnly
            ? { borderLeft: '2px solid rgba(16,185,129,0.25)' }
            : { borderLeft: '2px solid transparent' }
        }
      >
        {/* Left: icon + name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {habit.icon && (
            <span
              className={clx(
                'text-base leading-normal flex-shrink-0 transition-all duration-300',
                justCompleted && 'scale-125',
              )}
            >
              {habit.icon}
            </span>
          )}
          <button
            type="button"
            onClick={() => onNameClick?.(habit)}
            className={clx(
              'text-sm truncate text-left transition-colors duration-200',
              isDone
                ? 'text-text-muted line-through decoration-text-subtle/50'
                : readOnly
                  ? 'text-text-muted'
                  : 'text-text-primary',
              onNameClick && !readOnly && 'hover:text-violet cursor-pointer',
            )}
          >
            {habit.name}
            {unit && (
              <span className="text-[10px] text-text-subtle ml-1.5" style={{ textDecoration: 'none' }}>
                ({unit})
              </span>
            )}
          </button>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Note button */}
          {!readOnly && onNote && (
            <button
              onClick={() => setShowNote(v => !v)}
              title={log?.note ? 'Edit note' : 'Add note'}
              className={clx(
                'sm:opacity-0 group-hover:opacity-100 opacity-100 w-8 h-8 sm:w-6 sm:h-6',
                'flex items-center justify-center rounded-lg transition-all duration-200',
                showNote || log?.note
                  ? 'sm:opacity-100 text-violet bg-violet/10'
                  : 'text-text-subtle hover:text-text-muted hover:bg-white/[0.04]',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 2h10v8H8l-3 2v-2H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Goal badge */}
          {hasGoal && numericValue !== null && (
            <span
              className="text-[10px] font-mono flex-shrink-0 px-1.5 py-0.5 rounded-md"
              style={
                goalMet
                  ? { background: 'rgba(16,185,129,0.15)', color: '#34D399' }
                  : { background: 'rgba(28,30,52,0.6)', color: 'rgb(62,66,104)' }
              }
            >
              {Math.round(numericValue)}/{habit.goal}
            </span>
          )}

          {/* Input */}
          {habit.type === 'checkbox' ? (
            <CustomCheckbox checked={checked} onChange={handleCheckbox} disabled={readOnly} size="sm" />
          ) : (
            <NumericInput
              value={numericValue}
              onChange={handleNumeric}
              calMin={habit.cal_min}
              calMax={habit.cal_max}
              disabled={readOnly}
              unit={undefined}
              step={step}
            />
          )}
        </div>
      </div>

      {/* Progress bar */}
      {hasGoal && (
        <div className="mx-3 mb-1 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(28,30,52,0.8)' }}>
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progress}%`,
              background: goalMet
                ? 'linear-gradient(90deg, #10B981, #34D399)'
                : 'linear-gradient(90deg, rgba(139,92,246,0.5), rgba(139,92,246,0.8))',
            }}
          />
        </div>
      )}

      {/* Note textarea */}
      {showNote && (
        <div className="px-3 pb-2.5 animate-fade-in">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            placeholder="Add a note for today…"
            autoFocus
            rows={2}
            className="w-full rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-subtle resize-none focus:outline-none transition-all duration-200"
            style={{
              background: 'rgb(7,8,15)',
              border: '1px solid rgba(28,30,52,0.8)',
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.06)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(28,30,52,0.8)';
              e.currentTarget.style.boxShadow = 'none';
              onNote?.(habit.id, date, noteText);
              setShowNote(false);
            }}
          />
        </div>
      )}
    </div>
  );
};
