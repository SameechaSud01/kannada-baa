import type { Lesson } from './index';

export const lesson05Shopping: Lesson = {
  id: 'lesson-05-shopping',
  title: 'Shopping',
  subtitle: 'Bargain at the market',
  level: 3,
  estimatedMinutes: 6,
  type: 'lesson',
  culturalNote:
    'Bargaining is an art form at Bengaluru\'s local markets. Using Kannada phrases while negotiating earns instant respect — and usually a better price.',
  words: [
    {
      id: 'w-05-01',
      kannadaScript: 'ಎಷ್ಟು?',
      transliteration: 'Estu?',
      meaning: 'How much?',
      audioUrl: 'lesson_05_estu.mp3',
    },
    {
      id: 'w-05-02',
      kannadaScript: 'ಜಾಸ್ತಿ ಆಯ್ತು',
      transliteration: 'Jaasti aaythu',
      meaning: 'Too expensive',
      audioUrl: 'lesson_05_jaasti_aaythu.mp3',
    },
    {
      id: 'w-05-03',
      kannadaScript: 'ಕಮ್ಮಿ ಮಾಡಿ',
      transliteration: 'Kammi maadi',
      meaning: 'Reduce the price',
      audioUrl: 'lesson_05_kammi_maadi.mp3',
    },
    {
      id: 'w-05-04',
      kannadaScript: 'ತಿನ್ನೆಯಾ?',
      transliteration: 'Tinneya?',
      meaning: 'Are you eating? (casual)',
      audioUrl: 'lesson_05_tinneya.mp3',
    },
    {
      id: 'w-05-05',
      kannadaScript: 'ಕೊಡಿ',
      transliteration: 'Kodi',
      meaning: 'Give (me)',
      audioUrl: 'lesson_05_kodi.mp3',
    },
  ],
  quiz: [
    {
      id: 'q-05-01',
      type: 'mcq',
      question: 'How do you say "Too expensive" in Kannada?',
      options: ['Estu?', 'Kammi maadi', 'Jaasti aaythu', 'Kodi'],
      correctAnswer: 'Jaasti aaythu',
      explanation: '"Jaasti" means too much and "aaythu" means it became.',
    },
    {
      id: 'q-05-02',
      type: 'translate',
      question: 'What does "Kammi maadi" mean?',
      options: ['How much?', 'Give me', 'Reduce the price', 'Too expensive'],
      correctAnswer: 'Reduce the price',
      explanation: '"Kammi" means less and "maadi" means do/make — together it\'s "make it less".',
    },
    {
      id: 'q-05-03',
      type: 'mcq',
      question: 'How do you ask "How much?" in Kannada?',
      options: ['Tinneya?', 'Kodi', 'Jaasti aaythu', 'Estu?'],
      correctAnswer: 'Estu?',
      explanation: '"Estu?" is the most common way to ask about price.',
    },
  ],
};
