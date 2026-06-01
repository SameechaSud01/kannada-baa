import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import type { VocabItem, OptionState } from '../types';

type Props = {
  item:        VocabItem;
  state:       OptionState;
  hintVisible: boolean;
  onPress:     () => void;
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

const KN_COLOR: Record<OptionState, string> = {
  default:  Colors.onSurface,
  correct:  Colors.onSecondaryContainer,
  wrong:    Colors.primary,
  reveal:   Colors.onSecondaryContainer,
  disabled: Colors.tertiary,
};

const WordOptionButton: React.FC<Props> = ({ item, state, hintVisible, onPress }) => (
  <Pressable
    onPress={onPress}
    disabled={state !== 'default'}
    accessibilityRole="button"
    accessibilityLabel={`${item.kn}, ${item.ph}`}
    style={({ pressed }) => ({
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: Radius.xl,
      borderWidth: 1.5,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      backgroundColor: BG[state],
      borderColor: BORDER[state],
      minHeight: moderateScale(56),
      opacity: pressed && state === 'default' ? 0.8 : 1,
    })}
  >
    <View style={{ flex: 1 }}>
      {item.ph ? (
        <Text
          style={{
            fontFamily: Fonts.lora.italic,
            fontSize: moderateScale(17),
            color: KN_COLOR[state],
          }}
          maxFontSizeMultiplier={1.3}
        >
          {item.ph}
        </Text>
      ) : null}
      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(13),
          color: Colors.tertiary,
          marginTop: moderateScale(2),
        }}
        maxFontSizeMultiplier={1.3}
      >
        {item.en}
      </Text>
      <Text
        style={{
          fontFamily: 'NotoSansKannada_400Regular',
          fontSize: moderateScale(13),
          color: Colors.tertiary,
          marginTop: moderateScale(2),
          opacity: 0.7,
        }}
        maxFontSizeMultiplier={1.3}
      >
        {item.kn}
      </Text>
    </View>
  </Pressable>
);

export default WordOptionButton;
