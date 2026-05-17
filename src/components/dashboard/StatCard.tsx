import React from 'react';
import { clx } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  color?: 'green' | 'blue' | 'amber' | 'red';
  subtitle?: string;
  streakHighlight?: boolean; // show premium badge for streaks >= 3
}

const colorConfig = {
  green: {
    bg:     'rgba(16,185,129,0.06)',
    border: 'rgba(16,185,129,0.15)',
    badge:  'rgba(16,185,129,0.12)',
    icon:   '#10B981',
    text:   '#34D399',
    glow:   'rgba(16,185,129,0.2)',
  },
  blue: {
    bg:     'rgba(99,102,241,0.06)',
    border: 'rgba(99,102,241,0.15)',
    badge:  'rgba(99,102,241,0.12)',
    icon:   '#6366F1',
    text:   '#818CF8',
    glow:   'rgba(99,102,241,0.2)',
  },
  amber: {
    bg:     'rgba(245,158,11,0.06)',
    border: 'rgba(245,158,11,0.15)',
    badge:  'rgba(245,158,11,0.12)',
    icon:   '#F59E0B',
    text:   '#FCD34D',
    glow:   'rgba(245,158,11,0.2)',
  },
  red: {
    bg:     'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.15)',
    badge:  'rgba(239,68,68,0.12)',
    icon:   '#EF4444',
    text:   '#F87171',
    glow:   'rgba(239,68,68,0.2)',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label, value, unit, icon, color = 'green', subtitle, streakHighlight,
}) => {
  const c = colorConfig[color];
  const showFire = streakHighlight && typeof value === 'number' && value >= 3;

  return (
    <div
      className="rounded-2xl p-5 flex items-start gap-4 transition-all duration-300"
      style={{
        background: `linear-gradient(145deg, ${c.bg}, rgba(12,13,22,0.6))`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03)`,
      }}
    >
      {/* Icon badge */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{
          background: c.badge,
          boxShadow: `0 0 16px ${c.glow}`,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-text-muted text-xs font-medium mb-1.5">{label}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <p
            className="font-mono-nums text-2xl font-bold animate-count-up"
            style={{ color: c.text }}
          >
            {value}
          </p>
          {unit && (
            <span className="text-sm font-normal text-text-muted mt-0.5">{unit}</span>
          )}
          {/* Premium Professional Streak Indicator */}
          {showFire && (
            <div className="ml-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber/10 via-amber/20 to-orange-500/10 border border-amber/30 shadow-[0_0_15px_rgba(245,158,11,0.15)] backdrop-blur-md animate-pulse">
              <span className="text-xs filter drop-shadow-[0_0_8px_rgba(245,158,11,0.9)]">
                {label === 'Best Streak' ? '👑' : '🔥'}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-amber via-yellow-200 to-amber bg-clip-text text-transparent font-heading">
                {label === 'Best Streak' ? 'All-Time Best' : 'On Fire'}
              </span>
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-text-subtle text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
