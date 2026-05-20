import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Halo } from '../Halo';
import { Button, ButtonRow } from '../../ui/Button';

export type ExitLessonVariant = 'lesson' | 'game';

export interface ExitLessonDialogProps {
  variant?: ExitLessonVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

const COPY: Record<ExitLessonVariant, { title: string; body: string; confirm: string }> = {
  lesson: {
    title: 'Exit lesson?',
    body: "You'll lose your progress on this lesson. The phrases you've already met are safe.",
    confirm: 'Exit',
  },
  game: {
    title: 'Exit this game?',
    body: "You'll lose this round. Your XP for already-completed rounds is safe.",
    confirm: 'Exit',
  },
};

/**
 * Destructive confirm (MODALS §6.1). Renders inside <Dialog>.
 * Caller must trigger the actual `router.back()` from onConfirm.
 */
export function ExitLessonDialog({
  variant = 'lesson',
  onConfirm,
  onCancel,
}: ExitLessonDialogProps) {
  const copy = COPY[variant];
  return (
    <View style={{ gap: moderateScale(14), alignItems: 'stretch' }}>
      <View style={{ alignItems: 'center' }}>
        <Halo icon="x" iconColor={Colors.primary} />
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
        {copy.title}
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
        {copy.body}
      </Text>
      <ButtonRow>
        <Button label="Cancel" variant="ghost" onPress={onCancel} flex />
        <Button
          label={copy.confirm}
          variant="primary"
          onPress={onConfirm}
          destructive
          accessibilityHint="Loses your progress."
          flex
        />
      </ButtonRow>
    </View>
  );
}
