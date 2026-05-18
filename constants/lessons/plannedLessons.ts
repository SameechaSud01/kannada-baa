/**
 * 8 lesson slots for the Learn-screen layout (Spec 01 §2).
 *
 * Content for slots beyond what `LESSON_ORDER` provides is content-blocked on
 * Spec 04. Until Spec 04 lands, slots without a real lesson render as
 * placeholders that cannot be opened.
 *
 * All Kannada glyphs and titles below are [Unverified] — placeholders intended
 * to be overwritten by Spec 04 content.
 */
export type PlannedLessonSlot = {
  slot: number;
  title: string;
  subtitle: string;
  charPlaceholder: string;
};

export const PLANNED_LESSON_SLOTS: PlannedLessonSlot[] = [
  { slot: 1, title: 'Meeting someone new', subtitle: 'First introductions', charPlaceholder: 'ನ' },
  { slot: 2, title: 'Numbers & money', subtitle: 'Count and pay', charPlaceholder: 'ಒ' },
  { slot: 3, title: 'Food & ordering', subtitle: 'Eat without pointing', charPlaceholder: 'ಊ' },
  { slot: 4, title: 'Directions', subtitle: 'Left, right, here, there', charPlaceholder: 'ಎ' },
  { slot: 5, title: 'Shopping', subtitle: 'Ask, haggle, decline', charPlaceholder: 'ಬ' },
  { slot: 6, title: 'Small talk', subtitle: 'Weather, family, work', charPlaceholder: 'ಮ' },
  { slot: 7, title: 'Travel & transit', subtitle: 'Buses, autos, trains', charPlaceholder: 'ರ' },
  { slot: 8, title: 'Everyday courtesies', subtitle: 'Thank you, sorry, please', charPlaceholder: 'ಸ' },
];

export const TOTAL_LESSON_SLOTS = PLANNED_LESSON_SLOTS.length;
