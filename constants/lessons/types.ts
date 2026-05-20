export type PhraseId = string;
export type LessonId = string;
export type AudioKey = string;
export type ImageKey = string;

/**
 * Self-rating after the user attempts to say a phrase.
 * Held in component state for now; will feed Leitner SRS in a future spec.
 */
export type SelfRating = 'hard' | 'ok' | 'easy';

/**
 * A single phrase the user will learn. Atomic unit of progress and SRS.
 *
 * Audio policy: by default, the device's native TTS speaks `kannada` at runtime.
 * If `audioKey` is set, a future implementation may load a recorded native-speaker
 * file instead — this is the v2 swap-in path. Step 3 only uses runtime TTS.
 */
export type Phrase = {
  id: PhraseId;
  kannada: string;          // ಎಷ್ಟು — also the source for runtime TTS
  transliteration: string;  // Eshtu
  english: string;          // How much? (hint only — never shown by default)
  audioKey?: AudioKey;      // optional — for v2 recorded-audio swap-in
  imageKey?: ImageKey;      // optional — for intake illustration
  vocabAtoms: string[];     // sub-words flagged as "new" — used for i+1 sequencing
  /** Optional cultural/grammar note shown in PhraseDetailSheet (MODALS §6.4). */
  note?: string;
  /** Optional atom-level glosses surfaced in PhraseDetailSheet (MODALS §6.4). */
  gloss?: Array<{ atom: string; en: string; transliteration?: string }>;
};

/**
 * A drill prompt. Discriminated union.
 */
export type DrillItem =
  | { type: 'listen_pick'; phraseId: PhraseId; distractorIds: PhraseId[] }
  | { type: 'translate_pick'; phraseId: PhraseId; distractorIds: PhraseId[] }
  | { type: 'fill_blank'; phraseId: PhraseId; blankAtom: string };

/**
 * A situated learning unit. The scenario IS the lesson.
 */
export type Lesson = {
  id: LessonId;
  situation: {
    title: string;            // "Negotiating an auto fare"
    setup: string;            // 1–2 sentence framing
    imageKey: ImageKey;
    realWorldPrompt: string;  // "Try this in your next auto"
  };
  intake: Phrase[];           // 2–4 new phrases — STRICT MAX
  drill: DrillItem[];         // 5–8 items
  output: {
    driverLine: Phrase;       // the cue
    expectedResponse: Phrase; // what the user must produce
  };
  resurfaces: PhraseId[];     // phrase ids from earlier lessons to interleave (empty for first lesson)
};
