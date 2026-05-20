import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { GAMES, isGameKey } from '@/constants/games';
import { LessonSelector } from '@/components/lesson/LessonSelector';
import { useLessons } from '@/hooks/useLessons';

export default function GameLessonSelectorScreen() {
  const router = useRouter();
  const { game: gameParam } = useLocalSearchParams<{ game: string }>();
  const lessons = useLessons();

  if (!gameParam || !isGameKey(gameParam)) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: Spacing.xxl,
            gap: Spacing.md,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(18),
              color: Colors.onSurface,
            }}
          >
            Game not found
          </Text>
          <Pressable
            onPress={() => router.replace('/practice')}
            accessibilityRole="button"
            accessibilityLabel="Back to Practice"
            style={({ pressed }) => ({
              backgroundColor: Colors.primary,
              borderRadius: Radius.lg,
              paddingVertical: Spacing.md,
              paddingHorizontal: Spacing.xl,
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(14),
                color: Colors.onPrimary,
              }}
            >
              Back to Practice
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const game = GAMES[gameParam];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }} edges={['top', 'bottom']}>
      <LessonSelector
        game={game}
        lessons={lessons}
        onSelectLesson={(lesson) => router.push(`/${game.key}/${lesson.n}`)}
        onBack={() => router.replace('/practice')}
      />
    </SafeAreaView>
  );
}
