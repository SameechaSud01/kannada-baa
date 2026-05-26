import { VOCAB_BANK } from '../../src/games/imagematch/data/vocabBank';

describe('VOCAB_BANK', () => {
  it('has exactly 12 items', () => {
    expect(VOCAB_BANK).toHaveLength(12);
  });

  it('every item has non-empty id, kn, ph, en, emoji strings', () => {
    for (const item of VOCAB_BANK) {
      expect(typeof item.id).toBe('string');
      expect(item.id.length).toBeGreaterThan(0);
      expect(typeof item.kn).toBe('string');
      expect(item.kn.length).toBeGreaterThan(0);
      expect(typeof item.ph).toBe('string');
      expect(item.ph.length).toBeGreaterThan(0);
      expect(typeof item.en).toBe('string');
      expect(item.en.length).toBeGreaterThan(0);
      expect(typeof item.emoji).toBe('string');
      expect(item.emoji.length).toBeGreaterThan(0);
    }
  });

  it('all id values are unique', () => {
    const ids = VOCAB_BANK.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('no item has an empty emoji string', () => {
    for (const item of VOCAB_BANK) {
      expect(item.emoji.trim().length).toBeGreaterThan(0);
    }
  });
});
