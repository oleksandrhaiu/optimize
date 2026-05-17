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

const PremiumFlame: React.FC = () => (
  <div className="relative w-8 h-8 flex items-center justify-center ml-1.5 flex-shrink-0">
    <style>{`
      @keyframes premiumFlicker {
        0% { transform: scaleY(1) skewX(0deg); }
        50% { transform: scaleY(1.08) skewX(-2deg); }
        100% { transform: scaleY(0.96) skewX(2deg); }
      }
      @keyframes premiumInner {
        0% { transform: scaleY(0.95) skewX(1deg); }
        50% { transform: scaleY(1.05) skewX(-1deg); }
        100% { transform: scaleY(1) skewX(0deg); }
      }
      .flame-outer { animation: premiumFlicker 1.8s ease-in-out infinite alternate; transform-origin: 50% 90%; }
      .flame-inner { animation: premiumInner 1.4s ease-in-out infinite alternate; transform-origin: 50% 90%; }
    `}</style>
    
    {/* Ambient Glow Behind Flame */}
    <div className="absolute inset-0 bg-gradient-to-t from-amber-500/40 to-orange-600/40 rounded-full filter blur-md animate-pulse" />
    
    <svg viewBox="0 0 24 24" className="w-full h-full relative z-10 overflow-visible">
      <defs>
        <linearGradient id="flameOuter" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" /> {/* Orange 600 */}
          <stop offset="50%" stopColor="#F97316" /> {/* Orange 500 */}
          <stop offset="100%" stopColor="#EF4444" /> {/* Red 500 */}
        </linearGradient>
        <linearGradient id="flameInner" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" /> {/* Amber 500 */}
          <stop offset="100%" stopColor="#FBBF24" /> {/* Amber 400 */}
        </linearGradient>
        <linearGradient id="flameCore" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#FDE047" /> {/* Yellow 300 */}
          <stop offset="100%" stopColor="#FEF08A" /> {/* Yellow 100 */}
        </linearGradient>
        <filter id="premiumGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Flame (Orange/Red base with smooth movement) */}
      <path
        d="M12 2C12 2 7 7 7 12C7 15.31 9.69 18 13 18C16.31 18 19 15.31 19 12C19 8.5 15.5 5.5 12 2Z"
        fill="url(#flameOuter)"
        filter="url(#premiumGlow)"
        className="flame-outer"
      />

      {/* Middle Flame (Amber/Gold body) */}
      <path
        d="M13 6C13 6 9.5 9.5 9.5 13C9.5 14.93 11.07 16.5 13 16.5C14.93 16.5 16.5 14.93 16.5 13C16.5 10.5 14.5 8 13 6Z"
        fill="url(#flameInner)"
        className="flame-inner"
      />

      {/* Inner Bright Core (Yellow/White hot center) */}
      <path
        d="M13 10C13 10 11 12 11 14C11 15.1 11.9 16 13 16C14.1 16 15 15.1 15 14C15 12.5 13.8 11.2 13 10Z"
        fill="url(#flameCore)"
        className="animate-pulse transform-origin-bottom"
      />
    </svg>
  </div>
);

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
          {/* Premium Professional Flame Animation */}
          {showFire && <PremiumFlame />}
        </div>
        {subtitle && (
          <p className="text-text-subtle text-xs mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
