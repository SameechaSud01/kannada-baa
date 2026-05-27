import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { useImageMatchItems, useRecordImageMatchAttempt } from '../../../hooks/games/imageMatch';
import { useImageMatch } from './hooks/useImageMatch';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import PictureOptionGrid from './components/PictureOptionGrid';
import WordOptionList from './components/WordOptionList';
import FeedbackBanner from './components/FeedbackBanner';
import ResultScreen from './components/ResultScreen';
import { ExitBackButton } from '@/components/ui/ExitBackButton';
import type { VocabItem } from './types';
import type { ImageMatchItem } from '../../../services/api/games/imageMatch';

type Props = { lessonNo: number };

const PLACEHOLDER_EMOJI = '🔤';

function toVocab(item: ImageMatchItem): VocabItem {
  return {
    id: item.id,
    kn: item.kannada,
    ph: item.transliteration ?? '',
    en: item.meaning,
    emoji: item.emoji ?? PLACEHOLDER_EMOJI,
  };
}

const ImageMatchGame: React.FC<Props> = ({ lessonNo }) => {
  // Fetch lesson's items + a fallback pool from neighboring lessons for
  // distractor sampling when the lesson has < 4 items (e.g. L1 has 1).
  const target = useImageMatchItems(lessonNo);
  const neighbor1 = useImageMatchItems(lessonNo > 1 ? lessonNo - 1 : null);
  const neighbor2 = useImageMatchItems(lessonNo > 2 ? lessonNo - 2 : null);

  const targetBank = useMemo<VocabItem[]>(
    () => (target.data ?? []).map(toVocab),
    [target.data],
  );

  const distractorBank = useMemo<VocabItem[]>(() => {
    const all = [
      ...(target.data ?? []),
      ...(neighbor1.data ?? []),
      ...(neighbor2.data ?? []),
    ];
    // de-dupe by id
    const seen = new Set<string>();
    const dedup: ImageMatchItem[] = [];
    for (const item of all) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      dedup.push(item);
    }
    return dedup.map(toVocab);
  }, [target.data, neighbor1.data, neighbor2.data]);

  if (target.isLoading) return <CenteredLoading />;
  if (target.isError) return <ErrorState onRetry={() => target.refetch()} />;
  if (targetBank.length === 0) return <EmptyState lessonNo={lessonNo} />;

  return <ImageMatchGameInner targetBank={targetBank} distractorBank={distractorBank} />;
};

function ImageMatchGameInner({
  targetBank,
  distractorBank,
}: {
  targetBank: VocabItem[];
  distractorBank: VocabItem[];
}) {
  const recordAttempt = useRecordImageMatchAttempt();

  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    phase,
    answered,
    selectedId,
    score,
    hintVisible,
    handleOptionTap,
    handleNext,
    toggleHint,
    restart,
  } = useImageMatch(targetBank, distractorBank, ({ itemId, isCorrect }) => {
    recordAttempt.mutate(
      { itemId, isCorrect },
      { onError: (err) => console.warn('[image-match] record attempt failed', err) },
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
          question={currentQuestion}
          hintVisible={hintVisible}
          onHintPress={toggleHint}
        />

        {currentQuestion.type === 'word-to-picture' ? (
          <PictureOptionGrid
            options={currentQuestion.options}
            targetId={currentQuestion.target.id}
            selectedId={selectedId}
            answered={answered}
            onSelect={handleOptionTap}
          />
        ) : (
          <WordOptionList
            options={currentQuestion.options}
            targetId={currentQuestion.target.id}
            selectedId={selectedId}
            answered={answered}
            hintVisible={hintVisible}
            onSelect={handleOptionTap}
          />
        )}

        <FeedbackBanner
          answered={answered}
          correct={selectedId === currentQuestion.target.id}
        />

        {answered && (
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
        <Pressable onPress={() => router.back()} style={({ pressed }) => ({ paddingVertical: Spacing.sm, opacity: pressed ? 0.6 : 1 })}>
          <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(13), color: Colors.tertiary }}>Back</Text>
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
          No image-match items have been authored for this lesson yet. Try an earlier lesson.
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

export default ImageMatchGame;
