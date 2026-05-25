import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import type { AnswerState } from '../types';

type Props = {
  answerState: AnswerState;
  streak: number;
  hintUsed: boolean;
};

const FeedbackBanner: React.FC<Props> = ({ answerState, streak, hintUsed }) => {
  if (answerState === 'unanswered') return null;

  const isCorrect = answerState === 'correct';
<<<<<<< Updated upstream
  const isOnRoll = isCorrect && streak >= 3;
  const Icon = isOnRoll ? Icons.streak : isCorrect ? Icons.correct : Icons.wrong;
  const message = isOnRoll ? 'Correct! On a roll!' : isCorrect ? 'Correct!' : 'Wrong!';
  const textColor = isCorrect ? Colors.onSecondaryContainer : Colors.primary;
=======
  let message: string;
  if (isCorrect) {
    if (hintUsed) {
      message = '✓ Correct! (½ pt — hint used)';
    } else if (streak >= 3) {
      message = '🔥 Correct! On a roll!';
    } else {
      message = '✓ Correct!';
    }
  } else {
    message = '✗ Wrong!';
  }
>>>>>>> Stashed changes

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(6),
        alignSelf: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: moderateScale(6),
        borderRadius: Radius.full,
        backgroundColor: isCorrect ? Colors.secondaryFixed : Colors.surfaceDim,
      }}
    >
      <Icon size={moderateScale(14)} color={textColor} />
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(14),
          color: textColor,
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default FeedbackBanner;
