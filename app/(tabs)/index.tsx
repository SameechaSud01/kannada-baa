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
import { LESSONS, LESSON_ORDER } from '../../constants/lessons';
import { PLANNED_LESSON_SLOTS, TOTAL_LESSON_SLOTS } from '../../constants/lessons/plannedLessons';
import type { Phrase } from '../../constants/lessons/types';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { useModal } from '../../components/modals/ModalHost';
import { PhraseDetailSheet } from '../../components/modals/instances/PhraseDetailSheet';
import { formatFirstName } from '../../utils/formatName';
import { useCompletedLessons, useStreak } from '../../hooks/progress';

const STARTER_PHRASE: Phrase = {
  id: 'starter.namaskara',
  kannada: 'ನಮಸ್ಕಾರ',
  transliteration: 'Namaskāra',
  english: 'Hello / Greetings',
  vocabAtoms: ['ನಮಸ್ಕಾರ'],
};

const ESTIMATED_MIN_PER_LESSON = 5;

function speakable(text: string): string {
  return text.replace(/\[name\]/g, '').trim();
}

function wordOfDayIndex(arrayLength: number): number {
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
  const modal = useModal();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const rawName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there';
  const userName = formatFirstName(rawName, 'there');

  // Word of the Day — drawn from learned phrases when available
  const completedPhrases: Phrase[] = completedLessons
    .map((id) => LESSONS[id])
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .flatMap((l) => l.intake);
  const hasCompletedPhrases = completedPhrases.length > 0;
  const wordOfDay: Phrase = hasCompletedPhrases
    ? completedPhrases[wordOfDayIndex(completedPhrases.length)]
    : STARTER_PHRASE;
  const wordOfDayKn = speakable(wordOfDay.kannada) || wordOfDay.kannada;

  // Progress = lessons completed / 8 (Spec 01 §1)
  const completedCount = Math.min(completedLessons.length, TOTAL_LESSON_SLOTS);
  const progressPercent = Math.round((completedCount / TOTAL_LESSON_SLOTS) * 100);
  const ringSize = moderateScale(76);
  const ringStroke = moderateScale(7);
  const ringR = (ringSize - ringStroke) / 2;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc * (1 - completedCount / TOTAL_LESSON_SLOTS);

  // Next lesson — real if available, otherwise the next planned slot title
  const nextLessonRealId = LESSON_ORDER.find((id) => !completedLessons.includes(id));
  const nextLesson = nextLessonRealId ? LESSONS[nextLessonRealId] : null;
  const nextSlot = PLANNED_LESSON_SLOTS[completedCount];
  const nextTitle = nextLesson?.situation.title ?? nextSlot?.title ?? 'All caught up';

  const allDone = completedCount >= TOTAL_LESSON_SLOTS;

  const handleStartNext = () => {
    if (nextLessonRealId) router.push(`/lesson/${nextLessonRealId}`);
  };

  const handleListenWordOfDay = () => {
    const txt = speakable(wordOfDay.kannada);
    if (!txt) return;
    deviceTtsAudioService
      .play(txt)
      .catch((err) => {
        console.warn('[audio] home word-of-day failed', err);
        Toasts.audioFailed(handleListenWordOfDay);
      });
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
      {/* ── APP BAR — empty left, centred wordmark, streak right (no hamburger) ── */}
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
          {/* Greeting line */}
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

          {/* ── 1. WORD OF THE DAY ── */}
          <Pressable
            onPress={() =>
              modal.show({
                kind: 'sheet',
                component: PhraseDetailSheet,
                props: {
                  phrase: wordOfDay,
                  onDismiss: () => modal.dismiss(),
                },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Word of the day: ${wordOfDay.english}. Tap for breakdown.`}
            style={({ pressed }) => ({
              backgroundColor: Colors.surfaceContainerLow,
              borderRadius: Radius.xl,
              padding: Spacing.xxl,
              marginBottom: Spacing.lg,
              transform: [{ scale: pressed ? 0.99 : 1 }],
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(11),
                letterSpacing: 2,
                color: Colors.tertiary,
                textTransform: 'uppercase',
                marginBottom: moderateScale(14),
              }}
              maxFontSizeMultiplier={1.4}
            >
              Word of the day
            </Text>
            <Text
              style={{
                fontFamily: Fonts.notoSerifKannada.bold,
                fontSize: moderateScale(36),
                lineHeight: moderateScale(52),
                color: Colors.primary,
                marginBottom: moderateScale(6),
              }}
              maxFontSizeMultiplier={1.3}
              adjustsFontSizeToFit
              numberOfLines={2}
            >
              {wordOfDayKn}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.lora.italic,
                fontSize: moderateScale(15),
                color: Colors.onSurface,
                marginBottom: Spacing.xs,
              }}
              maxFontSizeMultiplier={1.4}
            >
              {wordOfDay.transliteration}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(13),
                color: Colors.tertiary,
                marginBottom: moderateScale(14),
              }}
              maxFontSizeMultiplier={1.4}
            >
              {wordOfDay.english}
            </Text>
            <Pressable
              onPress={handleListenWordOfDay}
              accessibilityRole="button"
              accessibilityLabel={`Listen: ${wordOfDay.english}`}
              hitSlop={8}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: Spacing.sm,
                minHeight: moderateScale(44),
                alignSelf: 'flex-start',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Icons.audio size={18} color={Colors.secondary} />
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: moderateScale(11),
                  letterSpacing: 1.8,
                  color: Colors.secondary,
                  textTransform: 'uppercase',
                }}
              >
                Listen
              </Text>
            </Pressable>
          </Pressable>

          {/* ── 2. YOUR PROGRESS — lessons/8 ring ── */}
          <Pressable
            onPress={handleStartNext}
            disabled={allDone || !nextLessonRealId}
            accessibilityRole={nextLessonRealId ? 'button' : 'text'}
            accessibilityLabel={`Progress: ${completedCount} of ${TOTAL_LESSON_SLOTS} lessons. Next: ${nextTitle}.`}
            style={({ pressed }) => ({
              backgroundColor: Colors.surfaceContainerHighest,
              borderRadius: Radius.xl,
              padding: Spacing.xxl,
              marginBottom: Spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: moderateScale(22),
              transform: [{ scale: pressed && nextLessonRealId ? 0.98 : 1 }],
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

          {/* ── 3. EMERGENCY KANNADA GUIDE ── */}
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
