export type DictationWord = {
  /** dictation_items.id when DB-sourced. Drives per-item attempt recording. */
  id?: string;
  kn: string;
  audioFile?: number;
  accepted: string[];
  phonetic: string;
};

export type AnswerState = 'unanswered' | 'correct' | 'partial' | 'wrong';

export type GamePhase = 'playing' | 'result';
