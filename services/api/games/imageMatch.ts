import { supabase } from '../supabase';

export type ImageMatchItem = {
  id: string;
  lessonId: string;
  lessonNo: number;
  sortOrder: number;
  kannada: string;
  transliteration: string | null;
  meaning: string;
  emoji: string | null;
  imageUrl: string | null;
};

type Row = {
  id: string;
  lesson_id: string;
  sort_order: number;
  kannada: string;
  transliteration: string | null;
  meaning: string;
  emoji: string | null;
  image_url: string | null;
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

function mapRow(row: Row, lessonNo: number): ImageMatchItem {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    lessonNo,
    sortOrder: row.sort_order,
    kannada: row.kannada,
    transliteration: row.transliteration,
    meaning: row.meaning,
    emoji: row.emoji,
    imageUrl: row.image_url,
  };
}

export async function fetchImageMatchItemsByLessonNo(
  lessonNo: number,
): Promise<ImageMatchItem[]> {
  const lessonId = await lessonIdByNo(lessonNo);
  if (!lessonId) return [];

  const { data, error } = await supabase
    .from('image_match_items')
    .select('id, lesson_id, sort_order, kannada, transliteration, meaning, emoji, image_url')
    .eq('lesson_id', lessonId)
    .gt('sort_order', 0)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return (data ?? []).map((r) => mapRow(r as unknown as Row, lessonNo));
}

/**
 * UPSERT into image_match_progress via SECURITY INVOKER RPC.
 */
export async function recordImageMatchAttempt(
  itemId: string,
  isCorrect: boolean,
): Promise<void> {
  const { error } = await supabase.rpc('record_image_match_attempt', {
    p_item_id: itemId,
    p_is_correct: isCorrect,
  });
  if (error) throw error;
}
