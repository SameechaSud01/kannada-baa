/**
 * Single source of truth for every icon in the app (Spec 03).
 *
 * Rules:
 *   1. ONE library — `@tabler/icons-react-native` outline weight (pinned in
 *      package.json).
 *   2. Never reach into the library directly from a component. Every icon comes
 *      from this map so swaps stay one-line.
 *   3. No hand-drawn inline SVGs for iconography. (Illustrations / brand marks
 *      are not icons and are out of scope.)
 *   4. No emoji glyphs in UI.
 *
 * Sizing (Spec 03 §sizing):
 *   - Tab bar: 19
 *   - Inline / list / chip: 16–21
 *   - Decorative max: 24
 *   - Never below 11
 *
 * Colour: inherit from parent per Spec 02 — primary for actions, tertiary for
 * muted, onPrimary on primary fills.
 */
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowsLeftRight,
  IconBell,
  IconBolt,
  IconBook2,
  IconCar,
  IconCheck,
  IconChevronRight,
  IconCircleCheck,
  IconCircleX,
  IconFlame,
  IconHeadphones,
  IconHelpCircle,
  IconClock,
  IconHome,
  IconInfoCircle,
  IconLock,
  IconMessage2,
  IconMessages,
  IconMicrophone,
  IconMoodHappy,
  IconMoodNeutral,
  IconMoodSad,
  IconPhoto,
  IconPlayerPlayFilled,
  IconSparkles,
  IconStack2,
  IconTargetArrow,
  IconUrgent,
  IconUser,
  IconVolume,
  IconX,
} from '@tabler/icons-react-native';

export const Icons = {
  // Tab bar
  tabHome: IconHome,
  tabLearn: IconBook2,
  tabPractice: IconTargetArrow, // changed from microphone (user-confirmed, Spec 03)
  tabProfile: IconUser,

  // Global / shared
  streak: IconFlame,
  audio: IconVolume,
  forward: IconChevronRight,
  back: IconArrowLeft,
  lessonDone: IconCircleCheck,
  locked: IconLock,
  emergency: IconUrgent,
  phrasePool: IconStack2,

  // Practice games
  gameQuickQuiz: IconBolt,
  gameImageMatch: IconPhoto,
  gameDictation: IconHeadphones,
  gameConversations: IconMessages,
  gameOpposites: IconArrowsLeftRight,

  // Emergency guide groups
  emAuto: IconCar,
  emHelp: IconAlertTriangle,
  emBasic: IconMessage2,

  // Settings rows
  setReminders: IconBell,
  setAudio: IconVolume,
  setHelp: IconHelpCircle,

  // Onboarding
  info: IconInfoCircle,
  clock: IconClock,

  // Lesson runner — drill / output / intake (replaces former emoji glyphs)
  correct: IconCircleCheck,
  wrong: IconCircleX,
  close: IconX,
  mic: IconMicrophone,
  ratingEasy: IconMoodHappy,
  ratingOk: IconMoodNeutral,
  ratingHard: IconMoodSad,

  // Modal system (Spec MODALS)
  x: IconX,
  play: IconPlayerPlayFilled,
  bell: IconBell,
  check: IconCheck,
  headphones: IconHeadphones,
  sparkle: IconSparkles,
  flame: IconFlame,
  lock: IconLock,
} as const;

export type IconName = keyof typeof Icons;
