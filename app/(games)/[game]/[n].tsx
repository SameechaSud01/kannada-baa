import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
import { GAMES, isGameKey, type GameKey } from '@/constants/games';
import OppositeGame from '@/src/games/opposites';
import DictationGame from '@/src/games/dictation';
import ImageMatchGame from '@/src/games/imagematch';

export default function GameRunnerScreen() {
  const router = useRouter();
  const { game: gameParam, n: nParam } = useLocalSearchParams<{ game: string; n: string }>();

  if (!gameParam || !isGameKey(gameParam)) {
    return <NotFound onBack={() => router.replace('/practice')} />;
  }

  const lessonNo = Number.parseInt(String(nParam ?? ''), 10);
  if (!Number.isFinite(lessonNo) || lessonNo < 1 || lessonNo > 8) {
    return <NotFound onBack={() => router.replace(`/${gameParam}`)} />;
  }

  switch (gameParam as GameKey) {
    case 'opposites':
      return <OppositeGame lessonNo={lessonNo} />;
    case 'dictation':
      return <DictationGame lessonNo={lessonNo} />;
    case 'image-match':
      return <ImageMatchGame lessonNo={lessonNo} />;
    case 'quiz':
    case 'conversations':
      return (
        <ComingSoon
          title={GAMES[gameParam].title}
          onBack={() => router.back()}
        />
      );
  }
}

function ComingSoon({ title, onBack }: { title: string; onBack: () => void }) {
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
        <View
          style={{
            width: moderateScale(56),
            height: moderateScale(56),
            borderRadius: Radius.full,
            backgroundColor: Colors.secondaryFixed,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.sm,
          }}
        >
          <Icons.locked size={moderateScale(24)} color={Colors.onSecondaryContainer} />
        </View>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(20),
            color: Colors.onSurface,
            textAlign: 'center',
          }}
          maxFontSizeMultiplier={1.3}
        >
          {title} — coming soon
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14),
            color: Colors.tertiary,
            textAlign: 'center',
            lineHeight: moderateScale(20),
            marginBottom: Spacing.md,
          }}
          maxFontSizeMultiplier={1.4}
        >
          This game isn&apos;t built yet. Try Opposites or Dictation for now.
        </Text>
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to lesson selector"
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
            maxFontSizeMultiplier={1.3}
          >
            Back to lessons
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function NotFound({ onBack }: { onBack: () => void }) {
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
          onPress={onBack}
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
