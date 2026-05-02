import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clx } from '@/lib/utils';
import type { Habit } from '@/types';
import { CustomSelect } from '@/components/ui/CustomSelect';

const ALL_UNITS = [
  { value: '',         label: 'No unit' },
  { value: 'glasses',  label: 'Glasses' },
  { value: 'ml',       label: 'ml' },
  { value: 'L',        label: 'Liters' },
  { value: 'oz',       label: 'oz' },
  { value: 'hrs',      label: 'Hours' },
  { value: 'min',      label: 'Minutes' },
  { value: 'km',       label: 'km' },
  { value: 'mi',       label: 'Miles' },
  { value: 'k steps',  label: 'K steps' },
  { value: 'steps',    label: 'Steps' },
  { value: 'pages',    label: 'Pages' },
  { value: 'chapters', label: 'Chapters' },
  { value: 'kcal',     label: 'kcal' },
  { value: '/ 10',     label: 'Out of 10' },
  { value: '/ 5',      label: 'Out of 5' },
  { value: 'kg',       label: 'kg' },
  { value: 'lbs',      label: 'lbs' },
  { value: 'reps',     label: 'Reps' },
  { value: 'sets',     label: 'Sets' },
  { value: 'items',    label: 'Items' },
  { value: 'times',    label: 'Times' },
];

interface HabitItemProps {
  habit: Habit;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onUpdate, onDelete }) => {
  // show unit picker only if habit already has a unit, or user clicked "add unit"
  const [showUnitPicker, setShowUnitPicker] = useState(!!habit.group);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: habit.id });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleUnitChange = (v: string) => {
    onUpdate(habit.id, { group: v || null });
    if (!v) setShowUnitPicker(false);
  };

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

        {habit.icon && (
          <span className="text-xl leading-normal flex-shrink-0">{habit.icon}</span>
        )}

        <input
          value={habit.name}
          onChange={e => onUpdate(habit.id, { name: e.target.value })}
          className="bg-transparent border-none focus:outline-none text-text-primary text-sm flex-1 min-w-0 placeholder-text-muted"
          placeholder="Habit name"
        />

        {/* Unit area — only for numeric */}
        {habit.type === 'numeric' && (
          <>
            {showUnitPicker ? (
              <CustomSelect
                value={habit.group ?? ''}
                onChange={handleUnitChange}
                options={ALL_UNITS}
                className="w-28 flex-shrink-0"
              />
            ) : (
              <button
                type="button"
                onClick={() => setShowUnitPicker(true)}
                className="text-[10px] text-text-subtle hover:text-text-muted px-2 py-1 rounded-lg border border-dashed border-border/60 hover:border-border transition-all flex-shrink-0"
              >
                + unit
              </button>
            )}
          </>
        )}

        {/* Type badge */}
        <span className={clx(
          'text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0',
          habit.type === 'checkbox' ? 'bg-blue/10 text-blue' : 'bg-amber/10 text-amber',
        )}>
          {habit.type === 'checkbox' ? '☑' : '#'}
        </span>

        {/* Calorie toggle (numeric only) */}
        {habit.type === 'numeric' && (
          <button
            onClick={() => onUpdate(habit.id, { is_calorie_habit: !habit.is_calorie_habit })}
            title={habit.is_calorie_habit ? 'Calorie tracking ON' : 'Enable calorie tracking'}
            className={clx(
              'flex-shrink-0 p-1 rounded-lg text-base transition-colors leading-none',
              habit.is_calorie_habit ? 'text-amber' : 'text-text-subtle hover:text-text-muted',
            )}
          >
            🔥
          </button>
        )}

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
        <div className="flex items-center gap-3 px-3 pb-2.5 border-t border-border/30 pt-2">
          <span className="text-xs text-text-muted flex-shrink-0">🎯 Range:</span>
          <input
            type="number"
            placeholder="Min"
            value={habit.cal_min ?? ''}
            onChange={e => onUpdate(habit.id, { cal_min: e.target.value ? parseFloat(e.target.value) : null })}
            className="input-base py-1 px-2 text-xs w-20 text-center font-mono-nums"
          />
          <span className="text-text-subtle text-xs">–</span>
          <input
            type="number"
            placeholder="Max"
            value={habit.cal_max ?? ''}
            onChange={e => onUpdate(habit.id, { cal_max: e.target.value ? parseFloat(e.target.value) : null })}
            className="input-base py-1 px-2 text-xs w-20 text-center font-mono-nums"
          />
          <span className="text-xs text-text-muted">{habit.group || 'kcal'}</span>
          {habit.cal_min && habit.cal_max && (
            <span className="text-[10px] text-text-subtle ml-auto">
              ±{Math.round((habit.cal_max - habit.cal_min) / 2)} buffer
            </span>
          )}
        </div>
      )}
    </div>
  );
};
