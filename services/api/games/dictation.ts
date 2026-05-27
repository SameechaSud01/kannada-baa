import { supabase } from '../supabase';

export type DictationItem = {
  id: string;
  lessonId: string;
  lessonNo: number;
  sortOrder: number;
  expectedAnswer: string;
  acceptedSpellings: string[];
  phonetic: string | null;
  audioUrl: string | null;
};

type Row = {
  id: string;
  lesson_id: string;
  sort_order: number;
  expected_answer: string;
  accepted_json: string[] | null;
  phonetic: string | null;
  audio_url: string | null;
};

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

function mapRow(row: Row, lessonNo: number): DictationItem {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    lessonNo,
    sortOrder: row.sort_order,
    expectedAnswer: row.expected_answer,
    acceptedSpellings: row.accepted_json ?? [],
    phonetic: row.phonetic,
    audioUrl: row.audio_url,
  };
}

export async function fetchDictationItemsByLessonNo(
  lessonNo: number,
): Promise<DictationItem[]> {
  const lessonId = await lessonIdByNo(lessonNo);
  if (!lessonId) return [];

  const { data, error } = await supabase
    .from('dictation_items')
    .select('id, lesson_id, sort_order, expected_answer, accepted_json, phonetic, audio_url')
    .eq('lesson_id', lessonId)
    .gt('sort_order', 0)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as unknown as Row, lessonNo));
}

/**
 * UPSERT into dictation_progress via SECURITY INVOKER RPC.
 * OR-merges is_correct (personal-best); increments attempts; updates last_played.
 */
export async function recordDictationAttempt(
  itemId: string,
  isCorrect: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('record_dictation_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
