import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingData {
  learningMode: 'spoken' | 'written' | 'both';
  motivations: string[];
  dailyGoalMinutes: 5 | 10 | 20;
  displayName?: string;
}

interface UserState {
  /** Supabase user id this persisted data belongs to. `null` = pre-auth / not yet bound. */
  userId: string | null;
  hasCompletedOnboarding: boolean;
  displayName: string | null;
  learningMode: 'spoken' | 'written' | 'both' | null;
  motivations: string[];
  dailyGoalMinutes: 5 | 10 | 20 | null;
  mode: 'rowdy' | 'classic';
  /** TTS missing-voice warning shown at boot (MODALS §6.9). One-time per install. */
  hasSeenTtsWarning: boolean;
  /** ISO timestamp of last denial, scoped per kind. We re-ask at most once per week. */
  permissionDenials: Partial<Record<'notifications' | 'mic', string>>;
  isHydrated: boolean;

  setOnboarding: (data: OnboardingData) => void;
  setDisplayName: (name: string) => void;
  setLearningMode: (mode: 'spoken' | 'written' | 'both') => void;
  setMode: (mode: 'rowdy' | 'classic') => void;
  setHasSeenTtsWarning: (seen: boolean) => void;
  recordPermissionDenial: (kind: 'notifications' | 'mic') => void;
  setHydrated: (hydrated: boolean) => void;
  /** Bind the persisted data to a Supabase user id. */
  bindUser: (userId: string) => void;
  /** Wipe all per-user state and bind to a fresh user id. Called on user switch. */
  resetForUser: (userId: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      hasCompletedOnboarding: false,
      displayName: null,
      learningMode: null,
      motivations: [],
      dailyGoalMinutes: null,
      mode: 'classic',
      hasSeenTtsWarning: false,
      permissionDenials: {},
      isHydrated: false,

      setOnboarding: (data) =>
        set((s) => ({
          hasCompletedOnboarding: true,
          displayName: data.displayName?.trim() || s.displayName,
          learningMode: data.learningMode,
          motivations: data.motivations,
          dailyGoalMinutes: data.dailyGoalMinutes,
        })),

      setDisplayName: (name) => set({ displayName: name.trim() || null }),

      setLearningMode: (learningMode) => set({ learningMode }),

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

      bindUser: (userId) => set({ userId }),

      resetForUser: (userId) =>
        set({
          userId,
          hasCompletedOnboarding: false,
          displayName: null,
          learningMode: null,
          motivations: [],
          dailyGoalMinutes: null,
          // mode + permissionDenials + hasSeenTtsWarning are install-scoped, not user-scoped — keep them.
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
