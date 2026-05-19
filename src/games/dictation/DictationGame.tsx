import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius, Spacing } from '../../../constants/spacing';
import { useDictationGame } from './hooks/useDictationGame';
import ProgressBar from './components/ProgressBar';
import AudioButton from './components/AudioButton';
import AnswerInput from './components/AnswerInput';
import FeedbackCard from './components/FeedbackCard';
import ResultScreen from './components/ResultScreen';
import { ExitBackButton } from '../../../components/ui/ExitBackButton';

export default function DictationGame() {
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
  } = useDictationGame();

  const [inputText, setInputText] = useState('');

  useEffect(() => {
    setInputText('');
  }, [currentIndex]);

  const handleSubmit = () => submitAnswer(inputText);

  if (phase === 'result') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
        <ExitBackButton />
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
          <ExitBackButton
            floating={false}
            message="Exit this game? You'll lose your progress."
          />
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
