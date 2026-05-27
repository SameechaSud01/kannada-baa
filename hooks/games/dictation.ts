import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  fetchDictationItemsByLessonNo,
  recordDictationAttempt,
  type DictationItem,
} from '../../services/api/games/dictation';

export function useDictationItems(lessonNo: number | null | undefined) {
  return useQuery<DictationItem[]>({
    queryKey: ['dictation-items', lessonNo ?? 0],
    queryFn: () => fetchDictationItemsByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
  });
}

export function useRecordDictationAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['recordDictationAttempt'],
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordDictationAttempt(itemId, isCorrect),
    onSuccess: () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['overall-progress', userId] });
      }
    },
  });
}
