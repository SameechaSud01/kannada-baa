import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '../api/supabase';

let configured = false;

function configureOnce() {
  if (configured) return;
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  configured = true;
}

export async function signInWithGoogle() {
  configureOnce();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  // v15+ returns { type: 'cancelled', data: null } silently on user cancel;
  // v13/v14 throw with statusCodes.SIGN_IN_CANCELLED. Either way, the caller
  // treats a null return as "do nothing" — no error toast.
  if ((result as { type?: string }).type === 'cancelled') return null;
  const idToken =
    // v15+ shape: { type: 'success', data: { idToken, ... } }
    (result as { data?: { idToken?: string | null } }).data?.idToken ??
    // legacy v13/v14 shape: { idToken, ... }
    (result as { idToken?: string | null }).idToken ??
    null;
  if (!idToken) throw new Error('Google did not return an ID token');
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data;
}

export async function signOutGoogle() {
  configureOnce();
  try {
    await GoogleSignin.signOut();
  } catch {
    // benign if the user wasn't currently signed in with Google
  }
}

export const GoogleStatusCodes = statusCodes;
