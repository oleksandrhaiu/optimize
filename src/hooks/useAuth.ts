import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { session, profile, loading, initialized, setSession, setLoading, fetchProfile } =
    useAuthStore();

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).finally(() => {
          if (mounted) {
            setLoading(false);
            useAuthStore.setState({ initialized: true });
          }
        });
      } else {
        setLoading(false);
        useAuthStore.setState({ initialized: true });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        useAuthStore.setState({ profile: null });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, profile, loading, initialized };
}
