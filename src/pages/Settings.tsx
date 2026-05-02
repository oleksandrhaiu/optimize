import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useFriends } from '@/hooks/useFriends';
import { HabitList } from '@/components/settings/HabitList';
import { CalorieTargetForm } from '@/components/settings/CalorieTargetForm';
import { FriendsManager } from '@/components/settings/FriendsManager';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { clx } from '@/lib/utils';

type Tab = 'habits' | 'calories' | 'friends';

export const Settings: React.FC = () => {
  const { session } = useAuthStore();
  const userId = session?.user.id;
  
  const [activeTab, setActiveTab] = useState<Tab>('habits');

  const { habits, loading: habitsLoading, addHabit, updateHabit, deleteHabit, reorderHabits } = useHabits(userId);
  const { friends, loading: friendsLoading, removeFriend } = useFriends(userId);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'habits', label: 'My Habits', icon: '📝' },
    { id: 'calories', label: 'Calorie Target', icon: '🔥' },
    { id: 'friends', label: 'Friends', icon: '👥' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-muted text-sm">Manage your account and preferences.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-48 flex-shrink-0">
            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clx(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-card border border-border text-text-primary'
                      : 'text-text-muted hover:bg-card/50 hover:text-text-primary'
                  )}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <section className="flex-1 min-w-0">
            {habitsLoading || friendsLoading ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size={32} />
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in">
                {activeTab === 'habits' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading font-semibold text-lg text-text-primary mb-1">Manage Habits</h2>
                      <p className="text-text-muted text-sm mb-4">Add, remove, or drag to reorder your habits.</p>
                    </div>
                    <HabitList
                      habits={habits}
                      onAdd={addHabit}
                      onUpdate={updateHabit}
                      onDelete={deleteHabit}
                      onReorder={reorderHabits}
                    />
                  </div>
                )}
                {activeTab === 'calories' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading font-semibold text-lg text-text-primary mb-1">Calorie Target</h2>
                      <p className="text-text-muted text-sm mb-4">Set your daily min and max ranges for your calorie habit.</p>
                    </div>
                    <CalorieTargetForm habits={habits} onUpdate={updateHabit} />
                  </div>
                )}
                {activeTab === 'friends' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="font-heading font-semibold text-lg text-text-primary mb-1">Friends</h2>
                      <p className="text-text-muted text-sm mb-4">Share your tracker and stay accountable together.</p>
                    </div>
                    <FriendsManager friends={friends} onRemove={removeFriend} />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
