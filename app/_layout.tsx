import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { NotoSansKannada_400Regular, NotoSansKannada_700Bold } from '@expo-google-fonts/noto-sans-kannada';
import { Lora_400Regular_Italic, Lora_500Medium_Italic } from '@expo-google-fonts/lora';
import {
  NotoSerifKannada_400Regular,
  NotoSerifKannada_500Medium,
  NotoSerifKannada_700Bold,
} from '@expo-google-fonts/noto-serif-kannada';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { useProgressStore } from '../stores/progressStore';
import { supabase } from '../services/api/supabase';
import { Audio } from 'expo-av';
import { isKannadaVoiceAvailable } from '../services/audio/deviceTtsAudioService';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AppGate() {
  const router = useRouter();
  const segments = useSegments();
  const { session, isLoading: authLoading, setSession, setLoading } = useAuthStore();
  const hasCompletedOnboarding = useUserStore((s) => s.hasCompletedOnboarding);
  const userHydrated = useUserStore((s) => s.isHydrated);
  const progressHydrated = useProgressStore((s) => s.isHydrated);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.getSession().catch(async (err) => {
      if (err?.message?.toLowerCase().includes('refresh token')) {
        await supabase.auth.signOut().catch(() => {});
        setSession(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading || !userHydrated || !progressHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      if (!hasCompletedOnboarding) {
        router.replace('/onboarding/welcome');
      } else {
        router.replace('/(tabs)');
      }
    } else if (session && !hasCompletedOnboarding && !inOnboarding) {
      router.replace('/onboarding/welcome');
    } else if (session && hasCompletedOnboarding && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [session, authLoading, segments, hasCompletedOnboarding, userHydrated, progressHydrated]);

  return <Slot />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    Lora_400Regular_Italic,
    Lora_500Medium_Italic,
    NotoSerifKannada_400Regular,
    NotoSerifKannada_500Medium,
    NotoSerifKannada_700Bold,
    NotoSansKannada_400Regular,
    NotoSansKannada_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
    }).catch((err) => {
      console.warn('[audio] setAudioModeAsync failed', err);
    });

    isKannadaVoiceAvailable().then((available) => {
      if (!available) {
        console.warn('[audio] Kannada TTS voice not available on this device.');
      }
    });
  }, []);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppGate />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
