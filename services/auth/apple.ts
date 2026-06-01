import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { supabase } from '../api/supabase';

export async function isAppleSupported(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithAppleNative() {
  // Send raw nonce to Supabase, hashed nonce to Apple — Supabase verifies the hash matches.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce,
  );
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) {
    throw new Error('Apple did not return an identity token');
  }
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;
  return data;
}

export async function signInWithAppleWeb() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: 'kannada-baa://auth/callback',
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Supabase did not return an Apple OAuth URL');
  const result = await WebBrowser.openAuthSessionAsync(
    data.url,
    'kannada-baa://auth/callback',
  );
  if (result.type !== 'success' || !result.url) {
    throw new Error('Apple sign-in cancelled');
  }
  const { data: session, error: exchangeError } =
    await supabase.auth.exchangeCodeForSession(result.url);
  if (exchangeError) throw exchangeError;
  return session;
}

export const APPLE_CANCEL_CODE = 'ERR_REQUEST_CANCELED';
