import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { GUIDE_SECTIONS } from '../../constants/guide';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { GuidePager, type GuidePagerHandle } from '../../components/guide/GuidePager';
import { GuideDots } from '../../components/guide/GuideDots';
import { useUserStore } from '../../stores/useUserStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { completeOnboarding } from '../../services/api/users';
import { Toasts } from '../../components/modals/instances/toastCatalog';

/**
 * Step 6 of 6 — Beginners' Guide primer (forced once during onboarding).
 * See spec_beginners_guide.md.
 */
export default function BasicsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const pagerRef = useRef<GuidePagerHandle>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [hasReachedLast, setHasReachedLast] = useState(false);

  const totalPages = GUIDE_SECTIONS.length;
  const showContinue = hasReachedLast;

  const handlePageChange = useCallback((idx: number) => {
    setActivePage(idx);
    if (idx >= GUIDE_SECTIONS.length - 1) {
      setHasReachedLast(true);
    }
  }, []);

  const finishOnboarding = async () => {
    if (submitting) return;

    const userId = useAuthStore.getState().user?.id;
    if (!userId) {
      Toasts.sessionLost();
      return;
    }

    const { displayName, learningMode, motivations, dailyGoalMinutes } =
      useUserStore.getState();

    if (!learningMode) {
      router.replace('/onboarding/goal');
      return;
    }
    if (motivations.length === 0) {
      router.replace('/onboarding/motivation');
      return;
    }
    if (!dailyGoalMinutes) {
      router.replace('/onboarding/commitment');
      return;
    }

    setSubmitting(true);
    try {
      const row = await completeOnboarding(userId, {
        name: displayName ?? null,
        learning_mode: learningMode,
        motivations,
        daily_goal_minutes: dailyGoalMinutes,
      });
      useUserStore.getState().hydrateFromUserRow(row);
      useUserStore.getState().setHasSeenBasicsGuide(true);
      router.replace('/(tabs)');
    } catch (err) {
      // spec_security_hardening.md §6: don't trap the user if the sync fails.
      // Capture answers, mark local onboarding done, route forward — boot path
      // retries on next session.
      console.warn('[onboarding] completeOnboarding failed; queued for retry', err);
      useUserStore.getState().setOnboarding({
        displayName: displayName ?? undefined,
        learningMode,
        motivations,
        dailyGoalMinutes,
      });
      useUserStore.getState().setPendingOnboardingSync({
        displayName: displayName ?? undefined,
        learningMode,
        motivations,
        dailyGoalMinutes,
      });
      router.replace('/(tabs)');
    }
  };

  const handlePrimaryPress = () => {
    if (showContinue) {
      void finishOnboarding();
    } else {
      pagerRef.current?.goToPage(activePage + 1);
    }
  };

  const buttonLabel = showContinue ? 'Continue' : 'Next';

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: insets.top + Spacing.xl,
      }}
    >
      <View style={{ paddingHorizontal: Spacing.xxl }}>
        <ProgressDots total={6} current={5} />
      </View>

      <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.xxl }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2,
            color: Colors.tertiary,
            textTransform: 'uppercase',
          }}
          maxFontSizeMultiplier={1.4}
        >
          Step 5 of 5
        </Text>
      </View>

      <GuidePager
        ref={pagerRef}
        showOnboardingHeader
        onPageChange={handlePageChange}
      />

      <View
        style={{
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.md,
          paddingBottom: insets.bottom + Spacing.lg,
          backgroundColor: Colors.surface,
          gap: Spacing.lg,
        }}
      >
        <GuideDots total={totalPages} current={activePage} />

        <Pressable
          onPress={handlePrimaryPress}
          disabled={submitting}
          accessibilityRole="button"
          accessibilityLabel={
            showContinue ? 'Continue to the home screen' : `Next: page ${activePage + 2} of ${totalPages}`
          }
          accessibilityState={{ busy: submitting, disabled: submitting }}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: moderateScale(56),
            opacity: submitting ? 0.7 : 1,
            transform: [{ scale: pressed && !submitting ? 0.97 : 1 }],
          })}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(16),
                color: Colors.onPrimary,
              }}
            >
              {buttonLabel}
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
