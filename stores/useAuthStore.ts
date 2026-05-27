import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/api/supabase';
import { resetLessonsCache } from '../services/api/lessons';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set) => ({
  session: null,
  user: null,
  isLoading: true,

  setSession: (session) =>
    set({
      session,
      user: session?.user ?? null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  signOut: async () => {
    await supabase.auth.signOut();
    // Preserve persisted user + progress state across signOut. AppGate's bind
    // effect calls resetForUser() when a different user signs in next, which
    // covers the cross-account leak case. Wiping state here breaks same-user
    // re-login: the routing effect briefly sees hasCompletedOnboarding=false
    // and bounces the user through /onboarding/welcome before the DB sync
    // resolves.
    resetLessonsCache();
    set({ session: null, user: null });
  },
}));
