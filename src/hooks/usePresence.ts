import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Tracks online presence for a set of user IDs via Supabase Realtime Presence.
 * Returns a Set of user IDs that are currently online.
 */
export function usePresence(myUserId: string | undefined, friendIds: string[]) {
  const [onlineIds, setOnlineIds] = useState<Set<string>>(new Set());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!myUserId) return;

    // Remove previous channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase.channel('online-presence', {
      config: { presence: { key: myUserId } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<{ userId: string }>();
        const ids = new Set(
          Object.values(state)
            .flat()
            .map((p: any) => p.userId as string)
            .filter(Boolean),
        );
        setOnlineIds(ids);
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

  return onlineIds;
}
