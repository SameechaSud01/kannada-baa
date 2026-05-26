import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';

type Props = {
  answered: boolean;
  correct:  boolean;
};

const FeedbackBanner: React.FC<Props> = ({ answered, correct }) => {
  if (!answered) return null;

  const Icon = correct ? Icons.correct : Icons.wrong;
  const bgColor = correct ? Colors.secondaryFixed : Colors.errorContainerLow;
  const borderColor = correct ? Colors.secondary : Colors.primary;
  const textColor = correct ? Colors.onSecondaryContainer : Colors.primary;
  const message = correct ? 'Correct!' : 'Incorrect — correct answer highlighted';

  return (
    <View
      accessibilityLiveRegion="polite"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(6),
        paddingHorizontal: Spacing.lg,
        paddingVertical: moderateScale(10),
        borderRadius: Radius.xl,
        borderWidth: 1,
        backgroundColor: bgColor,
        borderColor,
      }}
    >
      <Icon size={moderateScale(16)} color={textColor} />
      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(14),
          color: textColor,
          flexShrink: 1,
        }}
      >
        {message}
      </Text>
    </View>
  );
};

export default FeedbackBanner;
