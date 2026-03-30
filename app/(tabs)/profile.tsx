import { useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { StreakRing } from '../../components/ui/StreakRing';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../services/api/supabase';
import lessonsData from '../../data/lessons.json';

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    streak,
    totalPhrasesLearned,
    totalMinutesPracticed,
    weeklyActivity,
    completedLessons,
  } = useProgressStore();
  const user = useAuthStore((s) => s.user);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(4)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);

  const hours = Math.floor(totalMinutesPracticed / 60);
  const mins = totalMinutesPracticed % 60;
  const practiceLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // Weekly heatmap — last 7 days
  const weekDates = useMemo(() => {
    const dates: string[] = [];
    const today = new Date();
    // Start from Monday of current week
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  }, []);

  const completedLessonData = lessonsData.lessons.filter((l) =>
    completedLessons.includes(l.id)
  );

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Learner';

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
        {/* Streak Ring */}
        <View style={{ alignItems: 'center', marginVertical: Spacing.xxl }}>
          <StreakRing days={streak} />
        </View>

        {/* Stat Cards */}
        <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xxl }}>
          <View
            style={{
              flex: 1,
              backgroundColor: Colors.primaryLight,
              borderRadius: Radius.lg,
              padding: Spacing.lg,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 20,
                color: Colors.primary,
              }}
            >
              {totalPhrasesLearned}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 9,
                letterSpacing: 1.4,
                color: Colors.textTertiary,
                marginTop: Spacing.xs,
              }}
            >
              PHRASES
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              backgroundColor: Colors.primaryLight,
              borderRadius: Radius.lg,
              padding: Spacing.lg,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 20,
                color: Colors.primary,
              }}
            >
              {practiceLabel}
            </Text>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 9,
                letterSpacing: 1.4,
                color: Colors.textTertiary,
                marginTop: Spacing.xs,
              }}
            >
              PRACTICE
            </Text>
          </View>
        </View>

        {/* Weekly Activity */}
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 10,
            letterSpacing: 1.4,
            color: Colors.textTertiary,
            marginBottom: Spacing.md,
          }}
        >
          WEEKLY ACTIVITY
        </Text>

        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: Spacing.xxl,
          }}
        >
          {weekDates.map((date, i) => {
            const isActive = weeklyActivity[date];
            return (
              <View key={date} style={{ alignItems: 'center', gap: Spacing.xs }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: Radius.sm,
                    backgroundColor: isActive ? Colors.primary : Colors.primaryLight,
                    opacity: isActive ? 1 : 0.5,
                  }}
                />
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.regular,
                    fontSize: 10,
                    color: Colors.textTertiary,
                  }}
                >
                  {DAY_LABELS[i]}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Completed Lessons */}
        {completedLessonData.length > 0 && (
          <>
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 10,
                letterSpacing: 1.4,
                color: Colors.textTertiary,
                marginBottom: Spacing.md,
              }}
            >
              COMPLETED LESSONS
            </Text>

            {completedLessonData.map((lesson) => (
              <View
                key={lesson.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: Colors.cardBg,
                  borderWidth: 0.5,
                  borderColor: Colors.border,
                  borderRadius: Radius.lg,
                  padding: Spacing.md,
                  marginBottom: Spacing.sm,
                }}
              >
                {/* Kannada thumbnail */}
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: Radius.sm,
                    backgroundColor: Colors.primaryLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: Spacing.md,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: Fonts.notoSerifKannada.medium,
                      fontSize: 18,
                      color: Colors.primary,
                    }}
                  >
                    {lesson.thumbnailChar}
                  </Text>
                </View>

                {/* Text */}
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.medium,
                      fontSize: 14,
                      color: Colors.textBody,
                    }}
                  >
                    {lesson.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: Fonts.dmSans.regular,
                      fontSize: 12,
                      color: Colors.textTertiary,
                    }}
                  >
                    {lesson.subtitle}
                  </Text>
                </View>

                {/* Green check */}
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: Radius.full,
                    backgroundColor: Colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
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
              </View>
            ))}
          </>
        )}

        {/* Sign Out */}
        <Pressable
          onPress={() => supabase.auth.signOut()}
          style={({ pressed }) => ({
            marginTop: Spacing.xxl,
            paddingVertical: Spacing.md,
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: 13,
              color: Colors.textTertiary,
            }}
          >
            Sign out
          </Text>
        </Pressable>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </Animated.View>
  );
}
