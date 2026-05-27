import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  fetchOppositesItemsByLessonNo,
  recordOppositesAttempt,
  type OppositesItem,
} from '../../services/api/games/opposites';

/**
 * Fetch all opposites_items for one lesson, ordered by sort_order.
 * Stale time 1h — lesson content is near-static.
 */
export function useOppositesItems(lessonNo: number | null | undefined) {
  return useQuery<OppositesItem[]>({
    queryKey: ['opposites-items', lessonNo ?? 0],
    queryFn: () => fetchOppositesItemsByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
  });
}

/**
 * Record one per-item attempt via the record_opposites_attempt RPC.
 * Personal-best on the server side; invalidates the overall-progress query
 * so the new aggregate is picked up on next read.
 */
export function useRecordOppositesAttempt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['recordOppositesAttempt'],
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordOppositesAttempt(itemId, isCorrect),
    onSuccess: () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['overall-progress', userId] });
      }
    },
  });
}
