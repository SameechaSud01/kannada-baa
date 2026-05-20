import { View, Text, Pressable } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import { Toasts } from '../../../components/modals/instances/toastCatalog';
import type { Phrase } from '../../../constants/lessons/types';

interface AudioControlsProps {
  phrase: Phrase;
}

function speakablePhrase(phrase: Phrase): string {
  return phrase.kannada.replace(/\[name\]/g, '').trim();
}

export function AudioControls({ phrase }: AudioControlsProps) {
  const handleHearAgain = () => {
    deviceTtsAudioService.play(speakablePhrase(phrase)).catch((err) => {
      console.warn('[audio] play failed', err);
      Toasts.audioFailed(handleHearAgain);
    });
  };

  return (
    <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
      <Pressable
        onPress={handleHearAgain}
        accessibilityRole="button"
        accessibilityLabel="Hear the phrase again"
        style={({ pressed }) => ({
          backgroundColor: pressed ? Colors.surfaceContainerHigh : Colors.secondaryFixed,
          borderRadius: Radius.md,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xl,
          minHeight: moderateScale(44),
          minWidth: moderateScale(44),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
        })}
      >
        <Icons.audio size={18} color={Colors.onSecondaryContainer} />
        <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(14), color: Colors.onSecondaryContainer }}>
          Hear again
        </Text>
      </Pressable>
    </View>
  );
}

export { speakablePhrase };
