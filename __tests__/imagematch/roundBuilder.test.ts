import { buildRound, fisherYates } from '../../src/games/imagematch/utils/roundBuilder';

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
  it('returns exactly 10 questions', () => {
    expect(buildRound()).toHaveLength(10);
  });

  it('has exactly 5 word-to-picture and 5 picture-to-word questions', () => {
    const round = buildRound();
    const w2p = round.filter((q) => q.type === 'word-to-picture').length;
    const p2w = round.filter((q) => q.type === 'picture-to-word').length;
    expect(w2p).toBe(5);
    expect(p2w).toBe(5);
  });

  it('every question has exactly 4 options', () => {
    const round = buildRound();
    for (const q of round) {
      expect(q.options).toHaveLength(4);
    }
  });

  it('target is always present in the options array', () => {
    const round = buildRound();
    for (const q of round) {
      expect(q.options.some((o) => o.id === q.target.id)).toBe(true);
    }
  });

  it('no duplicate ids within a single question options', () => {
    const round = buildRound();
    for (const q of round) {
      const ids = q.options.map((o) => o.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('all target items across the 10 questions are unique', () => {
    const round = buildRound();
    const targetIds = round.map((q) => q.target.id);
    expect(new Set(targetIds).size).toBe(10);
  });

  it('calling buildRound twice produces different orders with high probability', () => {
    const results: string[][] = [];
    for (let i = 0; i < 10; i++) {
      results.push(buildRound().map((q) => q.target.id));
    }
    const first = results[0].join(',');
    const allSame = results.every((r) => r.join(',') === first);
    expect(allSame).toBe(false);
  });
});
