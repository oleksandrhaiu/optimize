import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/components/ui/Avatar';
import { Sparkline } from './Sparkline';
import { formatLastSeen } from '@/hooks/usePresence';
import type { FriendWithData } from '@/types';
import { todayStr, clx } from '@/lib/utils';

interface FriendCardProps {
  friend: FriendWithData;
  isOnline?: boolean;
  lastSeen?: Date;
}

export const FriendCard: React.FC<FriendCardProps> = ({
  friend, isOnline = false, lastSeen,
}) => {
  const navigate = useNavigate();
  const { profile, habits, logs, todayScore, weekScores } = friend;
  const today = todayStr();
  const avgWeek = weekScores.length > 0
    ? Math.round(weekScores.reduce((a, b) => a + b, 0) / weekScores.length) : 0;

  const presenceLabel = isOnline ? 'online' : formatLastSeen(lastSeen, profile.last_seen_at);
  const scoreColor = todayScore >= 80 ? '#10B981' : todayScore >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div
      onClick={() => navigate(`/u/${profile.username}`)}
      className="relative z-10 hover:z-20 flex flex-col gap-3 min-w-[210px] max-w-[240px] flex-shrink-0 cursor-pointer transition-all duration-300 group"
      style={{
        background: 'linear-gradient(145deg, rgba(17,19,32,0.9), rgba(12,13,22,0.95))',
        border: '1px solid rgba(28,30,52,0.8)',
        borderRadius: '20px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
        borderTopColor: 'rgba(255,255,255,0.04)',
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(-4px)';
        el.style.borderColor = 'rgba(139,92,246,0.3)';
        el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,246,0.15), 0 20px 48px rgba(139,92,246,0.08)';
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.transform = 'translateY(0)';
        el.style.borderColor = 'rgba(28,30,52,0.8)';
        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)';
      }}
    >
      {/* Header: avatar + name + score */}
      <div className="flex items-center gap-2.5">
        <Avatar
          username={profile.username}
          color={profile.avatar_color}
          size="md"
          online={isOnline}
        />
        <div className="min-w-0 flex-1">
          <p
            className="font-heading font-semibold text-sm truncate transition-colors duration-200"
            style={{ color: '#EDEEFC' }}
          >
            @{profile.username}
          </p>
          <p
            className="text-[10px] font-medium mt-0.5"
            style={{ color: isOnline ? '#34D399' : 'rgb(62,66,104)' }}
          >
            {presenceLabel}
          </p>
        </div>
        {/* Score badge */}
        {todayScore > 0 && (
          <div
            className="flex-shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold"
            style={{
              background: `${scoreColor}18`,
              color: scoreColor,
              border: `1px solid ${scoreColor}28`,
            }}
          >
            {todayScore}%
          </div>
        )}
      </div>

      {/* Sparkline + weekly avg */}
      <div
        className="flex items-center gap-3 rounded-xl p-2.5"
        style={{ background: 'rgba(7,8,15,0.6)', border: '1px solid rgba(28,30,52,0.5)' }}
      >
        <Sparkline values={weekScores} width={88} height={28} />
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-text-subtle">7 days</p>
          <p className="font-mono text-sm font-semibold text-text-primary">{avgWeek}%</p>
        </div>
      </div>

      {/* Today's habits */}
      <div className="space-y-1.5 border-t pt-2.5" style={{ borderColor: 'rgba(28,30,52,0.6)' }}>
        <p className="text-[10px] font-semibold text-text-subtle uppercase tracking-wider mb-2">Today</p>
        {habits.length === 0 ? (
          <p className="text-xs text-text-subtle italic">No habits set</p>
        ) : (
          habits.slice(0, 6).map(habit => {
            const log = logs.find(l => l.habit_id === habit.id && l.date === today);
            const done = log
              ? (habit.type === 'checkbox' ? log.value === 'true' : parseFloat(log.value) > 0)
              : false;
            return (
              <div key={habit.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-text-muted truncate flex items-center gap-1.5 min-w-0">
                  {habit.icon && <span className="leading-normal flex-shrink-0">{habit.icon}</span>}
                  <span className="truncate">{habit.name}</span>
                </span>
                <span
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    background: done ? 'rgba(16,185,129,0.15)' : 'rgba(28,30,52,0.8)',
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    {done ? (
                      <path d="M1.5 4L3 5.5L6.5 2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    ) : (
                      <path d="M2 2L6 6M6 2L2 6" stroke="rgb(62,66,104)" strokeWidth="1.2" strokeLinecap="round" />
                    )}
                  </svg>
                </span>
              </div>
            );
          })
        )}
        {habits.length > 6 && (
          <p className="text-xs" style={{ color: 'rgb(62,66,104)' }}>+{habits.length - 6} more</p>
        )}
      </div>
    </div>
  );
};
