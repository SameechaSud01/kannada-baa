import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface OnboardingData {
  learningMode: 'spoken' | 'written' | 'both';
  motivations: string[];
  dailyGoalMinutes: 5 | 10 | 20;
}

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

  setOnboarding: (data: OnboardingData) => void;
  setLearningMode: (mode: 'spoken' | 'written' | 'both') => void;
  setMode: (mode: 'rowdy' | 'classic') => void;
  setHasSeenTtsWarning: (seen: boolean) => void;
  recordPermissionDenial: (kind: 'notifications' | 'mic') => void;
  setHydrated: (hydrated: boolean) => void;
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

      setOnboarding: (data) =>
        set({
          hasCompletedOnboarding: true,
          learningMode: data.learningMode,
          motivations: data.motivations,
          dailyGoalMinutes: data.dailyGoalMinutes,
        }),

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
