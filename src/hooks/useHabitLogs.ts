import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { daysInMonth, dateKey } from '@/lib/utils';
import type { HabitLog } from '@/types';

export function useHabitLogs(userId: string | undefined, year: number, month: number) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const startDate = dateKey(year, month, 1);
  const endDate = dateKey(year, month, daysInMonth(month, year));

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

/** Fetch logs for a specific user (friends / history) */
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
