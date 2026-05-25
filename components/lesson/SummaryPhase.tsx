import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import type { Phrase, Word } from '../../constants/lessons/types';

interface SummaryPhaseProps {
  words: Word[];
  phrases: Phrase[];
  onAdvance: () => void;
}

export function SummaryPhase({ words, phrases, onAdvance }: SummaryPhaseProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: insets.top + Spacing.xxxl,
          paddingBottom: Spacing.lg,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(24),
            color: Colors.onSurface,
            marginBottom: Spacing.xl,
          }}
        >
          What you learned
        </Text>

        <SectionLabel label="Words" />
        <View style={{ gap: Spacing.sm, marginBottom: Spacing.xl }}>
          {words.map((w, i) => (
            <SummaryRow
              key={`w-${i}`}
              transliteration={w.transliteration}
              english={w.english}
              kannada={w.kannada}
            />
          ))}
        </View>

        <SectionLabel label="Phrases" />
        <View style={{ gap: Spacing.sm }}>
          {phrases.map((p, i) => (
            <SummaryRow
              key={`p-${i}`}
              transliteration={p.transliteration}
              english={p.english}
              kannada={p.kannada}
            />
          ))}
        </View>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
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
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontFamily: Fonts.dmSans.bold,
        fontSize: moderateScale(11),
        letterSpacing: 2,
        color: Colors.tertiary,
        textTransform: 'uppercase',
        marginBottom: Spacing.md,
      }}
      maxFontSizeMultiplier={1.4}
    >
      {label}
    </Text>
  );
}

function SummaryRow({
  transliteration,
  english,
  kannada,
}: {
  transliteration: string;
  english: string;
  kannada: string;
}) {
  const handlePlay = () => {
    deviceTtsAudioService.play(kannada).catch(() => undefined);
  };
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.lora.italic,
            fontSize: moderateScale(15),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {transliteration}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.regular,
            fontSize: moderateScale(12),
            color: Colors.tertiary,
            marginTop: moderateScale(2),
            opacity: 0.7,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {kannada}
        </Text>
      </View>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(13),
          color: Colors.tertiary,
          flexShrink: 1,
          textAlign: 'right',
          maxWidth: '40%',
        }}
        numberOfLines={2}
        maxFontSizeMultiplier={1.3}
      >
        {english}
      </Text>
      <Pressable
        onPress={handlePlay}
        accessibilityRole="button"
        accessibilityLabel={`Hear ${english}`}
        hitSlop={8}
        style={({ pressed }) => ({
          width: moderateScale(36),
          height: moderateScale(36),
          borderRadius: Radius.full,
          backgroundColor: pressed ? Colors.surfaceContainerHigh : Colors.secondaryFixed,
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Icons.audio size={moderateScale(16)} color={Colors.onSecondaryContainer} />
      </Pressable>
    </View>
  );
}
