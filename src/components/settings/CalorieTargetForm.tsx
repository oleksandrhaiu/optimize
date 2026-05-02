import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import type { Habit } from '@/types';

interface Props {
  habits: Habit[];
  onUpdate: (id: string, updates: Partial<Habit>) => void;
}

export const CalorieTargetForm: React.FC<Props> = ({ habits, onUpdate }) => {
  const calorieHabit = habits.find(h => h.is_calorie_habit);
  
  const [min, setMin] = useState(calorieHabit?.cal_min ? String(calorieHabit.cal_min) : '');
  const [max, setMax] = useState(calorieHabit?.cal_max ? String(calorieHabit.cal_max) : '');

  useEffect(() => {
    if (calorieHabit) {
      setMin(calorieHabit.cal_min ? String(calorieHabit.cal_min) : '');
      setMax(calorieHabit.cal_max ? String(calorieHabit.cal_max) : '');
    }
  }, [calorieHabit]);

  if (!calorieHabit) {
    return (
      <div className="text-text-muted text-sm py-4">
        You need a habit marked as "is_calorie_habit" to set targets. (Currently not supported via UI, use DB for now or it's created by default).
      </div>
    );
  }

  const handleSave = () => {
    const minVal = min ? parseInt(min) : null;
    const maxVal = max ? parseInt(max) : null;
    onUpdate(calorieHabit.id, { cal_min: minVal, cal_max: maxVal });
  };

  return (
    <div className="space-y-4 max-w-sm">
      <div className="flex items-center gap-4">
        <div className="space-y-1.5 flex-1">
          <label className="text-sm text-text-muted">Target Min</label>
          <input
            type="number"
            value={min}
            onChange={e => setMin(e.target.value)}
            placeholder="e.g. 1800"
            className="input-base font-mono-nums"
          />
        </div>
        <div className="space-y-1.5 flex-1">
          <label className="text-sm text-text-muted">Target Max</label>
          <input
            type="number"
            value={max}
            onChange={e => setMax(e.target.value)}
            placeholder="e.g. 2400"
            className="input-base font-mono-nums"
          />
        </div>
      </div>
      <Button onClick={handleSave} variant="secondary" className="w-full">
        Save Targets
      </Button>
    </div>
  );
};
