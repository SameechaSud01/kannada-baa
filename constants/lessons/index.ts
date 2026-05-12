export interface WordItem {
  id: string;
  kannadaScript: string;
  transliteration: string;
  meaning: string;
  audioUrl: string;
  exampleSentence?: {
    kannadaScript: string;
    transliteration: string;
    meaning: string;
  };
}

export interface QuizQuestion {
  id: string;
  type: 'mcq' | 'audio_match' | 'translate';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  level: 1 | 2 | 3 | 4 | 5;
  estimatedMinutes: number;
  type: 'lesson' | 'activity' | 'trivia';
  words: WordItem[];
  quiz: QuizQuestion[];
  culturalNote?: string;
}

import { lesson01Greetings } from './lesson-01-greetings';
import { lesson02Numbers } from './lesson-02-numbers';
import { lesson03Food } from './lesson-03-food';
import { lesson04Directions } from './lesson-04-directions';
import { lesson05Shopping } from './lesson-05-shopping';

export const ALL_LESSONS: Lesson[] = [
  lesson01Greetings,
  lesson02Numbers,
  lesson03Food,
  lesson04Directions,
  lesson05Shopping,
];
