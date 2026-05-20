import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { useGameState } from './hooks/useGameState';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import OptionGrid from './components/OptionGrid';
import FeedbackBanner from './components/FeedbackBanner';
import ResultScreen from './components/ResultScreen';
import { ExitBackButton } from '@/components/ui/ExitBackButton';

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
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <ExitBackButton skipConfirm />
        <ResultScreen score={score} total={totalQuestions} onReplay={restart} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.lg,
          gap: Spacing.lg,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: Spacing.md,
          }}
        >
          <ExitBackButton floating={false} variant="game" />
          <Text
            style={{
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              fontFamily: Fonts.dmSans.regular,
            }}
          >
            Question {currentIndex + 1} / {totalQuestions}
          </Text>
          <Text
            style={{
              fontSize: moderateScale(14),
              fontFamily: Fonts.dmSans.bold,
              color: Colors.onSurface,
            }}
          >
            Score {score}
          </Text>
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
            style={{
              width: '100%',
              backgroundColor: Colors.primary,
              borderRadius: Radius.xl,
              paddingVertical: moderateScale(14),
              alignItems: 'center',
            }}
            onPress={handleNext}
          >
            <Text
              style={{
                color: Colors.onPrimary,
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(16),
              }}
            >
              {currentIndex + 1 < totalQuestions ? 'Next →' : 'See results'}
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default OppositeGame;
