import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/useAuthStore';
import { useProgressStore } from '../stores/progressStore';
import { fetchLessonIdBySlug } from '../services/api/lessons';
import { recordLessonCompletion } from '../services/api/progress';

export interface CompleteLessonInput {
  slug: string;
  score: number;
  phrasesLearned: number;
  minutesPracticed: number;
}

export class LessonNotRegisteredError extends Error {
  constructor(slug: string) {
    super(`Lesson "${slug}" not registered on server.`);
    this.name = 'LessonNotRegisteredError';
  }
}

/**
 * Server-first lesson completion. The DB write must succeed before any
 * client state mutates — preserving the C6 idempotency contract on the
 * Zustand side (replays UPSERT once on the server, and the store's
 * own early-return guards XP/phrase double-counting).
 *
 * Mutation key: ['completeLesson'].
 * Invalidates:  ['lesson-completions', userId].
 */
export function useCompleteLessonMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['completeLesson'],
    mutationFn: async ({
      slug,
      score,
      phrasesLearned,
      minutesPracticed,
    }: CompleteLessonInput) => {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error('Not signed in.');

      const lessonId = await fetchLessonIdBySlug(slug);
      if (!lessonId) throw new LessonNotRegisteredError(slug);

      await recordLessonCompletion(lessonId, score);

      const progress = useProgressStore.getState();
      progress.completeLesson(slug, score, phrasesLearned, minutesPracticed);
      progress.updateStreak();
      progress.recordActivity();

      return { userId, slug };
    },
    onSuccess: ({ userId }) => {
      queryClient.invalidateQueries({ queryKey: ['lesson-completions', userId] });
    },
  });
}
