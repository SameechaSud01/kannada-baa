import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { LessonProgressBar } from './LessonProgressBar';
import type { Word } from '../../constants/lessons/types';

interface PracticeWordsPhaseProps {
  words: Word[];
  practiceWordIndex: number;
  step: 'listen' | 'say';
  onAdvance: () => void;
}

const CORRECT_DELAY_MS = 800;
const WRONG_DELAY_MS = 1000;
const SAY_READY_DELAY_MS = 1800;

function pickDistractors(words: Word[], currentIndex: number): Word[] {
  const pool = words.filter((_, i) => i !== currentIndex);
  if (pool.length === 0) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picks: Word[] = [];
  for (let i = 0; i < 2; i++) {
    picks.push(shuffled[i % shuffled.length]);
  }
  return picks;
}

export function PracticeWordsPhase({
  words,
  practiceWordIndex,
  step,
  onAdvance,
}: PracticeWordsPhaseProps) {
  const insets = useSafeAreaInsets();
  const word = words[practiceWordIndex];
  const total = words.length;

  const [picked, setPicked] = useState<number | null>(null);
  const [canSayIt, setCanSayIt] = useState(false);
  const options = useMemo<Word[]>(() => {
    if (!word) return [];
    const distractors = pickDistractors(words, practiceWordIndex);
    const all = [word, ...distractors];
    return all.sort(() => Math.random() - 0.5);
    // re-shuffle on each new word + step entry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceWordIndex, step]);

  const correctIndex = options.findIndex((o) => o === word);

  useEffect(() => {
    setPicked(null);
  }, [practiceWordIndex, step]);

  useEffect(() => {
    if (step !== 'say') return;
    setCanSayIt(false);
    const t = setTimeout(() => setCanSayIt(true), SAY_READY_DELAY_MS);
    return () => clearTimeout(t);
  }, [practiceWordIndex, step]);

  useEffect(() => {
    if (!word) return;
    deviceTtsAudioService.play(word.kannada).catch((err) => {
      console.warn('[practice_words] auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [word?.kannada, step]);

  if (!word) return null;

  const handleReplay = () => {
    deviceTtsAudioService.play(word.kannada).catch((err) => {
      console.warn('[practice_words] replay failed', err);
    });
  };

  const handlePickOption = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    const isCorrect = idx === correctIndex;
    setTimeout(() => {
      onAdvance();
    }, isCorrect ? CORRECT_DELAY_MS : WRONG_DELAY_MS);
  };

  const handleISaidIt = () => {
    onAdvance();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ paddingTop: insets.top + Spacing.lg, paddingHorizontal: Spacing.lg }}>
        <LessonProgressBar
          current={practiceWordIndex + 1}
          total={total}
          label={`Word ${practiceWordIndex + 1} of ${total} — ${step === 'listen' ? 'Listen' : 'Say it'}`}
        />
      </View>

      {step === 'listen' ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.lg,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: Spacing.xxl }}>
            <Pressable
              onPress={handleReplay}
              accessibilityRole="button"
              accessibilityLabel="Replay audio"
              hitSlop={8}
              style={({ pressed }) => ({
                width: moderateScale(72),
                height: moderateScale(72),
                borderRadius: Radius.full,
                backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
                alignItems: 'center',
                justifyContent: 'center',
                transform: [{ scale: pressed ? 0.94 : 1 }],
              })}
            >
              <Icons.audio size={moderateScale(30)} color={Colors.onPrimary} />
            </Pressable>
          </View>

          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(20),
              color: Colors.onSurface,
              textAlign: 'center',
              marginBottom: Spacing.xl,
            }}
          >
            What does this mean?
          </Text>

          <View style={{ gap: Spacing.md }}>
            {options.map((opt, idx) => {
              const isPicked = picked === idx;
              const isCorrect = idx === correctIndex;
              const reveal = picked !== null;
              let bg = Colors.surfaceContainerHighest;
              let fg = Colors.onSurface;
              if (reveal && isCorrect) {
                bg = Colors.secondaryContainer;
                fg = Colors.onSecondaryContainer;
              } else if (reveal && isPicked && !isCorrect) {
                bg = Colors.errorContainerLow;
                fg = Colors.primary;
              }
              return (
                <Pressable
                  key={`${opt.english}-${idx}`}
                  onPress={() => handlePickOption(idx)}
                  disabled={picked !== null}
                  accessibilityRole="button"
                  accessibilityLabel={opt.english}
                  style={({ pressed }) => ({
                    backgroundColor: bg,
                    borderRadius: Radius.lg,
                    paddingVertical: Spacing.lg,
                    paddingHorizontal: Spacing.lg,
                    minHeight: moderateScale(56),
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ scale: pressed && picked === null ? 0.98 : 1 }],
                  })}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.medium,
                      fontSize: moderateScale(15),
                      color: fg,
                      textAlign: 'center',
                    }}
                  >
                    {opt.english}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xxl,
            paddingBottom: Spacing.lg,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: Colors.surfaceContainerLow,
              borderRadius: Radius.xl,
              paddingVertical: Spacing.xxxl,
              paddingHorizontal: Spacing.lg,
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.lora.italic,
                fontSize: moderateScale(38),
                lineHeight: moderateScale(50),
                color: Colors.onSurface,
                textAlign: 'center',
              }}
              maxFontSizeMultiplier={1.2}
              adjustsFontSizeToFit
              numberOfLines={2}
            >
              {word.transliteration}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(16),
                color: Colors.tertiary,
                textAlign: 'center',
                marginTop: Spacing.md,
              }}
            >
              {word.english}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSerifKannada.regular,
                fontSize: moderateScale(13),
                color: Colors.tertiary,
                textAlign: 'center',
                marginTop: Spacing.lg,
                opacity: 0.7,
              }}
            >
              {word.kannada}
            </Text>
          </View>

          <Pressable
            onPress={handleReplay}
            accessibilityRole="button"
            accessibilityLabel="Replay audio"
            hitSlop={8}
            style={({ pressed }) => ({
              marginTop: Spacing.xxl,
              width: moderateScale(56),
              height: moderateScale(56),
              borderRadius: Radius.full,
              backgroundColor: pressed ? Colors.surfaceContainerHigh : Colors.surfaceContainerHighest,
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <Icons.audio size={moderateScale(24)} color={Colors.primary} />
          </Pressable>

          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.onSurface,
              marginTop: Spacing.xl,
              textAlign: 'center',
            }}
          >
            Say it out loud
          </Text>
        </ScrollView>
      )}

      {step === 'say' && (
        <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="I said it"
            onPress={handleISaidIt}
            disabled={!canSayIt}
            style={({ pressed }) => ({
              backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
              borderRadius: Radius.md,
              paddingVertical: Spacing.md + moderateScale(2),
              alignItems: 'center',
              transform: [{ scale: pressed ? 0.96 : 1 }],
              minHeight: moderateScale(44),
              justifyContent: 'center',
              opacity: canSayIt ? 1 : 0.5,
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(15),
                color: Colors.onPrimary,
              }}
            >
              I said it
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
