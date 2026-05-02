import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface PresenceResult {
  onlineIds: Set<string>;
  lastSeen: Map<string, Date>; // userId → last time they were online
}

/**
 * Tracks online presence and last-seen times via Supabase Realtime Presence.
 */
export function usePresence(myUserId: string | undefined, _friendIds: string[]): PresenceResult {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const lastSeenRef = useRef<Map<string, Date>>(new Map());
  const [, forceUpdate] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!myUserId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel('online-presence', {
      config: { presence: { key: myUserId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ userId: string }>();
        const currentIds = new Set(
          Object.values(state)
            .flat()
            .map((p: any) => p.userId as string)
            .filter(Boolean),
        );

        // Record last seen for users who just went offline
        onlineIds.forEach(id => {
          if (!currentIds.has(id)) {
            lastSeenRef.current.set(id, new Date());
          }
        });

        setOnlineIds(currentIds);
        forceUpdate(n => n + 1);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        leftPresences.forEach((p: any) => {
          if (p.userId) {
            lastSeenRef.current.set(p.userId as string, new Date());
          }
        });
        forceUpdate(n => n + 1);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ userId: myUserId });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [myUserId]);

  return { onlineIds, lastSeen: lastSeenRef.current };
}

/** Format "last seen X ago" like Telegram */
export function formatLastSeen(date: Date | undefined): string {
  if (!date) return 'last seen a while ago';
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1)  return 'last seen just now';
  if (diffMin < 60) return `last seen ${diffMin}m ago`;
  if (diffHr  < 24) return `last seen ${diffHr}h ago`;
  if (diffDay === 1) return 'last seen yesterday';
  return `last seen ${diffDay} days ago`;
}
