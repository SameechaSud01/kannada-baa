import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { useModal } from '../../components/modals/ModalHost';
import { LearningTimeInfoDialog } from '../../components/modals/instances/LearningTimeInfoDialog';
import { useUserStore } from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { completeOnboarding } from '../../services/api/users';
import { Toasts } from '../../components/modals/instances/toastCatalog';

type Minutes = 5 | 10 | 20;

const COMMITMENTS: { value: Minutes; label: string; subtitle: string }[] = [
  { value: 5, label: '5 min / day', subtitle: 'Quick daily habit' },
  { value: 10, label: '10 min / day', subtitle: 'Steady progress' },
  { value: 20, label: '20 min / day', subtitle: 'Serious learner' },
];

export default function CommitmentScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const modal = useModal();
  const [selected, setSelected] = useState<Minutes | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const openInfo = (minutes: Minutes) => {
    modal.show({
      kind: 'dialog',
      component: LearningTimeInfoDialog,
      props: { minutes, onDismiss: () => modal.dismiss() },
      dim: 0.4,
    });
  };

  const handleFinish = async () => {
    if (!selected || submitting) return;

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      Toasts.sessionLost();
      return;
    }

    const { displayName, learningMode, motivations } = useUserStore.getState();

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
        name: displayName ?? null,
        learning_mode: learningMode,
        motivations,
        daily_goal_minutes: selected,
      });
      useUserStore.getState().hydrateFromUserRow(row);
      router.replace('/(tabs)');
    } catch (err) {
      // spec_security_hardening.md §6: don't trap the user on commitment if the
      // sync fails. Capture the answers, mark local onboarding done, route
      // forward — the boot path retries on next session.
      console.warn('[onboarding] completeOnboarding failed; queued for retry', err);
      useUserStore.getState().setOnboarding({
        displayName: displayName ?? undefined,
        learningMode,
        motivations,
        dailyGoalMinutes: selected,
      });
      useUserStore.getState().setPendingOnboardingSync({
        displayName: displayName ?? undefined,
        learningMode,
        motivations,
        dailyGoalMinutes: selected,
      });
      router.replace('/(tabs)');
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
      <ProgressDots total={5} current={4} />

      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2,
            color: Colors.tertiary,
            textTransform: 'uppercase',
            marginBottom: Spacing.sm,
          }}
          maxFontSizeMultiplier={1.4}
        >
          Step 4 of 4
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(28),
            color: Colors.onSurface,
            marginBottom: Spacing.sm,
          }}
          maxFontSizeMultiplier={1.3}
        >
          How much time can{'\n'}you commit?
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15),
            color: Colors.tertiary,
            marginBottom: Spacing.xxxl,
          }}
          maxFontSizeMultiplier={1.4}
        >
          Set your daily learning goal
        </Text>

        <View style={{ gap: Spacing.md }}>
          {COMMITMENTS.map((item) => (
            <CommitmentCard
              key={item.value}
              label={item.label}
              subtitle={item.subtitle}
              selected={selected === item.value}
              onPress={() => setSelected(item.value)}
              onInfoPress={() => openInfo(item.value)}
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
            flex: 2,
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

interface CommitmentCardProps {
  label: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  onInfoPress: () => void;
}

function CommitmentCard({ label, subtitle, selected, onPress, onInfoPress }: CommitmentCardProps) {
  const InfoIcon = Icons.info;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? '#FFF5F5' : Colors.surfaceContainerLowest,
        borderWidth: moderateScale(2),
        borderColor: selected ? Colors.primaryContainer : '#E0DDD0',
        borderRadius: moderateScale(16),
        padding: moderateScale(18),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View style={{ flex: 1, marginRight: Spacing.md }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            marginBottom: Spacing.xs,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {subtitle}
        </Text>
      </View>
      {selected ? (
        <View
          style={{
            width: moderateScale(24),
            height: moderateScale(24),
            borderRadius: moderateScale(12),
            backgroundColor: Colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12l5 5L20 7"
              stroke={Colors.onPrimary}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      ) : (
        <Pressable
          onPress={onInfoPress}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`More about ${label}`}
          style={({ pressed }) => ({
            width: moderateScale(28),
            height: moderateScale(28),
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 1,
          })}
        >
          <InfoIcon size={moderateScale(22)} color={Colors.tertiary} strokeWidth={2} />
        </Pressable>
      )}
    </Pressable>
  );
}
