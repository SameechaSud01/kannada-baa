import { useState, useCallback, useRef, useMemo } from 'react';
import type { QuestionPair, Option, AnswerState, GamePhase } from '../types';

/**
 * Per-item attempt callback. Fired once per option tap (correct or wrong).
 * The OppositeGame component owns the actual recording side-effect; this
 * hook stays pure for testability.
 */
type AttemptCallback = (args: { itemId: string; isCorrect: boolean }) => void;

type Session = {
  questions: QuestionPair[];
  shuffledOptsPerQ: Option[][];
};

type UseGameStateReturn = {
  currentQuestion: QuestionPair;
  shuffledOpts: Option[];
  currentIndex: number;
  totalQuestions: number;
  score: number;
  streak: number;
  phase: GamePhase;
  answerState: AnswerState;
  selectedOpt: string | null;
  hintUsed: boolean;
  handleOptionTap: (kn: string) => void;
  handleNext: () => void;
  useHint: () => void;
  restart: () => void;
};

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildSession(items: QuestionPair[]): Session {
  const questions = fisherYates([...items]);
  const shuffledOptsPerQ = questions.map((q) => fisherYates([...q.opts]));
  return { questions, shuffledOptsPerQ };
}

export function useGameState(
  items: QuestionPair[],
  onAttempt?: AttemptCallback,
): UseGameStateReturn {
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const onAttemptRef = useRef(onAttempt);
  onAttemptRef.current = onAttempt;

  const [session, setSession] = useState<Session>(() => buildSession(items));
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [hintUsed, setHintUsed] = useState(false);

  const useHint = useCallback(() => {
    if (answerState !== 'unanswered') return;
    setHintUsed(true);
  }, [answerState]);

  const handleOptionTap = useCallback(
    (kn: string) => {
      if (answerState !== 'unanswered') return;
      const { questions } = sessionRef.current;
      const current = questions[currentIndex];
      const isCorrect = kn === current.answer;

      setSelectedOpt(kn);
      if (isCorrect) {
        setAnswerState('correct');
        setScore((s) => s + (hintUsed ? 0.5 : 1));
        setStreak((s) => s + 1);
      } else {
        setAnswerState('wrong');
        setStreak(0);
      }

      if (current.id) {
        onAttemptRef.current?.({ itemId: current.id, isCorrect });
      }
    },
    [answerState, currentIndex, hintUsed],
  );

  const handleNext = useCallback(() => {
    if (answerState === 'unanswered') return;
    const { questions } = sessionRef.current;
    if (currentIndex + 1 >= questions.length) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswerState('unanswered');
      setSelectedOpt(null);
      setHintUsed(false);
    }
  }, [answerState, currentIndex]);

  const restart = useCallback(() => {
    setSession(buildSession(itemsRef.current));
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setPhase('playing');
    setAnswerState('unanswered');
    setSelectedOpt(null);
    setHintUsed(false);
  }, []);

  return useMemo(
    () => ({
      currentQuestion: session.questions[currentIndex],
      shuffledOpts: session.shuffledOptsPerQ[currentIndex],
      currentIndex,
      totalQuestions: session.questions.length,
      score,
      streak,
      phase,
      answerState,
      selectedOpt,
      hintUsed,
      handleOptionTap,
      handleNext,
      useHint,
      restart,
    }),
    [
      session,
      currentIndex,
      score,
      streak,
      phase,
      answerState,
      selectedOpt,
      hintUsed,
      handleOptionTap,
      handleNext,
      useHint,
      restart,
    ],
  );
}
