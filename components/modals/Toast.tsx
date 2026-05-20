import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Shadows } from '../../constants/shadows';
import { Icons } from '../../constants/icons';

export type ToastKind = 'success' | 'error';

export interface ToastProps {
  kind: ToastKind;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  onDismiss: () => void;
}

const ENTRY_MS = 200;
const EXIT_MS = 180;

/**
 * Single toast component (MODALS §4.4).
 * Success — top, pill, dark bg, 3 s auto-dismiss.
 * Error — bottom, card, soft bg, sticky (requires tap to dismiss).
 */
export function Toast({ kind, title, subtitle, onPress, onDismiss }: ToastProps) {
  const insets = useSafeAreaInsets();
  const isSuccess = kind === 'success';

  const translateY = useRef(new Animated.Value(isSuccess ? -40 : 40)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Track keyboard so the bottom error toast lifts above it on input screens.
  const [kbHeight, setKbHeight] = useState(0);
  useEffect(() => {
    if (isSuccess) return; // top toast is unaffected by the keyboard
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const subShow = Keyboard.addListener(showEvt, (e) =>
      setKbHeight(e.endCoordinates.height),
    );
    const subHide = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, [isSuccess]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: ENTRY_MS,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: ENTRY_MS,
        useNativeDriver: true,
      }),
    ]).start();

    if (isSuccess) {
      timeoutRef.current = setTimeout(() => exit(), 3000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exit = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: EXIT_MS,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: isSuccess ? -40 : 40,
        duration: EXIT_MS,
        useNativeDriver: true,
      }),
    ]).start(() => onDismiss());
  };

  const handlePress = () => {
    if (onPress) onPress();
    exit();
  };

  if (isSuccess) {
    return (
      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={{
          position: 'absolute',
          top: insets.top + Spacing.xl,
          alignSelf: 'center',
          maxWidth: '85%',
          backgroundColor: Colors.onSurface,
          borderRadius: Radius.full,
          paddingVertical: moderateScale(12),
          paddingLeft: moderateScale(12),
          paddingRight: moderateScale(16),
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(10),
          opacity,
          transform: [{ translateY }],
          ...Shadows.toastDark,
        }}
      >
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel={title}
          hitSlop={8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(10),
          }}
        >
          <View
            style={{
              width: moderateScale(22),
              height: moderateScale(22),
              borderRadius: Radius.full,
              backgroundColor: Colors.secondaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icons.check
              size={moderateScale(14)}
              color={Colors.onSecondaryContainer}
              strokeWidth={3}
            />
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(14),
              color: Colors.surface,
              maxWidth: moderateScale(260),
            }}
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
        </Pressable>
      </Animated.View>
    );
  }

  // Error variant — bottom, card, sticky
  const errorBottom =
    kbHeight > 0
      ? kbHeight + Spacing.lg
      : insets.bottom + Spacing.xxxl;
  return (
    <Animated.View
      accessibilityLiveRegion="assertive"
      accessibilityRole="alert"
      style={{
        position: 'absolute',
        left: Spacing.lg,
        right: Spacing.lg,
        bottom: errorBottom,
        backgroundColor: Colors.surfaceContainerLow,
        borderRadius: Radius.lg,
        paddingVertical: moderateScale(12),
        paddingHorizontal: moderateScale(14),
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(10),
        opacity,
        transform: [{ translateY }],
        ...Shadows.toastSoft,
      }}
    >
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
        hitSlop={8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(10),
          flex: 1,
        }}
      >
        <View
          style={{
            width: moderateScale(22),
            height: moderateScale(22),
            borderRadius: Radius.full,
            backgroundColor: Colors.errorContainerLow,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icons.x size={moderateScale(14)} color={Colors.primary} strokeWidth={3} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(13),
              color: Colors.onSurface,
            }}
            numberOfLines={2}
            maxFontSizeMultiplier={1.3}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(11),
                color: Colors.tertiary,
                marginTop: moderateScale(1),
              }}
              numberOfLines={2}
              maxFontSizeMultiplier={1.4}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {onPress ? (
          <Icons.forward
            size={moderateScale(18)}
            color={Colors.tertiary}
            strokeWidth={2.2}
          />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}
