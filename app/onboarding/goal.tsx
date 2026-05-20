import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { useUserStore } from '../../stores/useUserStore';

const GOALS = [
  { value: 'spoken' as const, label: 'Spoken only', subtitle: 'I want to speak and understand Kannada' },
  { value: 'written' as const, label: 'Written only', subtitle: 'I want to read and write Kannada script' },
  { value: 'both' as const, label: 'Both', subtitle: 'I want the full experience' },
];

export default function GoalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<'spoken' | 'written' | 'both' | null>(
    useUserStore.getState().learningMode
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.xxl,
      }}
    >
      <ProgressDots total={4} current={1} />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2.5,
            color: Colors.tertiary,
            textTransform: 'uppercase',
            marginBottom: Spacing.sm,
          }}
        >
          Step 1 of 3
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(22),
            color: Colors.onSurface,
            marginBottom: Spacing.sm,
          }}
        >
          What do you want to learn?
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13),
            lineHeight: moderateScale(18),
            color: Colors.tertiary,
            marginBottom: Spacing.xxxl,
          }}
        >
          Choose your learning focus
        </Text>

        <View style={{ gap: Spacing.md }}>
          {GOALS.map((goal) => (
            <OptionCard
              key={goal.value}
              label={goal.label}
              subtitle={goal.subtitle}
              selected={selected === goal.value}
              onPress={() => setSelected(goal.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onSurface }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (selected) {
              useUserStore.getState().setLearningMode(selected);
              router.push('/onboarding/motivation');
            }
          }}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: selected ? (pressed ? Colors.primary : Colors.primaryContainer) : Colors.surfaceDim,
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            transform: [{ scale: pressed && selected ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onPrimary }}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
