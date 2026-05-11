import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface PresenceResult {
  onlineIds: Set<string>;
  lastSeen: Map<string, Date>; // userId → last time they were detected online
}

/** How long without any activity before we consider the user "away" (ms) */
const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

/** Activity events that prove the user is really at the screen */
const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  'mousemove',
  'mousedown',
  'click',
  'keydown',
  'scroll',
  'touchstart',
  'pointermove',
];

/**
 * Tracks online presence via Supabase Realtime Presence.
 * A user is considered "online" only when they are actively interacting
 * with the page (mouse move, clicks, keyboard, scroll, touch) AND the
 * browser tab is visible. After IDLE_TIMEOUT_MS of no activity — or when
 * the tab is hidden — the user is untracked from the presence channel.
 */
export function usePresence(myUserId: string | undefined, _friendIds: string[]): PresenceResult {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const lastSeenRef = useRef<Map<string, Date>>(new Map());
  const [, forceUpdate] = useState(0);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const prevOnlineRef = useRef<Set<string>>(new Set());

  // Whether we are currently tracked in the presence channel
  const isTrackedRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Track / Untrack helpers ────────────────────────────────────────────────

  const trackOnline = useCallback(async () => {
    const ch = channelRef.current;
    if (!ch || !myUserId || isTrackedRef.current) return;
    isTrackedRef.current = true;
    await ch.track({ userId: myUserId });
  }, [myUserId]);

  const trackOffline = useCallback(async () => {
    const ch = channelRef.current;
    if (!ch || !isTrackedRef.current) return;
    isTrackedRef.current = false;
    await ch.untrack();
  }, []);

  // ─── Idle timer ──────────────────────────────────────────────────────────────

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      trackOffline();
    }, IDLE_TIMEOUT_MS);
  }, [trackOffline]);

  // ─── Activity handler ────────────────────────────────────────────────────────

  const handleActivity = useCallback(() => {
    // Only react if tab is visible
    if (document.visibilityState !== 'visible') return;
    trackOnline();
    resetIdleTimer();
  }, [trackOnline, resetIdleTimer]);

  // ─── Page Visibility handler ─────────────────────────────────────────────────

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'visible') {
      // Tab came back into focus — treat as activity
      handleActivity();
    } else {
      // Tab hidden — immediately go offline
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      trackOffline();
    }
  }, [handleActivity, trackOffline]);

  // ─── Heartbeat: keep last_seen_at fresh every 60s while active ───────────────

  useEffect(() => {
    if (!myUserId) return;
    const updateLastSeen = () => {
      supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', myUserId)
        .then(() => {});
    };
    updateLastSeen();
    const interval = setInterval(updateLastSeen, 60_000);
    return () => clearInterval(interval);
  }, [myUserId]);

  // ─── Presence channel setup ───────────────────────────────────────────────────

  useEffect(() => {
    if (!myUserId) return;

    if (channelRef.current) supabase.removeChannel(channelRef.current);
    isTrackedRef.current = false;

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
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          // Only track immediately if tab is visible
          if (document.visibilityState === 'visible') {
            await channel.track({ userId: myUserId });
            isTrackedRef.current = true;
            resetIdleTimer();
          }
        }
      });

    channelRef.current = channel;

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [myUserId, resetIdleTimer]);

  // ─── Attach activity & visibility listeners ───────────────────────────────────

  useEffect(() => {
    if (!myUserId) return;

    ACTIVITY_EVENTS.forEach(event =>
      window.addEventListener(event, handleActivity, { passive: true }),
    );
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      ACTIVITY_EVENTS.forEach(event =>
        window.removeEventListener(event, handleActivity),
      );
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [myUserId, handleActivity, handleVisibilityChange]);

  return { onlineIds, lastSeen: lastSeenRef.current };
}

/** Format "last seen X ago" like Telegram — uses DB timestamp if no in-session leave recorded */
export function formatLastSeen(
  sessionLastSeen: Date | undefined,
  dbLastSeen: string | null | undefined,
): string {
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
