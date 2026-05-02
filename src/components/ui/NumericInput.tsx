import React, { useState, useEffect } from 'react';
import { getCalorieZone, clx } from '@/lib/utils';
import type { CalorieZone } from '@/types';

interface NumericInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  calMin?: number | null;
  calMax?: number | null;
  placeholder?: string;
  disabled?: boolean;
  unit?: string;
}

const zoneColors: Record<CalorieZone, string> = {
  green: 'border-accent-green text-accent-green focus:ring-accent-green/30',
  amber: 'border-amber text-amber focus:ring-amber/30',
  red: 'border-red text-red focus:ring-red/30',
  none: 'border-border text-text-primary focus:ring-blue/30',
};

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  calMin,
  calMax,
  placeholder = '0',
  disabled = false,
  unit,
}) => {
  const [inputValue, setInputValue] = useState(value !== null ? String(value) : '');

  useEffect(() => {
    setInputValue(value !== null ? String(value) : '');
  }, [value]);

  const zone: CalorieZone =
    value !== null && calMin !== undefined && calMax !== undefined
      ? getCalorieZone(value, calMin ?? null, calMax ?? null)
      : 'none';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const num = parseFloat(raw);
    onChange(isNaN(num) ? null : num);
  };

  return (
    <div className="relative flex items-center">
      <input
        type="number"
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        min={0}
        className={clx(
          'font-mono-nums w-20 bg-bg rounded-lg border px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 transition-all duration-200',
          zoneColors[zone],
          disabled ? 'opacity-50 cursor-not-allowed' : '',
        )}
      />
      {unit && <span className="ml-1 text-xs text-text-muted font-mono">{unit}</span>}
    </div>
  );
};
