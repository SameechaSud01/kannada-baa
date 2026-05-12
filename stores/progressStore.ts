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
  setHydrated: (hydrated: boolean) => void;
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
          // Streak and lastActiveDate are intentionally not updated here.
          // Call updateStreak() separately at the call site — keeping
          // streak logic in one place under one rule.
          const completed = state.completedLessons.includes(lessonId)
            ? state.completedLessons
            : [...state.completedLessons, lessonId];
          const xpAward = score >= 80 ? 20 : 10;
          return {
            completedLessons: completed,
            xp: state.xp + xpAward,
            totalPhrasesLearned: state.totalPhrasesLearned + phrasesLearned,
            totalMinutesPracticed: state.totalMinutesPracticed + minutesPracticed,
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

      setHydrated: (isHydrated) => set({ isHydrated }),
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
