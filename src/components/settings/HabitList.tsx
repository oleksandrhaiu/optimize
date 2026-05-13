import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext,
  sortableKeyboardCoordinates, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { HabitItem } from './HabitItem';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import type { Habit } from '@/types';

/* ── Templates by category ──────────────────────────────────── */
const TEMPLATE_CATEGORIES = [
  {
    label: '💪 Fitness',
    templates: [
      { icon: '🏋️', name: 'Workout',    type: 'checkbox' as const, desc: 'Train today' },
      { icon: '🏃', name: 'Running',    type: 'numeric'  as const, unit: 'km', desc: 'Track distance' },
      { icon: '🚶', name: 'Steps',      type: 'numeric'  as const, unit: 'k steps', desc: '10k a day' },
      { icon: '🤸', name: 'Stretching', type: 'checkbox' as const, desc: 'Mobility & flexibility' },
    ],
  },
  {
    label: '🥗 Nutrition',
    templates: [
      { icon: '💧', name: 'Water',      type: 'numeric'  as const, unit: 'glasses', goal: 8, desc: '8 glasses/day' },
      { icon: '🔥', name: 'Calories',   type: 'numeric'  as const, unit: 'kcal', is_calorie_habit: true, cal_min: 1700, cal_max: 2300, desc: 'Track intake' },
      { icon: '🥗', name: 'Eat healthy',type: 'checkbox' as const, desc: 'Whole foods day' },
      { icon: '🍎', name: 'No sugar',   type: 'checkbox' as const, desc: 'No sweets today' },
    ],
  },
  {
    label: '🧠 Mind & Body',
    templates: [
      { icon: '😴', name: 'Sleep',      type: 'numeric'  as const, unit: 'hrs', goal: 8, desc: 'Track hours' },
      { icon: '🧘', name: 'Meditation', type: 'numeric'  as const, unit: 'min', goal: 10, desc: 'Find stillness' },
      { icon: '💊', name: 'Vitamins',   type: 'checkbox' as const, desc: 'Daily supplements' },
    ],
  },
  {
    label: '📚 Learning',
    templates: [
      { icon: '📖', name: 'Reading',    type: 'numeric'  as const, unit: 'pages', goal: 20, desc: '20 pages/day' },
      { icon: '📝', name: 'Journaling', type: 'checkbox' as const, desc: 'Daily reflection' },
      { icon: '🖥️', name: 'Coding',    type: 'numeric'  as const, unit: 'hrs', goal: 1, desc: 'Build something' },
    ],
  },
  {
    label: '📊 Tracking',
    templates: [
      { icon: '⚖️', name: 'Weight',    type: 'numeric'  as const, unit: 'kg', desc: 'Log your weight' },
      { icon: '😊', name: 'Mood',       type: 'numeric'  as const, unit: '/ 10', desc: 'Rate your day' },
    ],
  },
];

const TYPE_OPTIONS = [
  { value: 'checkbox', label: 'Checkbox', icon: '☑' },
  { value: 'numeric',  label: 'Numeric',  icon: '#' },
];

interface HabitListProps {
  habits: Habit[];
  archivedHabits: Habit[];
  onAdd: (name: string, type: 'checkbox' | 'numeric', extra?: Partial<Habit>) => Promise<{ data: Habit | null, error: any }>;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (habits: Habit[]) => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits, archivedHabits, onAdd, onArchive, onRestore, onDelete, onReorder,
}) => {
  const navigate = useNavigate();
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'checkbox' | 'numeric'>('checkbox');
  const [showTemplates, setShowTemplates] = useState(habits.length === 0);
  const [tab, setTab] = useState<'active' | 'archived'>('active');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex(h => h.id === active.id);
      const newIndex  = habits.findIndex(h => h.id === over.id);
      onReorder(arrayMove(habits, oldIndex, newIndex));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      const { data } = await onAdd(newName.trim(), newType);
      if (data) navigate(`/habits/${data.id}`);
      setNewName('');
      setShowTemplates(false);
    }
  };

  const handleTemplate = async (tpl: typeof TEMPLATE_CATEGORIES[0]['templates'][0]) => {
    const { name, type, desc: _desc, ...extra } = tpl;
    const { data } = await onAdd(name, type, extra as Partial<Habit>);
    if (data) navigate(`/habits/${data.id}`);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-bg rounded-xl border border-border/50 w-fit">
        <button
          onClick={() => setTab('active')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'active' ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Active {habits.length > 0 && <span className="ml-1 opacity-50">{habits.length}</span>}
        </button>
        <button
          onClick={() => setTab('archived')}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            tab === 'archived' ? 'bg-card text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          Archived {archivedHabits.length > 0 && <span className="ml-1 opacity-50">{archivedHabits.length}</span>}
        </button>
      </div>

      {tab === 'active' ? (
        <>
          {/* Add habit form */}
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="New habit name..."
                className="input-base flex-1 min-w-0"
              />
              <CustomSelect
                value={newType}
                onChange={v => setNewType(v as 'checkbox' | 'numeric')}
                options={TYPE_OPTIONS}
                className="w-36 flex-shrink-0"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button type="submit" disabled={!newName.trim()}>+ Add Habit</Button>
              <button
                type="button"
                onClick={() => setShowTemplates(v => !v)}
                className="btn-ghost text-xs flex items-center gap-1.5"
              >
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`transition-transform duration-200 ${showTemplates ? 'rotate-180' : ''}`}
                >
                  <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Templates
              </button>
            </div>
          </form>

          {/* Templates — grouped by category */}
          {showTemplates && (
            <div className="animate-fade-in space-y-4">
              {TEMPLATE_CATEGORIES.map(cat => (
                <div key={cat.label}>
                  <p className="text-[11px] font-semibold text-text-muted mb-2 uppercase tracking-wider">{cat.label}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {cat.templates.map(tpl => (
                      <button
                        key={tpl.name}
                        type="button"
                        onClick={() => handleTemplate(tpl)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border/60 bg-bg hover:border-accent/40 hover:bg-accent/5 text-left transition-all duration-150 group"
                      >
                        <span className="text-xl leading-none shrink-0">{tpl.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">{tpl.name}</p>
                          <p className="text-[10px] text-text-subtle truncate">{tpl.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {habits.length > 0 && <div className="border-t border-border/40" />}

          {/* Habit list */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
              {habits.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                  <p className="text-3xl mb-3">📋</p>
                  <p className="text-sm">No habits yet.</p>
                  <p className="text-xs text-text-subtle mt-1">Use templates above or type a name and hit Add.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {habits.map(habit => (
                    <HabitItem key={habit.id} habit={habit} />
                  ))}
                </div>
              )}
            </SortableContext>
          </DndContext>
        </>
      ) : (
        /* Archived tab */
        <div className="space-y-2">
          {archivedHabits.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p className="text-3xl mb-3">📦</p>
              <p className="text-sm">No archived habits.</p>
              <p className="text-xs text-text-subtle mt-1">Archive habits you want to pause without losing history.</p>
            </div>
          ) : (
            archivedHabits.map(habit => (
              <div
                key={habit.id}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl border border-border/40 bg-bg/50 opacity-70"
              >
                {habit.icon && <span className="text-xl">{habit.icon}</span>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-primary truncate">{habit.name}</p>
                  <p className="text-[10px] text-text-subtle">{habit.type}{habit.unit ? ` · ${habit.unit}` : ''}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onRestore(habit.id)}
                    className="text-xs text-accent hover:text-accent/80 font-medium px-2.5 py-1 rounded-lg border border-accent/30 hover:bg-accent/10 transition-all"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => onDelete(habit.id)}
                    className="text-xs text-text-subtle hover:text-red px-2.5 py-1 rounded-lg border border-border/40 hover:border-red/30 hover:bg-red/10 transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
