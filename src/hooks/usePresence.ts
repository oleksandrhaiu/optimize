import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export interface PresenceResult {
  onlineIds: Set<string>;
  lastSeen: Map<string, Date>; // userId → last time they were detected online
}

/**
 * Tracks online presence via Supabase Realtime Presence.
 * On leave events, updates last_seen_at in the users table.
 */
export function usePresence(myUserId: string | undefined, _friendIds: string[]): PresenceResult {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const lastSeenRef = useRef<Map<string, Date>>(new Map());
  const [, forceUpdate] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const prevOnlineRef = useRef<Set<string>>(new Set());

  // On mount: track our own last_seen_at heartbeat every 60s
  useEffect(() => {
    if (!myUserId) return;
    const updateLastSeen = () => {
      supabase.from('users').update({ last_seen_at: new Date().toISOString() }).eq('id', myUserId).then(() => {});
    };
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60_000);
    return () => clearInterval(interval);
  }, [myUserId]);

  useEffect(() => {
    if (!myUserId) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);

    const channel = supabase.channel('online-presence', {
      config: { presence: { key: myUserId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ userId: string }>();
        const currentIds = new Set(
          Object.values(state).flat().map((p: any) => p.userId as string).filter(Boolean),
        );

        // Record last seen for users who just went offline
        prevOnlineRef.current.forEach(id => {
          if (!currentIds.has(id)) {
            lastSeenRef.current.set(id, new Date());
          }
        });

        prevOnlineRef.current = currentIds;
        setOnlineIds(currentIds);
        forceUpdate(n => n + 1);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        leftPresences?.forEach((p: any) => {
          if (p.userId) lastSeenRef.current.set(p.userId as string, new Date());
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

/** Format "last seen X ago" like Telegram — uses DB timestamp if no in-session leave recorded */
export function formatLastSeen(sessionLastSeen: Date | undefined, dbLastSeen: string | null | undefined): string {
  const date = sessionLastSeen ?? (dbLastSeen ? new Date(dbLastSeen) : undefined);
  if (!date) return 'last seen a while ago';
  const diffMs  = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr  = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1)   return 'last seen just now';
  if (diffMin < 60)  return `last seen ${diffMin}m ago`;
  if (diffHr  < 24)  return `last seen ${diffHr}h ago`;
  if (diffDay === 1) return 'last seen yesterday';
  return `last seen ${diffDay} days ago`;
}
