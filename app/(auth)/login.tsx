import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { supabase } from '../../services/api/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        Alert.alert('Check your email for a confirmation link!');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.pageBg }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.xxl }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', marginBottom: Spacing.xxxl * 2 }}>
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.bold,
              fontSize: 48,
              color: Colors.primary,
              marginBottom: Spacing.sm,
            }}
          >
            ಕನ್ನಡ ಬಾ
          </Text>
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: 20,
              color: Colors.primary,
            }}
          >
            Kannada Baa
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: 14,
              color: Colors.textTertiary,
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
            fontSize: 15,
            backgroundColor: Colors.cardBg,
            borderWidth: 0.5,
            borderColor: Colors.border,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            marginBottom: Spacing.md,
            color: Colors.textBody,
          }}
          placeholderTextColor={Colors.textTertiary}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: 15,
            backgroundColor: Colors.cardBg,
            borderWidth: 0.5,
            borderColor: Colors.border,
            borderRadius: Radius.md,
            paddingHorizontal: Spacing.lg,
            paddingVertical: Spacing.md,
            marginBottom: Spacing.xl,
            color: Colors.textBody,
          }}
          placeholderTextColor={Colors.textTertiary}
        />

        {/* Submit */}
        <Pressable
          onPress={handleAuth}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primaryDark : Colors.primary,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + 2,
            alignItems: 'center',
            opacity: loading ? 0.7 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.bold,
              fontSize: 14,
              color: Colors.textOnGreen,
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
              fontSize: 13,
              color: Colors.textSecondary,
            }}
          >
            {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
