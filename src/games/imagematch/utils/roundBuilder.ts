import { VOCAB_BANK } from '../data/vocabBank';
import type { Question, VocabItem } from '../types';

export function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildRound(): Question[] {
  const shuffled = fisherYates(VOCAB_BANK);
  const targets = shuffled.slice(0, 10);

  const typed: Question[] = targets.map((target, i) => {
    const type = i < 5 ? 'word-to-picture' : 'picture-to-word';
    const distractors = fisherYates(
      VOCAB_BANK.filter((item) => item.id !== target.id),
    ).slice(0, 3) as VocabItem[];
    const options = fisherYates([target, ...distractors]);
    return { type, target, options };
  });

  return fisherYates(typed);
}
