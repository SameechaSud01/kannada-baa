import { useState } from 'react';
import { View, Text, TextInput, Pressable, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { supabase } from '../../services/api/supabase';
import { Toasts } from '../../components/modals/instances/toastCatalog';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

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
        // Under the current "Confirm email" OFF setting, signUp returns a live session.
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
        <View style={{ alignItems: 'center', marginBottom: Spacing.xxxl * 2 }}>
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
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              marginTop: Spacing.sm,
            }}
          >
            Learn Kannada. Belong in Bengaluru.
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
          placeholder="Password"
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
            {loading ? 'Please wait...' : isSignUp ? 'SIGN UP' : 'LOG IN'}
          </Text>
        </Pressable>

        {/* Toggle */}
        <Pressable
          onPress={() => setIsSignUp(!isSignUp)}
          style={{ marginTop: Spacing.lg, alignItems: 'center' }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
            }}
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
