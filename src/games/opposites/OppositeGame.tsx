import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { useOppositesItems, useRecordOppositesAttempt } from '../../../hooks/games/opposites';
import { useGameState } from './hooks/useGameState';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import OptionGrid from './components/OptionGrid';
import FeedbackBanner from './components/FeedbackBanner';
import ResultScreen from './components/ResultScreen';
import { ExitBackButton } from '@/components/ui/ExitBackButton';
import type { QuestionPair } from './types';
import type { OppositesItem } from '../../../services/api/games/opposites';

type Props = { lessonNo: number };

function toPair(item: OppositesItem): QuestionPair {
  return {
    id: item.id,
    word: item.word,
    tr: item.transliteration ?? '',
    meaning: item.meaning ?? '',
    answer: item.opposite,
    opts: item.options,
  };
}

const OppositeGame: React.FC<Props> = ({ lessonNo }) => {
  const { data: items, isLoading, isError, refetch } = useOppositesItems(lessonNo);

  const pairs = useMemo<QuestionPair[]>(
    () => (items ?? []).map(toPair),
    [items],
  );

  if (isLoading) {
    return <CenteredLoading />;
  }
  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }
  if (pairs.length === 0) {
    return <EmptyState lessonNo={lessonNo} />;
  }
  return <OppositeGameInner pairs={pairs} />;
};

function OppositeGameInner({ pairs }: { pairs: QuestionPair[] }) {
  const recordAttempt = useRecordOppositesAttempt();

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
    hintUsed,
    handleOptionTap,
    handleNext,
    useHint,
    restart,
  } = useGameState(pairs, ({ itemId, isCorrect }) => {
    // Fire-and-forget. Server preserves personal-best on conflict; transient
    // failures shouldn't disrupt play.
    recordAttempt.mutate(
      { itemId, isCorrect },
      { onError: (err) => console.warn('[opposites] record attempt failed', err) },
    );
  });

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
          hintUsed={hintUsed}
          isAnswered={answerState !== 'unanswered'}
          onHint={useHint}
        />

        <OptionGrid
          opts={shuffledOpts}
          answerState={answerState}
          selectedOpt={selectedOpt}
          correctAnswer={currentQuestion.answer}
          onSelect={handleOptionTap}
        />

        <FeedbackBanner answerState={answerState} streak={streak} hintUsed={hintUsed} />

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
}

function CenteredLoading() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    </SafeAreaView>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          gap: Spacing.md,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
        >
          Couldn&apos;t load this round
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            textAlign: 'center',
            marginBottom: Spacing.md,
          }}
        >
          Check your connection and try again.
        </Text>
        <Pressable
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry"
          style={({ pressed }) => ({
            backgroundColor: Colors.primary,
            borderRadius: Radius.lg,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xl,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: Colors.onPrimary }}>
            Retry
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={({ pressed }) => ({
            paddingVertical: Spacing.sm,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(13), color: Colors.tertiary }}>
            Back
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function EmptyState({ lessonNo }: { lessonNo: number }) {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: Spacing.xxl,
          gap: Spacing.md,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
        >
          Lesson {lessonNo} — coming soon
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            textAlign: 'center',
            lineHeight: moderateScale(20),
            marginBottom: Spacing.md,
          }}
        >
          No opposites items have been authored for this lesson yet. Try an earlier lesson.
        </Text>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back to lessons"
          style={({ pressed }) => ({
            backgroundColor: Colors.primary,
            borderRadius: Radius.lg,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xl,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: Colors.onPrimary }}>
            Back to lessons
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export default OppositeGame;
