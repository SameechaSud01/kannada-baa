/**
 * Canonical Beginners' Guide content.
 * Source of truth for the rendered /onboarding/basics and /guide screens.
 * See spec_docs/Sameecha/spec_beginners_guide.md.
 *
 * The public.lessons row at slug='basics' carries a parallel snapshot in
 * content_json.reference.sections. The two are deliberately not synced — the
 * TS file is what gets rendered; the DB row is the raw reference material.
 */

export type GlyphItem = {
  kind: 'glyph';
  kannada: string;
  transliteration: string;
  example: string;
};

export type RuleItem = {
  kind: 'rule';
  ruleKind: 'retroflex' | 'dental' | 'geminated';
  title: string;
  description: string;
  examples: Array<{ transliteration: string; english: string }>;
};

export type KeyItem = {
  kind: 'key';
  symbol: string;
  example: string;
};

export type GuideItem = GlyphItem | RuleItem | KeyItem;

export type GuideSection = {
  slug: 'vowels' | 'consonant-rules' | 'consonants' | 'pronunciation-key';
  title: string;
  subtitle: string;
  order: number;
  items: GuideItem[];
};

export const GUIDE_SECTIONS: GuideSection[] = [
  {
    slug: 'vowels',
    order: 1,
    title: 'Vowels (ಸ್ವರಗಳು)',
    subtitle: 'Kannada has 13 vowels. Long vowels use a macron — ā, ē, ī, ō, ū.',
    items: [
      { kind: 'glyph', kannada: 'ಅ', transliteration: 'a', example: 'as in America' },
      { kind: 'glyph', kannada: 'ಆ', transliteration: 'ā', example: 'as in art' },
      { kind: 'glyph', kannada: 'ಇ', transliteration: 'i', example: 'as in igloo' },
      { kind: 'glyph', kannada: 'ಈ', transliteration: 'ī', example: 'as in seed' },
      { kind: 'glyph', kannada: 'ಉ', transliteration: 'u', example: 'as in push' },
      { kind: 'glyph', kannada: 'ಊ', transliteration: 'ū', example: 'as in moon' },
      { kind: 'glyph', kannada: 'ಋ', transliteration: 'ṛ', example: 'as in rupees' },
      { kind: 'glyph', kannada: 'ಎ', transliteration: 'e', example: 'as in cake' },
      { kind: 'glyph', kannada: 'ಏ', transliteration: 'ē', example: 'as in crane' },
      { kind: 'glyph', kannada: 'ಐ', transliteration: 'ai', example: 'as in ice' },
      { kind: 'glyph', kannada: 'ಒ', transliteration: 'o', example: 'as in opener' },
      { kind: 'glyph', kannada: 'ಓ', transliteration: 'ō', example: 'as in go' },
      { kind: 'glyph', kannada: 'ಔ', transliteration: 'au', example: 'as in owl' },
    ],
  },
  {
    slug: 'consonant-rules',
    order: 2,
    title: 'Sounding consonants',
    subtitle: 'Three patterns to watch for: retroflex, dental, and doubled letters.',
    items: [
      {
        kind: 'rule',
        ruleKind: 'retroflex',
        title: 'Retroflex (capital letters)',
        description:
          'Tongue curls up and back, touching the ridge behind the teeth. Hollow, fuller sound.',
        examples: [
          { transliteration: 'Ta', english: 'as in Top' },
          { transliteration: 'Da', english: 'as in Dark' },
          { transliteration: 'Na', english: 'as in Pranam' },
          { transliteration: 'La', english: 'as in haLLi' },
        ],
      },
      {
        kind: 'rule',
        ruleKind: 'dental',
        title: 'Dental (lowercase letters)',
        description:
          'Tongue tip touches the back of the upper front teeth. Flat, soft, far forward.',
        examples: [
          { transliteration: 'ta', english: 'as in Bharath' },
          { transliteration: 'da', english: 'as in the' },
          { transliteration: 'na', english: 'as in narrator' },
          { transliteration: 'la', english: 'as in large' },
        ],
      },
      {
        kind: 'rule',
        ruleKind: 'geminated',
        title: 'Doubled letters',
        description: 'The consonant is held slightly longer than a single one.',
        examples: [
          { transliteration: 'appa', english: 'father' },
          { transliteration: 'amma', english: 'mother' },
        ],
      },
    ],
  },
  {
    slug: 'consonants',
    order: 3,
    title: 'Consonant chart (ವ್ಯಂಜನಗಳು)',
    subtitle: "The 34 consonants grouped by where they're produced in the mouth.",
    items: [
      { kind: 'glyph', kannada: 'ಕ', transliteration: 'ka', example: 'as in cup' },
      { kind: 'glyph', kannada: 'ಖ', transliteration: 'kha', example: 'as in khadi' },
      { kind: 'glyph', kannada: 'ಗ', transliteration: 'ga', example: 'as in gun' },
      { kind: 'glyph', kannada: 'ಘ', transliteration: 'gha', example: 'as in ghat' },
      { kind: 'glyph', kannada: 'ಙ', transliteration: 'gna', example: 'as in gnome' },
      { kind: 'glyph', kannada: 'ಚ', transliteration: 'cha', example: 'as in chair' },
      { kind: 'glyph', kannada: 'ಛ', transliteration: 'chha', example: 'as in church' },
      { kind: 'glyph', kannada: 'ಜ', transliteration: 'ja', example: 'as in jug' },
      { kind: 'glyph', kannada: 'ಝ', transliteration: 'jha', example: 'as in badge' },
      { kind: 'glyph', kannada: 'ಞ', transliteration: 'nja', example: 'rare in English' },
      { kind: 'glyph', kannada: 'ಟ', transliteration: 'Ta', example: 'as in Top' },
      { kind: 'glyph', kannada: 'ಠ', transliteration: 'Tha', example: 'as in Cut' },
      { kind: 'glyph', kannada: 'ಡ', transliteration: 'Da', example: 'as in Dark' },
      { kind: 'glyph', kannada: 'ಢ', transliteration: 'Ddha', example: 'as in Board' },
      { kind: 'glyph', kannada: 'ಣ', transliteration: 'Nha', example: 'rare in English' },
      { kind: 'glyph', kannada: 'ತ', transliteration: 'ta', example: 'as in Bharath' },
      { kind: 'glyph', kannada: 'ಥ', transliteration: 'tha', example: 'as in thumb' },
      { kind: 'glyph', kannada: 'ದ', transliteration: 'da', example: 'as in the' },
      { kind: 'glyph', kannada: 'ಧ', transliteration: 'dha', example: 'as in dhal' },
      { kind: 'glyph', kannada: 'ನ', transliteration: 'na', example: 'as in can' },
      { kind: 'glyph', kannada: 'ಪ', transliteration: 'pa', example: 'as in papaya' },
      { kind: 'glyph', kannada: 'ಫ', transliteration: 'pha', example: 'as in orphan' },
      { kind: 'glyph', kannada: 'ಬ', transliteration: 'ba', example: 'as in balloon' },
      { kind: 'glyph', kannada: 'ಭ', transliteration: 'bha', example: 'as in Bharath' },
      { kind: 'glyph', kannada: 'ಮ', transliteration: 'ma', example: 'as in man' },
      { kind: 'glyph', kannada: 'ಯ', transliteration: 'ya', example: 'as in yak' },
      { kind: 'glyph', kannada: 'ರ', transliteration: 'ra', example: 'as in rat' },
      { kind: 'glyph', kannada: 'ಲ', transliteration: 'la', example: 'as in lamp' },
      { kind: 'glyph', kannada: 'ವ', transliteration: 'va', example: 'as in water' },
      { kind: 'glyph', kannada: 'ಶ', transliteration: 'sha', example: 'as in ash' },
      { kind: 'glyph', kannada: 'ಷ', transliteration: 'sshha', example: 'as in shut' },
      { kind: 'glyph', kannada: 'ಸ', transliteration: 'sa', example: 'as in sun' },
      { kind: 'glyph', kannada: 'ಹ', transliteration: 'ha', example: 'as in hump' },
      { kind: 'glyph', kannada: 'ಳ', transliteration: 'lla', example: 'as in Clitella' },
    ],
  },
  {
    slug: 'pronunciation-key',
    order: 4,
    title: 'Reading transliteration',
    subtitle: "Symbols you'll see across the app.",
    items: [
      { kind: 'key', symbol: 'Ta', example: 'Top' },
      { kind: 'key', symbol: 'ta', example: 'Bharath' },
      { kind: 'key', symbol: 'Da', example: 'Dark' },
      { kind: 'key', symbol: 'da', example: 'the' },
      { kind: 'key', symbol: 'Na', example: 'Pranam' },
      { kind: 'key', symbol: 'na', example: 'narrator' },
      { kind: 'key', symbol: 'La', example: 'haLLi' },
      { kind: 'key', symbol: 'la', example: 'large' },
    ],
  },
];
