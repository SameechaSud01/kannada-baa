import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { UserRow } from '../services/api/users';

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
  /** 'HH:MM' 24h, mirrors public.users.daily_reminder_time. */
  dailyReminderTime: string | null;
  /** TTS playback rate (0.50–1.50), mirrors public.users.tts_rate. */
  ttsRate: number;
  /** Auto-speak lesson cards on mount, mirrors public.users.auto_replay. */
  autoReplay: boolean;
  /**
   * Snapshot of onboarding answers whose server sync failed. Cleared when a
   * subsequent boot retry succeeds (spec_security_hardening.md §6).
   */
  pendingOnboardingSync: OnboardingData | null;
  isHydrated: boolean;

  setOnboarding: (data: OnboardingData) => void;
  setDisplayName: (name: string) => void;
  setLearningMode: (mode: 'spoken' | 'written' | 'both') => void;
  setMotivations: (motivations: string[]) => void;
  setMode: (mode: 'rowdy' | 'classic') => void;
  setHasSeenTtsWarning: (seen: boolean) => void;
  recordPermissionDenial: (kind: 'notifications' | 'mic') => void;
  setDailyReminderTime: (time: string | null) => void;
  setTtsRate: (rate: number) => void;
  setAutoReplay: (value: boolean) => void;
  setPendingOnboardingSync: (data: OnboardingData | null) => void;
  setHydrated: (hydrated: boolean) => void;
  /** Bind the persisted data to a Supabase user id. */
  bindUser: (userId: string) => void;
  /** Wipe all per-user state and bind to a fresh user id. Called on user switch. */
  resetForUser: (userId: string) => void;
  hydrateFromUserRow: (row: UserRow) => void;
  /** Reset user-scoped state on signOut. Preserves device-scoped prefs. */
  reset: () => void;
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
      dailyReminderTime: null,
      ttsRate: 1.0,
      autoReplay: true,
      pendingOnboardingSync: null,
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

      setDailyReminderTime: (dailyReminderTime) => set({ dailyReminderTime }),

      setTtsRate: (ttsRate) => set({ ttsRate }),

      setAutoReplay: (autoReplay) => set({ autoReplay }),

      setPendingOnboardingSync: (pendingOnboardingSync) => set({ pendingOnboardingSync }),

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
          dailyReminderTime: null,
          ttsRate: 1.0,
          autoReplay: true,
          pendingOnboardingSync: null,
          // mode + permissionDenials + hasSeenTtsWarning are install-scoped, not user-scoped — keep them.
        }),

      hydrateFromUserRow: (row) =>
        set({
          displayName: row.name,
          learningMode: row.learning_mode,
          motivations: row.motivations ?? [],
          dailyGoalMinutes: row.daily_goal_minutes,
          hasCompletedOnboarding: !!row.onboarding_completed_at,
          dailyReminderTime: row.daily_reminder_time ?? null,
          ttsRate: row.tts_rate ?? 1.0,
          autoReplay: row.auto_replay ?? true,
        }),

      reset: () =>
        set({
          userId: null,
          hasCompletedOnboarding: false,
          displayName: null,
          learningMode: null,
          motivations: [],
          dailyGoalMinutes: null,
          dailyReminderTime: null,
          ttsRate: 1.0,
          autoReplay: true,
          pendingOnboardingSync: null,
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
