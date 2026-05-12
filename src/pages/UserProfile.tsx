import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Navbar } from '@/components/ui/Navbar';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/authStore';
import { useFriends } from '@/hooks/useFriends';
import { calcDayScore, calcWeekScores, lastNDates, todayStr, formatDate } from '@/lib/utils';
import { fetchLogsForUser } from '@/hooks/useHabitLogs';
import type { UserProfile, Habit, HabitLog } from '@/types';

export const UserProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { session } = useAuthStore();
  const myUserId = session?.user.id;

  const { friends, refetch, removeFriend } = useFriends(myUserId);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [addingFriend, setAddingFriend] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [removing, setRemoving] = useState(false);

  const today = todayStr();
  const weekDates = lastNDates(7);

  const isSelf = profile?.id === myUserId;
  const isFriend = friends.some(f => f.profile.id === profile?.id);

  useEffect(() => {
    if (!username) return;

    const load = async () => {
      setLoading(true);
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .ilike('username', username)
        .maybeSingle();

      if (!profileData) { setNotFound(true); setLoading(false); return; }
      setProfile(profileData as UserProfile);

      const { data: habitsData } = await supabase
        .from('habits')
        .select('*')
        .eq('user_id', profileData.id)
        .order('order', { ascending: true });

      const h = (habitsData ?? []) as Habit[];
      setHabits(h);

      const fetchedLogs = await fetchLogsForUser(profileData.id, weekDates[0], today);
      setLogs(fetchedLogs);
      setLoading(false);
    };

    load();
  }, [username]);

  const handleAddFriend = async () => {
    if (!myUserId || !profile) return;
    setAddingFriend(true);
    const { data: existing } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_a_id.eq.${myUserId},user_b_id.eq.${profile.id}),and(user_a_id.eq.${profile.id},user_b_id.eq.${myUserId})`)
      .maybeSingle();

    if (!existing) {
      await supabase.from('friendships').insert({
        user_a_id: myUserId,
        user_b_id: profile.id,
        status: 'accepted',
      });
      await refetch();
    }
    setAddingFriend(false);
    setAddedSuccess(true);
  };

  const handleRemoveFriend = async () => {
    if (!profile) return;
    setRemoving(true);
    await removeFriend(profile.id);
    setConfirmRemove(false);
    setAddedSuccess(false);
    setRemoving(false);
  };

  const weekScores = calcWeekScores(habits, logs);
  const todayScore = calcDayScore(habits, logs, today);
  const avgWeek = weekScores.length > 0
    ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length) : 0;
  const streak = (() => {
    let s = 0;
    for (let i = weekDates.length - 1; i >= 0; i--) {
      if (calcDayScore(habits, logs, weekDates[i]) >= 80) s++;
      else break;
    }
    return s;
  })();

  const scoreColor = todayScore >= 80 ? 'text-accent' : todayScore >= 50 ? 'text-amber' : 'text-text-muted';

  if (notFound) {
    return (
      <div>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <p className="text-4xl">🔍</p>
          <h1 className="font-heading text-xl font-bold text-text-primary">User not found</h1>
          <p className="text-text-muted text-sm">@{username} doesn't exist.</p>
          <button onClick={() => navigate(-1)} className="text-accent text-sm hover:underline">← Go back</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>

        {/* Profile header */}
        {loading ? (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-4">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ) : profile && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-card animate-fade-in">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar username={profile.username} color={profile.avatar_color} size="lg" />
                </div>
                <div>
                  <h1 className="font-heading text-xl font-bold text-text-primary">@{profile.username}</h1>
                  <p className="text-xs text-text-muted mt-0.5">
                    Joined {new Date(profile.created_at).toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Action button */}
              {!isSelf && (
                isFriend || addedSuccess ? (
                  confirmRemove ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">Remove friend?</span>
                      <button
                        onClick={handleRemoveFriend}
                        disabled={removing}
                        className="px-3 py-1.5 rounded-xl bg-red/80 text-white text-xs font-semibold hover:bg-red transition-all disabled:opacity-60"
                      >
                        {removing ? 'Removing…' : 'Remove'}
                      </button>
                      <button
                        onClick={() => setConfirmRemove(false)}
                        className="px-3 py-1.5 rounded-xl bg-border/50 text-text-muted text-xs font-semibold hover:bg-border transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmRemove(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-xs font-semibold hover:bg-red/10 hover:border-red/30 hover:text-red transition-all group"
                    >
                      <span className="group-hover:hidden">✓ Friends</span>
                      <span className="hidden group-hover:inline">Remove</span>
                    </button>
                  )
                ) : (
                  <button
                    onClick={handleAddFriend}
                    disabled={addingFriend}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent text-bg text-sm font-semibold hover:bg-accent/90 transition-all disabled:opacity-60"
                  >
                    {addingFriend ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" className="animate-spin" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.25"/>
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                      </svg>
                    ) : '+ '}
                    {addingFriend ? 'Adding…' : 'Add Friend'}
                  </button>
                )
              )}
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/50">
              <div className="text-center">
                <p className={`font-heading text-2xl font-bold ${scoreColor}`}>{todayScore}%</p>
                <p className="text-[10px] text-text-muted mt-0.5">Today</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-text-primary">{avgWeek}%</p>
                <p className="text-[10px] text-text-muted mt-0.5">This week</p>
              </div>
              <div className="text-center">
                <p className="font-heading text-2xl font-bold text-amber">{streak}</p>
                <p className="text-[10px] text-text-muted mt-0.5">Day streak</p>
              </div>
            </div>
          </div>
        )}

        {/* Week bar chart */}
        {!loading && habits.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card animate-fade-in">
            <p className="text-sm font-medium text-text-primary mb-4">Last 7 days</p>
            <div className="flex items-end gap-1.5">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => {
                const score = weekScores[i] ?? 0;
                const h = Math.max(4, Math.round((score / 100) * 48));
                const color = score >= 80 ? 'bg-accent' : score >= 50 ? 'bg-amber' : score > 0 ? 'bg-red/60' : 'bg-border';
                const isToday = weekDates[i] === today;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-text-subtle font-mono">{score > 0 ? score + '%' : ''}</span>
                    <div
                      className={`w-full rounded-md ${color} ${isToday ? 'ring-1 ring-offset-1 ring-offset-card ring-accent/50' : ''}`}
                      style={{ height: `${h}px` }}
                      title={`${day}: ${score}%`}
                    />
                    <span className={`text-[9px] ${isToday ? 'text-accent font-medium' : 'text-text-subtle'}`}>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Today's habits */}
        {!loading && habits.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card animate-fade-in">
            <p className="text-sm font-medium text-text-primary mb-3">
              Today's Habits
              <span className="ml-2 text-text-subtle text-xs font-normal font-mono">
                ({habits.filter(h => {
                  const l = logs.find(l => l.habit_id === h.id && l.date === today);
                  return l && (h.type === 'checkbox' ? l.value === 'true' : parseFloat(l.value) > 0);
                }).length}/{habits.length})
              </span>
            </p>
            <div className="space-y-2">
              {habits.map(habit => {
                const log = logs.find(l => l.habit_id === habit.id && l.date === today);
                const done = log ? (habit.type === 'checkbox' ? log.value === 'true' : parseFloat(log.value) > 0) : false;
                const displayValue = log && habit.type === 'numeric' && parseFloat(log.value) > 0
                  ? `${log.value}${habit.unit ? ' ' + habit.unit : ''}`
                  : null;
                return (
                  <div key={habit.id} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="flex items-center gap-2 text-sm text-text-muted min-w-0">
                      {habit.icon && <span className="flex-shrink-0">{habit.icon}</span>}
                      <span className="truncate">{habit.name}</span>
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {displayValue && (
                        <span className="text-xs text-text-subtle font-mono">{displayValue}</span>
                      )}
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-accent/15' : 'bg-border/40'}`}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          {done ? (
                            <path d="M2 5l2 2 4-4" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          ) : (
                            <path d="M3 3l4 4M7 3L3 7" stroke="#5A5F75" strokeWidth="1.2" strokeLinecap="round"/>
                          )}
                        </svg>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && habits.length === 0 && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-card animate-fade-in">
            <p className="text-2xl mb-2">📋</p>
            <p className="text-sm text-text-muted">No habits set up yet.</p>
          </div>
        )}
      </main>
    </div>
  );
};
