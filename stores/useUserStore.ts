import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserRow } from '../services/api/users';

interface UserState {
  hasCompletedOnboarding: boolean;
  learningMode: 'spoken' | 'written' | 'both' | null;
  motivations: string[];
  dailyGoalMinutes: 5 | 10 | 20 | null;
  mode: 'rowdy' | 'classic';
  /** TTS missing-voice warning shown at boot (MODALS §6.9). One-time per install. */
  hasSeenTtsWarning: boolean;
  /** ISO timestamp of last denial, scoped per kind. We re-ask at most once per week. */
  permissionDenials: Partial<Record<'notifications' | 'mic', string>>;
  isHydrated: boolean;

  setLearningMode: (mode: 'spoken' | 'written' | 'both') => void;
  setMotivations: (motivations: string[]) => void;
  setMode: (mode: 'rowdy' | 'classic') => void;
  setHasSeenTtsWarning: (seen: boolean) => void;
  recordPermissionDenial: (kind: 'notifications' | 'mic') => void;
  setHydrated: (hydrated: boolean) => void;
  hydrateFromUserRow: (row: UserRow) => void;
  /** Reset user-scoped state on signOut. Preserves device-scoped prefs. */
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      learningMode: null,
      motivations: [],
      dailyGoalMinutes: null,
      mode: 'classic',
      hasSeenTtsWarning: false,
      permissionDenials: {},
      isHydrated: false,

      setLearningMode: (learningMode) => set({ learningMode }),

      setMotivations: (motivations) => set({ motivations }),

      setMode: (mode) => set({ mode }),

      setHasSeenTtsWarning: (hasSeenTtsWarning) => set({ hasSeenTtsWarning }),

      recordPermissionDenial: (kind) =>
        set((s) => ({
          permissionDenials: {
            ...s.permissionDenials,
            [kind]: new Date().toISOString(),
          },
        })),

      setHydrated: (isHydrated) => set({ isHydrated }),

      hydrateFromUserRow: (row) =>
        set({
          learningMode: row.learning_mode,
          motivations: row.motivations ?? [],
          dailyGoalMinutes: row.daily_goal_minutes,
          hasCompletedOnboarding: !!row.onboarding_completed_at,
        }),

      reset: () =>
        set({
          hasCompletedOnboarding: false,
          learningMode: null,
          motivations: [],
          dailyGoalMinutes: null,
          // Preserved: mode, hasSeenTtsWarning, permissionDenials, isHydrated —
          // device-scoped state survives account switches.
        }),
    }),
    {
      name: 'user_prefs',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
