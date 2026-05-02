import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Habit } from '@/types';

const DEFAULT_HABITS: Omit<Habit, 'id' | 'user_id' | 'created_at'>[] = [
  { name: 'Water', type: 'numeric', unit: 'glasses', icon: '💧', order: 0, cal_min: null, cal_max: null, is_calorie_habit: false },
  { name: 'Workout', type: 'checkbox', unit: null, icon: '🏋️', order: 1, cal_min: null, cal_max: null, is_calorie_habit: false },
  { name: 'Calories', type: 'numeric', unit: 'kcal', icon: '🔥', order: 2, cal_min: 1800, cal_max: 2400, is_calorie_habit: true },
  { name: 'Reading', type: 'numeric', unit: 'pages', icon: '📖', order: 3, cal_min: null, cal_max: null, is_calorie_habit: false },
  { name: 'Sleep', type: 'numeric', unit: 'hrs', icon: '😴', order: 4, cal_min: null, cal_max: null, is_calorie_habit: false },
];

export function useHabits(userId: string | undefined) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHabits = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });

    if (error) { setError(error.message); setLoading(false); return; }

    // Seed default habits for new users
    if (!data || data.length === 0) {
      const inserts = DEFAULT_HABITS.map(h => ({ ...h, user_id: userId }));
      const { data: seeded } = await supabase.from('habits').insert(inserts).select();
      setHabits((seeded as Habit[]) ?? []);
    } else {
      setHabits(data as Habit[]);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const addHabit = useCallback(async (name: string, type: 'checkbox' | 'numeric', extra?: Partial<Habit>) => {
    if (!userId) return;
    const maxOrder = habits.reduce((m, h) => Math.max(m, h.order), -1);
    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: userId, name, type, order: maxOrder + 1, is_calorie_habit: false, ...extra })
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

  const deleteHabit = useCallback(async (id: string) => {
    const { error } = await supabase.from('habits').delete().eq('id', id);
    if (!error) setHabits(prev => prev.filter(h => h.id !== id));
    return error;
  }, []);

  const reorderHabits = useCallback(async (reordered: Habit[]) => {
    setHabits(reordered);
    const updates = reordered.map((h, i) => ({ id: h.id, order: i, user_id: h.user_id, name: h.name, type: h.type, is_calorie_habit: h.is_calorie_habit }));
    for (const u of updates) {
      await supabase.from('habits').update({ order: u.order }).eq('id', u.id);
    }
  }, []);

  return { habits, loading, error, refetch: fetchHabits, addHabit, updateHabit, deleteHabit, reorderHabits };
}
