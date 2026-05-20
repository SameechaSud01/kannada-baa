import { useEffect, useRef, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Dimensions,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { RoundIconButton } from '../ui/RoundIconButton';

export interface TakeoverProps {
  children: ReactNode;
  onClose: () => void;
  /** Override the default surface background per-instance (MODALS §6.6 medallion). */
  backgroundColor?: string;
}

/**
 * Full-screen takeover (MODALS §4.3).
 * Slides up 350ms ease-out, slides down 280ms (handled by ModalHost unmount).
 * Provides a top-right ghost close button per spec.
 */
export function Takeover({ children, onClose, backgroundColor }: TakeoverProps) {
  const insets = useSafeAreaInsets();
  const screenH = Dimensions.get('window').height;
  const translateY = useRef(new Animated.Value(screenH)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        translateY.setValue(0);
        opacity.setValue(0);
        Animated.timing(opacity, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }).start();
        return;
      }
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    });
    return () => {
      cancelled = true;
    };
  }, [opacity, translateY]);

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: backgroundColor ?? Colors.surfaceContainerLow,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View
        accessibilityViewIsModal
        importantForAccessibility="yes"
        style={{ flex: 1 }}
      >
        {children}
      </View>
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          top: insets.top + Spacing.xl,
          right: Spacing.lg,
        }}
      >
        <RoundIconButton
          icon="x"
          variant="ghost"
          size={40}
          onPress={onClose}
          accessibilityLabel="Close"
        />
      </View>
    </Animated.View>
  );
}
