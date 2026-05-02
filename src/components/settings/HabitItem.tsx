import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clx } from '@/lib/utils';
import type { Habit } from '@/types';
import { CustomSelect } from '@/components/ui/CustomSelect';

/* ── Unit options ────────────────────────────────────────────── */
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
  { value: 'times',    label: 'Times' },
];

/* ── Emoji Picker ────────────────────────────────────────────── */
const HABIT_EMOJIS = [
  '💪','🏋️','🧘','🏃','🚴','🤸','⛹️','🥊',
  '💧','🥗','🍎','☕','🍵','🥦','🥑','🍳',
  '😴','🧠','📖','📝','💊','🩺','🌿','✨',
  '🔥','⚡','🎯','🚀','🏆','💎','🌙','🌊',
  '🎵','🎨','📷','🖥️','💻','📱','✉️','📅',
  '🐕','🐈','🌱','🌻','⭐','🎲','🎮','🏅',
];

const EmojiPicker: React.FC<{ current: string | null; onSelect: (e: string | null) => void; onClose: () => void }> = ({ current, onSelect, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute left-0 top-[calc(100%+6px)] z-50 bg-card border border-border rounded-2xl p-3 shadow-card w-56 animate-slide-up">
      <p className="text-[10px] text-text-subtle uppercase tracking-wider mb-2.5 font-medium">Pick an icon</p>
      <div className="grid grid-cols-8 gap-0.5">
        <button onClick={() => { onSelect(null); onClose(); }}
          className={clx('w-7 h-7 rounded-lg text-xs flex items-center justify-center', !current ? 'bg-accent-green/15 ring-1 ring-accent-green/30' : 'hover:bg-white/[0.05]')}>
          <span className="text-text-subtle text-sm">–</span>
        </button>
        {HABIT_EMOJIS.map(e => (
          <button key={e} onClick={() => { onSelect(e); onClose(); }}
            className={clx('w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all leading-none',
              current === e ? 'bg-accent-green/15 ring-1 ring-accent-green/30 scale-110' : 'hover:bg-white/[0.05] hover:scale-105')}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ── HabitItem ───────────────────────────────────────────────── */
interface HabitItemProps {
  habit: Habit;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onUpdate, onDelete }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showUnit, setShowUnit] = useState(!!habit.unit);
  const [calorieOpen, setCalorieOpen] = useState(habit.is_calorie_habit);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleUnitChange = (v: string) => {
    onUpdate(habit.id, { unit: v || null });
    if (!v) setShowUnit(false);
  };

  const toggleCalorie = () => {
    const next = !habit.is_calorie_habit;
    onUpdate(habit.id, { is_calorie_habit: next });
    setCalorieOpen(next);
  };

  return (
    <div ref={setNodeRef} style={style} className={clx('group', isDragging && 'opacity-40 z-50')}>
      {/* Main row */}
      <div className="flex items-center gap-3 py-2.5 px-1">

        {/* Drag handle — fades in on hover */}
        <div {...attributes} {...listeners}
          className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity text-text-subtle hover:text-text-muted touch-none flex-shrink-0">
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <circle cx="4" cy="3" r="1.2" fill="currentColor" />
            <circle cx="8" cy="3" r="1.2" fill="currentColor" />
            <circle cx="4" cy="8" r="1.2" fill="currentColor" />
            <circle cx="8" cy="8" r="1.2" fill="currentColor" />
            <circle cx="4" cy="13" r="1.2" fill="currentColor" />
            <circle cx="8" cy="13" r="1.2" fill="currentColor" />
          </svg>
        </div>

        {/* Icon button */}
        <div className="relative flex-shrink-0">
          <button type="button" onClick={() => setShowEmoji(v => !v)}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-xl leading-none hover:bg-white/[0.05] transition-colors border border-transparent hover:border-border/40"
            title="Change icon">
            {habit.icon ?? <span className="text-text-subtle text-sm">+</span>}
          </button>
          {showEmoji && (
            <EmojiPicker current={habit.icon} onSelect={e => onUpdate(habit.id, { icon: e })} onClose={() => setShowEmoji(false)} />
          )}
        </div>

        {/* Name */}
        <input
          value={habit.name}
          onChange={e => onUpdate(habit.id, { name: e.target.value })}
          className="flex-1 bg-transparent border-none focus:outline-none text-sm text-text-primary placeholder-text-muted min-w-0"
          placeholder="Habit name…"
        />

        {/* Right side chips & actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">

          {/* Unit chip / add-unit — numeric only */}
          {habit.type === 'numeric' && (
            showUnit ? (
              <CustomSelect
                value={habit.unit ?? ''}
                onChange={handleUnitChange}
                options={ALL_UNITS}
                className="w-24 text-xs"
              />
            ) : (
              <button type="button" onClick={() => setShowUnit(true)}
                className="text-[10px] text-text-subtle border border-dashed border-border/50 px-2 py-0.5 rounded-full hover:text-text-muted hover:border-border transition-all">
                + unit
              </button>
            )
          )}

          {/* Type dot */}
          <span className={clx(
            'w-2 h-2 rounded-full flex-shrink-0',
            habit.type === 'checkbox' ? 'bg-blue/60' : 'bg-amber/60',
          )} title={habit.type} />

          {/* Calorie toggle — numeric only */}
          {habit.type === 'numeric' && (
            <button onClick={toggleCalorie}
              title={habit.is_calorie_habit ? 'Calorie tracking on' : 'Enable calorie tracking'}
              className={clx('text-sm leading-none transition-all w-6 h-6 rounded-lg flex items-center justify-center',
                habit.is_calorie_habit ? 'bg-amber/15 text-amber' : 'opacity-0 group-hover:opacity-100 text-text-subtle hover:bg-amber/10 hover:text-amber')}>
              🔥
            </button>
          )}

          {/* Delete */}
          <button onClick={() => onDelete(habit.id)}
            className="opacity-0 group-hover:opacity-100 text-text-subtle hover:text-red w-6 h-6 flex items-center justify-center rounded-lg hover:bg-red/10 transition-all"
            title="Delete">
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M2 3.5H12M4.5 3.5V2C4.5 1.448 4.948 1 5.5 1H8.5C9.052 1 9.5 1.448 9.5 2V3.5M5.5 6.5V10.5M8.5 6.5V10.5M3 3.5L3.5 11.5C3.5 12.052 3.948 12.5 4.5 12.5H9.5C10.052 12.5 10.5 12.052 10.5 11.5L11 3.5"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* Goal row — numeric, non-calorie only */}
      {habit.type === 'numeric' && !habit.is_calorie_habit && (
        <div className="flex items-center gap-2 pl-12 pb-2.5">
          <span className="text-[10px] text-text-subtle">🎯 daily goal</span>
          <input type="number" placeholder="e.g. 8"
            value={habit.goal ?? ''}
            onChange={e => onUpdate(habit.id, { goal: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-16 bg-bg border border-border/60 rounded-lg px-2 py-1 text-xs text-center text-text-primary focus:outline-none focus:border-accent-green/40 font-mono transition-colors"
          />
          {habit.unit && <span className="text-[10px] text-text-subtle">{habit.unit}</span>}
        </div>
      )}

      {/* Calorie range — expands below */}
      {habit.is_calorie_habit && (
        <div className="flex items-center gap-2 pl-12 pb-2.5 animate-fade-in">
          <span className="text-[10px] text-text-subtle">🎯 target</span>
          <input type="number" placeholder="min"
            value={habit.cal_min ?? ''}
            onChange={e => onUpdate(habit.id, { cal_min: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-16 bg-bg border border-border/60 rounded-lg px-2 py-1 text-xs text-center text-text-primary focus:outline-none focus:border-accent-green/40 font-mono transition-colors"
          />
          <span className="text-text-subtle text-xs">—</span>
          <input type="number" placeholder="max"
            value={habit.cal_max ?? ''}
            onChange={e => onUpdate(habit.id, { cal_max: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-16 bg-bg border border-border/60 rounded-lg px-2 py-1 text-xs text-center text-text-primary focus:outline-none focus:border-accent-green/40 font-mono transition-colors"
          />
          <span className="text-[10px] text-text-subtle">{habit.unit || 'kcal'}</span>
          {habit.cal_min && habit.cal_max && (
            <span className="text-[10px] text-accent-green ml-1">±{Math.round((habit.cal_max - habit.cal_min) / 2)}</span>
          )}
        </div>
      )}
    </div>
  );
};
