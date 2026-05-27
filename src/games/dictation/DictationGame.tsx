import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius, Spacing } from '../../../constants/spacing';
import { useDictationItems, useRecordDictationAttempt } from '../../../hooks/games/dictation';
import { useDictationGame } from './hooks/useDictationGame';
import ProgressBar from './components/ProgressBar';
import AudioButton from './components/AudioButton';
import AnswerInput from './components/AnswerInput';
import FeedbackCard from './components/FeedbackCard';
import ResultScreen from './components/ResultScreen';
import { ExitBackButton } from '../../../components/ui/ExitBackButton';
import type { DictationWord } from './types';
import type { DictationItem } from '../../../services/api/games/dictation';

type Props = { lessonNo: number };

function toWord(item: DictationItem): DictationWord {
  return {
    id: item.id,
    kn: item.expectedAnswer,
    accepted: item.acceptedSpellings,
    phonetic: item.phonetic ?? '',
  };
}

export default function DictationGame({ lessonNo }: Props) {
  const { data: items, isLoading, isError, refetch } = useDictationItems(lessonNo);

  const bank = useMemo<DictationWord[]>(() => (items ?? []).map(toWord), [items]);

  if (isLoading) return <CenteredLoading />;
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (bank.length === 0) return <EmptyState lessonNo={lessonNo} />;
  return <DictationGameInner bank={bank} />;
}

function DictationGameInner({ bank }: { bank: DictationWord[] }) {
  const recordAttempt = useRecordDictationAttempt();

  const {
    currentWord,
    currentIndex,
    totalWords,
    phase,
    answerState,
    lastScore,
    sessionAvg,
    answeredCount,
    isPlaying,
    playCurrentWord,
    submitAnswer,
    nextWord,
    skipWord,
    restart,
  } = useDictationGame(bank, ({ itemId, isCorrect }) => {
    recordAttempt.mutate(
      { itemId, isCorrect },
      { onError: (err) => console.warn('[dictation] record attempt failed', err) },
    );
  });

  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setInputText('');
  }, [currentIndex]);

  const handleSubmit = () => submitAnswer(inputText);

  if (phase === 'result') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <ExitBackButton skipConfirm />
        <ResultScreen
          sessionAvg={sessionAvg}
          answeredCount={answeredCount}
          totalWords={totalWords}
          onReplay={restart}
        />
      </SafeAreaView>
    );
  }

  const canSubmit = inputText.trim().length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.lg, gap: Spacing.lg }}>

        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md }}>
          <ExitBackButton floating={false} variant="game" />
          <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 14, color: Colors.tertiary }}>
            Word{' '}
            <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
              {currentIndex + 1}
            </Text>
            {' '}/ {totalWords}
          </Text>
          <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: 14, color: Colors.tertiary }}>
            Avg{' '}
            <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
              {answeredCount > 0 ? `${sessionAvg}%` : '—'}
            </Text>
          </Text>
        </View>

        <ProgressBar current={currentIndex} total={totalWords} />

        {/* Audio card */}
        <View
          style={{
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: Radius.xl,
            padding: Spacing.xxl,
            alignItems: 'center',
            gap: Spacing.md,
          }}
        >
          <AudioButton isPlaying={isPlaying} onPress={playCurrentWord} />
        </View>

        <AnswerInput
          value={inputText}
          onChange={setInputText}
          onSubmit={handleSubmit}
          answerState={answerState}
          disabled={answerState !== 'unanswered'}
        />

        {answerState !== 'unanswered' && (
          <FeedbackCard
            answerState={answerState}
            score={lastScore ?? 0}
            accepted={currentWord.accepted}
            kannadaWord={currentWord.kn}
          />
        )}

        {/* Check / Next */}
        {answerState === 'unanswered' ? (
          <Pressable
            onPress={handleSubmit}
            disabled={!canSubmit}
            style={({ pressed }) => ({
              backgroundColor: Colors.primary,
              borderRadius: Radius.lg,
              paddingVertical: Spacing.lg,
              alignItems: 'center',
              opacity: !canSubmit ? 0.4 : pressed ? 0.88 : 1,
            })}
          >
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 16, color: Colors.onPrimary }}>
              check answer
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={nextWord}
            style={({ pressed }) => ({
              backgroundColor: Colors.primary,
              borderRadius: Radius.lg,
              paddingVertical: Spacing.lg,
              alignItems: 'center',
              opacity: pressed ? 0.88 : 1,
            })}
          >
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: 16, color: Colors.onPrimary }}>
              {currentIndex + 1 < totalWords ? 'next word →' : 'see results'}
            </Text>
          </Pressable>
        )}

        {/* Skip */}
        {answerState === 'unanswered' && (
          <Pressable onPress={skipWord} style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: 12,
                color: Colors.tertiary,
                textDecorationLine: 'underline',
              }}
            >
              skip this word
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md }}>
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(18), color: Colors.onSurface, textAlign: 'center' }}>
          Couldn&apos;t load this round
        </Text>
        <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(14), color: Colors.tertiary, textAlign: 'center', marginBottom: Spacing.md }}>
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
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: Colors.onPrimary }}>Retry</Text>
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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xxl, gap: Spacing.md }}>
        <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(18), color: Colors.onSurface, textAlign: 'center' }}>
          Lesson {lessonNo} — coming soon
        </Text>
        <Text style={{ fontFamily: Fonts.dmSans.regular, fontSize: moderateScale(14), color: Colors.tertiary, textAlign: 'center', lineHeight: moderateScale(20), marginBottom: Spacing.md }}>
          No dictation words have been authored for this lesson yet. Try an earlier lesson.
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
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(14), color: Colors.onPrimary }}>Back to lessons</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
