import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import {
  fetchImageMatchItemsByLessonNo,
  recordImageMatchAttempt,
  type ImageMatchItem,
} from '../../services/api/games/imageMatch';

export function useImageMatchItems(lessonNo: number | null | undefined) {
  return useQuery<ImageMatchItem[]>({
    queryKey: ['image-match-items', lessonNo ?? 0],
    queryFn: () => fetchImageMatchItemsByLessonNo(lessonNo as number),
    enabled: typeof lessonNo === 'number' && lessonNo > 0,
    staleTime: 60 * 60 * 1000,
  });
}

export function useRecordImageMatchAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['recordImageMatchAttempt'],
    mutationFn: ({ itemId, isCorrect }: { itemId: string; isCorrect: boolean }) =>
      recordImageMatchAttempt(itemId, isCorrect),
    onSuccess: () => {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ['overall-progress', userId] });
      }
    },
  });
}
