import type { Lesson, LessonId } from './types';
import { greetings } from './greetings';
import { names } from './names';

export const LESSONS: Record<LessonId, Lesson> = {
  [greetings.id]: greetings,
  [names.id]: names,
};

export const LESSON_ORDER: LessonId[] = [
  greetings.id,
  names.id,
];
