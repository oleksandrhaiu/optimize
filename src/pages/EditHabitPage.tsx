import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { PageLoader } from '@/components/ui/LoadingSpinner';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { clx } from '@/lib/utils';
import type { Habit } from '@/types';

// ── Emoji Picker ──────────────────────────────────────────────
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
    <div ref={ref} className="absolute left-0 top-[calc(100%+6px)] z-50 bg-card border border-border rounded-2xl p-3 shadow-card w-[280px] sm:w-[320px] animate-slide-up">
      <p className="text-[10px] text-text-subtle uppercase tracking-wider mb-2.5 font-medium">Pick an icon</p>
      <div className="grid grid-cols-8 gap-1">
        <button onClick={() => { onSelect(null); onClose(); }}
          className={clx('w-8 h-8 rounded-lg text-xs flex items-center justify-center', !current ? 'bg-accent/15 ring-1 ring-accent/30' : 'hover:bg-white/[0.05]')}>
          <span className="text-text-subtle text-sm">–</span>
        </button>
        {HABIT_EMOJIS.map(e => (
          <button key={e} onClick={() => { onSelect(e); onClose(); }}
            className={clx('w-8 h-8 rounded-lg text-xl flex items-center justify-center transition-all leading-none',
              current === e ? 'bg-accent/15 ring-1 ring-accent/30 scale-110' : 'hover:bg-white/[0.05] hover:scale-105')}>
            {e}
          </button>
        ))}
      </div>
    </div>
  );
};

// ── Constants ─────────────────────────────────────────────────
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

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── EditHabitPage ─────────────────────────────────────────────
export const EditHabitPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const userId = session?.user.id;
  const { habits, archivedHabits, loading, updateHabit, archiveHabit, restoreHabit, deleteHabit, fetchArchivedHabits } = useHabits(userId);

  const [habit, setHabit] = useState<Habit | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Load local state only once initially
  useEffect(() => {
    if (loading) return;
    if (archivedHabits.length === 0) fetchArchivedHabits();
    
    if (!habit) {
      const found = habits.find(h => h.id === id) || archivedHabits.find(h => h.id === id);
      if (found) setHabit(found);
    }
  }, [id, habits, archivedHabits, loading, fetchArchivedHabits, habit]);

  if (loading || !habit) {
    return <PageLoader />;
  }

  const handleChange = (updates: Partial<Habit>) => {
    setHabit(prev => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      
      // Debounce auto-save to prevent flooding DB and UI stutter
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        updateHabit(next.id, updates);
      }, 400);

      return next;
    });
  };

  const handleCustomDayToggle = (dayIdx: number) => {
    const current = habit.frequency_days ?? [];
    const next = current.includes(dayIdx)
      ? current.filter(d => d !== dayIdx)
      : [...current, dayIdx].sort((a, b) => a - b);
    handleChange({ frequency: 'custom', frequency_days: next.length > 0 ? next : null });
  };

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-bg/90 backdrop-blur-md py-4 z-40 -mx-4 px-4 sm:-mx-6 sm:px-6 border-b border-border/30">
        <button
          onClick={() => navigate('/habits')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors font-medium text-sm"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10.5 3L5.5 8L10.5 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Habits
        </button>
        <div className="text-xs font-medium px-3 py-1 bg-accent/10 text-accent rounded-full border border-accent/20">
          Auto-saving
        </div>
      </div>

      {/* 1. General */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-bold text-text-subtle uppercase tracking-wider">General</h2>
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowEmoji(v => !v)}
              className="w-16 h-16 sm:w-20 sm:h-20 bg-card border border-border/50 rounded-2xl flex items-center justify-center text-4xl hover:border-accent/40 transition-colors shadow-sm"
              title="Pick icon"
            >
              {habit.icon ?? <span className="text-text-subtle text-xl">+</span>}
            </button>
            {showEmoji && <EmojiPicker current={habit.icon} onSelect={e => handleChange({ icon: e })} onClose={() => setShowEmoji(false)} />}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={habit.name}
              onChange={e => handleChange({ name: e.target.value })}
              placeholder="Habit name"
              className="w-full bg-transparent border-b-2 border-border/50 focus:border-accent pb-2 text-2xl sm:text-3xl font-heading font-bold text-text-primary placeholder-text-muted outline-none transition-colors"
            />
          </div>
        </div>
      </section>

      {/* 2. Tracking Mode */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-bold text-text-subtle uppercase tracking-wider">Tracking Mode</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleChange({ type: 'checkbox', is_calorie_habit: false })}
            className={clx(
              "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all",
              habit.type === 'checkbox'
                ? "bg-accent/10 border-accent shadow-sm"
                : "bg-card border-border/50 hover:border-text-muted"
            )}
          >
            <span className="text-2xl">☑️</span>
            <div>
              <p className={clx("font-bold text-sm", habit.type === 'checkbox' ? "text-text-primary" : "text-text-muted")}>Checkbox</p>
              <p className="text-[10px] text-text-subtle mt-0.5">Simple yes or no. Did you do it?</p>
            </div>
          </button>
          <button
            onClick={() => handleChange({ type: 'numeric' })}
            className={clx(
              "flex flex-col gap-2 p-4 rounded-2xl border text-left transition-all",
              habit.type === 'numeric'
                ? "bg-accent/10 border-accent shadow-sm"
                : "bg-card border-border/50 hover:border-text-muted"
            )}
          >
            <span className="text-2xl">🔢</span>
            <div>
              <p className={clx("font-bold text-sm", habit.type === 'numeric' ? "text-text-primary" : "text-text-muted")}>Numeric</p>
              <p className="text-[10px] text-text-subtle mt-0.5">Track quantities (pages, km, calories).</p>
            </div>
          </button>
        </div>

        {/* Numeric Settings */}
        {habit.type === 'numeric' && (
          <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-5 animate-slide-up">
            {/* Unit & Goal */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[120px] space-y-1.5">
                <label className="text-xs text-text-muted font-medium">Unit</label>
                <CustomSelect
                  value={habit.unit ?? ''}
                  onChange={v => handleChange({ unit: v || null })}
                  options={ALL_UNITS}
                  className="w-full"
                />
              </div>
              <div className="flex-1 min-w-[120px] space-y-1.5">
                <label className="text-xs text-text-muted font-medium">Daily Goal (optional)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={habit.goal ?? ''}
                    onChange={e => handleChange({ goal: e.target.value ? parseFloat(e.target.value) : null })}
                    placeholder="e.g. 10000"
                    className="input-base w-full pr-12"
                  />
                  {habit.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-subtle pointer-events-none">{habit.unit}</span>}
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border/40" />

            {/* Calorie Tracking */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary flex items-center gap-2">🔥 Calorie Tracking</p>
                  <p className="text-[10px] text-text-subtle mt-0.5">Enables green/amber/red zones on the dashboard.</p>
                </div>
                {/* Switch */}
                <button
                  onClick={() => handleChange({ is_calorie_habit: !habit.is_calorie_habit })}
                  className={clx(
                    "w-12 h-6 rounded-full p-1 transition-colors relative shadow-inner",
                    habit.is_calorie_habit ? "bg-amber" : "bg-border/60"
                  )}
                >
                  <div className={clx("w-4 h-4 bg-white rounded-full shadow-md transition-transform", habit.is_calorie_habit ? "translate-x-6" : "translate-x-0")} />
                </button>
              </div>

              {habit.is_calorie_habit && (
                <div className="flex gap-3 animate-fade-in">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs text-text-muted font-medium">Min Target</label>
                    <input
                      type="number"
                      value={habit.cal_min ?? ''}
                      onChange={e => handleChange({ cal_min: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="1800"
                      className="input-base w-full"
                    />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs text-text-muted font-medium">Max Target</label>
                    <input
                      type="number"
                      value={habit.cal_max ?? ''}
                      onChange={e => handleChange({ cal_max: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="2400"
                      className="input-base w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* 3. Schedule */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-bold text-text-subtle uppercase tracking-wider">Schedule</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {['daily', 'weekdays', 'weekends', 'custom'].map(f => (
            <button
              key={f}
              onClick={() => handleChange({ frequency: f as Habit['frequency'] })}
              className={clx(
                "p-2.5 rounded-xl text-xs font-semibold capitalize transition-all border",
                habit.frequency === f
                  ? "bg-accent text-bg border-accent shadow-sm"
                  : "bg-card border-border/50 text-text-muted hover:border-text-subtle"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {habit.frequency === 'custom' && (
          <div className="flex gap-1.5 pt-2 animate-slide-up">
            {WEEKDAY_LABELS.map((day, idx) => {
              const active = (habit.frequency_days ?? []).includes(idx);
              return (
                <button
                  key={day}
                  onClick={() => handleCustomDayToggle(idx)}
                  className={clx(
                    "flex-1 py-2 rounded-lg text-xs font-bold transition-all border",
                    active
                      ? "bg-accent/20 text-accent border-accent/40"
                      : "bg-card text-text-subtle border-border/50 hover:border-text-subtle"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Privacy */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-bold text-text-subtle uppercase tracking-wider">Privacy</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleChange({ is_private: false })}
            className={clx(
              "flex items-start gap-3 p-4 rounded-2xl border text-left transition-all",
              !habit.is_private
                ? "bg-blue/10 border-blue/40 shadow-sm"
                : "bg-card border-border/50 hover:border-text-muted"
            )}
          >
            <span className="text-2xl mt-1 opacity-80">🌍</span>
            <div>
              <p className={clx("font-bold text-sm", !habit.is_private ? "text-blue" : "text-text-primary")}>Public</p>
              <p className="text-xs text-text-subtle mt-1 leading-relaxed">Visible to your friends. Great for accountability and shared goals.</p>
            </div>
          </button>
          <button
            onClick={() => handleChange({ is_private: true })}
            className={clx(
              "flex items-start gap-3 p-4 rounded-2xl border text-left transition-all",
              habit.is_private
                ? "bg-violet/10 border-violet/40 shadow-sm"
                : "bg-card border-border/50 hover:border-text-muted"
            )}
          >
            <span className="text-2xl mt-1 opacity-80">🔒</span>
            <div>
              <p className={clx("font-bold text-sm", habit.is_private ? "text-violet" : "text-text-primary")}>Private</p>
              <p className="text-xs text-text-subtle mt-1 leading-relaxed">Only you can see this habit and its progress.</p>
            </div>
          </button>
        </div>
      </section>

      {/* 5. Danger Zone */}
      <section className="pt-8 mt-8 border-t border-border/30 space-y-4">
        <h2 className="text-[11px] font-bold text-red uppercase tracking-wider">Danger Zone</h2>
        <div className="bg-red/5 border border-red/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text-primary">
                {habit.is_archived ? 'Restore Habit' : 'Archive Habit'}
              </p>
              <p className="text-xs text-text-subtle mt-0.5">
                {habit.is_archived 
                  ? 'Bring this habit back to your active tracker.'
                  : 'Hide from tracker but keep all your history and stats.'}
              </p>
            </div>
            <button
              onClick={async () => {
                if (habit.is_archived) {
                  await restoreHabit(habit.id);
                  setHabit({ ...habit, is_archived: false });
                } else {
                  await archiveHabit(habit.id);
                  setHabit({ ...habit, is_archived: true });
                }
              }}
              className="px-4 py-2 bg-bg border border-border rounded-xl text-xs font-bold text-text-primary hover:border-text-muted transition-colors whitespace-nowrap"
            >
              {habit.is_archived ? 'Restore' : 'Archive'}
            </button>
          </div>
          
          <div className="w-full h-px bg-red/10" />

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-red">Delete Habit</p>
              <p className="text-xs text-red/60 mt-0.5">Permanently remove this habit and all its logged history. This cannot be undone.</p>
            </div>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to permanently delete this habit? All history will be lost.')) {
                  await deleteHabit(habit.id);
                  navigate('/habits');
                }
              }}
              className="px-4 py-2 bg-red/10 border border-red/20 text-red hover:bg-red/20 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
            >
              Delete
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};
