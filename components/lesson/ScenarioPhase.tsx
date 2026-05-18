import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { ProgressDots } from '../onboarding/ProgressDots';
import type { Lesson } from '../../constants/lessons/types';

interface ScenarioPhaseProps {
  lesson: Lesson;
  onContinue: () => void;
}

export function ScenarioPhase({ lesson, onContinue }: ScenarioPhaseProps) {
  const insets = useSafeAreaInsets();
  const { title, setup } = lesson.situation;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ paddingTop: insets.top + Spacing.lg, paddingHorizontal: Spacing.lg }}>
        <ProgressDots total={4} current={0} />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xxl,
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
            minHeight: 180,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 13,
              color: Colors.tertiary,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
          >
            Scenario
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 18,
              color: Colors.onSecondaryContainer,
              textAlign: 'center',
              lineHeight: 26,
            }}
          >
            {title}
          </Text>
        </View>

        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 24,
            color: Colors.onSurface,
            lineHeight: 32,
            marginBottom: Spacing.md,
          }}
        >
          {title}
        </Text>

        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: 16,
            color: Colors.onSurface,
            lineHeight: 24,
          }}
        >
          {setup}
        </Text>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue to learn the phrases"
          onPress={onContinue}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + 2,
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
            minHeight: 44,
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 15,
              color: Colors.onPrimary,
            }}
          >
            Let's learn the phrases →
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
