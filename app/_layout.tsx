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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { useProgressStore } from '../stores/progressStore';
import { supabase } from '../services/api/supabase';
import { fetchUserRow } from '../services/api/users';
import { fetchCompletedLessons, recordLessonCompletion } from '../services/api/progress';
import { fetchLessonIdBySlug } from '../services/api/lessons';
import { Audio } from 'expo-av';
import { isKannadaVoiceAvailable } from '../services/audio/deviceTtsAudioService';
import { ModalHost, useModal } from '../components/modals/ModalHost';
import { ToastHost } from '../components/modals/ToastHost';
import { TTSUnavailableDialog } from '../components/modals/instances/TTSUnavailableDialog';
import * as Linking from 'expo-linking';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

/**
 * Server-first hydration for lesson completions (spec_progress_persistence).
 * Pulls the server list, backfills any local-only slugs to the server with
 * score=null, then merges the union into useProgressStore. Routing is not
 * blocked on this — the store update triggers re-renders once it resolves.
 */
async function hydrateCompletions(userId: string) {
  const serverCompletions = await fetchCompletedLessons(userId);
  const serverSlugs = serverCompletions.map((c) => c.slug);
  const serverSet = new Set(serverSlugs);

  const localOnly = useProgressStore
    .getState()
    .completedLessons.filter((slug) => !serverSet.has(slug));

  for (const slug of localOnly) {
    try {
      const lessonId = await fetchLessonIdBySlug(slug);
      if (!lessonId) {
        console.warn('[progress] backfill skipped, no lesson for slug', slug);
        continue;
      }
      await recordLessonCompletion(lessonId, null);
    } catch (err) {
      console.warn('[progress] backfill failed for slug', slug, err);
    }
  }

  useProgressStore
    .getState()
    .hydrateFromServerCompletions([...serverSlugs, ...localOnly]);
}

/**
 * Boot-time TTS voice probe (MODALS §6.9). Runs inside ModalHost so we can
 * show the warning dialog if the device has no kn-IN voice.
 */
function TtsProbe() {
  const modal = useModal();
  const hasSeen = useUserStore((s) => s.hasSeenTtsWarning);
  const userHydrated = useUserStore((s) => s.isHydrated);
  const setHasSeen = useUserStore((s) => s.setHasSeenTtsWarning);

  useEffect(() => {
    if (!userHydrated || hasSeen) return;
    isKannadaVoiceAvailable().then((available) => {
      if (available) return;
      modal.show({
        kind: 'dialog',
        component: TTSUnavailableDialog,
        props: {
          onOpenSettings: () => {
            setHasSeen(true);
            modal.dismiss();
            Linking.openSettings().catch(() => undefined);
          },
          onDismiss: () => {
            setHasSeen(true);
            modal.dismiss();
          },
        },
      });
    });
  }, [userHydrated, hasSeen, modal, setHasSeen]);

  return null;
}

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

      // DB is the source of truth for onboarding completion. Hydrate the user
      // store from public.users on every session event so the local
      // hasCompletedOnboarding flag can't be stale across accounts. Routing
      // does not block on this — once the row resolves, the store update
      // triggers a re-run of the routing effect.
      const userId = session?.user?.id;
      if (!userId) return;
      fetchUserRow(userId)
        .then((row) => {
          if (row) useUserStore.getState().hydrateFromUserRow(row);
        })
        .catch((err) => {
          console.warn('[auth] fetchUserRow failed', err);
        });

      hydrateCompletions(userId).catch((err) => {
        console.warn('[progress] hydrateCompletions failed', err);
      });
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastHost>
            <ModalHost>
              <TtsProbe />
              <AppGate />
            </ModalHost>
          </ToastHost>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
