import React from 'react';

/* ── Single dot spinner ────────────────────────────────────── */
export const LoadingSpinner: React.FC<{ size?: number; className?: string }> = ({
  size = 24,
  className = '',
}) => (
  <svg
    className={`animate-spin text-accent ${className}`}
    style={{ animationDuration: '0.75s' }}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      cx="12" cy="12" r="10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.15"
    />
    <path
      d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

/* ── Skeleton block ─────────────────────────────────────────── */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

/* ── Skeleton card for tracker ──────────────────────────────── */
export const TrackerSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 animate-fade-in">
    {/* Left: my habits skeleton */}
    <div className="flex flex-col gap-4">
      <div className="bg-card border border-border rounded-2xl p-3">
        <div className="flex gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-9 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 rounded-xl" />
          ))}
        </div>
      </div>
    </div>

    {/* Right: friends skeleton */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-10 rounded-full" />
      </div>
      <div className="flex gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl p-4 min-w-[180px] space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
              <div className="space-y-1.5 flex-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3 w-12 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-7 rounded-lg" />
            <div className="space-y-1.5 pt-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-3 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ── Skeleton for dashboard ─────────────────────────────────── */
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="w-6 h-6 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-12" />
        </div>
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

/* ── Friends list skeleton ───────────────────────────────────── */
export const FriendsSkeleton: React.FC = () => (
  <div className="flex gap-4 animate-fade-in">
    {Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-2xl p-4 min-w-[180px] space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-12 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-7 rounded-lg" />
        <div className="space-y-1.5 pt-1">
          {Array.from({ length: 4 }).map((_, j) => (
            <Skeleton key={j} className="h-3 rounded" />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/* ── Full page loader ────────────────────────────────────────── */
export const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      {/* Logo mark */}
      <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-1">
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
          <path d="M2 7L5.5 10.5L12 3" stroke="#00C896" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <LoadingSpinner size={28} />
      <p className="text-text-muted text-xs tracking-wide">Loading HabitSync…</p>
    </div>
  </div>
);
