import React, { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/spacing';
import { Fonts } from '../../constants/fonts';
import { Icons } from '../../constants/icons';
import type { Game } from '../../constants/games';
import type { Lesson } from '../../hooks/useLessons';

type LessonSelectorProps = {
  game: Game;
  lessons: Lesson[];
  onSelectLesson: (lesson: Lesson) => void;
  onBack: () => void;
};

type LessonPillProps = {
  lesson: Lesson;
  index: number;
  onTap: (lesson: Lesson) => void;
};

function LessonPill({ lesson, index, onTap }: LessonPillProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(moderateScale(8));
  const pressScale = useSharedValue(1);
  const { unlocked } = lesson;

  useEffect(() => {
    const delay = index * 60;
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
    translateY.value = withDelay(
      delay,
      withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) }),
    );
  }, [index, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: pressScale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Lesson ${lesson.n}: ${lesson.theme}${unlocked ? '' : ', locked'}`}
        accessibilityState={{ disabled: !unlocked }}
        disabled={!unlocked}
        onPress={unlocked ? () => onTap(lesson) : undefined}
        onPressIn={() => {
          if (!unlocked) return;
          pressScale.value = withTiming(0.985, {
            duration: 80,
            easing: Easing.out(Easing.cubic),
          });
        }}
        onPressOut={() => {
          if (!unlocked) return;
          pressScale.value = withTiming(1, {
            duration: 80,
            easing: Easing.out(Easing.cubic),
          });
        }}
        android_ripple={{ color: 'transparent' }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          paddingVertical: moderateScale(14),
          paddingHorizontal: moderateScale(18),
          backgroundColor: unlocked ? Colors.surfaceContainerLowest : Colors.surfaceDim,
          borderRadius: Radius.xl,
          opacity: unlocked ? 1 : 0.7,
          ...(unlocked
            ? {
                shadowColor: Colors.outlineVariant,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.6,
                shadowRadius: 6,
                elevation: 1.5,
              }
            : null),
        }}
      >
        <View
          style={{
            width: moderateScale(42),
            height: moderateScale(42),
            borderRadius: Radius.lg,
            backgroundColor: unlocked ? Colors.secondaryFixed : Colors.surfaceContainerHigh,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {unlocked ? (
            <Text
              style={{
                fontFamily: Fonts.notoSerifKannada.bold,
                fontSize: moderateScale(22),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {lesson.glyph}
            </Text>
          ) : null}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(14.5),
              color: unlocked ? Colors.onSurface : Colors.tertiary,
            }}
            maxFontSizeMultiplier={1.3}
          >
            Lesson {lesson.n}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(12),
              color: Colors.tertiary,
              marginTop: moderateScale(1),
            }}
            maxFontSizeMultiplier={1.3}
          >
            {lesson.theme}
          </Text>
        </View>
        {!unlocked ? (
          <Icons.locked size={moderateScale(16)} color={Colors.tertiary} />
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export function LessonSelector({
  game,
  lessons,
  onSelectLesson,
  onBack,
}: LessonSelectorProps) {
  const unlockedCount = lessons.filter((l) => l.unlocked).length;
  const totalCount = lessons.length;

  const headerOpacity = useSharedValue(0);
  useEffect(() => {
    headerOpacity.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.cubic),
    });
  }, [headerOpacity]);
  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      contentContainerStyle={{
        paddingTop: moderateScale(26),
        paddingHorizontal: Spacing.xl,
        paddingBottom: Spacing.xxxl,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={headerStyle}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
            marginBottom: Spacing.md,
          }}
        >
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={12}
            style={({ pressed }) => ({
              width: moderateScale(44),
              height: moderateScale(44),
              borderRadius: Radius.full,
              backgroundColor: Colors.surfaceContainerHighest,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.94 : 1 }],
            })}
          >
            <Icons.back size={moderateScale(20)} color={Colors.primary} />
          </Pressable>
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(26),
              color: Colors.onSurface,
              lineHeight: moderateScale(28.6),
            }}
            maxFontSizeMultiplier={1.3}
            numberOfLines={1}
          >
            {game.title}
          </Text>
          <View
            accessibilityLabel={`${unlockedCount} of ${totalCount} lessons unlocked`}
            style={{
              backgroundColor: Colors.secondaryFixed,
              paddingVertical: moderateScale(6),
              paddingHorizontal: moderateScale(11),
              borderRadius: Radius.lg,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(12),
                color: Colors.onSecondaryContainer,
              }}
              maxFontSizeMultiplier={1.3}
            >
              {unlockedCount}/{totalCount}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(13),
            color: Colors.onSecondaryContainer,
            marginBottom: Spacing.md,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {game.tagline}
        </Text>

        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13),
            color: Colors.tertiary,
            lineHeight: moderateScale(19.5),
            marginBottom: Spacing.lg,
          }}
          maxFontSizeMultiplier={1.3}
        >
          Tap a lesson to play. Complete lessons in the Lessons tab to unlock more.
        </Text>
      </Animated.View>

      <View style={{ gap: moderateScale(10) }}>
        {lessons.map((lesson, idx) => (
          <LessonPill key={lesson.n} lesson={lesson} index={idx} onTap={onSelectLesson} />
        ))}
      </View>
    </ScrollView>
  );
}

export default LessonSelector;
