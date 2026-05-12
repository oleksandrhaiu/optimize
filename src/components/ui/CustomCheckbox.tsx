import React, { useState, useRef } from 'react';
import Lottie from 'lottie-react';
import checkSuccessData from '@/assets/animations/check-success.json';
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
  const [showAnim, setShowAnim] = useState(false);
  const lottieRef = useRef<any>(null);

  const sizeClass = size === 'sm'
    ? 'w-8 h-8 sm:w-6 sm:h-6'
    : 'w-9 h-9 sm:w-7 sm:h-7';

  const handleClick = () => {
    if (disabled) return;
    const next = !checked;
    onChange(next);
    if (next) {
      setShowAnim(true);
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
        'relative rounded-xl flex items-center justify-center transition-all duration-200',
        'outline-none focus-visible:ring-2 focus-visible:ring-violet/50',
        sizeClass,
        checked
          ? 'border-0'
          : 'border-2 border-border bg-transparent hover:border-text-subtle',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      )}
      style={
        checked
          ? {
              background: 'linear-gradient(135deg, #10B981, #059669)',
              boxShadow: '0 0 14px rgba(16,185,129,0.4)',
              transform: 'scale(1)',
            }
          : undefined
      }
    >
      {/* Static checkmark when checked + no animation */}
      {checked && !showAnim && (
        <svg
          className={size === 'sm' ? 'w-3 h-3 sm:w-2.5 sm:h-2.5' : 'w-3.5 h-3.5 sm:w-3 sm:h-3'}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 6L5 9L10 3"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* Lottie animation on first check */}
      {showAnim && (
        <div className="absolute inset-0 -m-2 pointer-events-none z-10">
          <Lottie
            lottieRef={lottieRef}
            animationData={checkSuccessData}
            loop={false}
            autoplay={true}
            onComplete={() => setShowAnim(false)}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}
    </div>
  );
};
