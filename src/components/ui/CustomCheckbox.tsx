import React from 'react';
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
  const handleClick = () => {
    if (!disabled) onChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const sizeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={clx(
        'relative rounded-md border-2 flex items-center justify-center transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue/50',
        sizeClass,
        checked
          ? 'border-accent-green bg-accent-green/10 scale-110'
          : 'border-border bg-transparent hover:border-text-muted',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        !disabled && !checked && 'hover:scale-105',
      )}
      style={{
        transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {checked && (
        <svg
          className="text-accent-green"
          width={size === 'sm' ? 10 : 12}
          height={size === 'sm' ? 10 : 12}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};
