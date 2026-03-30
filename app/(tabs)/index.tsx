import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { LessonCard } from '../../components/ui/LessonCard';
import { CultureCard } from '../../components/ui/CultureCard';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/authStore';
import lessonsData from '../../data/lessons.json';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { streak, lessonProgress, completedLessons } = useProgressStore();
  const user = useAuthStore((s) => s.user);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const lessons = lessonsData.lessons;

  // Find current lesson (first non-completed or first)
  const currentLessonIndex = lessons.findIndex(
    (l) => !completedLessons.includes(l.id)
  );
  const activeLessonIdx = currentLessonIndex >= 0 ? currentLessonIndex : 0;
  const activeLesson = lessons[activeLessonIdx];
  const activeLessonProgress = lessonProgress[activeLesson.id] ?? 0;
  const progressPercent = activeLessonProgress / activeLesson.totalPhrases;

  const greeting = getGreeting();
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there';

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.pageBg,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Bar */}
        <View
          style={{
            paddingTop: insets.top + Spacing.sm,
            backgroundColor: Colors.primary,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: Spacing.lg,
              paddingBottom: Spacing.md,
            }}
          >
            {/* Avatar placeholder */}
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: Radius.full,
                backgroundColor: Colors.primaryDark,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 13,
                  color: Colors.textOnGreen,
                }}
              >
                {userName[0]?.toUpperCase()}
              </Text>
            </View>

            {/* Title */}
            <Text
              style={{
                fontFamily: Fonts.lora.italic,
                fontSize: 17,
                color: Colors.textOnGreen,
              }}
            >
              Kannada Baa
            </Text>

            {/* Flame icon */}
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2c.5 3.5 4 6 4 10a4 4 0 0 1-8 0c0-4 3.5-6.5 4-10z"
                fill={Colors.accent}
                stroke={Colors.accent}
                strokeWidth={1.5}
              />
            </Svg>
          </View>
        </View>

        {/* Green Hero */}
        <View
          style={{
            backgroundColor: Colors.primary,
            paddingHorizontal: Spacing.lg,
            paddingBottom: Spacing.xxl,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Faint ಕ watermark */}
          <Text
            style={{
              position: 'absolute',
              right: -20,
              top: -30,
              fontFamily: Fonts.notoSerifKannada.bold,
              fontSize: 200,
              color: Colors.textOnGreen,
              opacity: 0.06,
            }}
          >
            ಕ
          </Text>

          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 10,
              letterSpacing: 1.4,
              color: Colors.textOnGreen,
              opacity: 0.7,
              marginBottom: Spacing.sm,
            }}
          >
            KANNADA BAA
          </Text>

          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 22,
              color: Colors.textOnGreen,
              marginBottom: Spacing.md,
            }}
          >
            {greeting}, {userName}
          </Text>

          {/* Streak pill */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: Radius.full,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.xs + 2,
              alignSelf: 'flex-start',
              gap: Spacing.xs,
            }}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 2c.5 3.5 4 6 4 10a4 4 0 0 1-8 0c0-4 3.5-6.5 4-10z"
                fill={Colors.accent}
              />
            </Svg>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 12,
                color: Colors.accent,
              }}
            >
              {streak}-day streak
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={{ padding: Spacing.lg }}>
          {/* Continue Learning */}
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 10,
              letterSpacing: 1.4,
              color: Colors.textTertiary,
              marginBottom: Spacing.md,
            }}
          >
            CONTINUE LEARNING
          </Text>

          <LessonCard
            title={activeLesson.title}
            lessonNumber={activeLessonIdx + 1}
            totalLessons={lessons.length}
            progress={progressPercent}
            onPress={() => router.push(`/lesson/${activeLesson.id}`)}
          />

          {/* Activities */}
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 10,
              letterSpacing: 1.4,
              color: Colors.textTertiary,
              marginTop: Spacing.xxl,
              marginBottom: Spacing.md,
            }}
          >
            ACTIVITIES
          </Text>

          {/* Large activity card */}
          <Pressable
            onPress={() => router.push('/(tabs)/practice')}
            style={({ pressed }) => ({
              backgroundColor: Colors.primaryLight,
              borderRadius: Radius.lg,
              padding: Spacing.lg,
              marginBottom: Spacing.md,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 10,
                letterSpacing: 0.5,
                color: Colors.primary,
                marginBottom: Spacing.xs,
              }}
            >
              ROLEPLAY PRACTICE
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: 15,
                color: Colors.textBody,
              }}
            >
              Order food in Kannada
            </Text>
          </Pressable>

          {/* 2-column grid */}
          <View style={{ flexDirection: 'row', gap: Spacing.md }}>
            <Pressable
              onPress={() => router.push('/(tabs)/practice')}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: Colors.cardBg,
                borderWidth: 0.5,
                borderColor: Colors.border,
                borderRadius: Radius.lg,
                padding: Spacing.lg,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.medium,
                  fontSize: 14,
                  color: Colors.textBody,
                }}
              >
                Daily Vocab
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: 11,
                  color: Colors.textTertiary,
                  marginTop: Spacing.xs,
                }}
              >
                5 new words
              </Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/practice')}
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: Colors.cardBg,
                borderWidth: 0.5,
                borderColor: Colors.border,
                borderRadius: Radius.lg,
                padding: Spacing.lg,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.medium,
                  fontSize: 14,
                  color: Colors.textBody,
                }}
              >
                Quick Quiz
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: 11,
                  color: Colors.textTertiary,
                  marginTop: Spacing.xs,
                }}
              >
                Test yourself
              </Text>
            </Pressable>
          </View>

          {/* Cultural Insight */}
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 10,
              letterSpacing: 1.4,
              color: Colors.textTertiary,
              marginTop: Spacing.xxl,
              marginBottom: Spacing.md,
            }}
          >
            CULTURAL INSIGHT
          </Text>

          <CultureCard
            label={activeLesson.culturalNote.label}
            text={activeLesson.culturalNote.text}
          />

          <View style={{ height: Spacing.xxl }} />
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
