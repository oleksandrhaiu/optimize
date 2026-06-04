import React from 'react';
import type { RecoveryInfo } from '@/lib/utils';

interface RecoveryBannerProps {
  info: RecoveryInfo;
}

const stepColors = [
  { active: '#F59E0B', done: '#10B981', ring: 'rgba(245,158,11,0.3)' },
  { active: '#F59E0B', done: '#10B981', ring: 'rgba(245,158,11,0.3)' },
  { active: '#10B981', done: '#10B981', ring: 'rgba(16,185,129,0.3)' },
];

export const RecoveryBanner: React.FC<RecoveryBannerProps> = ({ info }) => {
  const { gapDays, recoveryDays, recoveryTarget } = info;
  const pct = Math.round((recoveryDays / recoveryTarget) * 100);

  const greeting =
    recoveryDays === 1
      ? "First day back — let's go! 💪"
      : recoveryDays === 2
      ? "Day 2 — momentum building! 🔥"
      : "Almost there — one more! ⚡";

  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-4 mb-4 animate-fade-in"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(16,185,129,0.04) 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        boxShadow: '0 4px 24px rgba(245,158,11,0.06)',
      }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none"
        style={{ background: 'rgba(245,158,11,0.08)' }}
      />

      <div className="relative flex items-center justify-between gap-4">
        {/* Left: text */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-base leading-none">💪</span>
            <p className="text-sm font-semibold text-text-primary">
              Welcome back!
            </p>
          </div>
          <p className="text-xs text-text-muted">
            You were away {gapDays} {gapDays === 1 ? 'day' : 'days'}.{' '}
            <span style={{ color: '#F59E0B' }}>{greeting}</span>
          </p>

          {/* Progress bar */}
          <div
            className="mt-2.5 h-1 rounded-full overflow-hidden"
            style={{ background: 'rgba(28,30,52,0.8)', width: 160 }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 100
                  ? 'linear-gradient(90deg, #10B981, #34D399)'
                  : 'linear-gradient(90deg, #F59E0B, #FBBF24)',
              }}
            />
          </div>
        </div>

        {/* Right: step circles */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {Array.from({ length: recoveryTarget }).map((_, i) => {
            const isDone = i < recoveryDays;
            const isActive = i === recoveryDays;
            const c = stepColors[i] ?? stepColors[2];

            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                  style={{
                    background: isDone
                      ? `${c.done}20`
                      : isActive
                      ? `${c.active}15`
                      : 'rgba(28,30,52,0.6)',
                    border: isDone
                      ? `2px solid ${c.done}`
                      : isActive
                      ? `2px solid ${c.active}`
                      : '2px solid rgba(28,30,52,0.8)',
                    boxShadow: (isDone || isActive) ? `0 0 12px ${isDone ? c.done : c.active}30` : 'none',
                    color: isDone ? c.done : isActive ? c.active : 'rgb(62,66,104)',
                  }}
                >
                  {isDone ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : isActive ? (
                    <svg width="6" height="6" viewBox="0 0 6 6" fill="none">
                      <circle cx="3" cy="3" r="3" fill="currentColor" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className="text-[9px] font-medium"
                  style={{ color: isDone ? c.done : isActive ? c.active : 'rgb(62,66,104)' }}
                >
                  Day {i + 1}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
