import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useCompletedLessons, useStreak } from '../../hooks/progress';
import { LESSONS, LESSON_ORDER } from '../../constants/lessons';
import {
  PLANNED_LESSON_SLOTS,
  TOTAL_LESSON_SLOTS,
} from '../../constants/lessons/plannedLessons';

const ESTIMATED_MIN_PER_LESSON = 5;

type RowState = 'done' | 'active' | 'locked';

type LessonRow = {
  slot: number;
  state: RowState;
  title: string;
  subtitle: string;
  char: string;
  phraseCount: number;
  realLessonId?: string;
  prevTitle?: string;
};

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();
  const streak = useStreak();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const completedCount = Math.min(completedLessons.length, TOTAL_LESSON_SLOTS);

  // Build 8 rows. Real lessons fill the first N slots; rest are placeholders.
  const rows: LessonRow[] = PLANNED_LESSON_SLOTS.map((slot, idx) => {
    const realId = LESSON_ORDER[idx];
    const real = realId ? LESSONS[realId] : undefined;
    const n = idx + 1;

    let state: RowState;
    if (n <= completedCount) state = 'done';
    else if (n === completedCount + 1) state = 'active';
    else state = 'locked';

    return {
      slot: n,
      state,
      title: real?.situation.title ?? slot.title,
      subtitle: slot.subtitle,
      char: slot.charPlaceholder,
      phraseCount: real?.intake.length ?? 0,
      realLessonId: realId,
      prevTitle:
        idx > 0
          ? (LESSON_ORDER[idx - 1] && LESSONS[LESSON_ORDER[idx - 1]]?.situation.title) ||
            PLANNED_LESSON_SLOTS[idx - 1].title
          : undefined,
    };
  });

  const handleRowPress = (row: LessonRow) => {
    if (row.state === 'locked') return;
    if (row.realLessonId) {
      router.push(`/lesson/${row.realLessonId}`);
    }
    // No-op for unlocked-but-placeholder rows — content arrives with Spec 04.
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
      {/* APP BAR — centred wordmark, streak right (no hamburger) */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 12,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ width: 56 }} />
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.bold,
            fontSize: 22,
            color: Colors.primary,
            letterSpacing: -0.3,
            lineHeight: 36,
            paddingTop: 4,
          }}
          maxFontSizeMultiplier={1.2}
        >
          ಕನ್ನಡ ಬಾ
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            minWidth: 56,
            justifyContent: 'flex-end',
          }}
          accessibilityRole="text"
          accessibilityLabel={`Current streak: ${streak} day${streak === 1 ? '' : 's'}`}
        >
          <Icons.streak size={20} color={Colors.primary} />
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 16,
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
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        {/* Section label + helper */}
        <View style={{ paddingHorizontal: 24, paddingTop: 12, marginBottom: 20 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 11,
              letterSpacing: 2.5,
              color: Colors.tertiary,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
            maxFontSizeMultiplier={1.4}
          >
            All lessons
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: 13,
              color: Colors.tertiary,
              lineHeight: 18,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Finish a lesson to unlock the next one.
          </Text>
        </View>

        {/* 8 lesson rows */}
        <View style={{ paddingHorizontal: 24, gap: 10 }}>
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
      disabled={isLocked}
      accessibilityRole={isLocked ? 'text' : 'button'}
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
        padding: 14,
        opacity: isLocked ? 0.5 : 1,
        transform: [{ scale: pressed && !isLocked ? 0.98 : 1 }],
        // Active ghost-border glow via inset shadow (No-Line rule).
        // RN can't render true inset shadows cross-platform without a lib —
        // we emit a subtle outer shadow tinted with the ghost-border colour
        // only on the active row.
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
      {/* Left tile — 46px, surface bg, Kannada char */}
      <View
        style={{
          width: 46,
          height: 46,
          borderRadius: Radius.md,
          backgroundColor: Colors.surface,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.bold,
            fontSize: 24,
            lineHeight: 36,
            paddingTop: 2,
            color: isDone ? Colors.primary : Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.2}
        >
          {row.char}
        </Text>
      </View>

      {/* Middle — number/title + subtitle */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: 15,
            color: Colors.onSurface,
            marginBottom: 3,
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {row.slot}. {row.title}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: 12,
            color: Colors.tertiary,
            lineHeight: 16,
          }}
          numberOfLines={2}
          maxFontSizeMultiplier={1.4}
        >
          {isLocked
            ? `Complete ${row.prevTitle ?? 'the previous lesson'} to unlock`
            : `${row.subtitle}${row.phraseCount ? ` · ${row.phraseCount} phrases · ${ESTIMATED_MIN_PER_LESSON} min` : ` · ${ESTIMATED_MIN_PER_LESSON} min`}`}
        </Text>
      </View>

      {/* Right — check / Start pill / lock */}
      <View style={{ marginLeft: 10 }}>
        {isDone && <Icons.lessonDone size={18} color={Colors.primary} />}
        {isActive && (
          <View
            style={{
              backgroundColor: Colors.primary,
              borderRadius: Radius.full,
              paddingVertical: 8,
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 12,
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
