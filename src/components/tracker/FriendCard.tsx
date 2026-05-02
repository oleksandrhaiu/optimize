import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ScorePill } from './ScorePill';
import { Sparkline } from './Sparkline';
import { formatLastSeen } from '@/hooks/usePresence';
import type { FriendWithData } from '@/types';
import { todayStr, clx } from '@/lib/utils';

interface FriendCardProps {
  friend: FriendWithData;
  isOnline?: boolean;
  lastSeen?: Date;         // in-session leave time
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend,
  isOnline = false,
  lastSeen,
}) => {
  const { profile, habits, logs, todayScore, weekScores } = friend;
  const today = todayStr();
  const avgWeek = weekScores.length > 0
    ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length)
    : 0;

  const presenceLabel = isOnline
    ? '● online now'
    : formatLastSeen(lastSeen, profile.last_seen_at);

  const presenceColor = isOnline ? 'text-accent-green' : 'text-text-subtle';

  return (
    <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3 min-w-[200px] max-w-[240px] flex-shrink-0 shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-shrink-0">
          <Avatar username={profile.username} color={profile.avatar_color} size="md" />
          <span className={clx(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card transition-colors duration-300',
            isOnline ? 'bg-accent-green' : 'bg-text-subtle/40',
          )} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading font-semibold text-text-primary text-sm truncate">
            @{profile.username}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <ScorePill score={todayScore} />
          </div>
        </div>
      </div>

      {/* Presence status */}
      <p className={clx('text-[10px] font-medium -mt-1', presenceColor)}>
        {presenceLabel}
      </p>

      {/* Sparkline */}
      <div className="flex items-center gap-3 bg-bg rounded-xl p-2">
        <Sparkline values={weekScores} width={90} height={28} />
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-text-muted">7 days</p>
          <p className="font-mono-nums text-sm font-medium text-text-primary">{avgWeek}%</p>
        </div>
      </div>

      {/* Today's habits */}
      <div className="space-y-1.5 border-t border-border/50 pt-2.5">
        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider mb-2">Today</p>
        {habits.length === 0 ? (
          <p className="text-xs text-text-muted italic">No habits set</p>
        ) : (
          habits.slice(0, 6).map(habit => {
            const log = logs.find(l => l.habit_id === habit.id && l.date === today);
            let done = false;
            if (log) {
              done = habit.type === 'checkbox' ? log.value === 'true' : parseFloat(log.value) > 0;
            }
            return (
              <div key={habit.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-text-muted truncate flex items-center gap-1.5 min-w-0">
                  {habit.icon && <span className="leading-normal flex-shrink-0">{habit.icon}</span>}
                  <span className="truncate">{habit.name}</span>
                </span>
                <span className={clx(
                  'flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center',
                  done ? 'bg-accent-green/15' : 'bg-border/50',
                )}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    {done ? (
                      <path d="M1.5 4L3 5.5L6.5 2" stroke="#00C896" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M2 2L6 6M6 2L2 6" stroke="#5A5F75" strokeWidth="1.2" strokeLinecap="round" />
                    )}
                  </svg>
                </span>
              </div>
            );
          })
        )}
        {habits.length > 6 && (
          <p className="text-xs text-text-subtle">+{habits.length - 6} more</p>
        )}
      </div>
    </div>
  );
};
