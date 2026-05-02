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

  const checked     = log?.value === 'true';
  const numericValue = log ? (parseFloat(log.value) || null) : null;

  const unit = habit.unit ?? undefined;
  const step = unit === 'ml' ? 50 : ['L', 'km', 'mi', 'hrs'].includes(unit ?? '') ? 0.1 : 1;

  // goal progress
  const hasGoal = habit.goal != null && habit.goal > 0 && habit.type === 'numeric';
  const progress = hasGoal ? Math.min(100, Math.round(((numericValue ?? 0) / habit.goal!) * 100)) : null;

  const { profile } = useAuthStore();

  const handleCheckbox = (v: boolean) => {
    playSound(v ? 'pop' : 'unpop', profile?.sound_enabled);
    onToggle(habit.id, date, v ? 'true' : 'false');
  };
  const handleNumeric  = (v: number | null) => { 
    if (v !== null) {
      if (v > (numericValue ?? 0)) playSound('pop', profile?.sound_enabled);
      else if (v < (numericValue ?? 0)) playSound('unpop', profile?.sound_enabled);
      onToggle(habit.id, date, String(v)); 
    }
  };
  const handleNoteSave = () => { onNote?.(habit.id, date, noteText); setShowNote(false); };

  return (
    <div className="group">
      <div className={clx(
        'flex items-center justify-between gap-3 px-3 py-3.5 sm:py-2.5 rounded-xl transition-colors',
        !readOnly && 'hover:bg-white/[0.03]',
      )}>
        {/* Left: icon + name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {habit.icon && (
            <span className="text-lg leading-normal flex-shrink-0">{habit.icon}</span>
          )}
          <button
            type="button"
            onClick={() => onNameClick?.(habit)}
            className={clx(
              'text-sm truncate text-left',
              readOnly ? 'text-text-muted' : 'text-text-primary',
              onNameClick && !readOnly && 'hover:text-accent transition-colors cursor-pointer',
            )}
          >
            {habit.name}
            {unit && <span className="text-[10px] text-text-subtle ml-1.5">({unit})</span>}
          </button>
        </div>

        {/* Right: control + note toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Note icon — only non-readOnly */}
          {!readOnly && onNote && (
            <button
              onClick={() => setShowNote(v => !v)}
              title={log?.note ? 'Edit note' : 'Add note'}
              className={clx(
                'sm:opacity-0 group-hover:opacity-100 opacity-100 w-8 h-8 sm:w-5 sm:h-5 flex items-center justify-center rounded transition-all',
                showNote || log?.note ? 'sm:opacity-100 text-accent' : 'text-text-subtle hover:text-text-muted',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 2h10v8H8l-3 2v-2H2V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </button>
          )}

          {/* Goal progress badge */}
          {hasGoal && numericValue !== null && (
            <span className={clx(
              'text-[10px] font-mono flex-shrink-0',
              progress! >= 100 ? 'text-accent' : 'text-text-subtle',
            )}>
              {Math.round(numericValue)}/{habit.goal}
            </span>
          )}

          {/* Input control */}
          {habit.type === 'checkbox' ? (
            <CustomCheckbox checked={checked} onChange={handleCheckbox} disabled={readOnly} size="sm" />
          ) : (
            <NumericInput
              value={numericValue}
              onChange={handleNumeric}
              calMin={habit.cal_min}
              calMax={habit.cal_max}
              disabled={readOnly}
              unit={undefined}     // unit already shown in name
              step={step}
            />
          )}
        </div>
      </div>

      {/* Goal progress bar */}
      {hasGoal && (
        <div className="mx-3 mb-1 h-0.5 bg-border/40 rounded-full overflow-hidden">
          <div
            className={clx(
              'h-full rounded-full transition-all duration-500',
              progress! >= 100 ? 'bg-accent' : 'bg-accent/40',
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Inline note textarea */}
      {showNote && (
        <div className="px-3 pb-2.5 animate-fade-in">
          <textarea
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            onBlur={handleNoteSave}
            placeholder="Add a note for today…"
            autoFocus
            rows={2}
            className="w-full bg-bg border border-border/60 focus:border-accent/40 rounded-xl px-3 py-2 text-base sm:text-xs text-text-primary placeholder-text-muted resize-none focus:outline-none transition-colors"
          />
        </div>
      )}
    </div>
  );
};
