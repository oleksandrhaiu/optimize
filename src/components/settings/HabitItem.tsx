import React from 'react';
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clx(
        'flex items-center gap-3 bg-card border border-border rounded-xl p-3',
        isDragging && 'opacity-50 z-10 shadow-lg scale-[1.02]',
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-text-muted hover:text-text-primary p-1"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle cx="6" cy="4" r="1.5" fill="currentColor" />
          <circle cx="10" cy="4" r="1.5" fill="currentColor" />
          <circle cx="6" cy="8" r="1.5" fill="currentColor" />
          <circle cx="10" cy="8" r="1.5" fill="currentColor" />
          <circle cx="6" cy="12" r="1.5" fill="currentColor" />
          <circle cx="10" cy="12" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div className="flex-1 flex gap-2 items-center">
        {habit.icon && <span className="text-xl leading-normal">{habit.icon}</span>}
        <input
          value={habit.name}
          onChange={(e) => onUpdate(habit.id, { name: e.target.value })}
          className="bg-transparent border-none focus:outline-none text-text-primary text-sm flex-1 placeholder-text-muted"
          placeholder="Habit name"
        />
      </div>

      <div className="flex gap-2 items-center">
        <span className="text-xs text-text-muted bg-bg px-2 py-1 rounded">
          {habit.type}
        </span>
        <button
          onClick={() => onDelete(habit.id)}
          className="text-text-muted hover:text-red p-1 transition-colors"
          title="Delete habit"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 3.5H12M4.5 3.5V2C4.5 1.44772 4.94772 1 5.5 1H8.5C9.05228 1 9.5 1.44772 9.5 2V3.5M5.5 6.5V10.5M8.5 6.5V10.5M3 3.5L3.5 11.5C3.5 12.0523 3.94772 12.5 4.5 12.5H9.5C10.0523 12.5 10.5 12.0523 10.5 11.5L11 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};
