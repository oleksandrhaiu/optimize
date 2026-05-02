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

const zoneRing: Record<CalorieZone, string> = {
  green: 'ring-1 ring-accent-green/50',
  amber: 'ring-1 ring-amber/50',
  red:   'ring-1 ring-red/50',
  none:  '',
};

const zoneText: Record<CalorieZone, string> = {
  green: 'text-accent-green',
  amber: 'text-amber',
  red:   'text-red',
  none:  'text-text-primary',
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
    value !== null && calMin != null && calMax != null
      ? getCalorieZone(value, calMin, calMax)
      : 'none';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    const num = parseFloat(raw);
    onChange(isNaN(num) ? null : num);
  };

  const increment = () => {
    const cur = value ?? 0;
    onChange(parseFloat((cur + step).toFixed(2)));
  };

  const decrement = () => {
    const cur = value ?? 0;
    onChange(Math.max(0, parseFloat((cur - step).toFixed(2))));
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* Stepper */}
      <div className={clx(
        'inline-flex items-center bg-bg border border-border rounded-lg transition-all duration-150',
        zoneRing[zone],
        disabled && 'opacity-50',
      )}>
        <button
          type="button"
          onClick={decrement}
          disabled={disabled}
          className="w-10 h-10 sm:w-6 sm:h-6 flex items-center justify-center text-text-subtle hover:text-text-primary transition-colors disabled:cursor-not-allowed rounded-l-lg hover:bg-white/[0.04]"
        >
          <svg width="8" height="2" viewBox="0 0 8 2" fill="none">
            <path d="M1 1h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          min={0}
          className={clx(
            'w-14 sm:w-10 bg-transparent border-none text-center text-base sm:text-xs font-mono py-2 sm:py-1 focus:outline-none',
            zoneText[zone],
            'placeholder-text-muted',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
          )}
        />

        <button
          type="button"
          onClick={increment}
          disabled={disabled}
          className="w-10 h-10 sm:w-6 sm:h-6 flex items-center justify-center text-text-subtle hover:text-text-primary transition-colors disabled:cursor-not-allowed rounded-r-lg hover:bg-white/[0.04]"
        >
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M4 1v6M1 4h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Unit — outside the stepper, small and unobtrusive */}
      {unit && (
        <span className="text-[10px] text-text-subtle font-mono leading-none whitespace-nowrap">
          {unit}
        </span>
      )}
    </div>
  );
};
