import React, { useState } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { MyHabitsColumn } from '@/components/tracker/MyHabitsColumn';
import { FriendCard } from '@/components/tracker/FriendCard';
import { MonthNav } from '@/components/tracker/MonthNav';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useFriends } from '@/hooks/useFriends';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { usePresence } from '@/hooks/usePresence';
import { currentMonthYear } from '@/lib/utils';
import type { MonthYear } from '@/types';

export const Tracker: React.FC = () => {
  const { profile, session } = useAuthStore();
  const userId = session?.user.id;

  const [monthYear, setMonthYear] = useState<MonthYear>(currentMonthYear);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const { habits, loading: habitsLoading } = useHabits(userId);
  const { logs, setLog } = useHabitLogs(userId, monthYear.year, monthYear.month);
  const { friends, loading: friendsLoading, updateFriendLog } = useFriends(userId);

  // Realtime: sync friend logs + presence
  useRealtimeSync({ friendIds: friends.map(f => f.profile.id), onLogChange: updateFriendLog });
  const onlineIds = usePresence(userId, friends.map(f => f.profile.id));

  const handleToggle = async (habitId: string, date: string, value: string) => {
    await setLog(habitId, date, value);
  };

  const handlePrevMonth = () => {
    setMonthYear(prev => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { month: d.getMonth(), year: d.getFullYear() };
    });
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setMonthYear(prev => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { month: d.getMonth(), year: d.getFullYear() };
    });
    setSelectedDay(1);
  };

  const onlineFriends = friends.filter(f => onlineIds.has(f.profile.id)).length;

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">Tracker</h1>
            <p className="text-text-muted text-sm mt-0.5">
              Hey @{profile?.username} — stay consistent 💪
            </p>
          </div>
          <MonthNav monthYear={monthYear} onPrev={handlePrevMonth} onNext={handleNextMonth} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6">

          {/* My habits */}
          {habitsLoading ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-72 rounded-2xl" />
            </div>
          ) : (
            <div className="animate-fade-in">
              <MyHabitsColumn
                habits={habits}
                logs={logs}
                year={monthYear.year}
                month={monthYear.month}
                selectedDay={selectedDay}
                onDaySelect={setSelectedDay}
                onToggle={handleToggle}
              />
            </div>
          )}

          {/* Friends */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-semibold text-text-primary">
                Friends
                {!friendsLoading && (
                  <span className="ml-2 font-mono text-sm text-text-muted font-normal">
                    ({friends.length})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                {onlineFriends > 0 && (
                  <span className="text-xs text-accent-green font-medium">
                    {onlineFriends} online
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-soft" />
                  Live
                </span>
              </div>
            </div>

            {friendsLoading ? (
              <div className="flex gap-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-52 rounded-2xl min-w-[200px]" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <div className="border border-dashed border-border/60 rounded-2xl p-10 text-center space-y-2">
                <p className="text-3xl">👥</p>
                <p className="font-heading font-medium text-text-primary">No friends yet</p>
                <p className="text-text-muted text-sm">
                  Go to Settings → Friends to generate an invite link.
                </p>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 flex-wrap animate-fade-in">
                {friends.map(friend => (
                  <FriendCard
                    key={friend.profile.id}
                    friend={friend}
                    isOnline={onlineIds.has(friend.profile.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
