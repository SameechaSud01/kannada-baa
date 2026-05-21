import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface ProgressState {
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  lessonProgress: Record<string, number>;
  xp: number;
  totalPhrasesLearned: number;
  // TODO: tracked via completeLesson but not yet surfaced in UI.
  totalMinutesPracticed: number;
  // TODO: tracked via recordActivity but not yet surfaced in UI.
  weeklyActivity: Record<string, boolean>;
  /** Minutes practiced today — keyed by ISO date so it resets at midnight (MODALS §6.7). */
  todayMinutes: number;
  todayMinutesDate: string;
  /** Most recent date GoalCompleteDialog fired, to prevent repeat shows (MODALS §6.7). */
  lastGoalCelebrationDate: string | null;
  isHydrated: boolean;

  updateLessonProgress: (lessonId: string, phraseIndex: number) => void;
  completeLesson: (
    lessonId: string,
    score: number,
    phrasesLearned: number,
    minutesPracticed: number
  ) => void;
  updateStreak: () => void;
  recordActivity: () => void;
  markGoalCelebrated: () => void;
  setHydrated: (hydrated: boolean) => void;
  /**
   * Merge server-fetched completion slugs into completedLessons as a
   * deduped union. Does not touch xp, streak, lessonProgress, or any
   * other field — completion-only by design (spec_progress_persistence).
   */
  hydrateFromServerCompletions: (slugs: string[]) => void;
  /**
   * Wipe all progress. Called on signOut and when the signed-in Supabase
   * user changes, so a different account doesn't inherit another user's progress.
   */
  reset: () => void;
}

const getTodayISO = () => new Date().toISOString().split('T')[0];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastActiveDate: '',
      completedLessons: [],
      lessonProgress: {},
      xp: 0,
      totalPhrasesLearned: 0,
      totalMinutesPracticed: 0,
      weeklyActivity: {},
      todayMinutes: 0,
      todayMinutesDate: '',
      lastGoalCelebrationDate: null,
      isHydrated: false,

      updateLessonProgress: (lessonId, phraseIndex) =>
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: phraseIndex,
          },
        })),

      completeLesson: (lessonId, score, phrasesLearned, minutesPracticed) =>
        set((state) => {
          // Idempotent: re-entering a completed lesson must not double-count.
          // Streak and lastActiveDate are intentionally not updated here —
          // call updateStreak() separately to keep streak logic in one place.
          if (state.completedLessons.includes(lessonId)) return state;
          const xpAward = score >= 80 ? 20 : 10;
          const today = getTodayISO();
          const carryToday = state.todayMinutesDate === today ? state.todayMinutes : 0;
          return {
            completedLessons: [...state.completedLessons, lessonId],
            xp: state.xp + xpAward,
            totalPhrasesLearned: state.totalPhrasesLearned + phrasesLearned,
            totalMinutesPracticed: state.totalMinutesPracticed + minutesPracticed,
            todayMinutes: carryToday + minutesPracticed,
            todayMinutesDate: today,
          };
        }),

      updateStreak: () => {
        const today = getTodayISO();
        const { lastActiveDate, streak } = get();

        if (lastActiveDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayISO = yesterday.toISOString().split('T')[0];

        const newStreak = lastActiveDate === yesterdayISO ? streak + 1 : 1;

        set({ streak: newStreak, lastActiveDate: today });
      },

      recordActivity: () => {
        const today = getTodayISO();
        set((state) => ({
          weeklyActivity: {
            ...state.weeklyActivity,
            [today]: true,
          },
        }));
      },

      markGoalCelebrated: () => set({ lastGoalCelebrationDate: getTodayISO() }),

      setHydrated: (isHydrated) => set({ isHydrated }),

      hydrateFromServerCompletions: (slugs) =>
        set((state) => {
          const merged = new Set(state.completedLessons);
          for (const slug of slugs) merged.add(slug);
          if (merged.size === state.completedLessons.length) return state;
          return { completedLessons: Array.from(merged) };
        }),

      reset: () =>
        set({
          streak: 0,
          lastActiveDate: '',
          completedLessons: [],
          lessonProgress: {},
          xp: 0,
          totalPhrasesLearned: 0,
          totalMinutesPracticed: 0,
          weeklyActivity: {},
          todayMinutes: 0,
          todayMinutesDate: '',
          lastGoalCelebrationDate: null,
        }),
    }),
    {
      name: 'kannada-baa-progress',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
