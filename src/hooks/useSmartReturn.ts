import { useMemo, useState, useEffect } from 'react';
import type { Habit, HabitLog } from '@/types';
import { calcSmartReturn } from '@/lib/smartReturn';

const SESSION_KEY = 'lumina.smartReturn.dismissed';

function getSessionDismissed(): boolean {
  try {
    const val = sessionStorage.getItem(SESSION_KEY);
    return val === 'true';
  } catch { return false; }
}

export function useSmartReturn(habits: Habit[], logs: HabitLog[]) {
  const [dismissed, setDismissed] = useState(getSessionDismissed);

  const result = useMemo(
    () => calcSmartReturn(habits, logs),
    [habits, logs],
  );

  const dismiss = () => {
    try { sessionStorage.setItem(SESSION_KEY, 'true'); } catch {}
    setDismissed(true);
  };

  const showCard = result.state !== 'none' && !dismissed;

  return { ...result, showCard, dismiss };
}
