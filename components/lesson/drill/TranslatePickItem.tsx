import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import { DrillFeedback, type DrillResult } from './DrillFeedback';
import type { Phrase } from '../../../constants/lessons/types';

const AUTO_ADVANCE_MS = 1000;

interface TranslatePickItemProps {
  target: Phrase;
  distractors: Phrase[];
  onResolve: (correct: boolean) => void;
}

function speakable(phrase: Phrase): string {
  return phrase.kannada.replace(/\[name\]/g, '').trim();
}

function shuffle<T>(arr: T[]): T[] {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function TranslatePickItem({ target, distractors, onResolve }: TranslatePickItemProps) {
  const insets = useSafeAreaInsets();
  const options = useMemo(() => shuffle([target, ...distractors]), [target.id]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [result, setResult] = useState<DrillResult>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Cleanup audio when item changes / unmounts.
  useEffect(() => {
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [target.id]);

  // Auto-advance on correct.
  useEffect(() => {
    if (result !== 'correct') return;
    const timer = setTimeout(() => onResolve(true), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [result, onResolve]);

  const handleSelect = (id: string) => {
    if (result) return;
    setSelectedId(id);
  };

  const handlePreview = (phrase: Phrase) => {
    deviceTtsAudioService.play(speakable(phrase)).catch((err) => {
      console.warn('[audio] translate_pick preview failed', err);
    });
  };

  const handleConfirm = () => {
    if (!selectedId || result) return;
    if (selectedId === target.id) {
      setResult('correct');
    } else {
      setResult('incorrect');
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xl,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 22,
            color: Colors.onSurface,
            textAlign: 'center',
            lineHeight: 30,
            marginBottom: Spacing.sm,
          }}
        >
          {target.english}
        </Text>

        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: 13,
            color: Colors.tertiary,
            textAlign: 'center',
            marginBottom: Spacing.xl,
            letterSpacing: 0.3,
          }}
        >
          Which is the Kannada?
        </Text>

        <View style={{ gap: Spacing.md }}>
          {options.map((opt) => {
            const isSelected = selectedId === opt.id;
            const isCorrect = opt.id === target.id;
            const showRight = result !== null && isCorrect;
            const showWrong = result === 'incorrect' && isSelected && !isCorrect;
            const locked = result !== null;
            const wiggle = showWrong ? { transform: [{ translateX: shakeAnim }] } : null;

            return (
              <Animated.View key={opt.id} style={wiggle}>
                <Pressable
                  onPress={() => handleSelect(opt.id)}
                  disabled={locked}
                  accessibilityRole="button"
                  accessibilityLabel={`${opt.transliteration}, ${opt.kannada}`}
                  accessibilityState={{ selected: isSelected, disabled: locked }}
                  style={({ pressed }) => ({
                    backgroundColor: showRight
                      ? Colors.secondaryFixed
                      : showWrong
                        ? Colors.surfaceContainerHigh
                        : isSelected
                          ? Colors.secondaryFixed
                          : pressed
                            ? Colors.surfaceContainerHigh
                            : Colors.surfaceContainerHighest,
                    borderWidth: showRight || showWrong || isSelected ? 2 : 1,
                    borderColor:
                      showRight || showWrong || isSelected ? Colors.primaryContainer : Colors.outlineVariant,
                    borderRadius: Radius.lg,
                    paddingVertical: Spacing.md,
                    paddingHorizontal: Spacing.lg,
                    minHeight: 64,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: Spacing.md,
                  })}
                >
                  <View style={{ flexShrink: 1 }}>
                    <Text
                      style={{
                        fontFamily: Fonts.notoSerifKannada.regular,
                        fontSize: 20,
                        color: showWrong ? Colors.tertiary : Colors.primaryContainer,
                        lineHeight: 32,
                        paddingTop: 4,
                      }}
                    >
                      {opt.kannada}
                    </Text>
                    <Text
                      style={{
                        fontFamily: Fonts.lora.italic,
                        fontSize: 13,
                        color: showWrong ? Colors.tertiary : Colors.tertiary,
                        marginTop: 2,
                      }}
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      minimumFontScale={0.75}
                    >
                      {opt.transliteration}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    {showRight && (
                      <Icons.correct size={20} color={Colors.primaryContainer} />
                    )}
                    {showWrong && (
                      <Icons.close size={20} color={Colors.primaryContainer} />
                    )}
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handlePreview(opt);
                      }}
                      accessibilityRole="button"
                      accessibilityLabel={`Play ${opt.transliteration}`}
                      hitSlop={8}
                      style={({ pressed }) => ({
                        backgroundColor: pressed ? Colors.surfaceContainerHigh : Colors.secondaryFixed,
                        borderRadius: Radius.full,
                        width: 38,
                        height: 38,
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                    >
                      <Icons.audio size={16} color={Colors.onSecondaryContainer} />
                    </Pressable>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        {result === 'correct' && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: Spacing.sm,
              marginTop: Spacing.lg,
            }}
          >
            <Icons.correct size={16} color={Colors.primaryContainer} />
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: 13,
                color: Colors.primaryContainer,
              }}
            >
              Correct
            </Text>
          </View>
        )}
      </ScrollView>

      {result === null ? (
        <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
          <Pressable
            onPress={handleConfirm}
            disabled={!selectedId}
            accessibilityRole="button"
            accessibilityLabel="Confirm answer"
            style={({ pressed }) => ({
              backgroundColor: !selectedId
                ? Colors.surfaceDim
                : pressed
                  ? Colors.primary
                  : Colors.primaryContainer,
              borderRadius: Radius.md,
              paddingVertical: Spacing.md + 2,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed && selectedId ? 0.96 : 1 }],
            })}
          >
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 15, color: Colors.onPrimary }}>
              Confirm
            </Text>
          </Pressable>
        </View>
      ) : (
        <DrillFeedback
          result={result}
          correctPhrase={target}
          onContinue={() => onResolve(false)}
        />
      )}
    </View>
  );
}
