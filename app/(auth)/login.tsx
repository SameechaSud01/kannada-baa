import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { supabase } from '../../services/api/supabase';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import {
  signInWithGoogle,
  GoogleStatusCodes,
} from '../../services/auth/google';
import {
  isAppleSupported,
  signInWithAppleNative,
  signInWithAppleWeb,
  APPLE_CANCEL_CODE,
} from '../../services/auth/apple';
import { GoogleGlyph } from '../../components/auth/GoogleGlyph';
import { AppleGlyph } from '../../components/auth/AppleGlyph';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

type Mode = 'login' | 'signup';
type Provider = 'email' | 'google' | 'apple';

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

// Supabase returns this kind of error when an OAuth identity collides with
// an account that was originally created via a different provider (Rule 1).
// The exact shape varies across Supabase versions — match conservatively.
function isIdentityCollisionError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { status?: number; code?: string; message?: string };
  if (e.status === 422 && (e.code === 'email_exists' || e.code === 'identity_already_exists')) {
    return true;
  }
  const msg = (e.message ?? '').toLowerCase();
  return (
    msg.includes('user already registered') ||
    msg.includes('identity already exists') ||
    msg.includes('email already exists')
  );
}

function isUserCancellation(err: unknown, provider: 'google' | 'apple'): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as { code?: string | number; message?: string };
  if (provider === 'google') {
    return e.code === GoogleStatusCodes.SIGN_IN_CANCELLED;
  }
  if (provider === 'apple') {
    return e.code === APPLE_CANCEL_CODE || (e.message ?? '').includes('cancelled');
  }
  return false;
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [pending, setPending] = useState<Provider | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  const isSignUp = mode === 'signup';
  const copy = COPY[mode];
  const loading = pending !== null;

  useEffect(() => {
    let cancelled = false;
    isAppleSupported().then((ok) => {
      if (!cancelled) setAppleAvailable(ok);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAuth = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!EMAIL_RE.test(normalizedEmail) || password.length < 6) {
      Toasts.invalidCredentials();
      return;
    }

    Keyboard.dismiss();
    setPending('email');
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
      setPending(null);
    }
  };

  const handleGoogle = async () => {
    Keyboard.dismiss();
    setPending('google');
    try {
      await signInWithGoogle();
    } catch (error) {
      if (isUserCancellation(error, 'google')) {
        console.info('[auth] google sign-in cancelled');
      } else if (isIdentityCollisionError(error)) {
        Toasts.emailUsesDifferentMethod();
      } else {
        console.warn('[auth] google error', error);
        Toasts.signInFailed();
      }
    } finally {
      setPending(null);
    }
  };

  const handleApple = async () => {
    Keyboard.dismiss();
    setPending('apple');
    try {
      if (Platform.OS === 'ios') {
        await signInWithAppleNative();
      } else {
        await signInWithAppleWeb();
      }
    } catch (error) {
      if (isUserCancellation(error, 'apple')) {
        console.info('[auth] apple sign-in cancelled');
      } else if (isIdentityCollisionError(error)) {
        Toasts.emailUsesDifferentMethod();
      } else {
        console.warn('[auth] apple error', error);
        Toasts.signInFailed();
      }
    } finally {
      setPending(null);
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
          editable={!loading}
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
          editable={!loading}
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
            justifyContent: 'center',
            minHeight: moderateScale(44),
            opacity: loading && pending !== 'email' ? 0.5 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          {pending === 'email' ? (
            <ActivityIndicator color={Colors.onPrimary} />
          ) : (
            <Text
              style={{
                fontFamily: Fonts.dmSans.bold,
                fontSize: moderateScale(14),
                color: Colors.onPrimary,
                letterSpacing: 0.5,
              }}
            >
              {copy.cta}
            </Text>
          )}
        </Pressable>

        {/* OR divider */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: Spacing.xl,
          }}
        >
          <View
            style={{
              flex: 1,
              height: moderateScale(0.5),
              backgroundColor: Colors.outlineVariant,
            }}
          />
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(12),
              color: Colors.tertiary,
              paddingHorizontal: Spacing.md,
              letterSpacing: 0.5,
            }}
          >
            or
          </Text>
          <View
            style={{
              flex: 1,
              height: moderateScale(0.5),
              backgroundColor: Colors.outlineVariant,
            }}
          />
        </View>

        {/* Google */}
        <OAuthButton
          label="Continue with Google"
          glyph={<GoogleGlyph />}
          onPress={handleGoogle}
          loading={pending === 'google'}
          disabled={loading}
        />

        {appleAvailable && (
          <View style={{ marginTop: Spacing.md }}>
            <OAuthButton
              label="Continue with Apple"
              glyph={<AppleGlyph />}
              onPress={handleApple}
              loading={pending === 'apple'}
              disabled={loading}
            />
          </View>
        )}
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

type OAuthButtonProps = {
  label: string;
  glyph: React.ReactNode;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
};

function OAuthButton({ label, glyph, onPress, loading, disabled }: OAuthButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.surfaceContainerHigh,
        borderWidth: moderateScale(0.5),
        borderColor: Colors.outlineVariant,
        borderRadius: Radius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        minHeight: moderateScale(44),
        opacity: disabled && !loading ? 0.5 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {loading ? (
        <ActivityIndicator color={Colors.onSurface} />
      ) : (
        <>
          {glyph}
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14),
              color: Colors.onSurface,
              marginLeft: Spacing.md,
              letterSpacing: 0.3,
            }}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
