import type { Question, VocabItem } from '../types';

export function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build a round of up to 10 questions from a bank of vocab items.
 *
 * - `targetBank`: the lesson-scoped items that appear as the prompt (target).
 * - `distractorBank` (optional): a wider pool used for distractor sampling
 *   when the targetBank has fewer than 4 items. Defaults to `targetBank`.
 *
 * Quiz layout: half `word-to-picture`, half `picture-to-word`. Each question
 * shows the target + 3 distractors (4 options), shuffled. If the
 * effective distractor pool has fewer than 3 unique non-target items, the
 * question is built with whatever's available — Question.options may
 * therefore have fewer than 4 entries in degenerate cases.
 *
 * Returns an empty array if `targetBank` is empty. Returns fewer than 10
 * questions if `targetBank` has fewer items.
 */
export function buildRound(
  targetBank: VocabItem[],
  distractorBank?: VocabItem[],
): Question[] {
  if (targetBank.length === 0) return [];

  const pool = distractorBank ?? targetBank;
  const roundSize = Math.min(targetBank.length, 10);

  const shuffled = fisherYates(targetBank);
  const targets = shuffled.slice(0, roundSize);

  const w2pCount = Math.ceil(roundSize / 2);

  const typed: Question[] = targets.map((target, i) => {
    const type = i < w2pCount ? 'word-to-picture' : 'picture-to-word';
    const distractors = fisherYates(
      pool.filter((item) => item.id !== target.id),
    ).slice(0, 3) as VocabItem[];
    const options = fisherYates([target, ...distractors]);
    return { type, target, options };
  });

  return fisherYates(typed);
}
