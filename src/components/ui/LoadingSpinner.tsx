import React from 'react';

/* ── Single arc spinner ─────────────────────────────────────── */
export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({
  size = 24, className = '',
}) => (
  <svg
    className={`animate-spin ${className}`}
    style={{ animationDuration: '0.7s' }}
    width={size} height={size} viewBox="0 0 24 24" fill="none"
  >
    <circle cx="12" cy="12" r="10" stroke="rgba(139,92,246,0.15)" strokeWidth="2.5" />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round"
    />
  </svg>
);

/* ── Skeleton block ─────────────────────────────────────────── */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

/* ── Full page loader ────────────────────────────────────────── */
export const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-5">
      {/* Animated logo */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center animate-glow-pulse"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(124,58,237,0.08))',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 14 14" fill="none">
            <path d="M2 7L5.5 10.5L12 3" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Pulsing ring */}
        <div
          className="absolute inset-0 rounded-2xl animate-pulse-ring"
          style={{ background: 'transparent', border: '1px solid rgba(139,92,246,0.3)' }}
        />
      </div>
      <LoadingSpinner size={24} />
      <p className="text-text-subtle text-xs tracking-widest uppercase font-medium">
        HabitSync
      </p>
    </div>
  </div>
);

/* ── Tracker skeleton ───────────────────────────────────────── */
export const TrackerSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 animate-fade-in">
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl p-4 border border-border" style={{ background: 'rgb(12,13,22)' }}>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-lg" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-4 border border-border space-y-3" style={{ background: 'rgb(12,13,22)' }}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-1 w-full rounded-full" />
        <div className="space-y-2 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  </div>
);

/* ── Dashboard skeleton ──────────────────────────────────────── */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-2xl" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-64 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  </div>
);

/* ── Friends skeleton ────────────────────────────────────────── */
export const FriendsSkeleton: React.FC = () => (
  <div className="flex gap-3 animate-fade-in">
    {Array.from({ length: 3 }).map((_, i) => (
      <Skeleton key={i} className="h-52 rounded-2xl min-w-[200px]" />
    ))}
  </div>
);
