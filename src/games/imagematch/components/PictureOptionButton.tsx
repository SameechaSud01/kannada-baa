import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import type { VocabItem, OptionState } from '../types';

type Props = {
  item:    VocabItem;
  state:   OptionState;
  onPress: () => void;
};

const BG: Record<OptionState, string> = {
  default:  Colors.surface,
  correct:  Colors.secondaryFixed,
  wrong:    Colors.errorContainerLow,
  reveal:   Colors.secondaryFixed,
  disabled: Colors.surfaceContainerHigh,
};

const BORDER: Record<OptionState, string> = {
  default:  Colors.outlineVariant,
  correct:  Colors.secondary,
  wrong:    Colors.primary,
  reveal:   Colors.secondary,
  disabled: Colors.surfaceDim,
};

const PictureOptionButton: React.FC<Props> = ({ item, state, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={state !== 'default'}
    accessibilityRole="button"
    accessibilityLabel={`${item.ph}, ${item.en}`}
    style={({ pressed }) => ({
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: Radius.xl,
      borderWidth: 1.5,
      padding: Spacing.md,
      backgroundColor: BG[state],
      borderColor: BORDER[state],
      minHeight: moderateScale(90),
      opacity: pressed && state === 'default' ? 0.8 : 1,
    })}
  >
    <Text style={{ fontSize: moderateScale(36), textAlign: 'center' }}>{item.emoji}</Text>
    <Text
      style={{
        fontFamily: Fonts.dmSans.regular,
        fontSize: moderateScale(11),
        color: Colors.tertiary,
        textAlign: 'center',
        marginTop: moderateScale(6),
      }}
    >
      {item.en}
    </Text>
  </Pressable>
);

export default PictureOptionButton;
