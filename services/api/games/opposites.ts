import { supabase } from '../supabase';

export type OppositesOption = {
  kn: string;
  tr: string;
  en: string;
};

export type OppositesItem = {
  id: string;
  lessonId: string;
  lessonNo: number;
  sortOrder: number;
  word: string;
  opposite: string;
  transliteration: string | null;
  meaning: string | null;
  options: OppositesOption[];
};

type Row = {
  id: string;
  lesson_id: string;
  sort_order: number;
  word: string;
  opposite: string;
  transliteration: string | null;
  meaning: string | null;
  options_json: OppositesOption[] | null;
};

// Module-level cache for lesson_no -> lesson_id. Mirrors the slugToId
// cache in services/api/lessons.ts. The map is keyed by lesson_no and
// never invalidated — lessons rows are append-only and stable.
const lessonNoToId = new Map<number, string>();

async function lessonIdByNo(lessonNo: number): Promise<string | null> {
  const cached = lessonNoToId.get(lessonNo);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('lessons')
    .select('id')
    .eq('lesson_no', lessonNo)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  lessonNoToId.set(lessonNo, data.id as string);
  return data.id as string;
}

function mapRow(row: Row, lessonNo: number): OppositesItem {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    lessonNo,
    sortOrder: row.sort_order,
    word: row.word,
    opposite: row.opposite,
    transliteration: row.transliteration,
    meaning: row.meaning,
    options: row.options_json ?? [],
  };
}

export async function fetchOppositesItemsByLessonNo(
  lessonNo: number,
): Promise<OppositesItem[]> {
  const lessonId = await lessonIdByNo(lessonNo);
  if (!lessonId) return [];

  const { data, error } = await supabase
    .from('opposites_items')
    .select('id, lesson_id, sort_order, word, opposite, transliteration, meaning, options_json')
    .eq('lesson_id', lessonId)
    .gt('sort_order', 0)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as unknown as Row, lessonNo));
}

/**
 * UPSERT into opposites_progress via SECURITY INVOKER RPC.
 * OR-merges is_correct (personal-best); increments attempts; updates last_played.
 */
export async function recordOppositesAttempt(
  itemId: string,
  isCorrect: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('record_opposites_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
