import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';

type Props = {
  word: string;
  tr: string;
  meaning: string;
  streak: number;
  hintUsed: boolean;
  isAnswered: boolean;
  onHint: () => void;
};

const QuestionCard: React.FC<Props> = ({ word, tr, meaning, streak }) => (
  <View
    style={{
      borderRadius: Radius.xl,
      backgroundColor: Colors.surfaceContainerLow,
      padding: Spacing.xxl,
      width: '100%',
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        fontFamily: Fonts.dmSans.medium,
        fontSize: moderateScale(12),
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: Colors.tertiary,
        marginBottom: Spacing.sm,
      }}
    >
      find the opposite of
    </Text>
    {tr ? (
      <Text
        style={{
          fontFamily: Fonts.lora.italic,
          fontSize: moderateScale(40),
          lineHeight: moderateScale(52),
          textAlign: 'center',
          color: Colors.onSurface,
        }}
        adjustsFontSizeToFit
        numberOfLines={2}
        maxFontSizeMultiplier={1.2}
      >
        {tr}
      </Text>
    ) : null}
    <Text
      style={{
        fontFamily: Fonts.dmSans.medium,
        fontSize: moderateScale(16),
        textAlign: 'center',
        color: Colors.tertiary,
        marginTop: Spacing.sm,
      }}
      maxFontSizeMultiplier={1.3}
    >
      {meaning}
    </Text>
    <Text
      style={{
        fontFamily: Fonts.notoSerifKannada.regular,
        fontSize: moderateScale(14),
        textAlign: 'center',
        color: Colors.tertiary,
        marginTop: Spacing.md,
        opacity: 0.7,
      }}
      maxFontSizeMultiplier={1.3}
    >
      {word}
    </Text>

    {streak >= 2 && (
      <View
        style={{
          position: 'absolute',
          top: Spacing.md,
          right: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(4),
          backgroundColor: Colors.secondaryFixed,
          borderRadius: Radius.full,
          paddingHorizontal: Spacing.sm,
          paddingVertical: moderateScale(2),
        }}
      >
        <Icons.streak size={moderateScale(12)} color={Colors.secondary} />
        <Text
          style={{
            color: Colors.secondary,
            fontSize: moderateScale(12),
            fontFamily: Fonts.dmSans.bold,
          }}
        >
          {streak}
        </Text>
      </View>
    )}
  </View>
);

export default QuestionCard;
