import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clx } from '@/lib/utils';
import type { Habit } from '@/types';

interface HabitItemProps {
  habit: Habit;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onUpdate, onDelete }) => {
  const [showCalorie, setShowCalorie] = useState(
    habit.is_calorie_habit && (habit.cal_min !== null || habit.cal_max !== null),
  );
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: habit.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clx(
        'group bg-bg border border-border/60 rounded-xl transition-all duration-150',
        isDragging ? 'opacity-50 shadow-lg scale-[1.02] z-10' : 'hover:border-border',
      )}
    >
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-text-subtle hover:text-text-muted p-0.5 flex-shrink-0 touch-none"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="4" r="1.2" fill="currentColor" />
            <circle cx="10" cy="4" r="1.2" fill="currentColor" />
            <circle cx="6" cy="8" r="1.2" fill="currentColor" />
            <circle cx="10" cy="8" r="1.2" fill="currentColor" />
            <circle cx="6" cy="12" r="1.2" fill="currentColor" />
            <circle cx="10" cy="12" r="1.2" fill="currentColor" />
          </svg>
        </div>

        {/* Icon */}
        {habit.icon && (
          <span className="text-lg leading-normal flex-shrink-0">{habit.icon}</span>
        )}

        {/* Name */}
        <input
          value={habit.name}
          onChange={(e) => onUpdate(habit.id, { name: e.target.value })}
          className="bg-transparent border-none focus:outline-none text-text-primary text-sm flex-1 min-w-0 placeholder-text-muted"
          placeholder="Habit name"
        />

        {/* Type badge */}
        <span className={clx(
          'text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0',
          habit.type === 'checkbox'
            ? 'bg-blue/10 text-blue'
            : 'bg-amber/10 text-amber',
        )}>
          {habit.type === 'checkbox' ? '☑ check' : '# numeric'}
        </span>

        {/* Calorie toggle (only for numeric) */}
        {habit.type === 'numeric' && (
          <button
            onClick={() => {
              const next = !habit.is_calorie_habit;
              onUpdate(habit.id, { is_calorie_habit: next });
              setShowCalorie(next);
            }}
            title={habit.is_calorie_habit ? 'Calorie tracking ON' : 'Enable calorie tracking'}
            className={clx(
              'flex-shrink-0 px-1.5 py-0.5 rounded-lg text-[10px] font-medium transition-colors',
              habit.is_calorie_habit
                ? 'bg-accent-green/15 text-accent-green'
                : 'text-text-subtle hover:text-text-muted',
            )}
          >
            🔥
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => onDelete(habit.id)}
          className="text-text-subtle hover:text-red p-1 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M2 3.5H12M4.5 3.5V2C4.5 1.448 4.948 1 5.5 1H8.5C9.052 1 9.5 1.448 9.5 2V3.5M5.5 6.5V10.5M8.5 6.5V10.5M3 3.5L3.5 11.5C3.5 12.052 3.948 12.5 4.5 12.5H9.5C10.052 12.5 10.5 12.052 10.5 11.5L11 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Calorie target sub-row */}
      {habit.is_calorie_habit && (
        <div className="flex items-center gap-3 px-3 pb-2.5 border-t border-border/30 pt-2 mt-0.5">
          <span className="text-xs text-text-muted flex-shrink-0">Target range:</span>
          <div className="flex items-center gap-1.5 flex-1">
            <input
              type="number"
              placeholder="Min"
              value={habit.cal_min ?? ''}
              onChange={e => onUpdate(habit.id, { cal_min: e.target.value ? parseFloat(e.target.value) : null })}
              className="input-base py-1 px-2 text-xs w-20 text-center font-mono-nums"
              min={0}
            />
            <span className="text-text-subtle text-xs">–</span>
            <input
              type="number"
              placeholder="Max"
              value={habit.cal_max ?? ''}
              onChange={e => onUpdate(habit.id, { cal_max: e.target.value ? parseFloat(e.target.value) : null })}
              className="input-base py-1 px-2 text-xs w-20 text-center font-mono-nums"
              min={0}
            />
            <span className="text-xs text-text-muted">kcal</span>
          </div>
          <div className="flex-shrink-0 text-[10px] text-text-subtle">
            {habit.cal_min && habit.cal_max
              ? `±${Math.round(((habit.cal_max - habit.cal_min) / 2))} kcal buffer`
              : 'Set range'}
          </div>
        </div>
      )}
    </div>
  );
};
