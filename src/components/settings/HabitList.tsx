import React, { useState } from 'react';
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

/* ── Units by type ───────────────────────────────────────────── */
export const UNIT_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  water:    [{ value: 'glasses', label: 'Glasses' }, { value: 'ml', label: 'ml' }, { value: 'L', label: 'Liters' }, { value: 'oz', label: 'oz' }],
  sleep:    [{ value: 'hrs', label: 'Hours' }, { value: 'min', label: 'Minutes' }],
  running:  [{ value: 'km', label: 'km' }, { value: 'mi', label: 'Miles' }, { value: 'min', label: 'Minutes' }],
  steps:    [{ value: 'k steps', label: 'K steps' }, { value: 'steps', label: 'Steps' }],
  reading:  [{ value: 'pages', label: 'Pages' }, { value: 'min', label: 'Minutes' }, { value: 'chapters', label: 'Chapters' }],
  calories: [{ value: 'kcal', label: 'kcal' }, { value: 'cal', label: 'cal' }],
  mood:     [{ value: '/ 10', label: 'Out of 10' }, { value: '/ 5', label: 'Out of 5' }],
  weight:   [{ value: 'kg', label: 'kg' }, { value: 'lbs', label: 'lbs' }],
  generic:  [{ value: 'reps', label: 'Reps' }, { value: 'sets', label: 'Sets' }, { value: 'min', label: 'Minutes' }, { value: 'hrs', label: 'Hours' }, { value: 'items', label: 'Items' }],
};

/* ── Quick-start templates ───────────────────────────────────── */
const TEMPLATES: Array<{
  icon: string; name: string; type: 'checkbox' | 'numeric';
  group?: string;
  is_calorie_habit?: boolean; cal_min?: number; cal_max?: number;
}> = [
  { icon: '🏋️', name: 'Workout', type: 'checkbox' },
  { icon: '🧘', name: 'Meditation', type: 'checkbox' },
  { icon: '🥗', name: 'Ate healthy', type: 'checkbox' },
  { icon: '📖', name: 'Reading', type: 'numeric', group: 'pages' },
  { icon: '💧', name: 'Water', type: 'numeric', group: 'glasses' },
  { icon: '🔥', name: 'Calories', type: 'numeric', group: 'kcal', is_calorie_habit: true, cal_min: 1700, cal_max: 2300 },
  { icon: '🏃', name: 'Running', type: 'numeric', group: 'km' },
  { icon: '😴', name: 'Sleep', type: 'numeric', group: 'hrs' },
  { icon: '🚶', name: 'Steps', type: 'numeric', group: 'k steps' },
  { icon: '💊', name: 'Vitamins', type: 'checkbox' },
  { icon: '😊', name: 'Mood', type: 'numeric', group: '/ 10' },
  { icon: '⚖️', name: 'Weight', type: 'numeric', group: 'kg' },
];

const TYPE_OPTIONS = [
  { value: 'checkbox', label: 'Checkbox', icon: '☑' },
  { value: 'numeric',  label: 'Numeric',  icon: '#' },
];

interface HabitListProps {
  habits: Habit[];
  onAdd: (name: string, type: 'checkbox' | 'numeric', extra?: Partial<Habit>) => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onReorder: (habits: Habit[]) => void;
}

export const HabitList: React.FC<HabitListProps> = ({
  habits, onAdd, onUpdate, onDelete, onReorder,
}) => {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'checkbox' | 'numeric'>('checkbox');
  const [showTemplates, setShowTemplates] = useState(habits.length === 0);

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

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim(), newType);
      setNewName('');
      setShowTemplates(false);
    }
  };

  const handleTemplate = (tpl: typeof TEMPLATES[0]) => {
    const { name, type, icon, ...extra } = tpl;
    onAdd(name, type, { icon, ...extra } as Partial<Habit>);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-5">
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
          <Button type="submit" disabled={!newName.trim()}>
            + Add Habit
          </Button>
          <button
            type="button"
            onClick={() => setShowTemplates(v => !v)}
            className="btn-ghost text-xs"
          >
            {showTemplates ? '▲ Hide' : '⚡ Templates'}
          </button>
        </div>
      </form>

      {/* Templates */}
      {showTemplates && (
        <div className="animate-fade-in">
          <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">Quick-start templates</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TEMPLATES.map(tpl => (
              <button
                key={tpl.name}
                type="button"
                onClick={() => handleTemplate(tpl)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border/60 bg-bg hover:border-accent-green/40 hover:bg-accent-green/5 text-left transition-all duration-150"
              >
                <span className="text-xl leading-none">{tpl.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-text-primary truncate">{tpl.name}</p>
                  <p className="text-[10px] text-text-subtle">{tpl.group ? `${tpl.type} · ${tpl.group}` : tpl.type}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {habits.length > 0 && <div className="border-t border-border/40" />}

      {/* Habit list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {habits.map(habit => (
              <HabitItem key={habit.id} habit={habit} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
            {habits.length === 0 && (
              <div className="text-center py-10 text-text-muted">
                <p className="text-2xl mb-2">📋</p>
                <p className="text-sm">No habits yet. Use templates above or add your own!</p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
