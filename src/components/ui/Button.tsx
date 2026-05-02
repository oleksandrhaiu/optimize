import React from 'react';
import { clx } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizes = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: '',
  lg: 'text-base px-6 py-3.5',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={clx(variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          {/* Thin spinning arc */}
          <svg
            className="animate-spin"
            style={{ animationDuration: '0.75s' }}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.2" />
            <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          Loading…
        </span>
      ) : children}
    </button>
  );
};
