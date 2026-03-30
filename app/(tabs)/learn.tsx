import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useProgressStore } from '../../stores/progressStore';
import lessonsData from '../../data/lessons.json';

export default function LearnScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { lessonProgress, completedLessons } = useProgressStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const lessons = lessonsData.lessons;

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: Colors.pageBg,
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {/* App Bar */}
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          backgroundColor: Colors.primary,
          paddingHorizontal: Spacing.lg,
          paddingBottom: Spacing.md,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ width: 20 }} />
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: 17,
              color: Colors.textOnGreen,
            }}
          >
            Kannada Baa
          </Text>
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Spacing.lg }}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 10,
            letterSpacing: 1.4,
            color: Colors.textTertiary,
            marginBottom: Spacing.md,
          }}
        >
          ALL LESSONS
        </Text>

        {lessons.map((lesson, index) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const progress = isCompleted
            ? 1
            : (lessonProgress[lesson.id] ?? 0) / lesson.totalPhrases;

          return (
            <Pressable
              key={lesson.id}
              onPress={() => router.push(`/lesson/${lesson.id}`)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: Colors.cardBg,
                borderWidth: 0.5,
                borderColor: Colors.border,
                borderRadius: Radius.lg,
                padding: Spacing.lg,
                marginBottom: Spacing.sm,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              })}
            >
              {/* Thumbnail */}
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: Radius.sm,
                  backgroundColor: isCompleted ? Colors.primary : Colors.primaryLight,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: Spacing.md,
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.notoSerifKannada.medium,
                    fontSize: 18,
                    color: isCompleted ? Colors.textOnGreen : Colors.primary,
                  }}
                >
                  {lesson.thumbnailChar}
                </Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: 14,
                    color: Colors.textBody,
                    marginBottom: 2,
                  }}
                >
                  {lesson.title}
                </Text>
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.regular,
                    fontSize: 11,
                    color: Colors.textTertiary,
                    marginBottom: Spacing.sm,
                  }}
                >
                  {lesson.subtitle} · {lesson.estimatedMinutes} min
                </Text>
                <ProgressBar progress={progress} height={4} />
              </View>

              {/* Completed check */}
              {isCompleted && (
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: Radius.full,
                    backgroundColor: Colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: Spacing.md,
                  }}
                >
                  <Svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12l5 5L20 7"
                      stroke={Colors.textOnGreen}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              )}
            </Pressable>
          );
        })}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </Animated.View>
  );
}
