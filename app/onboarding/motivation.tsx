import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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

const OTHER_LABEL = 'Other';
const MAX_SELECTIONS = 3;
const OTHER_MAX_LEN = 60;

export default function MotivationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>([]);
  const [otherChecked, setOtherChecked] = useState(false);
  const [otherText, setOtherText] = useState('');

  const otherTrimmed = otherText.trim();
  const filledCount = selected.length + (otherChecked && otherTrimmed.length > 0 ? 1 : 0);

  const toggleMotivation = (motivation: string) => {
    setSelected((prev) => {
      if (prev.includes(motivation)) {
        return prev.filter((m) => m !== motivation);
      }
      if (prev.length + (otherChecked && otherTrimmed.length > 0 ? 1 : 0) >= MAX_SELECTIONS) {
        return prev;
      }
      return [...prev, motivation];
    });
  };

  const toggleOther = () => {
    setOtherChecked((prev) => {
      if (prev) {
        return false;
      }
      // Don't block selecting the card itself if cap reached — only the value counts.
      return true;
    });
  };

  const canContinue = filledCount > 0;

  const handleContinue = () => {
    if (!canContinue) return;
    const finalList = [...selected];
    if (otherChecked && otherTrimmed.length > 0) {
      finalList.push(otherTrimmed);
    }
    useUserStore.setState({ motivations: finalList });
    router.push('/onboarding/commitment');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View
        style={{
          flex: 1,
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.xxl,
        }}
      >
        <ProgressDots total={5} current={3} />

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: Spacing.xl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(11),
              letterSpacing: 2,
              color: Colors.tertiary,
              textTransform: 'uppercase',
              marginBottom: Spacing.sm,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Step 3 of 4
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(28),
              color: Colors.onSurface,
              marginBottom: Spacing.sm,
            }}
            maxFontSizeMultiplier={1.3}
          >
            Why are you learning{'\n'}Kannada?
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              marginBottom: Spacing.xxl,
            }}
            maxFontSizeMultiplier={1.4}
          >
            Pick up to {MAX_SELECTIONS} ({filledCount}/{MAX_SELECTIONS} selected)
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
            <OtherOptionCard
              checked={otherChecked}
              text={otherText}
              onToggle={toggleOther}
              onChangeText={setOtherText}
            />
          </View>
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl }}>
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
            onPress={handleContinue}
            disabled={!canContinue}
            style={({ pressed }) => ({
              flex: 2,
              backgroundColor: canContinue ? (pressed ? Colors.primary : Colors.primaryContainer) : '#C8C4B0',
              borderRadius: moderateScale(16),
              paddingVertical: moderateScale(18),
              alignItems: 'center',
              transform: [{ scale: pressed && canContinue ? 0.97 : 1 }],
            })}
          >
            <Text style={{ fontFamily: Fonts.dmSans.bold, fontSize: moderateScale(16), color: Colors.onPrimary }}>
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

interface OtherOptionCardProps {
  checked: boolean;
  text: string;
  onToggle: () => void;
  onChangeText: (value: string) => void;
}

function OtherOptionCard({ checked, text, onToggle, onChangeText }: OtherOptionCardProps) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => ({
        backgroundColor: checked ? '#FFF5F5' : Colors.surfaceContainerLowest,
        borderWidth: moderateScale(2),
        borderColor: checked ? Colors.primaryContainer : '#E0DDD0',
        borderRadius: moderateScale(16),
        padding: moderateScale(18),
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text
          style={{
            flex: 1,
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            marginRight: Spacing.md,
          }}
          maxFontSizeMultiplier={1.4}
        >
          {OTHER_LABEL}
        </Text>
        {checked && (
          <View
            style={{
              width: moderateScale(24),
              height: moderateScale(24),
              borderRadius: moderateScale(12),
              backgroundColor: Colors.primaryContainer,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12l5 5L20 7"
                stroke={Colors.onPrimary}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
        )}
      </View>
      {checked && (
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder="Tell us your reason…"
          placeholderTextColor={Colors.tertiary}
          autoCapitalize="sentences"
          autoCorrect
          maxLength={OTHER_MAX_LEN}
          accessibilityLabel="Your own reason"
          style={{
            marginTop: Spacing.md,
            backgroundColor: Colors.surface,
            borderWidth: moderateScale(1),
            borderColor: '#E0DDD0',
            borderRadius: moderateScale(10),
            paddingHorizontal: moderateScale(12),
            paddingVertical: moderateScale(10),
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15),
            color: Colors.onSurface,
          }}
        />
      )}
    </Pressable>
  );
}
