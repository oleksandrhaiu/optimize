import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { clx } from '@/lib/utils';
import type { FriendWithData } from '@/types';

interface LeaderboardEntry {
  profile: FriendWithData['profile'];
  weekAvg: number;
  todayScore: number;
  isSelf?: boolean;
}

interface LeaderboardProps {
  self: { profile: { username: string; avatar_color: string }; weekAvg: number; todayScore: number } | null;
  friends: FriendWithData[];
}

function calcAvg(scores: number[]) {
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ self, friends }) => {
  const entries: LeaderboardEntry[] = [];

  if (self) {
    entries.push({ profile: self.profile as any, weekAvg: self.weekAvg, todayScore: self.todayScore, isSelf: true });
  }

  friends.forEach(f => {
    entries.push({
      profile: f.profile,
      weekAvg: calcAvg(f.weekScores),
      todayScore: f.todayScore,
    });
  });

  entries.sort((a, b) => b.weekAvg - a.weekAvg);

  const medals = ['🥇', '🥈', '🥉'];

  if (entries.length < 2) {
    return (
      <div className="text-center py-6 text-text-muted">
        <p className="text-2xl mb-1">🏆</p>
        <p className="text-xs">Add friends to see the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {entries.map((e, i) => {
        const isTop = i < 3;
        const barWidth = entries[0].weekAvg > 0 ? Math.round((e.weekAvg / entries[0].weekAvg) * 100) : 0;

        return (
          <div key={e.profile.username} className={clx(
            'flex items-center gap-3 px-3 py-2 rounded-xl transition-all',
            e.isSelf ? 'bg-accent-green/5 border border-accent-green/20' : 'hover:bg-white/[0.02]',
          )}>
            {/* Rank */}
            <span className="w-5 text-center text-sm flex-shrink-0">
              {isTop ? medals[i] : <span className="text-xs text-text-subtle font-mono">{i + 1}</span>}
            </span>

            {/* Avatar */}
            <Avatar username={e.profile.username} color={e.profile.avatar_color} size="sm" />

            {/* Name + bar */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={clx('text-xs font-medium truncate', e.isSelf ? 'text-accent-green' : 'text-text-primary')}>
                  {e.isSelf ? 'You' : `@${e.profile.username}`}
                </span>
                <span className="text-xs font-mono text-text-muted ml-2 flex-shrink-0">{e.weekAvg}%</span>
              </div>
              <div className="h-1 bg-border/30 rounded-full overflow-hidden">
                <div
                  className={clx('h-full rounded-full transition-all duration-700', e.isSelf ? 'bg-accent-green' : 'bg-text-subtle/40')}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
