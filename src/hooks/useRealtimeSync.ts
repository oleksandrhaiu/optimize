import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { HabitLog } from '@/types';

interface Options {
  friendIds: string[];
  onLogChange: (friendId: string, log: HabitLog) => void;
}

/**
 * Subscribes to Supabase Realtime changes on habit_logs
 * for all provided friend IDs.
 */
export function useRealtimeSync({ friendIds, onLogChange }: Options) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const callbackRef = useRef(onLogChange);
  callbackRef.current = onLogChange;

  useEffect(() => {
    if (friendIds.length === 0) return;

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel('friend-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_logs',
          filter: `user_id=in.(${friendIds.join(',')})`,
        },
        (payload) => {
          const log = (payload.new ?? payload.old) as HabitLog;
          if (log?.user_id) {
            callbackRef.current(log.user_id, log);
          }
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [friendIds.join(',')]); // re-subscribe when friend list changes
}
