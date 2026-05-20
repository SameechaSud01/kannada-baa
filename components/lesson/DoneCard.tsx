import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import type { Lesson } from '../../constants/lessons/types';
import type { DrillAttempt } from '../../hooks/useLessonRunner';
import { useProgressStore } from '../../stores/progressStore';
import { useUserStore } from '../../stores/useUserStore';
import { useModal } from '../../components/modals/ModalHost';
import { GoalCompleteDialog } from '../../components/modals/instances/GoalCompleteDialog';
import {
  StreakMilestoneTakeover,
  isStreakMilestone,
} from '../../components/modals/instances/StreakMilestoneTakeover';

const ESTIMATED_MIN_PER_LESSON = 5;

interface DoneCardProps {
  lesson: Lesson;
  drillAttempts: DrillAttempt[];
  onClose: () => void;
}

export function DoneCard({ lesson, drillAttempts, onClose }: DoneCardProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [intentMarked, setIntentMarked] = useState(false);

  const correctCount = drillAttempts.filter((a) => a.correct).length;
  const totalDrills = drillAttempts.length;
  const phraseCount = lesson.intake.length;

  const completeLesson = useProgressStore((s) => s.completeLesson);
  const updateStreak = useProgressStore((s) => s.updateStreak);
  const recordActivity = useProgressStore((s) => s.recordActivity);
  const markGoalCelebrated = useProgressStore((s) => s.markGoalCelebrated);
  const dailyGoalMinutes = useUserStore((s) => s.dailyGoalMinutes);
  const modal = useModal();

  useEffect(() => {
    const score = totalDrills > 0 ? Math.round((correctCount / totalDrills) * 100) : 0;

    // Snapshot pre-completion state so we can detect milestone transitions.
    const prevStreak = useProgressStore.getState().streak;
    const prevTodayMinutes =
      useProgressStore.getState().todayMinutesDate ===
      new Date().toISOString().split('T')[0]
        ? useProgressStore.getState().todayMinutes
        : 0;

    completeLesson(lesson.id, score, phraseCount, ESTIMATED_MIN_PER_LESSON);
    updateStreak();
    recordActivity();

    const post = useProgressStore.getState();
    const today = new Date().toISOString().split('T')[0];

    // Streak milestone (takeover) — only fires when the streak number changed
    // into a configured milestone this completion.
    if (
      post.streak !== prevStreak &&
      isStreakMilestone(post.streak)
    ) {
      modal.show({
        kind: 'takeover',
        component: StreakMilestoneTakeover,
        props: {
          streak: post.streak,
          nWordsLearned: post.totalPhrasesLearned,
          onContinue: () => modal.dismiss(),
        },
      });
      return;
    }

    // Daily-goal celebration (dialog) — fires the first time today crosses goal.
    if (
      dailyGoalMinutes &&
      prevTodayMinutes < dailyGoalMinutes &&
      post.todayMinutes >= dailyGoalMinutes &&
      post.lastGoalCelebrationDate !== today
    ) {
      markGoalCelebrated();
      modal.show({
        kind: 'dialog',
        component: GoalCompleteDialog,
        props: {
          goalMinutes: dailyGoalMinutes,
          streakDays: post.streak,
          onOneMore: () => {
            modal.dismiss();
            router.push('/(tabs)/learn');
          },
          onDone: () => modal.dismiss(),
        },
      });
    }

    console.log('[lesson] completed', { lessonId: lesson.id, phrasesLearned: phraseCount });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkIntent = () => {
    if (intentMarked) return;
    console.log('[done] real-life intent marked', { lessonId: lesson.id });
    setIntentMarked(true);
  };

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
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(24),
            color: Colors.onSurface,
            textAlign: 'center',
            lineHeight: moderateScale(32),
            marginBottom: Spacing.xl,
          }}
        >
          Nice — that's the lesson done.
        </Text>

        {/* Stats block */}
        <View style={{ alignItems: 'flex-start', alignSelf: 'center', gap: Spacing.sm, marginBottom: Spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.tabLearn size={18} color={Colors.primary} />
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(15), color: Colors.onSurface }}>
              {phraseCount} {phraseCount === 1 ? 'phrase' : 'phrases'} learned
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.tabPractice size={18} color={Colors.primary} />
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(15), color: Colors.onSurface }}>
              {correctCount} of {totalDrills} drills correct
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.mic size={18} color={Colors.primary} />
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(15), color: Colors.onSurface }}>
              You spoke Kannada today
            </Text>
          </View>
        </View>

        {/* Real-world prompt card */}
        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.xl,
            padding: Spacing.xxl,
            marginBottom: Spacing.lg,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(12),
              color: Colors.tertiary,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
          >
            Take it outside
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(17),
              color: Colors.onSecondaryContainer,
              lineHeight: moderateScale(26),
            }}
          >
            {lesson.situation.realWorldPrompt}
          </Text>
        </View>

        {intentMarked && (
          <View
            style={{
              backgroundColor: Colors.secondaryFixed,
              borderRadius: Radius.md,
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.lg,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: moderateScale(13),
                color: Colors.primaryContainer,
                textAlign: 'center',
              }}
            >
              Nice. We'll check in tomorrow.
            </Text>
          </View>
        )}
      </ScrollView>

      <View
        style={{
          padding: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.lg,
          gap: Spacing.md,
        }}
      >
        <Pressable
          onPress={handleMarkIntent}
          disabled={intentMarked}
          accessibilityRole="button"
          accessibilityLabel="Commit to trying this in real life"
          style={({ pressed }) => ({
            backgroundColor: intentMarked
              ? Colors.surfaceDim
              : pressed
                ? Colors.primary
                : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + moderateScale(2),
            minHeight: moderateScale(44),
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed && !intentMarked ? 0.96 : 1 }],
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            {intentMarked && <Icons.correct size={16} color={Colors.onPrimary} />}
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: moderateScale(15), color: Colors.onPrimary }}>
              {intentMarked ? 'Committed' : "I'll try this in real life"}
            </Text>
          </View>
        </Pressable>

        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Back to lessons"
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.surfaceContainerHigh : 'transparent',
            borderRadius: Radius.md,
            paddingVertical: Spacing.md,
            minHeight: moderateScale(44),
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
            }}
          >
            Back to lessons
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
