import { useEffect, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';
import { useAuthStore } from '../../stores/useAuthStore';
import { useUserStore } from '../../stores/useUserStore';
import { useStreak, useWordsLearned } from '../../hooks/progress';
import { formatFirstName } from '../../utils/formatName';
import { supabase } from '../../services/api/supabase';

type LearningGoal = 'spoken' | 'fluency';

/** Map the existing 3-typed store value down to the 2 UI options (Spec 01 §4). */
function storeToGoal(mode: 'spoken' | 'written' | 'both' | null): LearningGoal {
  if (mode === 'spoken') return 'spoken';
  // 'written' is a legacy value — collapse to fluency (Spec 01 §4 + Spec 04).
  return 'fluency';
}

function goalToStore(goal: LearningGoal): 'spoken' | 'both' {
  return goal === 'spoken' ? 'spoken' : 'both';
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const streak = useStreak();
  const wordsLearned = useWordsLearned();
  const user = useAuthStore((s) => s.user);
  const learningMode = useUserStore((s) => s.learningMode);
  const setLearningMode = useUserStore((s) => s.setLearningMode);

  const goal: LearningGoal = storeToGoal(learningMode);

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
    'Learner';
  const userName = formatFirstName(rawName, 'Learner');

  const handleGoalChange = (next: LearningGoal) => {
    setLearningMode(goalToStore(next));
  };

  const settingsItems: Array<{
    id: string;
    label: string;
    Icon: TablerIcon;
    onPress: () => void;
  }> = [
    { id: 'reminders', label: 'Reminders', Icon: Icons.setReminders, onPress: () => {} },
    { id: 'audio', label: 'Audio & pronunciation', Icon: Icons.setAudio, onPress: () => {} },
    { id: 'help', label: 'Help & feedback', Icon: Icons.setHelp, onPress: () => {} },
  ];

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
        {/* Avatar + name */}
        <View style={{ alignItems: 'center', paddingTop: 16, marginBottom: 28 }}>
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: Radius.full,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: 36,
                color: Colors.onPrimary,
              }}
              maxFontSizeMultiplier={1.2}
            >
              {userName[0]?.toUpperCase()}
            </Text>
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 22,
              color: Colors.onSurface,
              letterSpacing: -0.3,
              marginBottom: 2,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {userName}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: 13,
              color: Colors.tertiary,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Linguistic enthusiast
          </Text>
        </View>

        {/* Two stat cards — container-low */}
        <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.surfaceContainerLow,
                borderRadius: Radius.lg,
                padding: 18,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Icons.streak size={20} color={Colors.primary} />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 28,
                  color: Colors.onSurface,
                  lineHeight: 32,
                }}
                maxFontSizeMultiplier={1.3}
              >
                {streak}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 10,
                  letterSpacing: 1.8,
                  color: Colors.tertiary,
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}
                maxFontSizeMultiplier={1.4}
              >
                Day streak
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: Colors.surfaceContainerLow,
                borderRadius: Radius.lg,
                padding: 18,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <Icons.tabLearn size={20} color={Colors.secondary} />
              </View>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 28,
                  color: Colors.onSurface,
                  lineHeight: 32,
                }}
                maxFontSizeMultiplier={1.3}
              >
                {wordsLearned}
              </Text>
              <Text
                style={{
                  fontFamily: Fonts.dmSans.bold,
                  fontSize: 10,
                  letterSpacing: 1.8,
                  color: Colors.tertiary,
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}
                maxFontSizeMultiplier={1.4}
              >
                Words learned
              </Text>
            </View>
          </View>
        </View>

        {/* Learning goal — 2 options */}
        <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 11,
              letterSpacing: 2.5,
              color: Colors.tertiary,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Learning goal
          </Text>
          <View style={{ gap: 10 }}>
            <GoalOption
              label="Spoken only"
              description="Conversation first — skip the script."
              selected={goal === 'spoken'}
              onPress={() => handleGoalChange('spoken')}
            />
            <GoalOption
              label="Complete fluency"
              description="Speak, read and write Kannada."
              selected={goal === 'fluency'}
              onPress={() => handleGoalChange('fluency')}
            />
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: 12,
              color: Colors.tertiary,
              lineHeight: 18,
              marginTop: 12,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Set when you signed up. Both goals share lessons 1–8; the path only diverges after lesson 8.
          </Text>
        </View>

        {/* Settings list — ghost-border inset shadow separates rows (§2 No-Line) */}
        <View style={{ paddingHorizontal: 24, marginBottom: 28 }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 11,
              letterSpacing: 2.5,
              color: Colors.tertiary,
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Settings
          </Text>
          <View
            style={{
              backgroundColor: Colors.surfaceContainerLow,
              borderRadius: Radius.lg,
              overflow: 'hidden',
            }}
          >
            {settingsItems.map((item, idx) => (
              <Pressable
                key={item.id}
                onPress={item.onPress}
                accessibilityRole="button"
                accessibilityLabel={item.label}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  gap: 14,
                  minHeight: 56,
                  // Tonal step on every other row substitutes for borders.
                  backgroundColor:
                    idx % 2 === 0
                      ? Colors.surfaceContainerLow
                      : Colors.surfaceContainerHigh,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <item.Icon size={20} color={Colors.primary} />
                <Text
                  style={{
                    flex: 1,
                    fontFamily: Fonts.dmSans.medium,
                    fontSize: 14,
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {item.label}
                </Text>
                <Icons.forward size={18} color={Colors.tertiary} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 24 }}>
          <Pressable
            onPress={() => supabase.auth.signOut()}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            style={({ pressed }) => ({
              paddingVertical: 14,
              alignItems: 'center',
              minHeight: 44,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.medium,
                fontSize: 14,
                color: Colors.primary,
              }}
              maxFontSizeMultiplier={1.3}
            >
              Sign out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

function GoalOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: selected
          ? Colors.secondaryContainer
          : Colors.surfaceContainerHighest,
        borderRadius: Radius.lg,
        padding: 16,
        minHeight: 56,
        // Selected affordance via inset shadow (No-Line rule). We use a same-tone
        // ghost shadow rather than a border edge on the unselected card.
        ...(selected
          ? {
              shadowColor: Colors.onSecondaryContainer,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.18,
              shadowRadius: 0.5,
              elevation: 0,
            }
          : {}),
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: 15,
            color: selected ? Colors.onSecondaryContainer : Colors.onSurface,
            marginBottom: 2,
          }}
          maxFontSizeMultiplier={1.3}
        >
          {label}
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: 12,
            color: selected ? Colors.onSecondaryContainer : Colors.tertiary,
            lineHeight: 16,
            opacity: selected ? 0.85 : 1,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {description}
        </Text>
      </View>
      {selected && (
        <Icons.lessonDone size={18} color={Colors.onSecondaryContainer} />
      )}
    </Pressable>
  );
}
