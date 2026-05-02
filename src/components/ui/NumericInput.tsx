import React, { useState, useEffect } from 'react';
import { clx, getCalorieZone } from '@/lib/utils';
import type { CalorieZone } from '@/types';

interface NumericInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  calMin?: number | null;
  calMax?: number | null;
  placeholder?: string;
  disabled?: boolean;
  unit?: string;
  step?: number;
}

const zoneStyles: Record<CalorieZone, { border: string; text: string; bg: string }> = {
  green: { border: 'border-accent-green/60', text: 'text-accent-green', bg: 'bg-accent-green/5' },
  amber: { border: 'border-amber/60',       text: 'text-amber',        bg: 'bg-amber/5' },
  red:   { border: 'border-red/60',         text: 'text-red',          bg: 'bg-red/5' },
  none:  { border: 'border-border',         text: 'text-text-primary', bg: 'bg-bg' },
};

export const NumericInput: React.FC<NumericInputProps> = ({
  value,
  onChange,
  calMin,
  calMax,
  placeholder = '0',
  disabled = false,
  unit,
  step = 1,
}) => {
  const [inputValue, setInputValue] = useState(value !== null ? String(value) : '');

  useEffect(() => {
    setInputValue(value !== null ? String(value) : '');
  }, [value]);

  const zone: CalorieZone =
    value !== null && calMin !== undefined && calMax !== undefined
      ? getCalorieZone(value, calMin ?? null, calMax ?? null)
      : 'none';

  const styles = zoneStyles[zone];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const num = parseFloat(raw);
    onChange(isNaN(num) ? null : num);
  };

  const increment = () => {
    const cur = value ?? 0;
    const next = parseFloat((cur + step).toFixed(2));
    onChange(next);
  };

  const decrement = () => {
    const cur = value ?? 0;
    const next = Math.max(0, parseFloat((cur - step).toFixed(2)));
    onChange(next);
  };

  return (
    <div className={clx(
      'inline-flex items-center rounded-xl border transition-all duration-150',
      styles.border,
      styles.bg,
      disabled && 'opacity-50',
    )}>
      {/* Minus */}
      <button
        type="button"
        onClick={decrement}
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors disabled:cursor-not-allowed rounded-l-xl"
      >
        <svg width="10" height="2" viewBox="0 0 10 2" fill="none">
          <path d="M1 1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Input */}
      <input
        type="number"
        value={inputValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        min={0}
        className={clx(
          'font-mono-nums w-14 bg-transparent border-none text-center text-sm py-1 focus:outline-none',
          styles.text,
          'placeholder-text-muted',
          '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
        )}
      />

      {/* Plus */}
      <button
        type="button"
        onClick={increment}
        disabled={disabled}
        className="w-7 h-7 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors disabled:cursor-not-allowed rounded-r-xl"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {unit && (
        <span className={clx('pr-2 text-xs font-mono', styles.text, 'opacity-70')}>
          {unit}
        </span>
      )}
    </div>
  );
};
