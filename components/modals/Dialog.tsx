import { useEffect, useRef, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  Platform,
  View,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';
import { Shadows } from '../../constants/shadows';

export interface DialogProps {
  children: ReactNode;
  /** Set to true for destructive confirms — read by screen readers as alert. */
  destructive?: boolean;
  /** Set to false to skip the entry animation (e.g., reduced motion). */
  animate?: boolean;
}

/**
 * Centered dialog primitive (MODALS §4.1).
 * Width `min(88%, 360pt)`, surfaceContainerLow bg, Radius.xl, padding 22.
 * Enter: 200ms fade + scale(0.96→1). Exit handled by ModalHost unmount.
 */
export function Dialog({ children, destructive, animate = true }: DialogProps) {
  const opacity = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const scale = useRef(new Animated.Value(animate ? 0.96 : 1)).current;

  useEffect(() => {
    if (!animate) return;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        opacity.setValue(1);
        scale.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 8,
          tension: 90,
          useNativeDriver: true,
        }),
      ]).start();
    });
    return () => {
      cancelled = true;
    };
  }, [animate, opacity, scale]);

  const screenWidth = Dimensions.get('window').width;
  const width = Math.min(screenWidth * 0.88, moderateScale(360));

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: moderateScale(12),
      }}
    >
      <Animated.View
        accessibilityRole={destructive ? 'alert' : 'none'}
        accessibilityViewIsModal={Platform.OS === 'ios'}
        importantForAccessibility="yes"
        style={{
          width,
          backgroundColor: Colors.surfaceContainerLow,
          borderRadius: Radius.xl,
          padding: moderateScale(22),
          ...Shadows.modal,
          opacity,
          transform: [{ scale }],
        }}
      >
        <View style={{ gap: moderateScale(14) }}>{children}</View>
      </Animated.View>
    </View>
  );
}
