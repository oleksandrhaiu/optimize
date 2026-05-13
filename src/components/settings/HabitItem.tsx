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
          className={clx('w-7 h-7 rounded-lg text-xs flex items-center justify-center', !current ? 'bg-accent/15 ring-1 ring-accent/30' : 'hover:bg-white/[0.05]')}>
          <span className="text-text-subtle text-sm">–</span>
        </button>
        {HABIT_EMOJIS.map(e => (
          <button key={e} onClick={() => { onSelect(e); onClose(); }}
            className={clx('w-7 h-7 rounded-lg text-base flex items-center justify-center transition-all leading-none',
              current === e ? 'bg-accent/15 ring-1 ring-accent/30 scale-110' : 'hover:bg-white/[0.05] hover:scale-105')}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ── Frequency Picker ────────────────────────────────────────── */
const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const FREQ_OPTIONS: Array<{ value: Habit['frequency']; label: string }> = [
  { value: 'daily',    label: 'Daily' },
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'custom',   label: 'Custom' },
];

const FrequencyPicker: React.FC<{
  frequency: Habit['frequency'];
  frequencyDays: number[] | null;
  onChange: (freq: Habit['frequency'], days: number[] | null) => void;
}> = ({ frequency, frequencyDays, onChange }) => {
  const toggleDay = (dayIdx: number) => {
    const current = frequencyDays ?? [];
    const next = current.includes(dayIdx)
      ? current.filter(d => d !== dayIdx)
      : [...current, dayIdx].sort((a, b) => a - b);
    onChange('custom', next.length > 0 ? next : null);
  };

  return (
    <div className="flex flex-col gap-2 pl-12 pb-2.5">
      {/* Frequency type buttons */}
      <div className="flex gap-1.5 flex-wrap">
        {FREQ_OPTIONS.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value, opt.value === 'custom' ? (frequencyDays ?? [0,1,2,3,4]) : null)}
            className={clx(
              'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all',
              frequency === opt.value
                ? 'bg-accent text-bg'
                : 'bg-bg border border-border/60 text-text-muted hover:border-accent/40 hover:text-text-primary',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Custom day selector */}
      {frequency === 'custom' && (
        <div className="flex gap-1">
          {WEEKDAY_LABELS.map((label, idx) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleDay(idx)}
              className={clx(
                'w-7 h-7 rounded-lg text-[10px] font-bold transition-all',
                (frequencyDays ?? []).includes(idx)
                  ? 'bg-accent text-bg'
                  : 'bg-bg border border-border/60 text-text-subtle hover:border-accent/40',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── HabitItem ───────────────────────────────────────────────── */
interface HabitItemProps {
  habit: Habit;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onArchive: (id: string) => void;
}

export const HabitItem: React.FC<HabitItemProps> = ({ habit, onUpdate, onArchive }) => {
  const [showEmoji, setShowEmoji] = useState(false);
  const [showUnit, setShowUnit] = useState(!!habit.unit);
  const [calorieOpen, setCalorieOpen] = useState(habit.is_calorie_habit);
  const [showFreq, setShowFreq] = useState(false);

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

  const togglePrivate = () => {
    onUpdate(habit.id, { is_private: !habit.is_private });
  };

  const handleFreqChange = (freq: Habit['frequency'], days: number[] | null) => {
    onUpdate(habit.id, { frequency: freq, frequency_days: days });
  };

  // Human-readable frequency label
  const freqLabel = habit.frequency === 'daily' ? null
    : habit.frequency === 'weekdays' ? 'Weekdays'
    : habit.frequency === 'weekends' ? 'Weekends'
    : habit.frequency === 'custom' && habit.frequency_days?.length
      ? habit.frequency_days.map(d => WEEKDAY_LABELS[d]).join(' ')
      : null;

  return (
    <div ref={setNodeRef} style={style} className={clx('group', isDragging && 'opacity-40 z-50')}>
      {/* Main row */}
      <div className="flex items-center gap-3 py-2.5 px-1">

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

          {/* Frequency badge — shown when non-daily */}
          {freqLabel && (
            <button
              type="button"
              onClick={() => setShowFreq(v => !v)}
              className="text-[10px] text-accent border border-accent/30 bg-accent/8 px-2 py-0.5 rounded-full font-medium"
            >
              {freqLabel}
            </button>
          )}

          {/* Frequency toggle — shown when daily (subtle) */}
          {!freqLabel && (
            <button
              type="button"
              onClick={() => setShowFreq(v => !v)}
              title="Set frequency"
              className="lg:opacity-0 group-hover:opacity-100 text-[10px] text-text-subtle border border-dashed border-border/50 px-2 py-0.5 rounded-full hover:text-text-muted hover:border-border transition-all"
            >
              freq
            </button>
          )}

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

          {/* Privacy toggle */}
          <button
            onClick={togglePrivate}
            title={habit.is_private ? 'Private (only you)' : 'Public (friends can see)'}
            className={clx(
              'text-sm leading-none transition-all w-6 h-6 rounded-lg flex items-center justify-center',
              habit.is_private
                ? 'bg-border/40 text-text-primary'
                : 'lg:opacity-0 group-hover:opacity-100 text-text-subtle hover:bg-border/20 hover:text-text-muted',
            )}
          >
            {habit.is_private ? '🔒' : '🌍'}
          </button>

          {/* Calorie toggle — numeric only */}
          {habit.type === 'numeric' && (
            <button onClick={toggleCalorie}
              title={habit.is_calorie_habit ? 'Calorie tracking on' : 'Enable calorie tracking'}
              className={clx('text-sm leading-none transition-all w-6 h-6 rounded-lg flex items-center justify-center',
                habit.is_calorie_habit ? 'bg-amber/15 text-amber' : 'lg:opacity-0 group-hover:opacity-100 text-text-subtle hover:bg-amber/10 hover:text-amber')}>
              🔥
            </button>
          )}

          {/* Archive */}
          <button
            onClick={() => onArchive(habit.id)}
            className="lg:opacity-0 group-hover:opacity-100 text-text-subtle hover:text-text-muted w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/[0.05] transition-all"
            title="Archive habit"
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M1 3.5h12M2 3.5l.5 9h9l.5-9M5 3.5V2a1 1 0 011-1h2a1 1 0 011 1v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              <path d="M5 7h4M7 6v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Frequency picker — expands below */}
      {showFreq && (
        <FrequencyPicker
          frequency={habit.frequency ?? 'daily'}
          frequencyDays={habit.frequency_days}
          onChange={handleFreqChange}
        />
      )}

      {/* Goal row — numeric, non-calorie only */}
      {habit.type === 'numeric' && !habit.is_calorie_habit && (
        <div className="flex items-center gap-2 pl-12 pb-2.5">
          <span className="text-[10px] text-text-subtle">🎯 daily goal</span>
          <input type="number" placeholder="e.g. 8"
            value={habit.goal ?? ''}
            onChange={e => onUpdate(habit.id, { goal: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-16 bg-bg border border-border/60 rounded-lg px-2 py-1 text-xs text-center text-text-primary focus:outline-none focus:border-accent/40 font-mono transition-colors"
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
            className="w-16 bg-bg border border-border/60 rounded-lg px-2 py-1 text-xs text-center text-text-primary focus:outline-none focus:border-accent/40 font-mono transition-colors"
          />
          <span className="text-text-subtle text-xs">—</span>
          <input type="number" placeholder="max"
            value={habit.cal_max ?? ''}
            onChange={e => onUpdate(habit.id, { cal_max: e.target.value ? parseFloat(e.target.value) : null })}
            className="w-16 bg-bg border border-border/60 rounded-lg px-2 py-1 text-xs text-center text-text-primary focus:outline-none focus:border-accent/40 font-mono transition-colors"
          />
          <span className="text-[10px] text-text-subtle">{habit.unit || 'kcal'}</span>
          {habit.cal_min && habit.cal_max && (
            <span className="text-[10px] text-accent ml-1">±{Math.round((habit.cal_max - habit.cal_min) / 2)}</span>
          )}
        </div>
      )}
    </div>
  );
};
