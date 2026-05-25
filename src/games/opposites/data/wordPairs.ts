import type { QuestionPair } from '../types';

export const RAW_PAIRS: QuestionPair[] = [
  {
    word: 'ದೊಡ್ಡ',
    tr: 'doḍḍa',
    meaning: 'big',
    answer: 'ಚಿಕ್ಕ',
    opts: [
      { kn: 'ಚಿಕ್ಕ', tr: 'cikka', en: 'small' },
      { kn: 'ಉದ್ದ', tr: 'udda', en: 'tall' },
      { kn: 'ಭಾರ', tr: 'bhāra', en: 'heavy' },
      { kn: 'ಶಕ್ತ', tr: 'śakta', en: 'strong' },
    ],
  },
  {
    word: 'ಬೆಳಕು',
    tr: 'beḷaku',
    meaning: 'light',
    answer: 'ಕತ್ತಲು',
    opts: [
      { kn: 'ಕತ್ತಲು', tr: 'kattalu', en: 'darkness' },
      { kn: 'ಬಿಸಿಲು', tr: 'bisilu', en: 'sunshine' },
      { kn: 'ಬೆಂಕಿ', tr: 'beṃki', en: 'fire' },
      { kn: 'ರಾತ್ರಿ', tr: 'rātri', en: 'night' },
    ],
  },
  {
    word: 'ಹಗಲು',
    tr: 'hagalu',
    meaning: 'daytime',
    answer: 'ರಾತ್ರಿ',
    opts: [
      { kn: 'ಮಧ್ಯಾಹ್ನ', tr: 'madhyāhna', en: 'noon' },
      { kn: 'ರಾತ್ರಿ', tr: 'rātri', en: 'night' },
      { kn: 'ಸಂಜೆ', tr: 'saṃje', en: 'evening' },
      { kn: 'ಬೆಳಿಗ್ಗೆ', tr: 'beḷigge', en: 'morning' },
    ],
  },
  {
    word: 'ಸಂತೋಷ',
    tr: 'santoṣa',
    meaning: 'happiness',
    answer: 'ದುಃಖ',
    opts: [
      { kn: 'ನಗು', tr: 'nagu', en: 'laughter' },
      { kn: 'ಪ್ರೀತಿ', tr: 'prīti', en: 'love' },
      { kn: 'ದುಃಖ', tr: 'duḥkha', en: 'sadness' },
      { kn: 'ಭಯ', tr: 'bhaya', en: 'fear' },
    ],
  },
  {
    word: 'ಮೇಲೆ',
    tr: 'mēle',
    meaning: 'above',
    answer: 'ಕೆಳಗೆ',
    opts: [
      { kn: 'ಹತ್ತಿರ', tr: 'hattira', en: 'near' },
      { kn: 'ದೂರ', tr: 'dūra', en: 'far' },
      { kn: 'ಕೆಳಗೆ', tr: 'keḷage', en: 'below' },
      { kn: 'ಒಳಗೆ', tr: 'oḷage', en: 'inside' },
    ],
  },
  {
    word: 'ಹೊಸ',
    tr: 'hosa',
    meaning: 'new',
    answer: 'ಹಳೆಯ',
    opts: [
      { kn: 'ಹಳೆಯ', tr: 'haḷeya', en: 'old' },
      { kn: 'ಚೆಂದ', tr: 'ceṃda', en: 'beautiful' },
      { kn: 'ಶ್ರೇಷ್ಠ', tr: 'śrēṣṭha', en: 'great' },
      { kn: 'ಕಷ್ಟ', tr: 'kaṣṭa', en: 'difficult' },
    ],
  },
  {
    word: 'ಬೇಗ',
    tr: 'bēga',
    meaning: 'fast',
    answer: 'ನಿಧಾನ',
    opts: [
      { kn: 'ನಿಧಾನ', tr: 'nidhāna', en: 'slow' },
      { kn: 'ಮೆಲ್ಲ', tr: 'mella', en: 'gently' },
      { kn: 'ತಕ್ಷಣ', tr: 'takṣaṇa', en: 'instant' },
      { kn: 'ಸ್ವಲ್ಪ', tr: 'svalpa', en: 'a little' },
    ],
  },
  {
    word: 'ಶೀತ',
    tr: 'śīta',
    meaning: 'cold',
    answer: 'ಬಿಸಿ',
    opts: [
      { kn: 'ಮಳೆ', tr: 'maḷe', en: 'rain' },
      { kn: 'ಗಾಳಿ', tr: 'gāḷi', en: 'wind' },
      { kn: 'ಬೆಚ್ಚ', tr: 'becca', en: 'warm' },
      { kn: 'ಬಿಸಿ', tr: 'bisi', en: 'hot' },
    ],
  },
  {
    word: 'ಒಳ್ಳೆಯ',
    tr: 'oḷḷeya',
    meaning: 'good',
    answer: 'ಕೆಟ್ಟ',
    opts: [
      { kn: 'ಕೆಟ್ಟ', tr: 'keṭṭa', en: 'bad' },
      { kn: 'ಸುಂದರ', tr: 'sundara', en: 'pretty' },
      { kn: 'ಸರಿ', tr: 'sari', en: 'correct' },
      { kn: 'ತಪ್ಪು', tr: 'tappu', en: 'wrong' },
    ],
  },
  {
    word: 'ಮುಂದೆ',
    tr: 'munde',
    meaning: 'in front',
    answer: 'ಹಿಂದೆ',
    opts: [
      { kn: 'ಪಕ್ಕ', tr: 'pakka', en: 'beside' },
      { kn: 'ಹಿಂದೆ', tr: 'hinde', en: 'behind' },
      { kn: 'ಮಧ್ಯ', tr: 'madhya', en: 'middle' },
      { kn: 'ತುದಿ', tr: 'tudi', en: 'end' },
    ],
  },
];
