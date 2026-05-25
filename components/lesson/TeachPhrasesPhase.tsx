import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { LessonProgressBar } from './LessonProgressBar';
import type { Phrase, Word } from '../../constants/lessons/types';

interface TeachPhrasesPhaseProps {
  phrases: Phrase[];
  words: Word[];
  phraseIndex: number;
  onAdvance: () => void;
}

const HIGHLIGHT_MS = 600;

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/[?.,!]+$/g, '');
}

export function TeachPhrasesPhase({
  phrases,
  words,
  phraseIndex,
  onAdvance,
}: TeachPhrasesPhaseProps) {
  const insets = useSafeAreaInsets();
  const phrase = phrases[phraseIndex];
  const total = phrases.length;
  const isLast = phraseIndex >= total - 1;
  const [highlightedChip, setHighlightedChip] = useState<number | null>(null);

  const chips = useMemo(() => {
    if (!phrase) return [];
    return phrase.transliteration.split(/\s+/).filter(Boolean).map((chip) => {
      const match = words.find((w) => normalize(w.transliteration) === normalize(chip));
      return { chip, match };
    });
  }, [phrase, words]);

  useEffect(() => {
    if (!phrase) return;
    deviceTtsAudioService.play(phrase.kannada).catch((err) => {
      console.warn('[teach_phrases] auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [phrase?.kannada]);

  if (!phrase) return null;

  const handleReplay = () => {
    deviceTtsAudioService.play(phrase.kannada).catch((err) => {
      console.warn('[teach_phrases] replay failed', err);
      Toasts.audioFailed(handleReplay);
    });
  };

  const handleChipTap = (idx: number, kannadaText: string) => {
    if (!kannadaText) return;
    setHighlightedChip(idx);
    deviceTtsAudioService.play(kannadaText).catch(() => undefined);
    setTimeout(() => setHighlightedChip((cur) => (cur === idx ? null : cur)), HIGHLIGHT_MS);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ paddingTop: insets.top + Spacing.lg, paddingHorizontal: Spacing.lg }}>
        <LessonProgressBar
          current={phraseIndex + 1}
          total={total}
          label={`Phrase ${phraseIndex + 1} of ${total}`}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xl,
          paddingBottom: Spacing.lg,
        }}
      >
        {/* Word chips row */}
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: Spacing.sm,
            marginBottom: Spacing.xl,
            justifyContent: 'center',
          }}
        >
          {chips.map((c, idx) => {
            const isHighlighted = highlightedChip === idx;
            return (
              <Pressable
                key={`${c.chip}-${idx}`}
                onPress={() => handleChipTap(idx, c.match?.kannada ?? '')}
                disabled={!c.match?.kannada}
                accessibilityRole="button"
                accessibilityLabel={`Hear ${c.chip}`}
                style={({ pressed }) => ({
                  backgroundColor: isHighlighted
                    ? Colors.secondaryFixed
                    : pressed
                      ? Colors.surfaceContainerHigh
                      : Colors.surfaceContainerHighest,
                  borderRadius: Radius.md,
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                  alignItems: 'center',
                  minWidth: moderateScale(64),
                })}
              >
                <Text
                  style={{
                    fontFamily: Fonts.lora.italic,
                    fontSize: moderateScale(15),
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {c.chip}
                </Text>
                {c.match ? (
                  <Text
                    style={{
                      fontFamily: Fonts.notoSerifKannada.regular,
                      fontSize: moderateScale(11),
                      color: Colors.tertiary,
                      marginTop: moderateScale(2),
                    }}
                    maxFontSizeMultiplier={1.3}
                  >
                    {c.match.kannada}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>

        {/* Full phrase display */}
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
              fontSize: moderateScale(28),
              lineHeight: moderateScale(38),
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
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {phrase.english}
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
            maxFontSizeMultiplier={1.3}
          >
            {phrase.kannada}
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: Spacing.xxl }}>
          <Pressable
            onPress={handleReplay}
            accessibilityRole="button"
            accessibilityLabel="Hear the full phrase again"
            hitSlop={8}
            style={({ pressed }) => ({
              width: moderateScale(64),
              height: moderateScale(64),
              borderRadius: Radius.full,
              backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
          >
            <Icons.audio size={moderateScale(26)} color={Colors.onPrimary} />
          </Pressable>
        </View>

        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            color: Colors.tertiary,
            textAlign: 'center',
            marginTop: Spacing.lg,
          }}
        >
          Tap a word to hear it on its own
        </Text>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Start practising phrases' : 'Got it, next phrase'}
          onPress={onAdvance}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + moderateScale(2),
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
            minHeight: moderateScale(44),
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.onPrimary,
            }}
          >
            {isLast ? 'Start practising phrases' : 'Got it'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
