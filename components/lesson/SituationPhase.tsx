import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import type { Lesson } from '../../constants/lessons/types';

interface SituationPhaseProps {
  lesson: Lesson;
  onAdvance: () => void;
}

export function SituationPhase({ lesson, onAdvance }: SituationPhaseProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: insets.top + Spacing.xxxl,
          paddingBottom: Spacing.lg,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.xl,
            paddingVertical: Spacing.xxxl + Spacing.md,
            paddingHorizontal: Spacing.lg,
            marginBottom: Spacing.xxl,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: moderateScale(180),
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
          >
            Situation
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(18),
              color: Colors.onSecondaryContainer,
              textAlign: 'center',
              lineHeight: moderateScale(26),
            }}
          >
            {lesson.title}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(24),
            color: Colors.onSurface,
            lineHeight: moderateScale(32),
            marginBottom: Spacing.md,
          }}
        >
          {lesson.title}
        </Text>

        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            lineHeight: moderateScale(24),
          }}
        >
          {lesson.situation}
        </Text>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Start the lesson"
          onPress={onAdvance}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + moderateScale(2),
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
            minHeight: moderateScale(44),
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.onPrimary,
            }}
          >
            Let's start
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
