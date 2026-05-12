import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types';
import type { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  loadingProfile: boolean;
  initialized: boolean;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  profile: null,
  loading: true,
  loadingProfile: false,
  initialized: false,

  setSession: (session) => set({ session }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  fetchProfile: async (userId: string) => {
    set({ loadingProfile: true });
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      if (data) set({ profile: data as UserProfile });
      else set({ profile: null });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ profile: null });
    } finally {
      set({ loadingProfile: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, profile: null, loadingProfile: false });
  },
}));
