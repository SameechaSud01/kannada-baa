import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useModal } from '../../components/modals/ModalHost';
import { ExitLessonDialog, type ExitLessonVariant } from '../../components/modals/instances/ExitLessonDialog';

interface ExitBackButtonProps {
  /** Skip the confirm dialog entirely (e.g., on screens that aren't mid-flow). */
  skipConfirm?: boolean;
  /** Which copy variant to show — defaults to "lesson". */
  variant?: ExitLessonVariant;
  floating?: boolean;
}

export function ExitBackButton({
  skipConfirm,
  variant = 'lesson',
  floating = true,
}: ExitBackButtonProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const modal = useModal();

  const onPress = () => {
    if (skipConfirm) {
      router.back();
      return;
    }
    modal.show({
      kind: 'dialog',
      component: ExitLessonDialog,
      props: {
        variant,
        onConfirm: () => {
          modal.dismiss();
          router.back();
        },
        onCancel: () => modal.dismiss(),
      },
      blockBackdropDismiss: true,
      blockHardwareBack: true,
    });
  };

  const floatingStyle = floating
    ? {
        position: 'absolute' as const,
        top: insets.top + Spacing.sm,
        left: Spacing.lg,
        zIndex: 10,
      }
    : {};

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      style={({ pressed }) => ({
        ...floatingStyle,
        width: moderateScale(40),
        height: moderateScale(40),
        borderRadius: Radius.full,
        backgroundColor: Colors.surfaceContainerHighest,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.94 : 1 }],
      })}
    >
      <Icons.back size={20} color={Colors.primary} />
    </Pressable>
  );
}
