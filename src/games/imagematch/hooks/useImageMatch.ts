import { useState, useCallback, useRef } from 'react';
import { buildRound } from '../utils/roundBuilder';
import type { Question, GamePhase, OptionState, VocabItem } from '../types';

type AttemptCallback = (args: { itemId: string; isCorrect: boolean }) => void;

type UseImageMatchReturn = {
  currentQuestion:  Question;
  currentIndex:     number;
  totalQuestions:   number;
  phase:            GamePhase;
  answered:         boolean;
  selectedId:       string | null;
  score:            number;
  hintVisible:      boolean;
  handleOptionTap:  (id: string) => void;
  handleNext:       () => void;
  toggleHint:       () => void;
  restart:          () => void;
};

export function deriveOptionState(
  optionId:  string,
  selectedId: string | null,
  targetId:  string,
  answered:  boolean,
): OptionState {
  if (!answered) return 'default';
  if (optionId === selectedId && optionId === targetId) return 'correct';
  if (optionId === selectedId && optionId !== targetId) return 'wrong';
  if (optionId !== selectedId && optionId === targetId && answered) return 'reveal';
  return 'disabled';
}

export function useImageMatch(
  targetBank: VocabItem[],
  distractorBank?: VocabItem[],
  onAttempt?: AttemptCallback,
): UseImageMatchReturn {
  const targetBankRef = useRef(targetBank);
  targetBankRef.current = targetBank;

  const distractorBankRef = useRef(distractorBank);
  distractorBankRef.current = distractorBank;

  const onAttemptRef = useRef(onAttempt);
  onAttemptRef.current = onAttempt;

  const [questions, setQuestions] = useState<Question[]>(() =>
    buildRound(targetBank, distractorBank),
  );
  const questionsRef = useRef(questions);
  questionsRef.current = questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [answered, setAnswered] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(false);

  const handleOptionTap = useCallback(
    (id: string) => {
      if (answered) return;
      const target = questionsRef.current[currentIndex].target;
      const isCorrect = id === target.id;

      setSelectedId(id);
      setAnswered(true);
      if (isCorrect) {
        setScore((s) => s + 1);
      }

      // Attempt is recorded against the target (the prompt), not the
      // tapped option — the prompt is what the user is being quizzed on.
      onAttemptRef.current?.({ itemId: target.id, isCorrect });
    },
    [answered, currentIndex],
  );

  const handleNext = useCallback(() => {
    if (!answered) return;
    setHintVisible(false);
    if (currentIndex + 1 >= questionsRef.current.length) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswered(false);
      setSelectedId(null);
    }
  }, [answered, currentIndex]);

  const toggleHint = useCallback(() => {
    setHintVisible((v) => !v);
  }, []);

  const restart = useCallback(() => {
    setQuestions(buildRound(targetBankRef.current, distractorBankRef.current));
    setCurrentIndex(0);
    setScore(0);
    setPhase('playing');
    setAnswered(false);
    setSelectedId(null);
    setHintVisible(false);
  }, []);

  return {
    currentQuestion: questions[currentIndex],
    currentIndex,
    totalQuestions: questions.length,
    phase,
    answered,
    selectedId,
    score,
    hintVisible,
    handleOptionTap,
    handleNext,
    toggleHint,
    restart,
  };
}
