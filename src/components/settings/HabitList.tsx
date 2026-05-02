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
import type { Habit } from '@/types';

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
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder="New habit name..."
          className="input-base flex-1"
        />
        <select
          value={newType}
          onChange={e => setNewType(e.target.value as 'checkbox' | 'numeric')}
          className="input-base w-32"
        >
          <option value="checkbox">Checkbox</option>
          <option value="numeric">Numeric</option>
        </select>
        <Button type="submit" disabled={!newName.trim()}>Add</Button>
      </form>

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
              <p className="text-center text-text-muted py-4">No habits yet.</p>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};
