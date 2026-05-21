import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';
import { ProgressDots } from '../../components/onboarding/ProgressDots';
import { useUserStore } from '../../stores/useUserStore';

const MAX_LEN = 30;

export default function NameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const persisted = useUserStore.getState().displayName ?? '';
  const [name, setName] = useState(persisted);
  const [focused, setFocused] = useState(false);

  const trimmed = name.trim();
  const valid = trimmed.length >= 1 && trimmed.length <= MAX_LEN;

  const handleContinue = () => {
    if (!valid) return;
    useUserStore.getState().setDisplayName(trimmed);
    Keyboard.dismiss();
    router.push('/onboarding/goal');
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
        <ProgressDots total={5} current={1} />

        <View style={{ flex: 1, justifyContent: 'center' }}>
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
            Step 1 of 4
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
            What should we{'\n'}call you?
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              marginBottom: Spacing.xxxl,
            }}
            maxFontSizeMultiplier={1.4}
          >
            We'll use this throughout the app.
          </Text>

          <TextInput
            value={name}
            onChangeText={setName}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onSubmitEditing={handleContinue}
            placeholder="Your name"
            placeholderTextColor={Colors.tertiary}
            autoCapitalize="words"
            autoCorrect={false}
            maxLength={MAX_LEN}
            returnKeyType="done"
            accessibilityLabel="Your name"
            style={{
              backgroundColor: Colors.surfaceContainerLowest,
              borderWidth: moderateScale(2),
              borderColor: focused ? Colors.primaryContainer : '#E0DDD0',
              borderRadius: moderateScale(16),
              paddingHorizontal: moderateScale(18),
              paddingVertical: moderateScale(18),
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(16),
              color: Colors.onSurface,
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
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
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(16),
                color: Colors.onSurface,
              }}
            >
              Back
            </Text>
          </Pressable>
          <Pressable
            onPress={handleContinue}
            disabled={!valid}
            style={({ pressed }) => ({
              flex: 2,
              backgroundColor: valid ? (pressed ? Colors.primary : Colors.primaryContainer) : '#C8C4B0',
              borderRadius: moderateScale(16),
              paddingVertical: moderateScale(18),
              alignItems: 'center',
              transform: [{ scale: pressed && valid ? 0.97 : 1 }],
            })}
          >
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(16),
                color: Colors.onPrimary,
              }}
            >
              Continue
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
