import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { useCompletedLessons, useStreak } from '../../hooks/progress';
import { Icons } from '../../constants/icons';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

type GameId = 'quiz' | 'image-match' | 'dictation' | 'conversations' | 'opposites';

type GameDef = {
  id: GameId;
  title: string;
  subtitle: string;
  Icon: TablerIcon;
};

export const GAMES: GameDef[] = [
  { id: 'quiz', title: 'Quick quiz', subtitle: 'Test your speed and accuracy.', Icon: Icons.gameQuickQuiz },
  { id: 'image-match', title: 'Image match', subtitle: 'Connect words to their visuals.', Icon: Icons.gameImageMatch },
  { id: 'dictation', title: 'Dictation', subtitle: 'Listen and write what you hear.', Icon: Icons.gameDictation },
  { id: 'conversations', title: 'Conversations', subtitle: 'Roleplay real-world scenarios.', Icon: Icons.gameConversations },
  { id: 'opposites', title: 'Opposites', subtitle: 'Learn word pairs and antonyms.', Icon: Icons.gameOpposites },
];

export default function PracticeScreen() {
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

  const completed = completedLessons.length;
  const hasUnlocked = completed > 0;

  const bannerText = hasUnlocked
    ? `Lessons 1–${completed} are loaded into every game below.`
    : 'Finish Lesson 1 to load content into these games.';

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
        {/* Phrase-pool banner (no border, surface-highest) */}
        <View style={{ paddingHorizontal: Spacing.xxl, paddingTop: Spacing.md, marginBottom: Spacing.xl }}>
          <View
            style={{
              backgroundColor: Colors.surfaceContainerHighest,
              borderRadius: Radius.lg,
              padding: Spacing.lg,
              flexDirection: 'row',
              alignItems: 'center',
              gap: Spacing.md,
            }}
          >
            <View
              style={{
                width: moderateScale(36),
                height: moderateScale(36),
                borderRadius: Radius.sm,
                backgroundColor: Colors.surfaceContainerHigh,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.phrasePool size={20} color={Colors.primary} />
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: Fonts.dmSans.regular,
                fontSize: moderateScale(13),
                lineHeight: moderateScale(18),
                color: Colors.onSurface,
              }}
              maxFontSizeMultiplier={1.4}
            >
              {bannerText}
            </Text>
          </View>
        </View>

        {/* Section label */}
        <View style={{ paddingHorizontal: Spacing.xxl, marginBottom: moderateScale(14) }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 2.5,
              color: Colors.tertiary,
              textTransform: 'uppercase',
            }}
            maxFontSizeMultiplier={1.4}
          >
            Games
          </Text>
        </View>

        {/* Game rows — entire list dimmed if completed == 0 */}
        <View
          style={{
            paddingHorizontal: Spacing.xxl,
            gap: moderateScale(10),
            opacity: hasUnlocked ? 1 : 0.5,
          }}
        >
          {GAMES.map((game) => (
            <GameRow
              key={game.id}
              game={game}
              completed={completed}
              hasUnlocked={hasUnlocked}
              onPress={() => router.push(`/${game.id}`)}
            />
          ))}
        </View>

        {hasUnlocked && (
          <Text
            style={{
              paddingHorizontal: Spacing.xxl,
              marginTop: moderateScale(18),
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(12),
              color: Colors.tertiary,
              lineHeight: moderateScale(18),
            }}
            maxFontSizeMultiplier={1.4}
          >
            Each game draws only from phrases you&apos;ve already learned.
          </Text>
        )}
      </ScrollView>
    </Animated.View>
  );
}

function GameRow({
  game,
  completed,
  hasUnlocked,
  onPress,
}: {
  game: GameDef;
  completed: number;
  hasUnlocked: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!hasUnlocked}
      accessibilityRole={hasUnlocked ? 'button' : 'text'}
      accessibilityLabel={
        hasUnlocked
          ? `${game.title} — ${game.subtitle}. ${completed} lesson${completed === 1 ? '' : 's'} loaded.`
          : `${game.title}, locked. Finish lesson 1 to unlock.`
      }
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceContainerHighest,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        gap: moderateScale(14),
        transform: [{ scale: pressed && hasUnlocked ? 0.98 : 1 }],
      })}
    >
      {/* Icon chip */}
      <View
        style={{
          width: moderateScale(48),
          height: moderateScale(48),
          borderRadius: Radius.md,
          backgroundColor: Colors.surfaceContainerHigh,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <game.Icon color={Colors.primary} size={24} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: moderateScale(15),
            color: Colors.onSurface,
            marginBottom: moderateScale(2),
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          {game.title}
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
          {game.subtitle}
        </Text>
      </View>

      {/* Trailing state */}
      {hasUnlocked ? (
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 1.4,
            color: Colors.primary,
            textTransform: 'uppercase',
          }}
          maxFontSizeMultiplier={1.3}
        >
          {completed} lesson{completed === 1 ? '' : 's'}
        </Text>
      ) : (
        <Icons.locked size={16} color={Colors.tertiary} />
      )}
    </Pressable>
  );
}
