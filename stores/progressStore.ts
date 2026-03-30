import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'kannada-baa' });

const mmkvStorage = {
  getItem: (name: string): string | null => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string): void => {
    storage.set(name, value);
  },
  removeItem: (name: string): void => {
    storage.remove(name);
  },
};

type ScriptMode = 'script' | 'roman';

interface ProgressState {
  streak: number;
  lastActiveDate: string;
  completedLessons: string[];
  lessonProgress: Record<string, number>;
  totalPhrasesLearned: number;
  totalMinutesPracticed: number;
  weeklyActivity: Record<string, boolean>;
  scriptModeDefault: ScriptMode;

  // Actions
  setScriptMode: (mode: ScriptMode) => void;
  updateLessonProgress: (lessonId: string, phraseIndex: number) => void;
  completeLesson: (lessonId: string, phrasesLearned: number, minutesPracticed: number) => void;
  updateStreak: () => void;
  recordActivity: () => void;
}

const getTodayISO = () => new Date().toISOString().split('T')[0];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      streak: 0,
      lastActiveDate: '',
      completedLessons: [],
      lessonProgress: {},
      totalPhrasesLearned: 0,
      totalMinutesPracticed: 0,
      weeklyActivity: {},
      scriptModeDefault: 'script',

      setScriptMode: (mode) => set({ scriptModeDefault: mode }),

      updateLessonProgress: (lessonId, phraseIndex) =>
        set((state) => ({
          lessonProgress: {
            ...state.lessonProgress,
            [lessonId]: phraseIndex,
          },
        })),

      completeLesson: (lessonId, phrasesLearned, minutesPracticed) =>
        set((state) => {
          const completed = state.completedLessons.includes(lessonId)
            ? state.completedLessons
            : [...state.completedLessons, lessonId];
          return {
            completedLessons: completed,
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
    }),
    {
      name: 'kannada-baa-progress',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
