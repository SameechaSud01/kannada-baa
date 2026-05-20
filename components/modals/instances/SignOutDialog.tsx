import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Button, ButtonStack } from '../../ui/Button';

export interface SignOutDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Destructive confirm (MODALS §6.2). Stacked layout (primary on top) — the user
 * tapped Sign out on purpose, so we add friction without feeling adversarial.
 */
export function SignOutDialog({ onConfirm, onCancel }: SignOutDialogProps) {
  return (
    <View style={{ gap: moderateScale(14) }}>
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
        Sign out of Kannada Baa?
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(14),
          lineHeight: moderateScale(20),
          color: Colors.tertiary,
          textAlign: 'center',
        }}
        maxFontSizeMultiplier={1.4}
      >
        Your streak, lessons and phrases are saved to your account. Sign back in anytime.
      </Text>
      <ButtonStack>
        <Button
          label="Sign out"
          variant="primary"
          onPress={onConfirm}
          destructive
          accessibilityHint="Signs you out of your account."
        />
        <Button label="Stay signed in" variant="ghost" onPress={onCancel} />
      </ButtonStack>
    </View>
  );
}
