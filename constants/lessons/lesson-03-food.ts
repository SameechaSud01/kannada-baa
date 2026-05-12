import type { Lesson } from './index';

export const lesson03Food: Lesson = {
  id: 'lesson-03-food',
  title: 'Food & Ordering',
  subtitle: 'Eat your way through Bengaluru',
  level: 2,
  estimatedMinutes: 6,
  type: 'lesson',
  culturalNote:
    'Bengaluru\'s darshinis (standing restaurants) serve incredible food fast. Knowing a few Kannada words transforms your ordering experience — and earns you a warm smile.',
  words: [
    {
      id: 'w-03-01',
      kannadaScript: 'ದೋಸೆ',
      transliteration: 'Dose',
      meaning: 'Dosa',
      audioUrl: 'lesson_03_dose.mp3',
    },
    {
      id: 'w-03-02',
      kannadaScript: 'ಇಡ್ಲಿ',
      transliteration: 'Idli',
      meaning: 'Idli',
      audioUrl: 'lesson_03_idli.mp3',
    },
    {
      id: 'w-03-03',
      kannadaScript: 'ಏನು ಬೇಕು?',
      transliteration: 'Enu beku?',
      meaning: 'What do you want?',
      audioUrl: 'lesson_03_enu_beku.mp3',
    },
    {
      id: 'w-03-04',
      kannadaScript: 'ಒಂದು ದೋಸೆ ಕೊಡಿ',
      transliteration: 'Ondhu dose kodi',
      meaning: 'Give me one dosa',
      audioUrl: 'lesson_03_ondhu_dose_kodi.mp3',
    },
    {
      id: 'w-03-05',
      kannadaScript: 'ಎಷ್ಟು ಆಗುತ್ತೆ?',
      transliteration: 'Estu aagatte?',
      meaning: 'How much does it cost?',
      audioUrl: 'lesson_03_estu_aagatte.mp3',
    },
    {
      id: 'w-03-06',
      kannadaScript: 'ಖಾಲಿ ಇದೆಯಾ?',
      transliteration: 'Khali idheya?',
      meaning: 'Is it available?',
      audioUrl: 'lesson_03_khali_idheya.mp3',
    },
  ],
  quiz: [
    {
      id: 'q-03-01',
      type: 'mcq',
      question: 'How do you ask "What do you want?" in Kannada?',
      options: ['Estu aagatte?', 'Enu beku?', 'Khali idheya?', 'Ondhu dose kodi'],
      correctAnswer: 'Enu beku?',
      explanation: '"Enu beku?" literally means "What is needed?" — used when ordering.',
    },
    {
      id: 'q-03-02',
      type: 'translate',
      question: 'What does "Ondhu dose kodi" mean?',
      options: ['How much is a dosa?', 'Give me one dosa', 'Is dosa available?', 'I want idli'],
      correctAnswer: 'Give me one dosa',
      explanation: '"Ondhu dose kodi" breaks down to: ondhu (one) + dose (dosa) + kodi (give).',
    },
    {
      id: 'q-03-03',
      type: 'mcq',
      question: 'How do you ask "How much does it cost?" in Kannada?',
      options: ['Enu beku?', 'Khali idheya?', 'Estu aagatte?', 'Dose kodi'],
      correctAnswer: 'Estu aagatte?',
      explanation: '"Estu aagatte?" is the go-to phrase for asking the price.',
    },
  ],
};
