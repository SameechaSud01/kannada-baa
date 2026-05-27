import { renderHook, act } from '@testing-library/react-native';
import { useGameState } from '../../src/games/opposites/hooks/useGameState';
import type { QuestionPair } from '../../src/games/opposites/types';

// Fixture: 10 distinct opposite pairs with stable shape. Each pair has
// 4 opts (1 answer + 3 distractors) so OptionGrid render parity holds.
// Distinct .word values so the reshuffle-across-restarts assertion stays
// statistically meaningful.
const FIXTURE: QuestionPair[] = Array.from({ length: 10 }, (_, i) => ({
  id: `fixture-${i + 1}`,
  word: `W${i + 1}`,
  tr: `w${i + 1}`,
  meaning: `meaning ${i + 1}`,
  answer: `ANS${i + 1}`,
  opts: [
    { kn: `ANS${i + 1}`, tr: `ans${i + 1}`, en: `answer ${i + 1}` },
    { kn: `D1-${i + 1}`, tr: `d1-${i + 1}`, en: `d1 ${i + 1}` },
    { kn: `D2-${i + 1}`, tr: `d2-${i + 1}`, en: `d2 ${i + 1}` },
    { kn: `D3-${i + 1}`, tr: `d3-${i + 1}`, en: `d3 ${i + 1}` },
  ],
}));

describe('useGameState', () => {
  it('initial state is correct', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answerState).toBe('unanswered');
    expect(result.current.selectedOpt).toBeNull();
  });

  it('totalQuestions matches the fixture length', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));
    expect(result.current.totalQuestions).toBe(FIXTURE.length);
  });

  it('correct answer sets answerState correct, increments score and streak', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));
    const answer = result.current.currentQuestion.answer;

    act(() => {
      result.current.handleOptionTap(answer);
    });

    expect(result.current.answerState).toBe('correct');
    expect(result.current.score).toBe(1);
    expect(result.current.streak).toBe(1);
  });

  it('wrong answer sets answerState wrong, keeps score unchanged, resets streak', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));
    const wrongOpt = result.current.currentQuestion.opts.find(
      (o) => o.kn !== result.current.currentQuestion.answer,
    )!;

    act(() => {
      result.current.handleOptionTap(wrongOpt.kn);
    });

    expect(result.current.answerState).toBe('wrong');
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
  });

  it('calling handleOptionTap twice is a no-op on second call', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));
    const answer = result.current.currentQuestion.answer;

    act(() => {
      result.current.handleOptionTap(answer);
    });
    act(() => {
      result.current.handleOptionTap(answer);
    });

    expect(result.current.score).toBe(1);
  });

  it('handleNext while answerState is unanswered is a no-op', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));

    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('after correct tap and handleNext, currentIndex is 1', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);
  });

  it('after all questions answered and last handleNext, phase is result', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));

    for (let i = 0; i < FIXTURE.length; i++) {
      act(() => {
        result.current.handleOptionTap(result.current.currentQuestion.answer);
      });
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.phase).toBe('result');
  });

  it('streak resets to 0 on wrong answer even after previous streak > 1', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });
    act(() => {
      result.current.handleNext();
    });
    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });
    act(() => {
      result.current.handleNext();
    });

    const wrongOpt = result.current.currentQuestion.opts.find(
      (o) => o.kn !== result.current.currentQuestion.answer,
    )!;
    act(() => {
      result.current.handleOptionTap(wrongOpt.kn);
    });

    expect(result.current.streak).toBe(0);
  });

  it('restart resets to initial state', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });
    act(() => {
      result.current.handleNext();
    });
    act(() => {
      result.current.restart();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.streak).toBe(0);
    expect(result.current.phase).toBe('playing');
  });

  it('restart reshuffles question order across sessions', () => {
    const { result } = renderHook(() => useGameState(FIXTURE));
    const firstWords: string[] = [result.current.currentQuestion.word];

    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.restart();
      });
      firstWords.push(result.current.currentQuestion.word);
    }

    // With 10 items, all 6 values being identical has P < 0.001%
    const unique = new Set(firstWords);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('fires onAttempt callback with the item id and correctness', () => {
    const onAttempt = jest.fn();
    const { result } = renderHook(() => useGameState(FIXTURE, onAttempt));

    const answer = result.current.currentQuestion.answer;
    const itemId = result.current.currentQuestion.id;

    act(() => {
      result.current.handleOptionTap(answer);
    });

    expect(onAttempt).toHaveBeenCalledTimes(1);
    expect(onAttempt).toHaveBeenCalledWith({ itemId, isCorrect: true });
  });

  it('does not fire onAttempt when current question has no id', () => {
    const onAttempt = jest.fn();
    const pairsNoId: QuestionPair[] = FIXTURE.map(({ id: _id, ...rest }) => rest);
    const { result } = renderHook(() => useGameState(pairsNoId, onAttempt));

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.answer);
    });

    expect(onAttempt).not.toHaveBeenCalled();
  });
});
