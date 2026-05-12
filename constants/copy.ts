export const COPY = {
  // Onboarding
  onboardingWelcome: {
    classic: 'Welcome! Let\'s learn Kannada together.',
    rowdy: 'Gottilla Kannada? No problem. Let\'s fix that.',
  },
  onboardingWelcomeSubtitle: {
    classic: 'Learn Kannada. Belong in Bengaluru.',
    rowdy: 'Time to stop nodding and start talking.',
  },

  // Lesson flow
  lessonComplete: {
    classic: 'Great work! You completed the lesson.',
    rowdy: 'Ayyooo! Look at you speaking Kannada!',
  },
  wrongAnswer: {
    classic: 'Not quite. Let\'s try again!',
    rowdy: 'Yen idu! That\'s not it, try again \u{1F605}',
  },
  correctAnswer: {
    classic: 'Correct! Well done.',
    rowdy: 'Sakkath! You nailed it!',
  },

  // Streak
  streakReminder: {
    classic: 'Keep your streak going today.',
    rowdy: 'Ey! Don\'t break the streak now, please.',
  },
  streakCelebration: {
    classic: 'Amazing streak! Keep it up!',
    rowdy: 'On fire, guru! Don\'t stop now!',
  },

  // Quiz
  quizIntro: {
    classic: 'Let\'s test what you\'ve learned.',
    rowdy: 'Okay okay, time to see if you were paying attention.',
  },
  quizComplete: {
    classic: 'Quiz complete! Great job.',
    rowdy: 'Done! Not bad for a non-Kannadiga \u{1F60E}',
  },

  // Daily goal
  dailyGoalComplete: {
    classic: 'You\'ve hit your daily goal!',
    rowdy: 'Done for today! Proud of you, go eat some thindi.',
  },
  dailyGoalIncomplete: {
    classic: 'You\'re making progress. Keep going!',
    rowdy: 'Swalpa more, come on!',
  },

  // Practice
  practiceTitle: {
    classic: 'Practice Daily',
    rowdy: 'Grind Time \u{1F4AA}',
  },
  matchPairsTitle: {
    classic: 'Match the Pairs',
    rowdy: 'Match Maadi!',
  },

  // Profile
  profileTitle: {
    classic: 'Your Profile',
    rowdy: 'Your Kannada Journey',
  },

  // Settings
  learningModeUpdated: {
    classic: 'Learning mode updated. Your progress is saved.',
    rowdy: 'Mode changed! Your XP is safe, don\'t worry.',
  },
  modeUpdated: {
    classic: 'App style updated.',
    rowdy: 'Vibe changed! Let\'s goooo.',
  },

  // Home
  homeGreeting: {
    classic: 'Ready to learn Kannada?',
    rowdy: 'Ready to level up your Kannada?',
  },
  nextLesson: {
    classic: 'Next Lesson',
    rowdy: 'Next Mission',
  },
  continuePractice: {
    classic: 'Continue Practice',
    rowdy: 'Keep Grinding',
  },

  // Lesson navigation
  nextPhrase: {
    classic: '\u0CAE\u0CC1\u0C82\u0CA6\u0CC1\u0CB5\u0CB0\u0CBF\u0CB8\u0CBF \u2192',
    rowdy: '\u0CAE\u0CC1\u0C82\u0CA6\u0CC1\u0CB5\u0CB0\u0CBF\u0CB8\u0CBF \u2192',
  },
  lessonDone: {
    classic: '\u0CAA\u0CC2\u0CB0\u0CCD\u0CA3\u0C97\u0CCA\u0C82\u0CA1\u0CBF\u0CA6\u0CC6 \u2713',
    rowdy: 'Done boss! \u2713',
  },
} as const;

export type CopyKey = keyof typeof COPY;
