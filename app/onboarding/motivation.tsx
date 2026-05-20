import { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { OptionCard } from '../../components/onboarding/OptionCard';
import { useUserStore } from '../../stores/useUserStore';

const MOTIVATIONS = [
  "Don't want to feel like an outsider",
  'Connect better with Kannadiga friends',
  'Navigate daily life in Bengaluru',
  'Stop getting overcharged (auto, markets)',
  'Impress someone special',
  'Understand Kannada slang and humour',
  'Read signboards and menus',
  'Career / professional reasons',
];

const MAX_SELECTIONS = 3;

export default function MotivationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>(
    () => useUserStore.getState().motivations,
  );

  const toggleMotivation = (motivation: string) => {
    setSelected((prev) => {
      if (prev.includes(motivation)) {
        return prev.filter((m) => m !== motivation);
      }
      if (prev.length >= MAX_SELECTIONS) return prev;
      return [...prev, motivation];
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.surface,
        paddingTop: insets.top + Spacing.xl,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.xxl,
      }}
    >
      <ProgressDots total={4} current={2} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: Spacing.xxl, paddingBottom: Spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(11),
            letterSpacing: 2.5,
            color: Colors.tertiary,
            textTransform: 'uppercase',
            marginBottom: Spacing.sm,
          }}
        >
          Step 2 of 3
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(22),
            color: Colors.onSurface,
            marginBottom: Spacing.sm,
          }}
        >
          Why are you learning Kannada?
        </Text>
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(13),
            lineHeight: moderateScale(18),
            color: Colors.tertiary,
            marginBottom: Spacing.xxl,
          }}
        >
          Pick up to {MAX_SELECTIONS} ({selected.length}/{MAX_SELECTIONS} selected)
        </Text>

        <View style={{ gap: moderateScale(10) }}>
          {MOTIVATIONS.map((motivation) => (
            <OptionCard
              key={motivation}
              label={motivation}
              selected={selected.includes(motivation)}
              onPress={() => toggleMotivation(motivation)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onSurface }}>
            Back
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            if (selected.length > 0) {
              useUserStore.getState().setMotivations(selected);
              router.push('/onboarding/commitment');
            }
          }}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: selected.length > 0 ? (pressed ? Colors.primary : Colors.primaryContainer) : Colors.surfaceDim,
            borderRadius: moderateScale(16),
            paddingVertical: moderateScale(18),
            alignItems: 'center',
            transform: [{ scale: pressed && selected.length > 0 ? 0.97 : 1 }],
          })}
        >
          <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onPrimary }}>
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
