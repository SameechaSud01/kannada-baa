import { useState, useCallback, useRef } from 'react';
import { RAW_PAIRS } from '../data/wordPairs';
import type { QuestionPair, Option, AnswerState, GamePhase } from '../types';

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

function buildSession(): Session {
  const questions = fisherYates([...RAW_PAIRS]);
  const shuffledOptsPerQ = questions.map((q) => fisherYates([...q.opts]));
  return { questions, shuffledOptsPerQ };
}

export function useGameState(): UseGameStateReturn {
  // Session in state so restart() always triggers a re-render (even from initial state)
  const [session, setSession] = useState<Session>(buildSession);
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
      setSelectedOpt(kn);
      if (kn === questions[currentIndex].answer) {
        setAnswerState('correct');
        setScore((s) => s + (hintUsed ? 0.5 : 1));
        setStreak((s) => s + 1);
      } else {
        setAnswerState('wrong');
        setStreak(0);
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
    setSession(buildSession());
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setPhase('playing');
    setAnswerState('unanswered');
    setSelectedOpt(null);
    setHintUsed(false);
  }, []);

  return {
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
  };
}
