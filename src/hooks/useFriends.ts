import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { UserProfile, FriendWithData } from '@/types';
import { calcDayScore, calcWeekScores, lastNDates, todayStr } from '@/lib/utils';
import { fetchLogsForUser } from './useHabitLogs';

export function useFriends(userId: string | undefined) {
  const [friends, setFriends] = useState<FriendWithData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFriends = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    // Get accepted friendships where I am either side
    const { data: fships } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`)
      .eq('status', 'accepted');

    if (!fships || fships.length === 0) {
      setFriends([]);
      setLoading(false);
      return;
    }

    const friendIds = fships.map(f => f.user_a_id === userId ? f.user_b_id : f.user_a_id);

    // Fetch all friend profiles
    const { data: profiles } = await supabase
      .from('users')
      .select('*')
      .in('id', friendIds);

    if (!profiles) { setLoading(false); return; }

    // Fetch habits + logs for each friend
    const today = todayStr();
    const weekDates = lastNDates(7);
    const startDate = weekDates[0];

    const friendData: FriendWithData[] = await Promise.all(
      (profiles as UserProfile[]).map(async profile => {
        const { data: habits } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', profile.id)
          .order('order', { ascending: true });

        const logs = await fetchLogsForUser(profile.id, startDate, today);
        const h = habits ?? [];
        const todayScore = calcDayScore(h as any, logs, today);
        const weekScores = calcWeekScores(h as any, logs);

        return {
          profile,
          habits: h as any,
          logs,
          todayScore,
          weekScores,
        };
      }),
    );

    setFriends(friendData);
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchFriends(); }, [fetchFriends]);

  // Realtime profile updates
  useEffect(() => {
    if (friends.length === 0) return;
    const friendIds = friends.map(f => f.profile.id);

    const channel = supabase
      .channel('friend-profiles')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=in.(${friendIds.join(',')})`,
        },
        (payload) => {
          const updatedProfile = payload.new as UserProfile;
          setFriends(prev => prev.map(f =>
            f.profile.id === updatedProfile.id
              ? { ...f, profile: { ...f.profile, ...updatedProfile } }
              : f
          ));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [friends.length]); // simple trigger on length change

  const removeFriend = useCallback(async (friendId: string) => {
    if (!userId) return;
    await supabase
      .from('friendships')
      .delete()
      .or(
        `and(user_a_id.eq.${userId},user_b_id.eq.${friendId}),and(user_a_id.eq.${friendId},user_b_id.eq.${userId})`,
      );
    setFriends(prev => prev.filter(f => f.profile.id !== friendId));
  }, [userId]);

  /** Update a single friend's log in state (used by realtime hook) */
  const updateFriendLog = useCallback((friendId: string, log: any) => {
    setFriends(prev =>
      prev.map(f => {
        if (f.profile.id !== friendId) return f;
        const filteredLogs = f.logs.filter(
          l => !(l.habit_id === log.habit_id && l.date === log.date),
        );
        const newLogs = [...filteredLogs, log];
        const todayScore = calcDayScore(f.habits, newLogs, todayStr());
        const weekScores = calcWeekScores(f.habits, newLogs);
        return { ...f, logs: newLogs, todayScore, weekScores };
      }),
    );
  }, []);

  return { friends, loading, refetch: fetchFriends, removeFriend, updateFriendLog };
}

export async function acceptInvite(token: string, userId: string): Promise<{ error: string | null }> {
  // Lookup token
  const { data: tokenRow } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single();

  if (!tokenRow) return { error: 'Invalid or already used invite link.' };
  if (tokenRow.creator_user_id === userId) return { error: 'You cannot add yourself as a friend.' };

  // Check not already friends
  const { data: existing } = await supabase
    .from('friendships')
    .select('id')
    .or(
      `and(user_a_id.eq.${userId},user_b_id.eq.${tokenRow.creator_user_id}),and(user_a_id.eq.${tokenRow.creator_user_id},user_b_id.eq.${userId})`,
    )
    .single();

  if (existing) return { error: null }; // already friends, no-op

  // Create friendship
  const { error: fErr } = await supabase.from('friendships').insert({
    user_a_id: tokenRow.creator_user_id,
    user_b_id: userId,
    status: 'accepted',
  });
  if (fErr) return { error: fErr.message };

  // Mark token as used
  await supabase.from('invite_tokens').update({ used: true }).eq('id', tokenRow.id);

  return { error: null };
}
