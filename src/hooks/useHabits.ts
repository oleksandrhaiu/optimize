import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Habit } from '@/types';

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [archivedHabits, setArchivedHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', false)
      .order('order', { ascending: true });

    if (error) { setError(error.message); setLoading(false); return; }
    setHabits(data as Habit[] ?? []);
    setLoading(false);
  }, [userId]);

  const fetchArchivedHabits = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .eq('is_archived', true)
      .order('order', { ascending: true });

    if (!error) setArchivedHabits(data as Habit[] ?? []);
    return error;
  }, [userId]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const addHabit = useCallback(async (
    name: string,
    type: 'checkbox' | 'numeric',
    extra?: Partial<Habit>,
  ) => {
    if (!userId) return;
    const maxOrder = habits.reduce((m, h) => Math.max(m, h.order), -1);
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name,
        type,
        order: maxOrder + 1,
        is_calorie_habit: false,
        frequency: 'daily',
        frequency_days: null,
        is_private: false,
        is_archived: false,
        streak_shield_used_at: null,
        ...extra,
      })
      .select()
      .single();
    if (!error && data) setHabits(prev => [...prev, data as Habit]);
    return error;
  }, [userId, habits]);

  const updateHabit = useCallback(async (id: string, updates: Partial<Habit>) => {
    const { error } = await supabase.from('habits').update(updates).eq('id', id);
    if (!error) setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
    return error;
  }, []);

  /** Soft-delete: hides from tracker but preserves history */
  const archiveHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('habits').update({ is_archived: true }).eq('id', id);
    if (!error) {
      setHabits(prev => {
        const habit = prev.find(h => h.id === id);
        if (habit) setArchivedHabits(a => [...a, { ...habit, is_archived: true }]);
        return prev.filter(h => h.id !== id);
      });
    }
    return error;
  }, []);

  /** Restore habit from archive */
  const restoreHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('habits').update({ is_archived: false }).eq('id', id);
    if (!error) {
      setArchivedHabits(prev => {
        const habit = prev.find(h => h.id === id);
        if (habit) setHabits(a => [...a, { ...habit, is_archived: false }]);
        return prev.filter(h => h.id !== id);
      });
    }
    return error;
  }, []);

  /** Hard-delete: permanently removes habit and all logs */
  const deleteHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) {
      setHabits(prev => prev.filter(h => h.id !== id));
      setArchivedHabits(prev => prev.filter(h => h.id !== id));
    }
    return error;
  }, []);

  const reorderHabits = useCallback(async (reordered: Habit[]) => {
    setHabits(reordered);
    const updates = reordered.map((h, i) => ({
      id: h.id, order: i, user_id: h.user_id, name: h.name,
      type: h.type, is_calorie_habit: h.is_calorie_habit,
    }));
    for (const u of updates) {
      await supabase.from('habits').update({ order: u.order }).eq('id', u.id);
    }
  }, []);

  return {
    habits, archivedHabits, loading, error,
    refetch: fetchHabits, fetchArchivedHabits,
    addHabit, updateHabit, archiveHabit, restoreHabit, deleteHabit, reorderHabits,
  };
}
