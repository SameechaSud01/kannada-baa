import type { ReactNode } from 'react';
import { Pressable, Text, View, ActivityIndicator } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons, type IconName } from '../../constants/icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps {
  label: string;
  variant?: ButtonVariant;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  trailingIcon?: IconName;
  flex?: boolean;
  accessibilityHint?: string;
  accessibilityRole?: 'button';
  destructive?: boolean;
}

const variantColors: Record<
  ButtonVariant,
  { bg: string; fg: string; pressedBg: string }
> = {
  primary: {
    bg: Colors.primary,
    fg: Colors.onPrimary,
    pressedBg: Colors.primaryContainer,
  },
  secondary: {
    bg: Colors.secondaryContainer,
    fg: Colors.onSecondaryContainer,
    pressedBg: Colors.secondaryFixed,
  },
  ghost: {
    bg: 'transparent',
    fg: Colors.tertiary,
    pressedBg: Colors.surfaceContainerHigh,
  },
};

export function Button({
  label,
  variant = 'primary',
  onPress,
  disabled,
  loading,
  trailingIcon,
  flex,
  accessibilityHint,
  destructive,
}: ButtonProps) {
  const v = variantColors[variant];
  const TrailingIcon = trailingIcon ? Icons[trailingIcon] : null;
  const isInactive = disabled || loading;

  return (
    <Pressable
      onPress={isInactive ? undefined : onPress}
      disabled={isInactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={
        destructive
          ? `${accessibilityHint ?? ''} Destructive.`.trim()
          : accessibilityHint
      }
      accessibilityState={{ disabled: isInactive, busy: loading }}
      style={({ pressed }) => ({
        flex: flex ? 1 : undefined,
        minHeight: moderateScale(44),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(8),
        paddingHorizontal: Spacing.lg,
        paddingVertical: moderateScale(12),
        backgroundColor: pressed && !isInactive ? v.pressedBg : v.bg,
        borderRadius: Radius.lg,
        opacity: isInactive ? 0.55 : 1,
        transform: [{ scale: pressed && !isInactive ? 0.98 : 1 }],
      })}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.fg} />
      ) : (
        <>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(14),
              color: v.fg,
              letterSpacing: 0.2,
            }}
            maxFontSizeMultiplier={1.3}
            numberOfLines={1}
          >
            {label}
          </Text>
          {TrailingIcon ? (
            <TrailingIcon size={moderateScale(16)} color={v.fg} strokeWidth={2.2} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

export function ButtonRow({ children, gap = 10 }: { children: ReactNode; gap?: number }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: moderateScale(gap),
      }}
    >
      {children}
    </View>
  );
}

export function ButtonStack({ children, gap = 8 }: { children: ReactNode; gap?: number }) {
  return (
    <View
      style={{
        flexDirection: 'column',
        gap: moderateScale(gap),
      }}
    >
      {children}
    </View>
  );
}
