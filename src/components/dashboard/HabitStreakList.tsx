import React from 'react';

interface HabitStreak {
  habitId: string;
  habitName: string;
  habitIcon: string | null;
  streak: number;
}

interface HabitStreakListProps {
  streaks: HabitStreak[];
}

const FireIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <defs>
      <linearGradient id="hsl-fire" x1="0%" y1="100%" x2="0%" y2="0%">
        <stop offset="0%" stopColor="#EA580C" />
        <stop offset="60%" stopColor="#F97316" />
        <stop offset="100%" stopColor="#FBBF24" />
      </linearGradient>
    </defs>
    <path
      d="M12 2C12 2 7 7 7 12C7 15.31 9.69 18 13 18C16.31 18 19 15.31 19 12C19 8.5 15.5 5.5 12 2Z"
      fill="url(#hsl-fire)"
    />
    <path
      d="M13 8C13 8 10.5 11 10.5 13.5C10.5 14.88 11.62 16 13 16C14.38 16 15.5 14.88 15.5 13.5C15.5 11.5 14 9.5 13 8Z"
      fill="#FDE047"
      opacity="0.9"
    />
  </svg>
);

// Mini 7-day sparkline dots
const StreakDots: React.FC<{ streak: number }> = ({ streak }) => {
  const DOTS = 7;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: DOTS }).map((_, i) => {
        const filled = i >= DOTS - streak && streak > 0;
        return (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: 5,
              height: 5,
              background: filled
                ? streak >= 7
                  ? 'linear-gradient(135deg, #F97316, #FBBF24)'
                  : streak >= 3
                  ? '#10B981'
                  : '#8B5CF6'
                : 'rgba(28,30,52,0.8)',
            }}
          />
        );
      })}
    </div>
  );
};

const streakColor = (streak: number): string => {
  if (streak >= 7) return '#F97316';
  if (streak >= 3) return '#10B981';
  if (streak >= 1) return '#8B5CF6';
  return 'rgb(62,66,104)';
};

export const HabitStreakList: React.FC<HabitStreakListProps> = ({ streaks }) => {
  if (streaks.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Habit Streaks
        </p>
        <p className="text-[10px] text-text-subtle">last 7 days</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {streaks.map(({ habitId, habitName, habitIcon, streak }) => {
          const color = streakColor(streak);
          const isHot = streak >= 3;

          return (
            <div
              key={habitId}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200"
              style={{
                background: streak > 0
                  ? `linear-gradient(135deg, ${color}08, rgba(12,13,22,0.6))`
                  : 'rgba(12,13,22,0.4)',
                border: `1px solid ${streak > 0 ? `${color}20` : 'rgba(28,30,52,0.5)'}`,
              }}
            >
              {/* Icon */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                style={{
                  background: streak > 0 ? `${color}15` : 'rgba(28,30,52,0.6)',
                }}
              >
                {habitIcon ?? (
                  <span style={{ color: streak > 0 ? color : 'rgb(62,66,104)', fontSize: 13, fontWeight: 600 }}>
                    {habitName.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name + dots */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{habitName}</p>
                <div className="mt-1.5">
                  <StreakDots streak={Math.min(streak, 7)} />
                </div>
              </div>

              {/* Streak count */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <span
                  className="font-mono text-lg font-bold leading-none"
                  style={{ color }}
                >
                  {streak}
                </span>
                {isHot && <FireIcon size={13} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
