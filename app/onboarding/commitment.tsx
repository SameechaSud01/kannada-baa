import { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { useUserStore } from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { completeOnboarding } from '../../services/api/users';
import { Toasts } from '../../components/modals/instances/toastCatalog';

const COMMITMENTS = [
  { value: 5 as const, label: '5 min / day', subtitle: 'Quick daily habit' },
  { value: 10 as const, label: '10 min / day', subtitle: 'Steady progress' },
  { value: 20 as const, label: '20 min / day', subtitle: 'Serious learner' },
];

export default function CommitmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<5 | 10 | 20 | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async () => {
    if (!selected || submitting) return;

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      Toasts.sessionLost();
      return;
    }

    const { learningMode, motivations } = useUserStore.getState();

    // Defensive — the screen flow should prevent this, but if the user
    // navigated here without completing earlier steps, route back instead
    // of submitting incomplete answers.
    if (!learningMode) {
      router.replace('/onboarding/goal');
      return;
    }
    if (motivations.length === 0) {
      router.replace('/onboarding/motivation');
      return;
    }

    setSubmitting(true);
    try {
      const row = await completeOnboarding(userId, {
        learning_mode: learningMode,
        motivations,
        daily_goal_minutes: selected,
      });
      useUserStore.getState().hydrateFromUserRow(row);
      router.replace('/(tabs)');
    } catch (err) {
      console.warn('[onboarding] completeOnboarding failed', err);
      Toasts.onboardingSaveFailed();
      setSubmitting(false);
    }
  };

  const canSubmit = !!selected && !submitting;

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
      <ProgressDots total={4} current={3} />

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
          Step 3 of 3
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(22),
            color: Colors.onSurface,
            marginBottom: Spacing.sm,
          }}
        >
          How much time can you commit?
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
          Set your daily learning goal
        </Text>

        <View style={{ gap: Spacing.md }}>
          {COMMITMENTS.map((item) => (
            <OptionCard
              key={item.value}
              label={item.label}
              subtitle={item.subtitle}
              selected={selected === item.value}
              onPress={() => setSelected(item.value)}
            />
          ))}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <Pressable
          onPress={() => router.back()}
          disabled={submitting}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            opacity: submitting ? 0.6 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onSurface }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={handleFinish}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Finish onboarding"
          accessibilityState={{ disabled: !canSubmit, busy: submitting }}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: selected ? (pressed ? Colors.primary : Colors.primaryContainer) : Colors.surfaceDim,
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: moderateScale(56),
            transform: [{ scale: pressed && canSubmit ? 0.97 : 1 }],
          })}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onPrimary }}>
              Let's Go!
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
