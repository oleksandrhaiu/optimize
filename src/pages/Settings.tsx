import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useFriends } from '@/hooks/useFriends';
import { HabitList } from '@/components/settings/HabitList';
import { FriendsManager } from '@/components/settings/FriendsManager';
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { Avatar } from '@/components/ui/Avatar';
import { clx } from '@/lib/utils';
import { UserCircle2, ListChecks, Users } from 'lucide-react';

type Tab = 'profile' | 'habits' | 'friends';

const TABS: { id: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { id: 'profile', label: 'Profile',   icon: UserCircle2, desc: 'Username & appearance' },
  { id: 'habits',  label: 'My Habits', icon: ListChecks,  desc: 'Add & configure habits' },
  { id: 'friends', label: 'Friends',   icon: Users,       desc: 'Accountability partners' },
];

export const Settings: React.FC = () => {
  const { session, profile } = useAuthStore();
  const userId = session?.user.id;

  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const { habits, loading: habitsLoading, addHabit, updateHabit, deleteHabit, reorderHabits } = useHabits(userId);
  const { friends, loading: friendsLoading, removeFriend, refetch: refetchFriends } = useFriends(userId);

  const isLoading = habitsLoading || friendsLoading;

  return (
    <div>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-text-muted text-sm mt-0.5">Manage your habits and account.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-5">
          {/* ── Sidebar ─────────────────────────────────────── */}
          <aside className="md:w-52 flex-shrink-0">
            {/* Profile card */}
            {profile && (
              <div
                className="rounded-2xl p-3.5 mb-3"
                style={{
                  background: 'rgb(12,13,22)',
                  border: '1px solid rgb(28,30,52)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar username={profile.username} color={profile.avatar_color} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">@{profile.username}</p>
                    <p className="text-[11px] text-text-subtle truncate">{profile.email}</p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 scrollbar-hide">
              {TABS.map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={clx('settings-tab', activeTab === id && 'active')}
                >
                  <span className="tab-icon">
                    <Icon size={15} strokeWidth={1.8} />
                  </span>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium leading-none">{label}</div>
                    <div className="text-[10px] mt-0.5 opacity-60">{desc}</div>
                  </div>
                  <span className="sm:hidden text-sm font-medium">{label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content ──────────────────────────────────────── */}
          <section className="flex-1 min-w-0">
            {(activeTab !== 'profile' && isLoading) ? (
              <div
                className="rounded-2xl p-6 space-y-3"
                style={{ background: 'rgb(12,13,22)', border: '1px solid rgb(28,30,52)' }}
              >
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
                <div className="space-y-2 pt-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-xl" />)}
                </div>
              </div>
            ) : (
              <div
                key={activeTab}
                className="rounded-2xl p-6 page-transition"
                style={{
                  background: 'rgb(12,13,22)',
                  border: '1px solid rgb(28,30,52)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                }}
              >
                {activeTab === 'profile' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-heading font-semibold text-lg text-text-primary">Edit Profile</h2>
                      <p className="text-text-muted text-sm mt-1">Customize your username and appearance.</p>
                    </div>
                    <ProfileSettings />
                  </div>
                )}
                {activeTab === 'habits' && (
                  <div className="space-y-5">
                    <div>
                      <h2 className="font-heading font-semibold text-lg text-text-primary">Manage Habits</h2>
                      <p className="text-text-muted text-sm mt-1">
                        Add, reorder, or configure your habits. Enable 🔥 for calorie tracking.
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
                      <p className="text-text-muted text-sm mt-1">Share your tracker and stay accountable.</p>
                    </div>
                    <FriendsManager friends={friends} onRemove={removeFriend} onRefetch={refetchFriends} />
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
