import { useState } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { supabase } from '../../services/api/supabase';
import { Toasts } from '../../components/modals/instances/toastCatalog';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

type Mode = 'login' | 'signup';

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  login: {
    title: 'Welcome back',
    subtitle: 'Log in to continue your Kannada journey.',
    cta: 'LOG IN',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'Sign up to start learning Kannada today.',
    cta: 'SIGN UP',
  },
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === 'signup';
  const copy = COPY[mode];

  const handleAuth = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_RE.test(normalizedEmail) || password.length < 6) {
      Toasts.invalidCredentials();
      return;
    }

    Keyboard.dismiss();
    setLoading(true);
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
        // Defensive: only fires if someone re-enables email confirmation in Supabase.
        // Under the current "Confirm email" OFF setting, signUp returns a live session
        // and AppGate routes to onboarding — showing this toast then would be misleading.
        if (!data.session) {
          Toasts.confirmEmailPending();
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      console.warn('[auth] error', error);
      Toasts.signInFailed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.surface }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', marginBottom: Spacing.xxxl }}>
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.bold,
              fontSize: moderateScale(48),
              color: Colors.primaryContainer,
              lineHeight: moderateScale(72),
              paddingTop: Spacing.sm,
              marginBottom: Spacing.sm,
            }}
          >
            ಕನ್ನಡ ಬಾ
          </Text>
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: moderateScale(20),
              color: Colors.primaryContainer,
            }}
          >
            Kannada Baa
          </Text>
        </View>

        {/* Mode segmented toggle */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: Colors.surfaceContainerHigh,
            borderRadius: Radius.full,
            padding: moderateScale(4),
            marginBottom: Spacing.xl,
          }}
        >
          <SegmentButton
            label="Log in"
            active={mode === 'login'}
            onPress={() => setMode('login')}
          />
          <SegmentButton
            label="Sign up"
            active={mode === 'signup'}
            onPress={() => setMode('signup')}
          />
        </View>

        {/* Mode-specific heading */}
        <View style={{ marginBottom: Spacing.xl }}>
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(22),
              color: Colors.onSurface,
              marginBottom: Spacing.xs,
            }}
          >
            {copy.title}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
            }}
          >
            {copy.subtitle}
          </Text>
        </View>

        {/* Form */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15),
            backgroundColor: Colors.surfaceContainerHighest,
            borderWidth: moderateScale(0.5),
            borderColor: Colors.outlineVariant,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            marginBottom: Spacing.md,
            color: Colors.onSurface,
          }}
          placeholderTextColor={Colors.tertiary}
        />

        <TextInput
          placeholder={isSignUp ? 'Password (min 6 characters)' : 'Password'}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(15),
            backgroundColor: Colors.surfaceContainerHighest,
            borderWidth: moderateScale(0.5),
            borderColor: Colors.outlineVariant,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            marginBottom: Spacing.xl,
            color: Colors.onSurface,
          }}
          placeholderTextColor={Colors.tertiary}
        />

        {/* Submit */}
        <Pressable
          onPress={handleAuth}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + moderateScale(2),
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(14),
              color: Colors.onPrimary,
              letterSpacing: 0.5,
            }}
          >
            {loading ? 'Please wait...' : copy.cta}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

type SegmentButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function SegmentButton({ label, active, onPress }: SegmentButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      style={{
        flex: 1,
        backgroundColor: active ? Colors.primaryContainer : 'transparent',
        borderRadius: Radius.full,
        paddingVertical: Spacing.sm + moderateScale(2),
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          fontFamily: active ? Fonts.dmSans.bold : Fonts.dmSans.regular,
          fontSize: moderateScale(14),
          color: active ? Colors.onPrimary : Colors.tertiary,
          letterSpacing: 0.3,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
