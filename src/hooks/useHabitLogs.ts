import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { daysInMonth, dateKey } from '@/lib/utils';
import { showErrorToast } from '@/components/ui/Toast';
import type { HabitLog } from '@/types';

export function useHabitLogs(userId: string | undefined, year: number, month: number) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const startDate = useMemo(() => dateKey(year, month, 1), [year, month]);
  const endDate   = useMemo(() => dateKey(year, month, daysInMonth(month, year)), [year, month]);

  const fetchLogs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);
    setLogs((data as HabitLog[]) ?? []);
    setLoading(false);
  }, [userId, startDate, endDate]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  /** Upsert value (and optionally note) */
  const setLog = useCallback(async (
    habitId: string,
    date: string,
    value: string,
    note?: string,
  ) => {
    if (!userId) return;
    const payload: Record<string, unknown> = { habit_id: habitId, user_id: userId, date, value };
    if (note !== undefined) payload.note = note;

    const { data, error } = await supabase
      .from('habit_logs')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .upsert(payload as any, { onConflict: 'habit_id,date' })
      .select()
      .single();

    if (!error && data) {
      setLogs(prev => {
        const filtered = prev.filter(l => !(l.habit_id === habitId && l.date === date));
        return [...filtered, data as HabitLog];
      });
    } else if (error) {
      showErrorToast('Failed to save — check your connection and try again.');
    }
    return error;
  }, [userId]);

  /** Update only the note of an existing log */
  const setNote = useCallback(async (habitId: string, date: string, note: string) => {
    if (!userId) return;
    const existing = logs.find(l => l.habit_id === habitId && l.date === date);
    if (!existing) return; // can't add note without a value
    return setLog(habitId, date, existing.value, note);
  }, [userId, logs, setLog]);

  /** Merge external logs (from realtime) */
  const mergeLog = useCallback((log: HabitLog) => {
    setLogs(prev => {
      const filtered = prev.filter(l => !(l.habit_id === log.habit_id && l.date === log.date));
      return [...filtered, log];
    });
  }, []);

  return { logs, loading, setLog, setNote, mergeLog, refetch: fetchLogs };
}

/** Fetch logs for a specific user or a batch of users (friends / history) */
export async function fetchLogsForUser(
  userId: string,
  startDate: string,
  endDate: string,
  userIds?: string[], // batch mode: fetch for multiple users at once
): Promise<HabitLog[]> {
  const query = supabase
    .from('habit_logs')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate);

  if (userIds && userIds.length > 0) {
    query.in('user_id', userIds);
  } else {
    query.eq('user_id', userId);
  }

  const { data } = await query;
  return (data as HabitLog[]) ?? [];
}
