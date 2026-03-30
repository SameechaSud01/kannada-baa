import { View, Text, Pressable } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { ProgressBar } from './ProgressBar';

interface LessonCardProps {
  title: string;
  lessonNumber: number;
  totalLessons: number;
  progress: number; // 0–1
  onPress: () => void;
  buttonLabel?: string;
}

export function LessonCard({
  title,
  lessonNumber,
  totalLessons,
  progress,
  onPress,
  buttonLabel = 'RESUME LESSON',
}: LessonCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.cardBg,
        borderWidth: 0.5,
        borderColor: Colors.border,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: 15,
          color: Colors.textBody,
          marginBottom: Spacing.xs,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: 12,
          color: Colors.textSecondary,
          marginBottom: Spacing.md,
        }}
      >
        Lesson {lessonNumber} of {totalLessons}
      </Text>

      <ProgressBar progress={progress} />

      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: 11,
          color: Colors.textTertiary,
          marginTop: Spacing.sm,
          marginBottom: Spacing.md,
        }}
      >
        {Math.round(progress * 100)}% complete
      </Text>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => ({
          backgroundColor: pressed ? Colors.primaryDark : Colors.primary,
          borderRadius: Radius.md,
          paddingVertical: Spacing.md,
          alignItems: 'center',
          transform: [{ scale: pressed ? 0.96 : 1 }],
        })}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 12,
            color: Colors.textOnGreen,
            letterSpacing: 0.5,
          }}
        >
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}
