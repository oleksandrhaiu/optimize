import React from 'react';
import { monthName, clx } from '@/lib/utils';
import type { MonthYear } from '@/types';

interface MonthNavProps {
  monthYear: MonthYear;
  onPrev: () => void;
  onNext: () => void;
}

export const MonthNav: React.FC<MonthNavProps> = ({ monthYear, onPrev, onNext }) => {
  const isCurrentMonth =
    monthYear.year === new Date().getFullYear() && monthYear.month === new Date().getMonth();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onPrev}
        className="w-8 h-8 rounded-lg border border-border text-text-muted hover:text-text-primary hover:border-text-muted flex items-center justify-center transition-all"
        aria-label="Previous month"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="text-center min-w-[120px]">
        <span className="font-heading font-semibold text-text-primary">
          {monthName(monthYear.month)}
        </span>
        <span className={clx('ml-2 font-mono text-sm', isCurrentMonth ? 'text-accent-green' : 'text-text-muted')}>
          {monthYear.year}
        </span>
      </div>
      <button
        onClick={onNext}
        disabled={isCurrentMonth}
        className={clx(
          'w-8 h-8 rounded-lg border border-border flex items-center justify-center transition-all',
          isCurrentMonth
            ? 'text-border cursor-not-allowed'
            : 'text-text-muted hover:text-text-primary hover:border-text-muted',
        )}
        aria-label="Next month"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M5 2L10 7L5 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
};
