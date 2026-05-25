import { useQuery } from '@tanstack/react-query';
import { fetchAllLessons, fetchLessonBySlug } from '../services/api/lessons';
import { PLANNED_LESSON_SLOTS } from '../constants/lessons/plannedLessons';
import { useProgressStore } from '../stores/progressStore';
import type { Lesson as DbLesson } from '../constants/lessons/types';

/** Lesson-selector view-model (game lesson picker). */
export type LessonSelectorItem = {
  n: number;
  glyph: string;
  theme: string;
  unlocked: boolean;
};

/**
 * Lesson list for game lesson-selector.
 *
 * Unlock rule: Lesson N is unlocked iff at least (N-1) lessons have been
 * completed. Lesson 1 is always unlocked. Driven off PLANNED_LESSON_SLOTS
 * and progress store — independent of DB lesson rows.
 */
export function useLessons(): LessonSelectorItem[] {
  const completed = useProgressStore((s) => s.completedLessons);
  return PLANNED_LESSON_SLOTS.map((slot, idx) => ({
    n: slot.slot,
    glyph: slot.charPlaceholder,
    theme: slot.title,
    unlocked: idx === 0 ? true : completed.length >= idx,
  }));
}

/** Fetch all DB lessons ordered by lesson_no. */
export function useDbLessons() {
  return useQuery<DbLesson[]>({
    queryKey: ['lessons'],
    queryFn: fetchAllLessons,
    staleTime: 5 * 60 * 1000,
  });
}

/** Fetch a single DB lesson by slug. */
export function useDbLesson(slug: string | undefined) {
  return useQuery<DbLesson | null>({
    queryKey: ['lesson', slug],
    queryFn: () => (slug ? fetchLessonBySlug(slug) : Promise.resolve(null)),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}
