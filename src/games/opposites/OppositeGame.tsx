// TODO(opposites-game): Rewrite this game's styling. All files under src/games/opposites/
// use NativeWind `className` props, but NativeWind was removed from the project in f5ee1d2.
// Result: className is a no-op prop at runtime (screens render unstyled) and TypeScript
// errors on every usage. Convert to inline style={{...}} with Colors/Spacing/Fonts tokens
// per CLAUDE.md, using moderateScale() for sizing.
import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameState } from './hooks/useGameState';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import OptionGrid from './components/OptionGrid';
import FeedbackBanner from './components/FeedbackBanner';
import ResultScreen from './components/ResultScreen';

const OppositeGame: React.FC = () => {
  const {
    currentQuestion,
    shuffledOpts,
    currentIndex,
    totalQuestions,
    score,
    streak,
    phase,
    answerState,
    selectedOpt,
    handleOptionTap,
    handleNext,
    restart,
  } = useGameState();

  if (phase === 'result') {
    return (
      <SafeAreaView className='flex-1 bg-white'>
        <ResultScreen score={score} total={totalQuestions} onReplay={restart} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className='flex-1 bg-white'>
      <ScrollView contentContainerClassName='px-4 py-4 gap-y-4'>
        <View className='flex-row justify-between items-center'>
          <Text className='text-sm text-gray-500'>
            Question {currentIndex + 1} / {totalQuestions}
          </Text>
          <Text className='text-sm font-semibold text-gray-700'>Score {score}</Text>
        </View>

        <ProgressBar current={currentIndex} total={totalQuestions} />

        <QuestionCard
          word={currentQuestion.word}
          tr={currentQuestion.tr}
          meaning={currentQuestion.meaning}
          streak={streak}
        />

        <OptionGrid
          opts={shuffledOpts}
          answerState={answerState}
          selectedOpt={selectedOpt}
          correctAnswer={currentQuestion.answer}
          onSelect={handleOptionTap}
        />

        <FeedbackBanner answerState={answerState} streak={streak} />

        {answerState !== 'unanswered' && (
          <Pressable
            className='w-full bg-emerald-600 rounded-2xl py-3.5 items-center'
            onPress={handleNext}
          >
            <Text className='text-white font-bold text-base'>
              {currentIndex + 1 < totalQuestions ? 'Next →' : 'See results'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OppositeGame;
