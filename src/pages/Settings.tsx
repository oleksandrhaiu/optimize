import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useFriends } from '@/hooks/useFriends';
import { HabitList } from '@/components/settings/HabitList';
import { FriendsManager } from '@/components/settings/FriendsManager';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { clx } from '@/lib/utils';

type Tab = 'habits' | 'friends';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'habits',  label: 'My Habits', icon: '📋' },
  { id: 'friends', label: 'Friends',   icon: '👥' },
];

export const Settings: React.FC = () => {
  const { session } = useAuthStore();
  const userId = session?.user.id;

  const [activeTab, setActiveTab] = useState<Tab>('habits');

  const { habits, loading: habitsLoading, addHabit, updateHabit, deleteHabit, reorderHabits } = useHabits(userId);
  const { friends, loading: friendsLoading, removeFriend } = useFriends(userId);

  const isLoading = habitsLoading || friendsLoading;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage your habits and account.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-44 flex-shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clx(
                    'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-white/[0.07] border border-border text-text-primary shadow-card'
                      : 'text-text-muted hover:bg-white/[0.04] hover:text-text-primary',
                  )}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <section className="flex-1 min-w-0">
            {isLoading ? (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-3">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
                <div className="space-y-2 pt-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-2xl p-6 animate-fade-in shadow-card">
                {activeTab === 'habits' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-heading font-semibold text-lg text-text-primary">Manage Habits</h2>
                      <p className="text-text-muted text-sm mt-1">
                        Add, reorder, or configure your habits. Enable 🔥 to set calorie targets inline.
                      </p>
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
                {activeTab === 'friends' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-heading font-semibold text-lg text-text-primary">Friends</h2>
                      <p className="text-text-muted text-sm mt-1">Share your tracker and stay accountable together.</p>
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
