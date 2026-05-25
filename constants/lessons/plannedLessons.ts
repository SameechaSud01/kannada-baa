/**
 * 8 lesson slots for the Learn-screen layout (Spec 01 §2).
 *
 * Slot metadata (glyph, subtitle) is the static fallback when a matching DB
 * lesson row is not yet authored. Lesson content itself comes from
 * `public.lessons` ordered by `lesson_no`.
 *
 * Kannada glyphs and titles below are placeholders shown for locked / not-yet-
 * authored slots.
 */
export type PlannedLessonSlot = {
  slot: number;
  title: string;
  subtitle: string;
  charPlaceholder: string;
};

export const PLANNED_LESSON_SLOTS: PlannedLessonSlot[] = [
  { slot: 1, title: 'Greetings', subtitle: 'Hello and how are you', charPlaceholder: 'ನ' },
  { slot: 2, title: 'Names', subtitle: 'I, you, my name is', charPlaceholder: 'ಹ' },
  { slot: 3, title: 'Wanting', subtitle: "I want, I don't want", charPlaceholder: 'ಬೇ' },
  { slot: 4, title: 'Pointing', subtitle: 'This, that, here, there', charPlaceholder: 'ಇ' },
  { slot: 5, title: 'Easy verbs', subtitle: 'Come, eat, laugh', charPlaceholder: 'ಬ' },
  { slot: 6, title: 'Questions', subtitle: 'Who, what, where', charPlaceholder: 'ಯಾ' },
  { slot: 7, title: 'Hard verbs', subtitle: 'See, do, play', charPlaceholder: 'ನೋ' },
  { slot: 8, title: 'Putting it together', subtitle: "Combining what you've learned", charPlaceholder: 'ಸ' },
];

export const TOTAL_LESSON_SLOTS = PLANNED_LESSON_SLOTS.length;
