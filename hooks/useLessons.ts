import { PLANNED_LESSON_SLOTS } from '../constants/lessons/plannedLessons';
import { LESSON_ORDER } from '../constants/lessons';
import { useProgressStore } from '../stores/progressStore';

export type Lesson = {
  n: number;
  glyph: string;
  theme: string;
  unlocked: boolean;
};

/**
 * Lesson list for the game lesson-selector.
 *
 * Unlock rule: Lesson N is unlocked iff Lesson (N-1) is in completedLessons.
 * Lesson 1 is always unlocked. Slots beyond LESSON_ORDER (content not yet
 * authored — see docs/foundation/CONTENT.md) stay locked forever, by design.
 */
export function useLessons(): Lesson[] {
  const completed = useProgressStore((s) => s.completedLessons);
  return PLANNED_LESSON_SLOTS.map((slot, idx) => {
    if (idx === 0) {
      return { n: slot.slot, glyph: slot.charPlaceholder, theme: slot.title, unlocked: true };
    }
    const prevLessonId = LESSON_ORDER[idx - 1];
    const unlocked = prevLessonId !== undefined && completed.includes(prevLessonId);
    return { n: slot.slot, glyph: slot.charPlaceholder, theme: slot.title, unlocked };
  });
}
