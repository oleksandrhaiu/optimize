import React, { useState, useEffect, useRef } from 'react';
import { MyHabitsColumn } from '@/components/tracker/MyHabitsColumn';
import { FriendCard } from '@/components/tracker/FriendCard';
import { HabitHistoryModal } from '@/components/tracker/HabitHistoryModal';
import { MonthNav } from '@/components/tracker/MonthNav';
import { OnboardingModal, useOnboarding } from '@/components/onboarding/OnboardingModal';
import { StreakMilestone } from '@/components/tracker/StreakMilestone';
import { WeeklyReview } from '@/components/tracker/WeeklyReview';
import { TrackerSkeleton } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useHabits } from '@/hooks/useHabits';
import { useHabitLogs } from '@/hooks/useHabitLogs';
import { useFriends } from '@/hooks/useFriends';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { usePresence } from '@/hooks/usePresence';
import { useWeeklyReview } from '@/hooks/useWeeklyReview';
import {
  currentMonthYear, calcWeekScores, calcDayScore, todayStr, dateKey,
  getDaysArray, daysInMonth, getStreakWithShield, checkStreakMilestone,
  isHabitScheduledOn, isHabitDone, latestShieldUsedAt, weekdayLabel, lastNDates,
} from '@/lib/utils';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import type { MonthYear, Habit } from '@/types';

export const Tracker: React.FC = () => {
  const { profile, session } = useAuthStore();
  const userId = session?.user.id;

  const [monthYear, setMonthYear]     = useState<MonthYear>(currentMonthYear);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());
  const [historyHabit, setHistoryHabit] = useState<Habit | null>(null);

  const { habits, loading: habitsLoading, updateHabit } = useHabits(userId);
  const { logs, loading: logsLoading, setLog, setNote } = useHabitLogs(userId, monthYear.year, monthYear.month);
  const { friends, loading: friendsLoading, updateFriendLog } = useFriends(userId);

  useRealtimeSync({ friendIds: friends.map(f => f.profile.id), onLogChange: updateFriendLog });
  const { onlineIds, lastSeen } = usePresence(userId, friends.map(f => f.profile.id));

  const { show: showOnboarding, dismiss: dismissOnboarding } = useOnboarding(habits.length);
  const { shouldShow: showWeeklyReview, reviewData, dismiss: dismissWeeklyReview } = useWeeklyReview(habits, logs);

  // ── Streak with shield ──────────────────────────────────────────────────────
  const shieldUsedAt = latestShieldUsedAt(habits);
  const { streak, shieldActive, shieldAvailable, shieldConsumedOn } = getStreakWithShield(
    habits, logs, shieldUsedAt,
  );

  const shieldPersistedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!shieldConsumedOn || !userId || habits.length === 0) return;
    if (shieldPersistedRef.current === shieldConsumedOn) return;
    if (habits.some(h => h.streak_shield_used_at === shieldConsumedOn)) {
      shieldPersistedRef.current = shieldConsumedOn;
      return;
    }
    shieldPersistedRef.current = shieldConsumedOn;
    const active = habits.filter(h => !h.is_archived);
    void Promise.all(
      active.map(h => updateHabit(h.id, { streak_shield_used_at: shieldConsumedOn })),
    );
  }, [shieldConsumedOn, userId, habits, updateHabit]);

  // ── Streak milestone ────────────────────────────────────────────────────────
  const prevStreakRef = useRef<number>(0);
  const isFirstStreakRun = useRef(true);
  const [milestoneDays, setMilestoneDays] = useState<number | null>(null);

  useEffect(() => {
    if (habitsLoading || logsLoading) return;
    if (isFirstStreakRun.current) { prevStreakRef.current = streak; isFirstStreakRun.current = false; return; }
    if (streak > prevStreakRef.current) {
      const milestone = checkStreakMilestone(streak);
      if (milestone) setMilestoneDays(milestone);
    }
    prevStreakRef.current = streak;
  }, [streak, habitsLoading, logsLoading]);

  // ── 100% celebration ────────────────────────────────────────────────────────
  const prevScoreRef = useRef<number>(0);
  const isFirstRun   = useRef(true);
  const today        = todayStr();
  const todayScore   = calcDayScore(habits, logs, today);
  const weekScores   = calcWeekScores(habits, logs);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    if (habitsLoading || logsLoading) return;
    if (isFirstRun.current) { prevScoreRef.current = todayScore; isFirstRun.current = false; return; }
    if (prevScoreRef.current < 100 && todayScore === 100 && habits.length > 0) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 4000);
    }
    prevScoreRef.current = todayScore;
  }, [todayScore, habits.length, habitsLoading, logsLoading]);

  const handleToggle = async (habitId: string, date: string, value: string) => setLog(habitId, date, value);
  const handleNote   = async (habitId: string, date: string, note: string) => setNote(habitId, date, note);

  const clampSelectedDay = (my: MonthYear, day: number) =>
    Math.min(day, daysInMonth(my.month, my.year));

  const handlePrevMonth = () => {
    setMonthYear(prev => {
      const d = new Date(prev.year, prev.month - 1, 1);
      const next = { month: d.getMonth(), year: d.getFullYear() };
      setSelectedDay(day => clampSelectedDay(next, day));
      return next;
    });
  };
  const handleNextMonth = () => {
    setMonthYear(prev => {
      const d = new Date(prev.year, prev.month + 1, 1);
      const next = { month: d.getMonth(), year: d.getFullYear() };
      setSelectedDay(day => clampSelectedDay(next, day));
      return next;
    });
  };

  const weekDates = lastNDates(7);

  const avgWeek = weekScores.length > 0
    ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length) : 0;
  const days      = getDaysArray(monthYear.month, monthYear.year);
  const greenDays = days.filter(d => calcDayScore(habits, logs, dateKey(monthYear.year, monthYear.month, d)) >= 80).length;

  // Only count habits scheduled for today
  const todayHabits = habits.filter(h => !h.is_archived && isHabitScheduledOn(h, today));
  const completedToday = todayHabits.filter(h => {
    const log = logs.find(l => l.habit_id === h.id && l.date === today);
    return isHabitDone(h, log?.value);
  }).length;

  const onlineFriends = friends.filter(f => onlineIds.has(f.profile.id)).length;
  const scoreColor = todayScore >= 80 ? '#10B981' : todayScore >= 50 ? '#F59E0B' : '#EF4444';
  const isLoading = habitsLoading || logsLoading;

  return (
    <div>

      {/* Modals */}
      {showOnboarding && !habitsLoading && <OnboardingModal onDone={dismissOnboarding} />}
      {historyHabit && (
        <HabitHistoryModal habit={historyHabit} logs={logs} onClose={() => setHistoryHabit(null)} />
      )}
      {milestoneDays && (
        <StreakMilestone streak={milestoneDays} onDismiss={() => setMilestoneDays(null)} />
      )}
      {showWeeklyReview && !showOnboarding && (
        <WeeklyReview reviewData={reviewData} onDismiss={dismissWeeklyReview} />
      )}

      {/* 100% Celebration overlay */}
      {celebrate && (
        <div className="fixed inset-0 z-40 pointer-events-none flex items-end justify-center pb-24">
          <div
            className="animate-slide-in-bottom flex items-center gap-3 px-6 py-4 rounded-2xl"
            style={{
              background: 'rgba(12,13,22,0.92)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16,185,129,0.3)',
              boxShadow: '0 0 40px rgba(16,185,129,0.2), 0 24px 64px rgba(0,0,0,0.5)',
            }}
          >
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-heading font-bold text-base" style={{ color: '#34D399' }}>
                Perfect Day!
              </p>
              <p className="text-xs text-text-muted">All habits completed today</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Tracker
            </h1>
            <p className="text-text-muted text-sm mt-0.5">
              Hey <span className="text-violet">@{profile?.username}</span> — stay consistent 💪
            </p>
          </div>
          <MonthNav monthYear={monthYear} onPrev={handlePrevMonth} onNext={handleNextMonth} />
        </div>

        {isLoading ? (
          <TrackerSkeleton />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 animate-fade-in">
            {/* Left: habits column */}
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

            {/* Right column */}
            <div className="space-y-4">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 animate-slide-up" style={{ animationFillMode: 'both' }}>
                {/* Today */}
                <div
                  className="rounded-2xl p-4 flex flex-col gap-1 relative overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(12,13,22,0.6)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: `${scoreColor}25`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                    transition: 'border-color 1.5s ease-out',
                  }}
                >
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: scoreColor, opacity: 0.06, transition: 'background-color 1.5s ease-out' }}
                  />
                  <div className="relative z-10">
                    <p className="text-xs text-text-muted">Today</p>
                    <p className="font-heading text-2xl font-bold" style={{ color: scoreColor, transition: 'color 1.5s ease-out' }}>
                      <AnimatedNumber value={todayScore} suffix="%" />
                    </p>
                    <p className="text-[10px] text-text-subtle">{completedToday}/{todayHabits.length} done</p>
                  </div>
                </div>

                {/* Streak */}
                <div
                  className="rounded-2xl p-4 flex flex-col gap-1 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(145deg, ${shieldActive ? 'rgba(167,139,250,0.10)' : 'rgba(245,158,11,0.06)'}, rgba(12,13,22,0.6))`,
                    border: `1px solid ${shieldActive ? 'rgba(167,139,250,0.25)' : 'rgba(245,158,11,0.15)'}`,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                  }}
                >
                  <p className="text-xs text-text-muted">Streak</p>
                  <p className="font-heading text-2xl font-bold" style={{ color: shieldActive ? '#A78BFA' : '#F59E0B' }}>
                    <AnimatedNumber value={streak} />
                    <span className="text-base ml-0.5">🔥</span>
                  </p>
                  <p className="text-[10px] text-text-subtle">
                    {shieldActive ? '🛡️ shield used' : shieldAvailable ? '🛡️ shield ready' : 'days in a row'}
                  </p>
                </div>

                {/* Green days */}
                <div
                  className="rounded-2xl p-4 flex flex-col gap-1"
                  style={{
                    background: 'linear-gradient(145deg, rgba(16,185,129,0.06), rgba(12,13,22,0.6))',
                    border: '1px solid rgba(16,185,129,0.15)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                  }}
                >
                  <p className="text-xs text-text-muted">Perfect days</p>
                  <p className="font-heading text-2xl font-bold" style={{ color: '#10B981' }}>
                    <AnimatedNumber value={greenDays} />
                  </p>
                  <p className="text-[10px] text-text-subtle">this month</p>
                </div>
              </div>

              {/* Week bar chart */}
              <div
                className="grid transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  gridTemplateRows: weekScores.some(s => s > 0) ? '1fr' : '0fr',
                  opacity: weekScores.some(s => s > 0) ? 1 : 0,
                }}
              >
                <div className="overflow-hidden">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: 'rgb(12,13,22)',
                      border: '1px solid rgb(28,30,52)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
                    }}
                  >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-text-primary font-heading">Last 7 days</p>
                    <span className="text-xs text-text-muted font-mono">
                      <AnimatedNumber value={avgWeek} suffix="% avg" />
                    </span>
                  </div>
                  <div className="flex items-end gap-1.5">
                    {weekDates.map((dateStr, i) => {
                      const day    = weekdayLabel(dateStr);
                      const score  = weekScores[i] ?? 0;
                      const h      = Math.max(4, Math.round((score / 100) * 52));
                      const color  = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : score > 0 ? '#EF4444' : 'rgba(28,30,52,0.8)';
                      const isToday = i === 6;
                      return (
                        <div key={dateStr} className="flex-1 flex flex-col items-center gap-1.5">
                          {score > 0 && (
                            <span className="text-[9px] font-mono" style={{ color }}>
                              {score}%
                            </span>
                          )}
                          <div
                            className="w-full rounded-lg transition-all duration-500"
                            style={{
                              height: `${h}px`,
                              background: isToday
                                ? `linear-gradient(180deg, ${color}, ${color}80)`
                                : color,
                              boxShadow: isToday ? `0 0 10px ${color}40` : 'none',
                            }}
                            title={`${dateStr}: ${score}%`}
                          />
                          <span
                            className="text-[9px] font-medium"
                            style={{ color: isToday ? '#A78BFA' : 'rgb(62,66,104)' }}
                          >
                            {day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Friends */}
              <div className="space-y-3">
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
                      <span className="text-xs font-medium" style={{ color: '#34D399' }}>
                        {onlineFriends} online
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-text-muted">
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: '#34D399' }} />
                      Live
                    </span>
                  </div>
                </div>

                {friendsLoading ? (
                  <div className="flex gap-3">
                    {[1, 2].map(i => (
                      <div key={i} className="h-52 rounded-2xl min-w-[200px] skeleton" />
                    ))}
                  </div>
                ) : friends.length === 0 ? (
                  <div
                    className="rounded-2xl p-8 text-center space-y-2"
                    style={{
                      background: 'rgba(12,13,22,0.5)',
                      border: '1px dashed rgba(28,30,52,0.8)',
                    }}
                  >
                    <p className="text-3xl">👥</p>
                    <p className="font-heading font-semibold text-text-primary">No friends yet</p>
                    <p className="text-text-muted text-sm">Go to Settings → Friends to invite people!</p>
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {friends.map(friend => (
                      <FriendCard
                        key={friend.profile.id}
                        friend={friend}
                        isOnline={onlineIds.has(friend.profile.id)}
                        lastSeen={lastSeen.get(friend.profile.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
