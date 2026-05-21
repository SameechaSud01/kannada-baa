import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
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
import { syncOnboardingToSupabase } from '../../services/api/onboarding';

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

  const openInfo = (minutes: Minutes) => {
    modal.show({
      kind: 'dialog',
      component: LearningTimeInfoDialog,
      props: { minutes, onDismiss: () => modal.dismiss() },
      dim: 0.4,
    });
  };

  const handleFinish = () => {
    if (!selected) return;

    const store = useUserStore.getState();
    const learningMode = store.learningMode ?? 'both';
    const motivations = store.motivations.length > 0 ? store.motivations : [];

    useUserStore.getState().setOnboarding({
      learningMode,
      motivations,
      dailyGoalMinutes: selected,
    });

    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      // Fire-and-forget: failure is logged inside the helper; user proceeds either way.
      void syncOnboardingToSupabase({
        userId,
        name: store.displayName,
        learningMode,
        motivations,
        dailyGoalMinutes: selected,
      });
    }

    router.replace('/(tabs)');
  };

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
          onPress={handleFinish}
          disabled={!selected}
          style={({ pressed }) => ({
            flex: 2,
            backgroundColor: selected ? (pressed ? Colors.primary : Colors.primaryContainer) : '#C8C4B0',
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            transform: [{ scale: pressed && selected ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onPrimary }}>
            Let's Go!
          </Text>
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
