import { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import type { Lesson } from '../../constants/lessons/types';
import type { DrillAttempt } from '../../hooks/useLessonRunner';
import { useProgressStore } from '../../stores/progressStore';

interface DoneCardProps {
  lesson: Lesson;
  drillAttempts: DrillAttempt[];
  onClose: () => void;
}

export function DoneCard({ lesson, drillAttempts, onClose }: DoneCardProps) {
  const insets = useSafeAreaInsets();
  const [intentMarked, setIntentMarked] = useState(false);

  const correctCount = drillAttempts.filter((a) => a.correct).length;
  const totalDrills = drillAttempts.length;
  const phraseCount = lesson.intake.length;

  const completedAlready = useProgressStore((s) => s.completedLessons.includes(lesson.id));
  const completeLesson = useProgressStore((s) => s.completeLesson);
  const updateStreak = useProgressStore((s) => s.updateStreak);
  const recordActivity = useProgressStore((s) => s.recordActivity);

  useEffect(() => {
    // IMPORTANT: completeLesson() in progressStore over-increments xp,
    // totalPhrasesLearned, totalMinutesPracticed on duplicate calls
    // (only the completedLessons array is deduped at the action level).
    // The completedAlready check above is the load-bearing guard against
    // this bug. Do not call this useEffect without it.
    if (completedAlready) return;
    const score = totalDrills > 0 ? Math.round((correctCount / totalDrills) * 100) : 0;
    completeLesson(lesson.id, score, phraseCount, 0);
    updateStreak();
    recordActivity();
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
            fontSize: 24,
            color: Colors.onSurface,
            textAlign: 'center',
            lineHeight: 32,
            marginBottom: Spacing.xl,
          }}
        >
          Nice — that's the lesson done.
        </Text>

        {/* Stats block */}
        <View style={{ alignItems: 'flex-start', alignSelf: 'center', gap: Spacing.sm, marginBottom: Spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.tabLearn size={18} color={Colors.primary} />
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 15, color: Colors.onSurface }}>
              {phraseCount} {phraseCount === 1 ? 'phrase' : 'phrases'} learned
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.tabPractice size={18} color={Colors.primary} />
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 15, color: Colors.onSurface }}>
              {correctCount} of {totalDrills} drills correct
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Icons.mic size={18} color={Colors.primary} />
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 15, color: Colors.onSurface }}>
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
              fontSize: 12,
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
              fontSize: 17,
              color: Colors.onSecondaryContainer,
              lineHeight: 26,
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
                fontSize: 13,
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
            paddingVertical: Spacing.md + 2,
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed && !intentMarked ? 0.96 : 1 }],
          })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            {intentMarked && <Icons.correct size={16} color={Colors.onPrimary} />}
            <Text style={{ fontFamily: Fonts.dmSans.medium, fontSize: 15, color: Colors.onPrimary }}>
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
            minHeight: 44,
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 14,
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
