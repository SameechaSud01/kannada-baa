import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface LessonProgressBarProps {
  current: number;
  total: number;
  label: string;
}

export function LessonProgressBar({ current, total, label }: LessonProgressBarProps) {
  const pct = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
  return (
    <View>
      <View
        style={{
          height: moderateScale(6),
          backgroundColor: Colors.surfaceContainerHigh,
          borderRadius: Radius.full,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${pct * 100}%`,
            height: '100%',
            backgroundColor: Colors.primaryContainer,
            borderRadius: Radius.full,
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(12),
          color: Colors.tertiary,
          textAlign: 'center',
          marginTop: Spacing.sm,
          letterSpacing: 0.4,
        }}
        maxFontSizeMultiplier={1.4}
      >
        {label}
      </Text>
    </View>
  );
}
