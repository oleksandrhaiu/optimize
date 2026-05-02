import type { Habit, HabitLog } from '@/types';

export function exportHabitsCsv(habits: Habit[], logs: HabitLog[]): void {
  const header = ['Date', 'Habit', 'Type', 'Unit', 'Value', 'Note'].join(',');

  const rows = logs
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(log => {
      const habit = habits.find(h => h.id === log.habit_id);
      if (!habit) return null;
      const value = habit.type === 'checkbox'
        ? (log.value === 'true' ? '✓' : '✗')
        : log.value;
      return [
        log.date,
        `"${habit.name}"`,
        habit.type,
        habit.unit ?? '',
        value,
        `"${(log.note ?? '').replace(/"/g, '""')}"`,
      ].join(',');
    })
    .filter(Boolean);

  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `habitsync-export-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
