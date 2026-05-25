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
import type { Phrase } from '../../constants/lessons/types';

interface PracticePhrasesPhaseProps {
  phrases: Phrase[];
  practicePhrasesIndex: number;
  step: 'listen' | 'say';
  onAdvance: () => void;
}

const CORRECT_DELAY_MS = 800;
const WRONG_DELAY_MS = 1000;
const SAY_READY_DELAY_MS = 2500;

function pickDistractors(phrases: Phrase[], currentIndex: number): Phrase[] {
  const pool = phrases.filter((_, i) => i !== currentIndex);
  if (pool.length === 0) return [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const picks: Phrase[] = [];
  for (let i = 0; i < 2; i++) {
    picks.push(shuffled[i % shuffled.length]);
  }
  return picks;
}

export function PracticePhrasesPhase({
  phrases,
  practicePhrasesIndex,
  step,
  onAdvance,
}: PracticePhrasesPhaseProps) {
  const insets = useSafeAreaInsets();
  const phrase = phrases[practicePhrasesIndex];
  const total = phrases.length;
  const [picked, setPicked] = useState<number | null>(null);
  const [canSayIt, setCanSayIt] = useState(false);

  const options = useMemo<Phrase[]>(() => {
    if (!phrase) return [];
    const distractors = pickDistractors(phrases, practicePhrasesIndex);
    return [phrase, ...distractors].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practicePhrasesIndex, step]);

  const correctIndex = options.findIndex((o) => o === phrase);

  useEffect(() => {
    setPicked(null);
  }, [practicePhrasesIndex, step]);

  useEffect(() => {
    if (step !== 'say') return;
    setCanSayIt(false);
    const t = setTimeout(() => setCanSayIt(true), SAY_READY_DELAY_MS);
    return () => clearTimeout(t);
  }, [practicePhrasesIndex, step]);

  useEffect(() => {
    if (!phrase) return;
    deviceTtsAudioService.play(phrase.kannada).catch((err) => {
      console.warn('[practice_phrases] auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [phrase?.kannada, step]);

  if (!phrase) return null;

  const handleReplay = () => {
    deviceTtsAudioService.play(phrase.kannada).catch((err) => {
      console.warn('[practice_phrases] replay failed', err);
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
          current={practicePhrasesIndex + 1}
          total={total}
          label={`Phrase ${practicePhrasesIndex + 1} of ${total} — ${step === 'listen' ? 'Listen' : 'Say it'}`}
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
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(18),
              color: Colors.onSurface,
              textAlign: 'center',
              marginBottom: Spacing.lg,
            }}
          >
            How do you say this?
          </Text>

          <View
            style={{
              backgroundColor: Colors.secondaryFixed,
              borderRadius: Radius.xl,
              paddingVertical: Spacing.lg,
              paddingHorizontal: Spacing.lg,
              marginBottom: Spacing.xl,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(16),
                color: Colors.onSecondaryContainer,
                textAlign: 'center',
              }}
            >
              {phrase.english}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: Colors.surfaceContainerLow,
              borderRadius: Radius.xl,
              paddingVertical: Spacing.xxl,
              paddingHorizontal: Spacing.lg,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.lora.italic,
                fontSize: moderateScale(26),
                lineHeight: moderateScale(36),
                color: Colors.onSurface,
                textAlign: 'center',
              }}
              maxFontSizeMultiplier={1.2}
              adjustsFontSizeToFit
              numberOfLines={3}
            >
              {phrase.transliteration}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSerifKannada.regular,
                fontSize: moderateScale(12),
                color: Colors.tertiary,
                textAlign: 'center',
                marginTop: Spacing.md,
                opacity: 0.7,
              }}
            >
              {phrase.kannada}
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginTop: Spacing.xxl }}>
            <Pressable
              onPress={handleReplay}
              accessibilityRole="button"
              accessibilityLabel="Replay audio"
              hitSlop={8}
              style={({ pressed }) => ({
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
          </View>
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
