export type Game = {
  key: string;
  title: string;
  tagline: string;
};

export const GAMES = {
  opposites: {
    key: 'opposites',
    title: 'Opposites',
    tagline: 'Pick the opposite of each word.',
  },
} as const satisfies Record<string, Game>;

export type GameKey = keyof typeof GAMES;
