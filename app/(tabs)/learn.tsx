import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useCompletedLessons, useStreak } from '../../hooks/progress';
import { useDbLessons } from '../../hooks/useLessons';
import {
  PLANNED_LESSON_SLOTS,
  TOTAL_LESSON_SLOTS,
} from '../../constants/lessons/plannedLessons';
import { useModal } from '../../components/modals/ModalHost';
import { LessonLockedDialog } from '../../components/modals/instances/LessonLockedDialog';

const ESTIMATED_MIN_PER_LESSON = 5;

type RowState = 'done' | 'active' | 'locked';

type LessonRow = {
  slot: number;
  state: RowState;
  title: string;
  subtitle: string;
  char: string;
  phraseCount: number;
  realLessonSlug?: string;
  prevTitle?: string;
  prevSlug?: string;
};

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();
  const streak = useStreak();
  const modal = useModal();
  const lessonsQuery = useDbLessons();
  const dbLessons = lessonsQuery.data ?? [];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const completedCount = Math.min(completedLessons.length, TOTAL_LESSON_SLOTS);

  const rows: LessonRow[] = PLANNED_LESSON_SLOTS.map((slot, idx) => {
    const real = dbLessons.find((l) => l.lessonNo === slot.slot);
    const prevReal = dbLessons.find((l) => l.lessonNo === slot.slot - 1);
    const n = idx + 1;

    let state: RowState;
    if (n <= completedCount) state = 'done';
    else if (n === completedCount + 1) state = 'active';
    else state = 'locked';

    return {
      slot: n,
      state,
      title: real?.title ?? slot.title,
      subtitle: slot.subtitle,
      char: slot.charPlaceholder,
      phraseCount: real?.phrases.length ?? 0,
      realLessonSlug: real?.slug,
      prevTitle: idx > 0 ? (prevReal?.title ?? PLANNED_LESSON_SLOTS[idx - 1].title) : undefined,
      prevSlug: prevReal?.slug,
    };
  });

  const handleRowPress = (row: LessonRow) => {
    if (row.state === 'locked') {
      const prevSlot = row.slot - 1;
      modal.show({
        kind: 'dialog',
        component: LessonLockedDialog,
        props: {
          lessonNumber: row.slot,
          lessonTitle: row.title,
          prevLessonNumber: prevSlot,
          prevLessonTitle: row.prevTitle ?? `Lesson ${prevSlot}`,
          onGoToPrev: () => {
            modal.dismiss();
            if (row.prevSlug) router.push(`/lesson/${row.prevSlug}`);
          },
          onDismiss: () => modal.dismiss(),
        },
        dim: 0.4,
      });
      return;
    }
    if (row.realLessonSlug) {
      router.push(`/lesson/${row.realLessonSlug}`);
    }
  };

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ width: moderateScale(56) }} />
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.bold,
            fontSize: moderateScale(22),
            color: Colors.primary,
            letterSpacing: -0.3,
            lineHeight: moderateScale(36),
            paddingTop: Spacing.xs,
          }}
          maxFontSizeMultiplier={1.2}
        >
          ಕನ್ನಡ ಬಾ
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: moderateScale(6),
            minWidth: moderateScale(56),
            justifyContent: 'flex-end',
          }}
          accessibilityRole="text"
          accessibilityLabel={`Current streak: ${streak} day${streak === 1 ? '' : 's'}`}
        >
          <Icons.streak size={20} color={Colors.primary} />
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(16),
              color: Colors.onSurface,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {streak}
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: moderateScale(40) + insets.bottom }}
      >
        <View
          style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, marginBottom: Spacing.xl }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 2.5,
              color: Colors.tertiary,
              textTransform: 'uppercase',
              marginBottom: moderateScale(6),
            }}
            maxFontSizeMultiplier={1.4}
          >
            All lessons
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              lineHeight: moderateScale(18),
            }}
            maxFontSizeMultiplier={1.4}
          >
            Finish a lesson to unlock the next one.
          </Text>
        </View>

        <View style={{ paddingHorizontal: Spacing.xxl, gap: moderateScale(10) }}>
          {rows.map((row) => (
            <LessonRowView
              key={`slot-${row.slot}`}
              row={row}
              onPress={() => handleRowPress(row)}
            />
          ))}
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function LessonRowView({ row, onPress }: { row: LessonRow; onPress: () => void }) {
  const isLocked = row.state === 'locked';
  const isDone = row.state === 'done';
  const isActive = row.state === 'active';

  const cardBg = isLocked ? Colors.surfaceContainerLow : Colors.surfaceContainerHighest;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        isLocked
          ? `Locked. Complete ${row.prevTitle ?? 'the previous lesson'} to unlock.`
          : `${row.slot}. ${row.title}${isDone ? ', completed' : ', start'}`
      }
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: cardBg,
        borderRadius: Radius.lg,
        padding: moderateScale(14),
        opacity: isLocked ? 0.5 : 1,
        transform: [{ scale: pressed && !isLocked ? 0.98 : 1 }],
        ...(isActive
          ? {
              shadowColor: Colors.outlineVariant,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.6,
              shadowRadius: 6,
              elevation: 0,
            }
          : {}),
      })}
    >
      <View
        style={{
          width: moderateScale(46),
          height: moderateScale(46),
          borderRadius: Radius.md,
          backgroundColor: Colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: moderateScale(14),
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.bold,
            fontSize: moderateScale(24),
            lineHeight: moderateScale(36),
            paddingTop: moderateScale(2),
            color: isDone ? Colors.primary : Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {row.char}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(15),
            color: Colors.onSurface,
            marginBottom: moderateScale(3),
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {row.slot}. {row.title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(12),
            color: Colors.tertiary,
            lineHeight: moderateScale(16),
          }}
          numberOfLines={2}
          maxFontSizeMultiplier={1.4}
        >
          {isLocked
            ? `Complete ${row.prevTitle ?? 'the previous lesson'} to unlock`
            : `${row.subtitle}${row.phraseCount ? ` · ${row.phraseCount} phrases · ${ESTIMATED_MIN_PER_LESSON} min` : ` · ${ESTIMATED_MIN_PER_LESSON} min`}`}
        </Text>
      </View>

      <View style={{ marginLeft: moderateScale(10) }}>
        {isDone && <Icons.lessonDone size={18} color={Colors.primary} />}
        {isActive && (
          <View
            style={{
              backgroundColor: Colors.primary,
              borderRadius: Radius.full,
              paddingVertical: Spacing.sm,
              paddingHorizontal: Spacing.lg,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(12),
                letterSpacing: 0.5,
                color: Colors.surface,
              }}
              maxFontSizeMultiplier={1.2}
            >
              Start
            </Text>
          </View>
        )}
        {isLocked && (
          <View style={{ opacity: 0.5 }}>
            <Icons.locked size={16} color={Colors.tertiary} />
          </View>
        )}
      </View>
    </Pressable>
  );
}
