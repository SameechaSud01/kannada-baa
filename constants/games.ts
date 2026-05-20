export type GameKey =
  | 'quiz'
  | 'image-match'
  | 'dictation'
  | 'conversations'
  | 'opposites';

export type Game = {
  key: GameKey;
  title: string;
  tagline: string;
};

export const GAMES = {
  quiz: {
    key: 'quiz',
    title: 'Quick quiz',
    tagline: 'Test your speed and accuracy.',
  },
  'image-match': {
    key: 'image-match',
    title: 'Image match',
    tagline: 'Connect words to their visuals.',
  },
  dictation: {
    key: 'dictation',
    title: 'Dictation',
    tagline: 'Listen and write what you hear.',
  },
  conversations: {
    key: 'conversations',
    title: 'Conversations',
    tagline: 'Roleplay real-world scenarios.',
  },
  opposites: {
    key: 'opposites',
    title: 'Opposites',
    tagline: 'Pick the opposite of each word.',
  },
} as const satisfies Record<GameKey, Game>;

export function isGameKey(value: string): value is GameKey {
  return Object.prototype.hasOwnProperty.call(GAMES, value);
}
