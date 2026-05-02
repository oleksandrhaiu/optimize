import React from 'react';
import { CustomCheckbox } from '@/components/ui/CustomCheckbox';
import { NumericInput } from '@/components/ui/NumericInput';
import type { Habit, HabitLog } from '@/types';
import { clx } from '@/lib/utils';

interface HabitRowProps {
  habit: Habit;
  date: string;
  log: HabitLog | undefined;
  onToggle: (habitId: string, date: string, value: string) => void;
  readOnly?: boolean;
}

export const HabitRow: React.FC<HabitRowProps> = ({ habit, date, log, onToggle, readOnly = false }) => {
  const checked = log?.value === 'true';
  const numericValue = log ? (parseFloat(log.value) || null) : null;

  const handleCheckbox = (checked: boolean) => {
    onToggle(habit.id, date, checked ? 'true' : 'false');
  };

  const handleNumeric = (value: number | null) => {
    if (value === null) return;
    onToggle(habit.id, date, String(value));
  };

  return (
    <div
      className={clx(
        'flex items-center justify-between gap-3 px-3 py-2 rounded-xl transition-colors',
        !readOnly && 'hover:bg-white/[0.02]',
      )}
    >
      {/* Left: icon + name */}
      <div className="flex items-center gap-2 min-w-0">
        {habit.icon && <span className="text-base leading-none flex-shrink-0">{habit.icon}</span>}
        <span
          className={clx(
            'text-sm truncate',
            readOnly ? 'text-text-muted' : 'text-text-primary',
          )}
        >
          {habit.name}
        </span>
      </div>

      {/* Right: control */}
      <div className="flex-shrink-0">
        {habit.type === 'checkbox' ? (
          <CustomCheckbox checked={checked} onChange={handleCheckbox} disabled={readOnly} size="sm" />
        ) : (
          <NumericInput
            value={numericValue}
            onChange={handleNumeric}
            calMin={habit.cal_min}
            calMax={habit.cal_max}
            disabled={readOnly}
          />
        )}
      </div>
    </div>
  );
};
