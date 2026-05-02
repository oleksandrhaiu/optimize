import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { ScorePill } from './ScorePill';
import { Sparkline } from './Sparkline';
import { Card } from '@/components/ui/Card';
import type { FriendWithData } from '@/types';
import { todayStr } from '@/lib/utils';

interface FriendCardProps {
  friend: FriendWithData;
}

export const FriendCard: React.FC<FriendCardProps> = ({ friend }) => {
  const { profile, habits, logs, todayScore, weekScores } = friend;
  const today = todayStr();

  return (
    <Card className="flex flex-col gap-3 min-w-[180px] max-w-[220px] flex-shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Avatar username={profile.username} color={profile.avatar_color} size="md" />
        <div className="min-w-0">
          <p className="font-heading font-semibold text-text-primary text-sm truncate">
            @{profile.username}
          </p>
          <ScorePill score={todayScore} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex items-center gap-2">
        <Sparkline values={weekScores} width={80} height={28} />
        <div className="text-right">
          <p className="text-xs text-text-muted">7 days</p>
          <p className="font-mono text-xs text-text-primary">
            {Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length)}%
          </p>
        </div>
      </div>

      {/* Today's habit checkmarks */}
      <div className="space-y-1.5 border-t border-border pt-2">
        <p className="text-xs text-text-muted mb-1">Today's habits</p>
        {habits.length === 0 ? (
          <p className="text-xs text-text-muted italic">No habits</p>
        ) : (
          habits.slice(0, 6).map(habit => {
            const log = logs.find(l => l.habit_id === habit.id && l.date === today);
            let done = false;
            if (log) {
              done = habit.type === 'checkbox' ? log.value === 'true' : parseFloat(log.value) > 0;
            }

            return (
              <div key={habit.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-text-muted truncate flex items-center gap-1">
                  {habit.icon && <span className="leading-normal">{habit.icon}</span>}
                  {habit.name}
                </span>
                <span className={`text-sm flex-shrink-0 ${done ? 'text-accent-green' : 'text-text-muted opacity-40'}`}>
                  {done ? '✓' : '✗'}
                </span>
              </div>
            );
          })
        )}
        {habits.length > 6 && (
          <p className="text-xs text-text-muted">+{habits.length - 6} more</p>
        )}
      </div>
    </Card>
  );
};
