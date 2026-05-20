/**
 * C6 — Lesson-completion idempotency contract.
 *
 * Pins the [LOCKED] contract in docs/foundation/STATE.md#streak-logic:
 * calling completeLesson twice with the same slug must not double-count
 * xp, totalPhrasesLearned, totalMinutesPracticed, or completedLessons.
 *
 * Bundled with spec_progress_persistence.md so a future refactor that
 * removes the early-return in progressStore can't quietly re-inflate
 * the metrics on every replay.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useProgressStore } from '../../stores/progressStore';

describe('useProgressStore.completeLesson — C6 idempotency', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('does not double-count xp, phrases, minutes, or completedLessons on replay', () => {
    const slug = 'greetings';
    const score = 100;
    const phrasesLearned = 5;
    const minutesPracticed = 5;

    useProgressStore.getState().completeLesson(slug, score, phrasesLearned, minutesPracticed);

    const after1 = useProgressStore.getState();
    expect(after1.completedLessons).toEqual([slug]);
    expect(after1.xp).toBe(20);
    expect(after1.totalPhrasesLearned).toBe(phrasesLearned);
    expect(after1.totalMinutesPracticed).toBe(minutesPracticed);
    expect(after1.todayMinutes).toBe(minutesPracticed);

    useProgressStore.getState().completeLesson(slug, score, phrasesLearned, minutesPracticed);

    const after2 = useProgressStore.getState();
    expect(after2.completedLessons).toEqual([slug]);
    expect(after2.completedLessons.length).toBe(1);
    expect(after2.xp).toBe(after1.xp);
    expect(after2.totalPhrasesLearned).toBe(after1.totalPhrasesLearned);
    expect(after2.totalMinutesPracticed).toBe(after1.totalMinutesPracticed);
    expect(after2.todayMinutes).toBe(after1.todayMinutes);
  });

  it('treats sub-80% scores as 10 xp but is still idempotent on replay', () => {
    const slug = 'greetings';
    useProgressStore.getState().completeLesson(slug, 50, 3, 5);
    expect(useProgressStore.getState().xp).toBe(10);

    useProgressStore.getState().completeLesson(slug, 95, 3, 5);
    expect(useProgressStore.getState().xp).toBe(10);
    expect(useProgressStore.getState().completedLessons.length).toBe(1);
  });
});

describe('useProgressStore.hydrateFromServerCompletions', () => {
  beforeEach(() => {
    useProgressStore.getState().reset();
  });

  it('merges server slugs into completedLessons without duplicates', () => {
    useProgressStore.getState().completeLesson('greetings', 100, 5, 5);
    useProgressStore.getState().hydrateFromServerCompletions([
      'greetings',
      'ordering-coffee',
    ]);

    const slugs = useProgressStore.getState().completedLessons;
    expect(slugs).toContain('greetings');
    expect(slugs).toContain('ordering-coffee');
    expect(slugs.length).toBe(2);
  });

  it('does not touch xp or phrase counters', () => {
    useProgressStore.getState().hydrateFromServerCompletions(['ordering-coffee']);
    const state = useProgressStore.getState();
    expect(state.xp).toBe(0);
    expect(state.totalPhrasesLearned).toBe(0);
    expect(state.totalMinutesPracticed).toBe(0);
  });
});
