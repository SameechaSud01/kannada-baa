import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import type { Phrase } from '../../../constants/lessons/types';

export type DrillResult = 'correct' | 'incorrect' | null;

interface DrillFeedbackProps {
  result: DrillResult;
  correctPhrase: Phrase;
  onContinue: () => void;
}

function speakable(phrase: Phrase): string {
  return phrase.kannada.replace(/\[name\]/g, '').trim();
}

export function DrillFeedback({ result, correctPhrase, onContinue }: DrillFeedbackProps) {
  const insets = useSafeAreaInsets();

  if (result !== 'incorrect') {
    return (
      <View style={{ paddingBottom: insets.bottom + Spacing.lg, paddingHorizontal: Spacing.lg }} />
    );
  }

  const handleHearAgain = () => {
    deviceTtsAudioService.play(speakable(correctPhrase)).catch((err) => {
      console.warn('[audio] drill hear-again failed', err);
    });
  };

  return (
    <View
      style={{
        paddingHorizontal: Spacing.lg,
        paddingBottom: insets.bottom + Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
      }}
    >
      <Pressable
        onPress={handleHearAgain}
        accessibilityRole="button"
        accessibilityLabel="Hear the correct answer again"
        style={({ pressed }) => ({
          backgroundColor: pressed ? Colors.surfaceContainerHigh : Colors.secondaryFixed,
          borderRadius: Radius.md,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.lg,
          minHeight: 44,
          minWidth: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
        })}
      >
        <Icons.audio size={16} color={Colors.onSecondaryContainer} />
        <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 13, color: Colors.onSecondaryContainer }}>
          Hear again
        </Text>
      </Pressable>

      <Pressable
        onPress={onContinue}
        accessibilityRole="button"
        accessibilityLabel="Continue to next question"
        style={({ pressed }) => ({
          flex: 1,
          backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
          borderRadius: Radius.md,
          paddingVertical: Spacing.md + 2,
          minHeight: 44,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 15, color: Colors.onPrimary }}>
          Continue →
        </Text>
      </Pressable>
    </View>
  );
}

export { speakable as speakablePhrase };
