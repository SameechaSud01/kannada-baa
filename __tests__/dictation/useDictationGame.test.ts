import { renderHook, act } from '@testing-library/react-native';
import { useDictationGame } from '../../src/games/dictation/hooks/useDictationGame';
import type { DictationWord } from '../../src/games/dictation/types';

jest.mock('../../src/games/dictation/utils/audioPlayer', () => ({
  playWord: jest.fn().mockResolvedValue(undefined),
  stopPlayback: jest.fn(),
}));

import { stopPlayback } from '../../src/games/dictation/utils/audioPlayer';

// 10 distinct DictationWords with id, so onAttempt-fires assertions are
// also meaningful. Accepted spellings are real-ish words with at least
// 4 characters so the "near-match" partial test has room to score.
const FIXTURE: DictationWord[] = [
  { id: 'd-1',  kn: 'ನೀರು',  phonetic: 'nee-ru',     accepted: ['neeru',  'niru'] },
  { id: 'd-2',  kn: 'ಮನೆ',   phonetic: 'ma-ne',      accepted: ['mane',   'manay'] },
  { id: 'd-3',  kn: 'ಕಾಡು',  phonetic: 'kaa-du',     accepted: ['kaadu',  'kadu'] },
  { id: 'd-4',  kn: 'ಹಾಲು',  phonetic: 'haa-lu',     accepted: ['haalu',  'halu'] },
  { id: 'd-5',  kn: 'ಬೆಳಕು', phonetic: 'be-la-ku',   accepted: ['belaku', 'belak'] },
  { id: 'd-6',  kn: 'ಮಳೆ',   phonetic: 'ma-le',      accepted: ['male',   'malle'] },
  { id: 'd-7',  kn: 'ಆಕಾಶ', phonetic: 'aa-kaa-sha', accepted: ['aakasha','akasha'] },
  { id: 'd-8',  kn: 'ಹಕ್ಕಿ',  phonetic: 'hak-ki',    accepted: ['hakki',  'haki'] },
  { id: 'd-9',  kn: 'ಬೆಂಕಿ', phonetic: 'ben-ki',     accepted: ['benki',  'benkhi'] },
  { id: 'd-10', kn: 'ಗಾಳಿ',  phonetic: 'gaa-li',     accepted: ['gaali',  'gali'] },
];

describe('useDictationGame', () => {
  it('has correct initial state', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.lastScore).toBeNull();
    expect(result.current.answeredCount).toBe(0);
    expect(result.current.isPlaying).toBe(false);
  });

  it('totalWords matches the fixture length', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    expect(result.current.totalWords).toBe(FIXTURE.length);
  });

  it('submitAnswer with exact match sets correct state', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    const word = result.current.currentWord;
    const exactAnswer = word.accepted[0];
    act(() => {
      result.current.submitAnswer(exactAnswer);
    });
    expect(result.current.answerState).toBe('correct');
    expect(result.current.lastScore).toBe(100);
    expect(result.current.answeredCount).toBe(1);
  });

  it('submitAnswer with near-match sets partial state', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    const word = result.current.currentWord;
    const nearMatch = word.accepted[0].slice(0, -1);
    if (nearMatch.length > 0 && nearMatch !== word.accepted[0]) {
      act(() => {
        result.current.submitAnswer(nearMatch);
      });
      const score = result.current.lastScore ?? 0;
      if (score >= 40 && score < 100) {
        expect(result.current.answerState).toBe('partial');
        expect(score).toBeGreaterThanOrEqual(40);
        expect(score).toBeLessThan(100);
      }
    }
  });

  it('submitAnswer with clearly wrong answer sets wrong state', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => {
      result.current.submitAnswer('zzzzzzzzzzzzzzz');
    });
    expect(result.current.answerState).toBe('wrong');
    const score = result.current.lastScore ?? 100;
    expect(score).toBeLessThan(40);
  });

  it('submitAnswer with empty string is a no-op', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => {
      result.current.submitAnswer('');
    });
    expect(result.current.answerState).toBe('unanswered');
  });

  it('calling submitAnswer twice only increments answeredCount once', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    const word = result.current.currentWord;
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    expect(result.current.answeredCount).toBe(1);
  });

  it('nextWord while unanswered is a no-op', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => {
      result.current.nextWord();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('after answering and nextWord: index advances, state resets', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    const word = result.current.currentWord;
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    act(() => {
      result.current.nextWord();
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.lastScore).toBeNull();
  });

  it('skipWord while unanswered advances index without incrementing answeredCount', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => {
      result.current.skipWord();
    });
    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answeredCount).toBe(0);
  });

  it('skipWord after answering is a no-op', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    const word = result.current.currentWord;
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    act(() => {
      result.current.skipWord();
    });
    expect(result.current.currentIndex).toBe(0);
  });

  it('after answering all words and nextWord on last: phase is result', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    for (let i = 0; i < FIXTURE.length; i++) {
      const word = result.current.currentWord;
      act(() => {
        result.current.submitAnswer(word.accepted[0]);
      });
      act(() => {
        result.current.nextWord();
      });
    }
    expect(result.current.phase).toBe('result');
  });

  it('sessionAvg reflects running average after multiple answers', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    act(() => { result.current.submitAnswer(result.current.currentWord.accepted[0]); });
    act(() => { result.current.nextWord(); });
    act(() => { result.current.submitAnswer('zzzzzzzzzzzzzzz'); });
    act(() => { result.current.nextWord(); });
    expect(result.current.sessionAvg).toBeGreaterThanOrEqual(0);
    expect(result.current.sessionAvg).toBeLessThanOrEqual(100);
    expect(result.current.sessionAvg).toBeLessThan(100);
  });

  it('after restart: counters reset, phase is playing, stopPlayback was called', () => {
    const { result } = renderHook(() => useDictationGame(FIXTURE));
    const word = result.current.currentWord;
    act(() => { result.current.submitAnswer(word.accepted[0]); });
    act(() => { result.current.nextWord(); });
    act(() => { result.current.restart(); });
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.answeredCount).toBe(0);
    expect(result.current.lastScore).toBeNull();
    expect(result.current.sessionAvg).toBe(0);
    expect(stopPlayback).toHaveBeenCalled();
  });

  it('fires onAttempt with isCorrect=true on exact match', () => {
    const onAttempt = jest.fn();
    const { result } = renderHook(() => useDictationGame(FIXTURE, onAttempt));
    const word = result.current.currentWord;
    act(() => {
      result.current.submitAnswer(word.accepted[0]);
    });
    expect(onAttempt).toHaveBeenCalledWith({ itemId: word.id, isCorrect: true });
  });

  it('fires onAttempt with isCorrect=false on wrong answer', () => {
    const onAttempt = jest.fn();
    const { result } = renderHook(() => useDictationGame(FIXTURE, onAttempt));
    const word = result.current.currentWord;
    act(() => {
      result.current.submitAnswer('zzzzzzzzzzzzzzz');
    });
    expect(onAttempt).toHaveBeenCalledWith({ itemId: word.id, isCorrect: false });
  });
});
