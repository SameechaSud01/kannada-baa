import type { Lesson } from './index';

export const lesson04Directions: Lesson = {
  id: 'lesson-04-directions',
  title: 'Directions',
  subtitle: 'Navigate Bengaluru like a local',
  level: 2,
  estimatedMinutes: 6,
  type: 'lesson',
  culturalNote:
    'In Bengaluru, people love helping with directions. Start with "Namaskara" and locals will go out of their way to guide you — sometimes even walking you there.',
  words: [
    {
      id: 'w-04-01',
      kannadaScript: 'ನೇರವಾಗಿ ಹೋಗಿ',
      transliteration: 'Neravagi hogi',
      meaning: 'Go straight',
      audioUrl: 'lesson_04_neravagi_hogi.mp3',
    },
    {
      id: 'w-04-02',
      kannadaScript: 'ಬಲ ತಿರುಗಿ',
      transliteration: 'Bala thirigi',
      meaning: 'Turn right',
      audioUrl: 'lesson_04_bala_thirigi.mp3',
    },
    {
      id: 'w-04-03',
      kannadaScript: 'ಎಡಬಲ ತಿರುಗಿ',
      transliteration: 'Edabala thirigi',
      meaning: 'Turn left',
      audioUrl: 'lesson_04_edabala_thirigi.mp3',
    },
    {
      id: 'w-04-04',
      kannadaScript: 'ಹತ್ತಿರ ಇದೆ',
      transliteration: 'Hattira iddhe',
      meaning: 'It\'s nearby',
      audioUrl: 'lesson_04_hattira_iddhe.mp3',
    },
    {
      id: 'w-04-05',
      kannadaScript: 'ಆಟೋ ತಗೊ',
      transliteration: 'Auto tago',
      meaning: 'Take an auto',
      audioUrl: 'lesson_04_auto_tago.mp3',
    },
  ],
  quiz: [
    {
      id: 'q-04-01',
      type: 'mcq',
      question: 'How do you say "Go straight" in Kannada?',
      options: ['Bala thirigi', 'Neravagi hogi', 'Hattira iddhe', 'Auto tago'],
      correctAnswer: 'Neravagi hogi',
      explanation: '"Neravagi" means straight and "hogi" means go.',
    },
    {
      id: 'q-04-02',
      type: 'translate',
      question: 'What does "Hattira iddhe" mean?',
      options: ['Go straight', 'Turn right', 'It\'s nearby', 'Take an auto'],
      correctAnswer: 'It\'s nearby',
      explanation: '"Hattira" means near/close and "iddhe" means it is.',
    },
    {
      id: 'q-04-03',
      type: 'mcq',
      question: 'How do you tell someone to "Turn right"?',
      options: ['Edabala thirigi', 'Bala thirigi', 'Neravagi hogi', 'Auto tago'],
      correctAnswer: 'Bala thirigi',
      explanation: '"Bala" means right and "thirigi" means turn.',
    },
  ],
};
