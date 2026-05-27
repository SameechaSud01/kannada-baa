import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { useAuthStore } from '../../stores/useAuthStore';
import { useDbLessons } from '../../hooks/useLessons';
import { useUserStore } from '../../stores/useUserStore';
import { PLANNED_LESSON_SLOTS, TOTAL_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import { formatFirstName } from '../../utils/formatName';
import { useCompletedLessons, useStreak } from '../../hooks/progress';
import { useKarnatakaFunFacts } from '../../hooks/useKarnatakaFunFacts';
import type { FunFact } from '../../services/api/karnataka_fun_facts';
import FUN_FACTS_FALLBACK from '../../data/karnataka_fun_facts.json';

const ESTIMATED_MIN_PER_LESSON = 5;

type CardFact = Pick<FunFact, 'category' | 'fact'>;

function factOfDayIndex(arrayLength: number): number {
  if (arrayLength <= 0) return 0;
  const dateStr = new Date().toISOString().split('T')[0];
  let sum = 0;
  for (let i = 0; i < dateStr.length; i++) sum += dateStr.charCodeAt(i);
  return sum % arrayLength;
}

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const completedLessons = useCompletedLessons();
  const streak = useStreak();
  const user = useAuthStore((s) => s.user);
  const displayName = useUserStore((s) => s.displayName);
  const lessonsQuery = useDbLessons();
  const dbLessons = lessonsQuery.data ?? [];
  const factsQuery = useKarnatakaFunFacts();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (factsQuery.error) {
      console.warn('[home] fun-facts fetch failed', factsQuery.error);
    }
  }, [factsQuery.error]);

  const rawName =
    displayName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there';
  const userName = formatFirstName(rawName, 'there');

  // Karnataka fun fact — DB-backed with bundled JSON fallback.
  const facts: readonly CardFact[] =
    factsQuery.data && factsQuery.data.length > 0
      ? factsQuery.data
      : (FUN_FACTS_FALLBACK as readonly CardFact[]);
  const factOfDay = facts[factOfDayIndex(facts.length)];

  const completedSlugSet = new Set(completedLessons);

  const completedCount = Math.min(completedLessons.length, TOTAL_LESSON_SLOTS);
  const progressPercent = Math.round((completedCount / TOTAL_LESSON_SLOTS) * 100);
  const ringSize = moderateScale(76);
  const ringStroke = moderateScale(7);
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc * (1 - completedCount / TOTAL_LESSON_SLOTS);

  const nextLessonSlot = dbLessons.find((l) => !completedSlugSet.has(l.slug));
  const nextSlot = PLANNED_LESSON_SLOTS[completedCount];
  const nextTitle = nextLessonSlot?.title ?? nextSlot?.title ?? 'All caught up';

  const allDone = completedCount >= TOTAL_LESSON_SLOTS;

  const handleStartNext = () => {
    if (nextLessonSlot) router.push(`/lesson/${nextLessonSlot.slug}`);
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
        <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14),
              letterSpacing: 0.2,
              color: Colors.tertiary,
              marginBottom: Spacing.xxl,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Namaskāra, {userName}
          </Text>

          {/* Karnataka fun fact */}
          <View
            accessibilityRole="text"
            accessibilityLabel={`Did you know? ${factOfDay.category}. ${factOfDay.fact}`}
            style={{
              backgroundColor: Colors.surfaceContainerLow,
              borderRadius: Radius.xl,
              padding: Spacing.xxl,
              marginBottom: Spacing.lg,
            }}
          >
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
              Did you know?
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(10),
                letterSpacing: 1.4,
                color: Colors.secondary,
                textTransform: 'uppercase',
                marginTop: moderateScale(4),
              }}
              maxFontSizeMultiplier={1.4}
            >
              {factOfDay.category}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.lora.italic,
                fontSize: moderateScale(16),
                lineHeight: moderateScale(24),
                color: Colors.primary,
                marginTop: moderateScale(14),
              }}
              maxFontSizeMultiplier={1.3}
            >
              {factOfDay.fact}
            </Text>
          </View>

          {/* Progress ring */}
          <Pressable
            onPress={handleStartNext}
            disabled={allDone || !nextLessonSlot}
            accessibilityRole={nextLessonSlot ? 'button' : 'text'}
            accessibilityLabel={`Progress: ${completedCount} of ${TOTAL_LESSON_SLOTS} lessons. Next: ${nextTitle}.`}
            style={({ pressed }) => ({
              backgroundColor: Colors.surfaceContainerHighest,
              borderRadius: Radius.xl,
              padding: Spacing.xxl,
              marginBottom: Spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(22),
              transform: [{ scale: pressed && nextLessonSlot ? 0.98 : 1 }],
            })}
          >
            <View
              style={{
                width: ringSize,
                height: ringSize,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Svg
                width={ringSize}
                height={ringSize}
                style={{ transform: [{ rotate: '-90deg' }] }}
              >
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  stroke={Colors.surfaceDim}
                  strokeWidth={ringStroke}
                  fill="transparent"
                />
                <Circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringR}
                  stroke={Colors.primary}
                  strokeWidth={ringStroke}
                  fill="transparent"
                  strokeDasharray={ringCirc}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                />
              </Svg>
              <Text
                style={{
                  position: 'absolute',
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(16),
                  color: Colors.primary,
                }}
                maxFontSizeMultiplier={1.2}
              >
                {progressPercent}%
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(11),
                  letterSpacing: 2,
                  color: Colors.tertiary,
                  textTransform: 'uppercase',
                  marginBottom: moderateScale(6),
                }}
                maxFontSizeMultiplier={1.4}
              >
                Your progress
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(18),
                  color: Colors.onSurface,
                  marginBottom: Spacing.xs,
                }}
                maxFontSizeMultiplier={1.3}
              >
                {completedCount} of {TOTAL_LESSON_SLOTS} lessons
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(13),
                  color: Colors.tertiary,
                  lineHeight: moderateScale(18),
                }}
                numberOfLines={2}
                maxFontSizeMultiplier={1.4}
              >
                {allDone
                  ? 'All caught up — more lessons coming soon.'
                  : `Next: ${nextTitle} · ${ESTIMATED_MIN_PER_LESSON} min`}
              </Text>
            </View>
          </Pressable>

          {/* Emergency Kannada Guide */}
          <Pressable
            onPress={() => router.push('/emergency')}
            accessibilityRole="button"
            accessibilityLabel="Stuck right now? Survival phrases for the auto, shop and street."
            style={({ pressed }) => ({
              backgroundColor: Colors.surfaceContainerHighest,
              borderRadius: Radius.xl,
              padding: Spacing.xl,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.lg,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View
              style={{
                width: moderateScale(48),
                height: moderateScale(48),
                borderRadius: Radius.lg,
                backgroundColor: Colors.surfaceContainerHigh,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.emergency size={22} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(16),
                  color: Colors.primary,
                  marginBottom: moderateScale(2),
                }}
                maxFontSizeMultiplier={1.3}
              >
                Stuck right now?
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(13),
                  color: Colors.tertiary,
                  lineHeight: moderateScale(18),
                }}
                numberOfLines={2}
                maxFontSizeMultiplier={1.4}
              >
                Survival phrases for the auto, shop & street
              </Text>
            </View>
            <Icons.forward size={18} color={Colors.tertiary} />
          </Pressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
}
