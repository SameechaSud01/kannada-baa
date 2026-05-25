export interface Word {
  transliteration: string;
  english: string;
  kannada: string;
}

export interface Phrase {
  transliteration: string;
  english: string;
  kannada: string;
  /** Optional cultural/grammar note for PhraseDetailSheet. */
  note?: string;
  /** Optional atom-level gloss for PhraseDetailSheet. */
  gloss?: Array<{ atom: string; en: string; transliteration?: string }>;
}

export interface Lesson {
  id: string;
  lessonNo: number;
  title: string;
  slug: string;
  situation: string;
  realWorldPrompt: string;
  words: Word[];
  phrases: Phrase[];
}

export type LessonPhase =
  | 'idle'
  | 'situation'
  | 'teach_words'
  | 'practice_words'
  | 'teach_phrases'
  | 'practice_phrases'
  | 'summary'
  | 'real_world'
  | 'done';

export interface LessonRow {
  id: string;
  lesson_no: number;
  title: string;
  slug: string;
  situation: string;
  real_world_prompt: string;
  content_json: {
    reference: {
      words: Array<{ english: string; kannada: string; transliteration: string }>;
      phrases: Array<{ english: string; kannada: string; transliteration: string }>;
      verified?: boolean;
      source?: string;
    };
  };
}

export function mapDbLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    lessonNo: row.lesson_no,
    title: row.title,
    slug: row.slug,
    situation: row.situation,
    realWorldPrompt: row.real_world_prompt,
    words: row.content_json.reference.words.map((w) => ({
      transliteration: w.transliteration,
      english: w.english,
      kannada: w.kannada,
    })),
    phrases: row.content_json.reference.phrases.map((p) => ({
      transliteration: p.transliteration,
      english: p.english,
      kannada: p.kannada,
    })),
  };
}
