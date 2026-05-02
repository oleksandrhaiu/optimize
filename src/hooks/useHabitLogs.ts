import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { HabitLog } from '@/types';

export function useHabitLogs(userId: string | undefined, year: number, month: number) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-31`;

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

  /** Upsert a log (insert or update on conflict) */
  const setLog = useCallback(async (
    habitId: string,
    date: string,
    value: string,
  ) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('habit_logs')
      .upsert({ habit_id: habitId, user_id: userId, date, value }, { onConflict: 'habit_id,date' })
      .select()
      .single();
    if (!error && data) {
      setLogs(prev => {
        const filtered = prev.filter(l => !(l.habit_id === habitId && l.date === date));
        return [...filtered, data as HabitLog];
      });
    }
    return error;
  }, [userId]);

  /** Merge external logs (from realtime) */
  const mergeLog = useCallback((log: HabitLog) => {
    setLogs(prev => {
      const filtered = prev.filter(l => !(l.habit_id === log.habit_id && l.date === log.date));
      return [...filtered, log];
    });
  }, []);

  return { logs, loading, setLog, mergeLog, refetch: fetchLogs };
}

/** Fetch logs for a specific user (friends) */
export async function fetchLogsForUser(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<HabitLog[]> {
  const { data } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate);
  return (data as HabitLog[]) ?? [];
}
