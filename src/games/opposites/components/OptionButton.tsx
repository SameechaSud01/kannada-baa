import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import type { Option } from '../types';

export type OptionState = 'default' | 'correct' | 'wrong' | 'reveal' | 'disabled';

type Props = {
  option: Option;
  state: OptionState;
  onPress: () => void;
};

const LIFT_PX = moderateScale(7);
const LIFT_SCALE = 1.04;

const OptionButton: React.FC<Props> = ({ option, state, onPress }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const checkProgress = useRef(new Animated.Value(0)).current;

  const isLifted = state === 'correct' || state === 'reveal';
  const isWrong = state === 'wrong';

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: isLifted ? -LIFT_PX : 0,
        damping: 15,
        stiffness: 180,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: isLifted ? LIFT_SCALE : 1,
        damping: 15,
        stiffness: 180,
        mass: 1,
        useNativeDriver: true,
      }),
      Animated.timing(checkProgress, {
        toValue: isLifted ? 1 : 0,
        duration: isLifted ? 180 : 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isLifted, translateY, scale, checkProgress]);

  useEffect(() => {
    if (!isWrong) return;
    Animated.sequence([
      Animated.timing(translateX, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(translateX, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [isWrong, translateX]);

  const checkScale = checkProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }, { translateX }, { scale }],
        shadowColor: Colors.onSurface,
        shadowOpacity: isLifted ? 0.18 : 0.06,
        shadowOffset: { width: 0, height: isLifted ? moderateScale(6) : moderateScale(2) },
        shadowRadius: isLifted ? moderateScale(10) : moderateScale(4),
        elevation: isLifted ? 6 : 2,
        borderRadius: Radius.xl,
      }}
    >
      <Pressable
        onPress={onPress}
        disabled={state !== 'default'}
        android_ripple={null}
        accessibilityRole="button"
        accessibilityLabel={`${option.kn}, ${option.en}`}
        accessibilityState={{ selected: isLifted, disabled: state !== 'default' }}
        style={{
          backgroundColor: Colors.surface,
          borderWidth: 1,
          borderColor: Colors.outlineVariant,
          borderRadius: Radius.xl,
          padding: Spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: moderateScale(80),
        }}
      >
<<<<<<< Updated upstream
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.bold,
            fontSize: moderateScale(20),
            textAlign: 'center',
            color: Colors.onSurface,
          }}
        >
          {option.kn}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            textAlign: 'center',
            marginTop: Spacing.xs,
            color: Colors.tertiary,
          }}
        >
          {option.en}
        </Text>
        {isLifted && (
          <Animated.View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: Spacing.sm,
              right: Spacing.sm,
              opacity: checkProgress,
              transform: [{ scale: checkScale }],
            }}
          >
            <Icons.correct size={moderateScale(18)} color={Colors.secondary} />
          </Animated.View>
        )}
      </Pressable>
    </Animated.View>
=======
        {option.kn}
      </Text>
      <Text className={`text-xs text-center mt-1 italic ${GLOSS_CLASSES[state]}`}>
        {option.tr}
      </Text>
    </Pressable>
>>>>>>> Stashed changes
  );
};

export default OptionButton;
