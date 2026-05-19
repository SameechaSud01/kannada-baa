import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import type { AnswerState } from '../types';

type Props = {
  answerState: AnswerState;
  streak: number;
};

const FeedbackBanner: React.FC<Props> = ({ answerState, streak }) => {
  if (answerState === 'unanswered') return null;

  const isCorrect = answerState === 'correct';
  const message = isCorrect
    ? streak >= 3
      ? '🔥 Correct! On a roll!'
      : '✓ Correct!'
    : '✗ Wrong!';

  return (
    <View
      style={{
        alignSelf: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: moderateScale(6),
        borderRadius: Radius.full,
        backgroundColor: isCorrect ? Colors.secondaryFixed : Colors.surfaceDim,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(14),
          color: isCorrect ? Colors.onSecondaryContainer : Colors.primary,
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default FeedbackBanner;
