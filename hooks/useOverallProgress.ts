import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { fetchOverallProgress, type OverallProgress } from '../services/api/overall';

/**
 * Read the aggregated user_overall_progress row.
 * Refetched on focus and invalidated by every record_*_attempt mutation
 * + the existing record_lesson_completion path (via the recompute trigger).
 *
 * Returns `null` data when there's no row yet (user hasn't completed
 * anything since the trigger was installed).
 */
export function useOverallProgress() {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery<OverallProgress | null>({
    queryKey: ['overall-progress', userId ?? ''],
    queryFn: () => fetchOverallProgress(userId as string),
    enabled: !!userId,
    staleTime: 60 * 1000,
  });
}
