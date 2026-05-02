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

/* ── Quick-start templates ───────────────────────────────────── */
const TEMPLATES: Array<{
  icon: string; name: string; type: 'checkbox' | 'numeric';
  unit?: string;
  is_calorie_habit?: boolean; cal_min?: number; cal_max?: number;
}> = [
  { icon: '🏋️', name: 'Workout',  type: 'checkbox' },
  { icon: '🧘', name: 'Meditation', type: 'checkbox' },
  { icon: '🥗', name: 'Ate healthy', type: 'checkbox' },
  { icon: '📖', name: 'Reading',   type: 'numeric', unit: 'pages' },
  { icon: '💧', name: 'Water',     type: 'numeric', unit: 'glasses' },
  { icon: '🔥', name: 'Calories',  type: 'numeric', unit: 'kcal', is_calorie_habit: true, cal_min: 1700, cal_max: 2300 },
  { icon: '🏃', name: 'Running',   type: 'numeric', unit: 'km' },
  { icon: '😴', name: 'Sleep',     type: 'numeric', unit: 'hrs' },
  { icon: '🚶', name: 'Steps',     type: 'numeric', unit: 'k steps' },
  { icon: '💊', name: 'Vitamins',  type: 'checkbox' },
  { icon: '😊', name: 'Mood',      type: 'numeric', unit: '/ 10' },
  { icon: '⚖️', name: 'Weight',   type: 'numeric', unit: 'kg' },
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
          <Button type="submit" disabled={!newName.trim()}>+ Add Habit</Button>
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
                  <p className="text-[10px] text-text-subtle">{tpl.unit ? `${tpl.type} · ${tpl.unit}` : tpl.type}</p>
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
          {habits.length === 0 ? (
            <div className="text-center py-12 text-text-muted">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-sm">No habits yet.</p>
              <p className="text-xs text-text-subtle mt-1">Use templates above or type a name and hit Add.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {habits.map(habit => (
                <HabitItem key={habit.id} habit={habit} onUpdate={onUpdate} onDelete={onDelete} />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  );
};
