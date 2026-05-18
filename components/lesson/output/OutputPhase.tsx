import { useCallback, useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { PhaseHeader } from '../PhaseHeader';
import { TypedResponse } from './TypedResponse';
import { SpokenResponse } from './SpokenResponse';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import { resolveImage } from '../../../constants/lessons/imageAssets';
import type { Lesson, Phrase, SelfRating } from '../../../constants/lessons/types';

type ResponseMode = 'type' | 'say';

interface OutputPhaseProps {
  lesson: Lesson;
  onAdvance: () => void;
}

function speakable(phrase: Phrase): string {
  return phrase.kannada.replace(/\[name\]/g, '').trim();
}

export function OutputPhase({ lesson, onAdvance }: OutputPhaseProps) {
  const insets = useSafeAreaInsets();
  const driver = lesson.output.driverLine;
  const expected = lesson.output.expectedResponse;
  const scenarioImage = resolveImage(lesson.situation.imageKey);

  const [mode, setMode] = useState<ResponseMode>('type');
  const [typedInput, setTypedInput] = useState('');
  const [typedMatched, setTypedMatched] = useState(false);
  const [sayRating, setSayRating] = useState<SelfRating | null>(null);
  const [revealed, setRevealed] = useState(false);

  // Auto-play the driver line on entry.
  useEffect(() => {
    deviceTtsAudioService.play(speakable(driver)).catch((err) => {
      console.warn('[audio] output driver auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [driver.id]);

  const handleHearAgain = () => {
    deviceTtsAudioService.play(speakable(driver)).catch((err) => {
      console.warn('[audio] output driver replay failed', err);
    });
  };

  const handleRated = useCallback((rating: SelfRating) => {
    setSayRating(rating);
  }, []);

  const canAdvance = mode === 'type' ? typedMatched : sayRating !== null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <PhaseHeader phase="output" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.lg,
          paddingBottom: Spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: 13,
            color: Colors.tertiary,
            letterSpacing: 0.5,
            textAlign: 'center',
            marginBottom: Spacing.md,
          }}
        >
          Now it's real.
        </Text>

        {scenarioImage ? (
          <Image
            source={scenarioImage}
            style={{
              width: '100%',
              height: 120,
              borderRadius: Radius.lg,
              marginBottom: Spacing.lg,
            }}
            resizeMode="cover"
            accessibilityLabel={lesson.situation.title}
          />
        ) : (
          <View
            style={{
              width: '100%',
              height: 100,
              borderRadius: Radius.lg,
              backgroundColor: Colors.secondaryFixed,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: Spacing.lg,
              paddingHorizontal: Spacing.md,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: 12,
                color: Colors.tertiary,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: Spacing.xs,
              }}
            >
              Scenario
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 14,
                color: Colors.onSecondaryContainer,
                textAlign: 'center',
              }}
            >
              {lesson.situation.title}
            </Text>
          </View>
        )}

        {/* Driver line — the cue */}
        <View
          style={{
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: Radius.lg,
            padding: Spacing.lg,
            marginBottom: Spacing.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.sm,
              marginBottom: Spacing.sm,
            }}
          >
            <Icons.audio size={14} color={Colors.tertiary} />
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: 12,
                color: Colors.tertiary,
                letterSpacing: 0.5,
              }}
            >
              They say:
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.regular,
              fontSize: 22,
              color: Colors.primaryContainer,
              lineHeight: 36,
              paddingTop: 4,
            }}
          >
            {driver.kannada}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: 14,
              color: Colors.tertiary,
              marginTop: Spacing.xs,
            }}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {driver.transliteration}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: 13,
              color: Colors.onSurface,
              marginTop: Spacing.sm,
            }}
          >
            {driver.english}
          </Text>

          <Pressable
            onPress={handleHearAgain}
            accessibilityRole="button"
            accessibilityLabel="Hear the driver line again"
            style={({ pressed }) => ({
              alignSelf: 'flex-start',
              marginTop: Spacing.md,
              backgroundColor: pressed ? Colors.surfaceContainerHigh : Colors.secondaryFixed,
              borderRadius: Radius.md,
              paddingVertical: Spacing.sm,
              paddingHorizontal: Spacing.md,
              minHeight: 44,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.sm,
            })}
          >
            <Icons.audio size={16} color={Colors.onSecondaryContainer} />
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 13, color: Colors.onSecondaryContainer }}>
              Hear again
            </Text>
          </Pressable>
        </View>

        {/* Your response */}
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 15,
            color: Colors.onSurface,
            marginBottom: Spacing.sm,
          }}
        >
          Say in Kannada: "{expected.english}"
        </Text>

        {/* Mode toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: Colors.surfaceContainerHigh,
            borderRadius: Radius.md,
            padding: 4,
            marginTop: Spacing.sm,
            marginBottom: Spacing.sm,
          }}
        >
          {(['type', 'say'] as const).map((m) => {
            const active = mode === m;
            return (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={m === 'type' ? 'Type it mode' : 'Say it mode'}
                style={{
                  flex: 1,
                  backgroundColor: active ? Colors.surfaceContainerHighest : 'transparent',
                  borderRadius: Radius.sm,
                  paddingVertical: Spacing.sm,
                  minHeight: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: 13,
                    color: active ? Colors.onSurface : Colors.tertiary,
                  }}
                >
                  {m === 'type' ? 'Type it' : 'Say it'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Both response panels stay mounted so toggling preserves state. */}
        <View style={{ display: mode === 'type' ? 'flex' : 'none' }}>
          <TypedResponse
            expected={expected}
            value={typedInput}
            onChangeValue={setTypedInput}
            onMatchChange={setTypedMatched}
          />
        </View>
        <View style={{ display: mode === 'say' ? 'flex' : 'none' }}>
          <SpokenResponse expected={expected} onRated={handleRated} />
        </View>

        {/* Reveal answer — always visible */}
        <Pressable
          onPress={() => setRevealed((r) => !r)}
          accessibilityRole="button"
          accessibilityLabel={revealed ? 'Hide answer' : 'Reveal answer'}
          style={{ marginTop: Spacing.lg, alignSelf: 'center', minHeight: 44, justifyContent: 'center', paddingHorizontal: Spacing.md }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 13,
              color: Colors.primaryContainer,
              textDecorationLine: 'underline',
            }}
          >
            {revealed ? 'Hide answer' : 'Reveal answer'}
          </Text>
        </Pressable>

        {revealed && (
          <View
            style={{
              backgroundColor: Colors.secondaryFixed,
              borderRadius: Radius.lg,
              padding: Spacing.lg,
              marginTop: Spacing.md,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.notoSerifKannada.regular,
                fontSize: 22,
                color: Colors.primaryContainer,
                lineHeight: 36,
                paddingTop: 4,
              }}
            >
              {expected.kannada}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.lora.italic,
                fontSize: 14,
                color: Colors.onSecondaryContainer,
                marginTop: Spacing.xs,
              }}
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.75}
            >
              {expected.transliteration}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          onPress={canAdvance ? onAdvance : undefined}
          disabled={!canAdvance}
          accessibilityRole="button"
          accessibilityLabel="Mark as done"
          style={({ pressed }) => ({
            backgroundColor: !canAdvance
              ? Colors.surfaceDim
              : pressed
                ? Colors.primary
                : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + 2,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed && canAdvance ? 0.96 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 15, color: Colors.onPrimary }}>
            I'm done →
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
