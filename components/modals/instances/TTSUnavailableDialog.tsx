import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Radius } from '../../../constants/spacing';
import { Halo } from '../Halo';
import { Button, ButtonRow } from '../../ui/Button';

export interface TTSUnavailableDialogProps {
  onOpenSettings: () => void;
  onDismiss: () => void;
}

/**
 * Boot-time warning shown once per install when the device has no Kannada TTS
 * voice (MODALS §6.9). Both buttons mark hasSeenTtsWarning so we don't repeat.
 */
export function TTSUnavailableDialog({
  onOpenSettings,
  onDismiss,
}: TTSUnavailableDialogProps) {
  return (
    <View style={{ gap: moderateScale(14) }}>
      <View style={{ alignItems: 'center' }}>
        <Halo
          icon="headphones"
          iconSize={26}
          stroke={2}
          iconColor={Colors.primary}
        />
      </View>
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(20),
          letterSpacing: -0.3,
          color: Colors.onSurface,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.3}
      >
        Kannada voice not installed
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(14),
          lineHeight: moderateScale(21),
          color: Colors.tertiary,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.4}
      >
        Your phone doesn&apos;t have a Kannada text-to-speech voice yet. We can guide you — it&apos;s a one-time download in system settings.
      </Text>
      <View
        style={{
          backgroundColor: Colors.surfaceContainerHigh,
          borderRadius: Radius.lg,
          padding: moderateScale(10),
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            lineHeight: moderateScale(18),
            color: Colors.tertiary,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.4}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, color: Colors.onSurface }}>
            Settings → Languages → Text-to-speech →{' '}
          </Text>
          install Kannada (kn-IN).
        </Text>
      </View>
      <ButtonRow>
        <Button label="Maybe later" variant="ghost" onPress={onDismiss} flex />
        <Button
          label="Open settings"
          variant="primary"
          onPress={onOpenSettings}
          trailingIcon="forward"
          flex
        />
      </ButtonRow>
    </View>
  );
}
