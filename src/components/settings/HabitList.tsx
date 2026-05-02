import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { HabitItem } from './HabitItem';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import type { Habit } from '@/types';

const TYPE_OPTIONS = [
  { value: 'checkbox', label: 'Checkbox', icon: '✅' },
  { value: 'numeric', label: 'Numeric', icon: '🔢' },
];

interface HabitListProps {
  habits: Habit[];
  onAdd: (name: string, type: 'checkbox' | 'numeric') => void;
  onUpdate: (id: string, updates: Partial<Habit>) => void;
  onDelete: (id: string) => void;
  onReorder: (habits: Habit[]) => void;
}

export const HabitList: React.FC<HabitListProps> = ({ habits, onAdd, onUpdate, onDelete, onReorder }) => {
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'checkbox' | 'numeric'>('checkbox');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex((h) => h.id === active.id);
      const newIndex = habits.findIndex((h) => h.id === over.id);
      onReorder(arrayMove(habits, oldIndex, newIndex));
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAdd(newName.trim(), newType);
      setNewName('');
    }
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
        <Button type="submit" disabled={!newName.trim()} className="w-full sm:w-auto">
          + Add Habit
        </Button>
      </form>

      {/* Divider */}
      {habits.length > 0 && (
        <div className="border-t border-border/50" />
      )}

      {/* Habit list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={habits.map(h => h.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {habits.map((habit) => (
              <HabitItem
                key={habit.id}
                habit={habit}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
            {habits.length === 0 && (
              <div className="text-center py-10 text-text-muted">
                <p className="text-2xl mb-2">📋</p>
                <p className="text-sm">No habits yet. Add your first one above!</p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
