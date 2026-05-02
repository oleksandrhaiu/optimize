import React from 'react';

export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    className={`animate-spin text-accent-green ${className}`}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path
      className="opacity-80"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center">
    <div className="text-center space-y-4">
      <LoadingSpinner size={40} />
      <p className="text-text-muted text-sm">Loading…</p>
    </div>
  </div>
);
