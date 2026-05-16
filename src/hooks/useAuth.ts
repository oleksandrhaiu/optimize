import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { session, profile, loading, loadingProfile, initialized, setSession, setLoading, fetchProfile } =
    useAuthStore();

  useEffect(() => {
    let mounted = true;

    const minDelay = new Promise(resolve => setTimeout(resolve, 1500));

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);

      if (initialSession?.user) {
        Promise.all([
          fetchProfile(initialSession.user.id),
          minDelay,
        ]).finally(() => {
          if (mounted) {
            setLoading(false);
            useAuthStore.setState({ initialized: true });
          }
        });
      } else {
        minDelay.then(() => {
          if (mounted) {
            setLoading(false);
            useAuthStore.setState({ initialized: true });
          }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;

      const prevUserId = useAuthStore.getState().session?.user?.id;
      const newUserId = newSession?.user?.id;
      const currentProfile = useAuthStore.getState().profile;

      setSession(newSession);

      if (newUserId) {
        if (newUserId !== prevUserId || !currentProfile) {
          fetchProfile(newUserId);
        }
      } else {
        useAuthStore.setState({ profile: null, loadingProfile: false });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setSession, setLoading, fetchProfile]);

  return { session, profile, loading, loadingProfile, initialized };
}
