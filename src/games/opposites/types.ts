export type Option = {
  kn: string;
  tr: string;
  en: string;
};

export type QuestionPair = {
  /** opposites_items.id when DB-sourced. Drives per-item attempt recording. */
  id?: string;
  word: string;
  tr: string;
  meaning: string;
  answer: string;
  opts: Option[];
};

export type AnswerState = 'unanswered' | 'correct' | 'wrong';

export type GamePhase = 'playing' | 'result';
