import React from 'react';
import { Pressable, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import type { Option } from '../types';

export type OptionState = 'default' | 'correct' | 'wrong' | 'reveal' | 'disabled';

type Props = {
  option: Option;
  state: OptionState;
  onPress: () => void;
};

type Palette = {
  border: string;
  bg: string;
  knText: string;
  glossText: string;
};

const STATE_PALETTE: Record<OptionState, Palette> = {
  default: {
    border: Colors.outlineVariant,
    bg: Colors.surface,
    knText: Colors.onSurface,
    glossText: Colors.tertiary,
  },
  correct: {
    border: Colors.secondaryContainer,
    bg: Colors.secondaryFixed,
    knText: Colors.onSecondaryContainer,
    glossText: Colors.secondary,
  },
  wrong: {
    border: Colors.primary,
    bg: Colors.surfaceDim,
    knText: Colors.primary,
    glossText: Colors.primary,
  },
  reveal: {
    border: Colors.secondaryContainer,
    bg: Colors.secondaryFixed,
    knText: Colors.onSecondaryContainer,
    glossText: Colors.secondary,
  },
  disabled: {
    border: Colors.surfaceContainerHigh,
    bg: Colors.surfaceContainerLow,
    knText: Colors.tertiary,
    glossText: Colors.tertiary,
  },
};

const OptionButton: React.FC<Props> = ({ option, state, onPress }) => {
  const palette = STATE_PALETTE[state];

  return (
    <Pressable
      onPress={onPress}
      disabled={state !== 'default'}
      style={{
        borderWidth: 1,
        borderColor: palette.border,
        borderRadius: Radius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: palette.bg,
        minHeight: moderateScale(80),
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.notoSerifKannada.bold,
          fontSize: moderateScale(24),
          textAlign: 'center',
          color: palette.knText,
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
          color: palette.glossText,
        }}
      >
        {option.en}
      </Text>
    </Pressable>
  );
};

export default OptionButton;
