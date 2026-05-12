import React, { useState } from 'react';
import { clx } from '@/lib/utils';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
}) => {
  const [animating, setAnimating] = useState(false);

  const sizeClass = size === 'sm'
    ? 'w-8 h-8 sm:w-6 sm:h-6'
    : 'w-9 h-9 sm:w-7 sm:h-7';

  const svgSize = size === 'sm' ? 12 : 14;

  const handleClick = () => {
    if (disabled) return;
    const next = !checked;
    onChange(next);
    if (next) {
      setAnimating(true);
      // reset so animation can replay on next check
      setTimeout(() => setAnimating(false), 400);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={clx(
        'relative rounded-xl flex items-center justify-center',
        'outline-none focus-visible:ring-2 focus-visible:ring-violet/50',
        'transition-all duration-200 select-none',
        sizeClass,
        checked ? 'border-0' : 'border-2 border-border hover:border-text-subtle',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        animating && 'animate-check-pop',
      )}
      style={
        checked
          ? {
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 0 14px rgba(16,185,129,0.5)',
            }
          : undefined
      }
    >
      {checked && (
        <svg
          width={svgSize}
          height={svgSize}
          viewBox="0 0 12 12"
          fill="none"
          className={animating ? 'check-draw' : ''}
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={
              animating
                ? {
                    strokeDasharray: 14,
                    strokeDashoffset: 0,
                    animation: 'checkDraw 0.3s ease-out forwards',
                  }
                : undefined
            }
          />
        </svg>
      )}

      <style>{`
        @keyframes checkDraw {
          from { stroke-dashoffset: 14; }
          to   { stroke-dashoffset: 0; }
        }
      `}</style>
    </div>
  );
};
