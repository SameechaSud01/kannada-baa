import { supabase } from './supabase';

export type OverallProgress = {
  userId: string;
  totalScore: number;
  progressPct: number;
  recomputedAt: string | null;
};

type Row = {
  user_id: string;
  total_score: number | null;
  progress_pct: number | null;
  recomputed_at: string | null;
};

/**
 * Read the user's aggregated progress row. The row is maintained by the
 * recompute_overall_progress trigger function (PR1) which fires on every
 * write to user_lesson_progress, opposites_progress, dictation_progress,
 * and image_match_progress. The client never writes here directly.
 *
 * Returns null if the row hasn't been computed yet (no lessons or game
 * attempts on file).
 */
export async function fetchOverallProgress(
  userId: string,
): Promise<OverallProgress | null> {
  const { data, error } = await supabase
    .from('user_overall_progress')
    .select('user_id, total_score, progress_pct, recomputed_at')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as Row;
  return {
    userId: row.user_id,
    totalScore: row.total_score ?? 0,
    progressPct: row.progress_pct ?? 0,
    recomputedAt: row.recomputed_at,
  };
}
