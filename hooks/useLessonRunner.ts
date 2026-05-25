import { useState, useCallback } from 'react';
import type { Lesson, LessonPhase } from '../constants/lessons/types';

export type PracticeStep = 'listen' | 'say';

export interface LessonRunnerState {
  phase: LessonPhase;
  wordIndex: number;
  practiceWordIndex: number;
  practiceWordStep: PracticeStep;
  phraseIndex: number;
  practicePhrasesIndex: number;
  practicePhrasesStep: PracticeStep;
}

export interface LessonRunner extends LessonRunnerState {
  advance: () => void;
  reset: () => void;
}

const initialState = (hasLesson: boolean): LessonRunnerState => ({
  phase: hasLesson ? 'situation' : 'idle',
  wordIndex: 0,
  practiceWordIndex: 0,
  practiceWordStep: 'listen',
  phraseIndex: 0,
  practicePhrasesIndex: 0,
  practicePhrasesStep: 'listen',
});

export function useLessonRunner(lesson: Lesson | null): LessonRunner {
  const [state, setState] = useState<LessonRunnerState>(() => initialState(!!lesson));

  const advance = useCallback(() => {
    setState((s) => {
      if (!lesson) return s;
      const wordsLen = lesson.words.length;
      const phrasesLen = lesson.phrases.length;

      switch (s.phase) {
        case 'idle':
          return { ...s, phase: 'situation' };

        case 'situation':
          return { ...s, phase: 'teach_words', wordIndex: 0 };

        case 'teach_words':
          if (s.wordIndex < wordsLen - 1) {
            return { ...s, wordIndex: s.wordIndex + 1 };
          }
          return {
            ...s,
            phase: 'practice_words',
            practiceWordIndex: 0,
            practiceWordStep: 'listen',
          };

        case 'practice_words':
          if (s.practiceWordStep === 'listen') {
            return { ...s, practiceWordStep: 'say' };
          }
          // 'say' step → next word or move to teach_phrases
          if (s.practiceWordIndex < wordsLen - 1) {
            return {
              ...s,
              practiceWordIndex: s.practiceWordIndex + 1,
              practiceWordStep: 'listen',
            };
          }
          return { ...s, phase: 'teach_phrases', phraseIndex: 0 };

        case 'teach_phrases':
          if (s.phraseIndex < phrasesLen - 1) {
            return { ...s, phraseIndex: s.phraseIndex + 1 };
          }
          return {
            ...s,
            phase: 'practice_phrases',
            practicePhrasesIndex: 0,
            practicePhrasesStep: 'listen',
          };

        case 'practice_phrases':
          if (s.practicePhrasesStep === 'listen') {
            return { ...s, practicePhrasesStep: 'say' };
          }
          if (s.practicePhrasesIndex < phrasesLen - 1) {
            return {
              ...s,
              practicePhrasesIndex: s.practicePhrasesIndex + 1,
              practicePhrasesStep: 'listen',
            };
          }
          return { ...s, phase: 'summary' };

        case 'summary':
          return { ...s, phase: 'real_world' };

        case 'real_world':
          return { ...s, phase: 'done' };

        case 'done':
          return s;
      }
    });
  }, [lesson]);

  const reset = useCallback(() => {
    setState(initialState(!!lesson));
  }, [lesson]);

  return {
    ...state,
    advance,
    reset,
  };
}
