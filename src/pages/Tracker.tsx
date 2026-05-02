import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from '@/components/ui/Navbar';
import { MyHabitsColumn } from '@/components/tracker/MyHabitsColumn';
import { FriendCard } from '@/components/tracker/FriendCard';
import { HabitHistoryModal } from '@/components/tracker/HabitHistoryModal';
import { MonthNav } from '@/components/tracker/MonthNav';
import { Confetti } from '@/components/ui/Confetti';
import { OnboardingModal, useOnboarding } from '@/components/onboarding/OnboardingModal';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useFriends } from '@/hooks/useFriends';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { usePresence } from '@/hooks/usePresence';
import { currentMonthYear, calcWeekScores, calcDayScore, todayStr, dateKey, getDaysArray } from '@/lib/utils';
import type { MonthYear, Habit } from '@/types';

export const Tracker: React.FC = () => {
  const { profile, session } = useAuthStore();
  const userId = session?.user.id;

  const [monthYear, setMonthYear]   = useState<MonthYear>(currentMonthYear);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);

  const { habits, loading: habitsLoading } = useHabits(userId);
  const { logs, setLog, setNote } = useHabitLogs(userId, monthYear.year, monthYear.month);
  const { friends, loading: friendsLoading, updateFriendLog } = useFriends(userId);

  useRealtimeSync({ friendIds: friends.map(f => f.profile.id), onLogChange: updateFriendLog });
  const { onlineIds, lastSeen } = usePresence(userId, friends.map(f => f.profile.id));

  // Onboarding
  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding(habits.length);

  // Celebration
  const prevScoreRef = useRef<number>(0);
  const today        = todayStr();
  const weekScores   = calcWeekScores(habits, logs);
  const todayScore   = calcDayScore(habits, logs, today);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (prevScoreRef.current < 100 && todayScore === 100 && habits.length > 0) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 4000);
    }
    prevScoreRef.current = todayScore;
  }, [todayScore, habits.length]);

  const handleToggle = async (habitId: string, date: string, value: string) => {
    await setLog(habitId, date, value);
  };

  const handleNote = async (habitId: string, date: string, note: string) => {
    await setNote(habitId, date, note);
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

  const avgWeek      = weekScores.length > 0
    ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length) : 0;
  const days         = getDaysArray(monthYear.month, monthYear.year);
  const greenDays    = days.filter(d => calcDayScore(habits, logs, dateKey(monthYear.year, monthYear.month, d)) >= 80).length;
  const completedToday = habits.filter(h => {
    const log = logs.find(l => l.habit_id === h.id && l.date === today);
    if (!log) return false;
    return h.type === 'checkbox' ? log.value === 'true' : parseFloat(log.value) > 0;
  }).length;

  const onlineFriends = friends.filter(f => onlineIds.has(f.profile.id)).length;
  const scoreColor    = todayScore >= 80 ? 'text-accent-green' : todayScore >= 50 ? 'text-amber' : 'text-red';

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Confetti trigger={celebrate} />

      {/* Celebration overlay text */}
      {celebrate && (
        <div className="fixed top-20 inset-x-0 z-40 flex justify-center pointer-events-none animate-fade-in">
          <div className="bg-accent-green/90 backdrop-blur-sm text-bg font-heading font-bold px-6 py-3 rounded-2xl shadow-lg text-lg">
            🎉 Perfect day!
          </div>
        </div>
      )}

      {/* Onboarding */}
      {showOnboarding && !habitsLoading && (
        <OnboardingModal onDone={dismissOnboarding} />
      )}

      {/* Habit history modal */}
      {historyHabit && (
        <HabitHistoryModal
          habit={historyHabit}
          logs={logs}
          onClose={() => setHistoryHabit(null)}
        />
      )}

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
          {/* My habits column */}
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
                onNote={handleNote}
                onHabitClick={setHistoryHabit}
              />
            </div>
          )}

          {/* Right column */}
          <div className="space-y-4">
            {/* Stats section */}
            {!habitsLoading && (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                    <p className="text-xs text-text-muted mb-1">Today</p>
                    <p className={`font-heading text-2xl font-bold ${scoreColor}`}>{todayScore}%</p>
                    <p className="text-[10px] text-text-subtle mt-1">{completedToday}/{habits.length} done</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                    <p className="text-xs text-text-muted mb-1">This week</p>
                    <p className="font-heading text-2xl font-bold text-text-primary">{avgWeek}%</p>
                    <p className="text-[10px] text-text-subtle mt-1">avg score</p>
                  </div>
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                    <p className="text-xs text-text-muted mb-1">Green days</p>
                    <p className="font-heading text-2xl font-bold text-accent-green">{greenDays}</p>
                    <p className="text-[10px] text-text-subtle mt-1">this month</p>
                  </div>
                </div>

                {weekScores.some(s => s > 0) && (
                  <div className="bg-card border border-border rounded-2xl p-4 shadow-card">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-text-primary">Last 7 days</p>
                      <span className="text-xs text-text-muted font-mono">{avgWeek}% avg</span>
                    </div>
                    <div className="flex items-end gap-1.5">
                      {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => {
                        const score  = weekScores[i] ?? 0;
                        const h      = Math.max(4, Math.round((score / 100) * 48));
                        const color  = score >= 80 ? 'bg-accent-green' : score >= 50 ? 'bg-amber' : score > 0 ? 'bg-red/70' : 'bg-border';
                        const isToday = i === 6;
                        return (
                          <div key={day} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full rounded-md transition-all ${color} ${isToday ? 'ring-1 ring-offset-1 ring-offset-card ring-accent-green/40' : ''}`}
                              style={{ height: `${h}px` }} title={`${day}: ${score}%`} />
                            <span className={`text-[9px] ${isToday ? 'text-accent-green font-medium' : 'text-text-subtle'}`}>{day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Friends section - back at the bottom */}
            <div className="space-y-3 animate-fade-in">
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
                    <span className="text-xs text-accent-green font-medium">{onlineFriends} online</span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs text-text-muted">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse-soft" />
                    Live
                  </span>
                </div>
              </div>
              {friendsLoading ? (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {[1, 2].map(i => <Skeleton key={i} className="h-52 rounded-2xl min-w-[200px]" />)}
                </div>
              ) : friends.length === 0 ? (
                <div className="bg-card border border-dashed border-border/60 rounded-2xl p-8 text-center space-y-2">
                  <p className="text-3xl">👥</p>
                  <p className="font-heading font-medium text-text-primary">No friends yet</p>
                  <p className="text-text-muted text-sm">Go to Settings → Friends to invite people!</p>
                </div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {friends.map(friend => (
                    <FriendCard key={friend.profile.id} friend={friend}
                      isOnline={onlineIds.has(friend.profile.id)}
                      lastSeen={lastSeen.get(friend.profile.id)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
