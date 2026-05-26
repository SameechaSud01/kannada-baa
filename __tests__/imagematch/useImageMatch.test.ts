import { renderHook, act } from '@testing-library/react-native';
import { useImageMatch, deriveOptionState } from '../../src/games/imagematch/hooks/useImageMatch';

describe('useImageMatch', () => {
  it('initial state is correct', () => {
    const { result } = renderHook(() => useImageMatch());
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answered).toBe(false);
    expect(result.current.selectedId).toBeNull();
    expect(result.current.score).toBe(0);
    expect(result.current.hintVisible).toBe(false);
  });

  it('totalQuestions is 10', () => {
    const { result } = renderHook(() => useImageMatch());
    expect(result.current.totalQuestions).toBe(10);
  });

  it('correct tap sets answered=true, selectedId=targetId, score=1', () => {
    const { result } = renderHook(() => useImageMatch());
    const targetId = result.current.currentQuestion.target.id;

    act(() => {
      result.current.handleOptionTap(targetId);
    });

    expect(result.current.answered).toBe(true);
    expect(result.current.selectedId).toBe(targetId);
    expect(result.current.score).toBe(1);
  });

  it('wrong tap sets answered=true, selectedId=wrongId, score=0', () => {
    const { result } = renderHook(() => useImageMatch());
    const wrongId = result.current.currentQuestion.options.find(
      (o) => o.id !== result.current.currentQuestion.target.id,
    )!.id;

    act(() => {
      result.current.handleOptionTap(wrongId);
    });

    expect(result.current.answered).toBe(true);
    expect(result.current.selectedId).toBe(wrongId);
    expect(result.current.score).toBe(0);
  });

  it('calling handleOptionTap twice is a no-op on second call', () => {
    const { result } = renderHook(() => useImageMatch());
    const targetId = result.current.currentQuestion.target.id;

    act(() => { result.current.handleOptionTap(targetId); });
    act(() => { result.current.handleOptionTap(targetId); });

    expect(result.current.score).toBe(1);
  });

  it('handleNext while answered=false is a no-op', () => {
    const { result } = renderHook(() => useImageMatch());

    act(() => { result.current.handleNext(); });

    expect(result.current.currentIndex).toBe(0);
  });

  it('after correct tap and handleNext, currentIndex=1, answered=false, selectedId=null, hintVisible=false', () => {
    const { result } = renderHook(() => useImageMatch());

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.target.id);
    });
    act(() => {
      result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.answered).toBe(false);
    expect(result.current.selectedId).toBeNull();
    expect(result.current.hintVisible).toBe(false);
  });

  it('toggleHint flips hintVisible false → true → false', () => {
    const { result } = renderHook(() => useImageMatch());

    act(() => { result.current.toggleHint(); });
    expect(result.current.hintVisible).toBe(true);

    act(() => { result.current.toggleHint(); });
    expect(result.current.hintVisible).toBe(false);
  });

  it('after answering all 10 questions and last handleNext, phase=result', () => {
    const { result } = renderHook(() => useImageMatch());

    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.handleOptionTap(result.current.currentQuestion.target.id);
      });
      act(() => {
        result.current.handleNext();
      });
    }

    expect(result.current.phase).toBe('result');
  });

  it('restart resets all state to initial values and phase=playing', () => {
    const { result } = renderHook(() => useImageMatch());

    act(() => {
      result.current.handleOptionTap(result.current.currentQuestion.target.id);
    });
    act(() => { result.current.handleNext(); });
    act(() => { result.current.restart(); });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.phase).toBe('playing');
    expect(result.current.answered).toBe(false);
    expect(result.current.selectedId).toBeNull();
    expect(result.current.hintVisible).toBe(false);
  });
});

describe('deriveOptionState', () => {
  it('returns default when not answered', () => {
    expect(deriveOptionState('a', null, 'a', false)).toBe('default');
    expect(deriveOptionState('a', 'a', 'a', false)).toBe('default');
  });

  it('returns correct when optionId === selectedId === targetId', () => {
    expect(deriveOptionState('a', 'a', 'a', true)).toBe('correct');
  });

  it('returns wrong when optionId === selectedId !== targetId', () => {
    expect(deriveOptionState('b', 'b', 'a', true)).toBe('wrong');
  });

  it('returns reveal when optionId === targetId, optionId !== selectedId, and answered', () => {
    expect(deriveOptionState('a', 'b', 'a', true)).toBe('reveal');
  });

  it('returns disabled for all other answered options', () => {
    expect(deriveOptionState('c', 'b', 'a', true)).toBe('disabled');
  });
});
