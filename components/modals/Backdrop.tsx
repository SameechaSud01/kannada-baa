import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, AccessibilityInfo, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export interface BackdropProps {
  /** Dim opacity 0..1 — default 0.55, use 0.4 for info-only dialogs. */
  dim?: number;
  /** Called on tap. Pass `undefined` to make backdrop non-dismissible (destructive confirms). */
  onTap?: () => void;
  /** Set false to skip the BlurView (perf opt for Android low-end). */
  withBlur?: boolean;
}

/**
 * Shared backdrop for dialogs, sheets and goal-complete (MODALS §3).
 * Warm-dark fill at `Colors.onSurface` × dim, with a subtle expo-blur on top.
 * Fade-in 200ms ease-out per spec.
 */
export function Backdrop({ dim = 0.55, onTap, withBlur = true }: BackdropProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (cancelled) return;
      reduceMotionRef.current = v;
      Animated.timing(opacity, {
        toValue: 1,
        duration: v ? 100 : 200,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [opacity]);

  return (
    <Animated.View
      pointerEvents="auto"
      style={[StyleSheet.absoluteFill, { opacity }]}
    >
      {withBlur && Platform.OS !== 'web' ? (
        <BlurView
          intensity={20}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <Pressable
        onPress={onTap}
        accessible={false}
        importantForAccessibility="no"
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `rgba(27,29,14,${dim})` },
        ]}
      />
    </Animated.View>
  );
}
