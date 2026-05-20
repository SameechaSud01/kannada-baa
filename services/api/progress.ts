import { supabase } from './supabase';

export type LessonCompletion = {
  slug: string;
  completed_at: string | null;
  score: number | null;
};

/**
 * UPSERT into user_lesson_progress on (user_id, lesson_id) via RPC.
 * Personal-best semantic on conflict: score never decreases, completed_at
 * preserves the earliest completion. Pass score = null for backfill of
 * pre-spec local completions (see AppGate).
 */
export async function recordLessonCompletion(
  lessonId: string,
  score: number | null,
): Promise<void> {
  const { error } = await supabase.rpc('record_lesson_completion', {
    p_lesson_id: lessonId,
    p_score: score,
  });
  if (error) throw error;
}

export async function fetchCompletedLessons(
  userId: string,
): Promise<LessonCompletion[]> {
  const { data, error } = await supabase
    .from('user_lesson_progress')
    .select('completed_at, score, lessons:lesson_id ( slug )')
    .eq('user_id', userId);

  if (error) throw error;
  if (!data) return [];

  type Row = {
    completed_at: string | null;
    score: number | null;
    lessons: { slug: string | null } | { slug: string | null }[] | null;
  };

  const completions: LessonCompletion[] = [];
  for (const row of data as Row[]) {
    const joined = Array.isArray(row.lessons) ? row.lessons[0] : row.lessons;
    const slug = joined?.slug;
    if (!slug) continue;
    completions.push({
      slug,
      completed_at: row.completed_at,
      score: row.score,
    });
  }
  return completions;
}
