export type QuestionType = 'word-to-picture' | 'picture-to-word';

export type GamePhase = 'playing' | 'result';

export type OptionState = 'default' | 'correct' | 'wrong' | 'reveal' | 'disabled';

export type VocabItem = {
  id:    string;
  kn:    string;
  ph:    string;
  en:    string;
  emoji: string;
};

export type Question = {
  type:    QuestionType;
  target:  VocabItem;
  options: VocabItem[];
};
