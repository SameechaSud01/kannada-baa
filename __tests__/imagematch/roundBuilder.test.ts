import { buildRound, fisherYates } from '../../src/games/imagematch/utils/roundBuilder';
import type { VocabItem } from '../../src/games/imagematch/types';

// Fixture: 12 distinct VocabItems. Mirrors the legacy VOCAB_BANK shape so
// the existing assertions (10 unique targets, 4 options/question) hold.
const FIXTURE: VocabItem[] = Array.from({ length: 12 }, (_, i) => ({
  id:    `v-${i + 1}`,
  kn:    `K${i + 1}`,
  ph:    `k${i + 1}`,
  en:    `english ${i + 1}`,
  emoji: '🔤',
}));

describe('fisherYates', () => {
  it('returns [] for empty array', () => {
    expect(fisherYates([])).toEqual([]);
  });

  it('returns [1] for single-element array', () => {
    expect(fisherYates([1])).toEqual([1]);
  });

  it('does not mutate the input array', () => {
    const input = [1, 2, 3];
    fisherYates(input);
    expect(input).toEqual([1, 2, 3]);
  });
});

describe('buildRound', () => {
  it('returns exactly 10 questions when bank has >=10 items', () => {
    expect(buildRound(FIXTURE)).toHaveLength(10);
  });

  it('has exactly 5 word-to-picture and 5 picture-to-word questions when round size is 10', () => {
    const round = buildRound(FIXTURE);
    const w2p = round.filter((q) => q.type === 'word-to-picture').length;
    const p2w = round.filter((q) => q.type === 'picture-to-word').length;
    expect(w2p).toBe(5);
    expect(p2w).toBe(5);
  });

  it('every question has exactly 4 options when distractor pool is large enough', () => {
    const round = buildRound(FIXTURE);
    for (const q of round) {
      expect(q.options).toHaveLength(4);
    }
  });

  it('target is always present in the options array', () => {
    const round = buildRound(FIXTURE);
    for (const q of round) {
      expect(q.options.some((o) => o.id === q.target.id)).toBe(true);
    }
  });

  it('no duplicate ids within a single question options', () => {
    const round = buildRound(FIXTURE);
    for (const q of round) {
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('all target items across the round are unique', () => {
    const round = buildRound(FIXTURE);
    const targetIds = round.map((q) => q.target.id);
    expect(new Set(targetIds).size).toBe(targetIds.length);
  });

  it('calling buildRound twice produces different orders with high probability', () => {
    const results: string[][] = [];
    for (let i = 0; i < 10; i++) {
      results.push(buildRound(FIXTURE).map((q) => q.target.id));
    }
    const first = results[0].join(',');
    const allSame = results.every((r) => r.join(',') === first);
    expect(allSame).toBe(false);
  });

  it('returns empty when targetBank is empty', () => {
    expect(buildRound([])).toEqual([]);
  });

  it('returns fewer than 10 questions when targetBank has fewer items', () => {
    const tiny = FIXTURE.slice(0, 3);
    const round = buildRound(tiny);
    expect(round.length).toBe(3);
    for (const q of round) {
      expect(tiny.some((t) => t.id === q.target.id)).toBe(true);
    }
  });

  it('uses distractorBank for option sampling when target bank is sparse', () => {
    const targets = FIXTURE.slice(0, 2);
    const pool = FIXTURE; // larger pool
    const round = buildRound(targets, pool);
    // each question should still have 4 options sourced from the wider pool
    for (const q of round) {
      expect(q.options).toHaveLength(4);
      // distractors can come from outside targets
      const distractorIds = q.options.filter((o) => o.id !== q.target.id).map((o) => o.id);
      const allInPool = distractorIds.every((id) => pool.some((p) => p.id === id));
      expect(allInPool).toBe(true);
    }
  });
});
