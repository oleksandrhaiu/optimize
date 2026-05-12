import React from 'react';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { HabitList } from '@/components/settings/HabitList';
import { Skeleton } from '@/components/ui/LoadingSpinner';

export const HabitsPage: React.FC = () => {
  const { session } = useAuthStore();
  const userId = session?.user.id;
  const { habits, loading, addHabit, updateHabit, deleteHabit, reorderHabits } = useHabits(userId);

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">My Habits</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage, add, and organize your habits.</p>
        </div>

        <div className="rounded-2xl p-6 page-transition" style={{ background: 'rgb(12,13,22)', border: '1px solid rgb(28,30,52)' }}>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="space-y-2">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
              </div>
            </div>
          ) : (
            <HabitList
              habits={habits}
              onAdd={addHabit}
              onUpdate={updateHabit}
              onDelete={deleteHabit}
              onReorder={reorderHabits}
            />
          )}
        </div>
      </main>
    </div>
  );
};
