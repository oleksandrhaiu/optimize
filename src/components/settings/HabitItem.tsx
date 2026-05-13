import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { clx } from '@/lib/utils';
import type { Habit } from '@/types';

interface HabitItemProps {
  habit: Habit;
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

export const HabitItem: React.FC<HabitItemProps> = ({ habit }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // Human-readable frequency label
  const freqLabel = habit.frequency === 'daily' ? null
    : habit.frequency === 'weekdays' ? 'Weekdays'
    : habit.frequency === 'weekends' ? 'Weekends'
    : habit.frequency === 'custom' && habit.frequency_days?.length
      ? habit.frequency_days.map(d => WEEKDAY_LABELS[d]).join(' ')
      : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clx('group flex items-center gap-3 py-3 px-1 transition-all', isDragging && 'opacity-40 z-50')}
    >
      {/* Drag handle */}
      <div {...attributes} {...listeners}
        className="cursor-grab lg:opacity-0 group-hover:opacity-100 transition-opacity text-text-subtle hover:text-text-muted touch-none flex-shrink-0">
        <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
          <circle cx="4" cy="3" r="1.2" fill="currentColor" />
          <circle cx="8" cy="3" r="1.2" fill="currentColor" />
          <circle cx="4" cy="8" r="1.2" fill="currentColor" />
          <circle cx="8" cy="8" r="1.2" fill="currentColor" />
          <circle cx="4" cy="13" r="1.2" fill="currentColor" />
          <circle cx="8" cy="13" r="1.2" fill="currentColor" />
        </svg>
      </div>

      {/* Clickable Area for Edit */}
      <div 
        onClick={() => navigate(`/habits/${habit.id}`)}
        className="flex-1 flex items-center justify-between min-w-0 cursor-pointer rounded-xl hover:bg-white/[0.03] p-1.5 -ml-1.5 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Icon */}
          <div className="w-8 h-8 rounded-xl bg-card border border-border/50 flex items-center justify-center text-lg flex-shrink-0">
            {habit.icon ?? '✨'}
          </div>

          {/* Name & Subtitle */}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">{habit.name}</p>
            <p className="text-[10px] text-text-subtle truncate">
              {habit.type === 'checkbox' ? 'Checkbox' : `Numeric${habit.unit ? ` (${habit.unit})` : ''}`}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-3">
          {freqLabel && (
            <span className="text-[10px] text-accent border border-accent/30 bg-accent/8 px-2 py-0.5 rounded-full font-medium hidden sm:inline-block">
              {freqLabel}
            </span>
          )}
          
          {habit.is_calorie_habit && (
            <span className="text-[10px] text-amber border border-amber/30 bg-amber/8 px-2 py-0.5 rounded-full font-medium" title="Calorie tracking enabled">
              🔥
            </span>
          )}

          {habit.is_private && (
            <span className="text-[10px] text-text-subtle border border-border/60 bg-bg px-2 py-0.5 rounded-full font-medium" title="Private Habit">
              🔒 Private
            </span>
          )}
          
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-text-subtle opacity-50 group-hover:opacity-100 transition-opacity ml-1 hidden sm:block">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
};
