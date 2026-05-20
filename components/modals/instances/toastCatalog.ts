import * as Linking from 'expo-linking';
import { Toast } from '../ToastHost';

/**
 * Standard toast triggers (MODALS §6.10). One call per row of the spec table —
 * keeps the strings and onTap behavior in a single source of truth.
 *
 * Strings duplicated lightly from copy.ts intentionally — these are system
 * feedback, not lesson copy, so they don't carry tone variants.
 */
export const Toasts = {
  reminderSet(time: string) {
    Toast.show({
      kind: 'success',
      id: 'reminder.set',
      title: `Reminder set — ${time} daily`,
    });
  },

  lessonSavedOffline() {
    Toast.show({
      kind: 'success',
      id: 'lesson.savedOffline',
      title: "Saved — we'll sync when you're back online",
    });
  },

  modeUpdated() {
    Toast.show({
      kind: 'success',
      id: 'mode.updated',
      title: 'App style updated',
    });
  },

  signedOut() {
    Toast.show({
      kind: 'success',
      id: 'signedOut',
      title: 'Signed out. See you soon.',
    });
  },

  audioFailed(onRetry?: () => void) {
    Toast.show({
      kind: 'error',
      id: 'audio.failed',
      title: "Couldn't play audio",
      subtitle: 'Tap to retry · check sound is on',
      onPress: onRetry,
    });
  },

  signInFailed() {
    Toast.show({
      kind: 'error',
      id: 'signIn.failed',
      title: "Couldn't sign you in",
      subtitle: 'Check your email and password and try again',
    });
  },

  invalidCredentials() {
    Toast.show({
      kind: 'error',
      id: 'signIn.invalid',
      title: 'Check your details',
      subtitle: 'Enter a valid email and a password of 6+ characters',
    });
  },

  confirmEmailPending() {
    Toast.show({
      kind: 'success',
      id: 'signUp.confirmPending',
      title: 'Check your email to confirm your account',
    });
  },

  sessionLost() {
    Toast.show({
      kind: 'error',
      id: 'session.lost',
      title: 'Please sign in again',
    });
  },

  onboardingSaveFailed() {
    Toast.show({
      kind: 'error',
      id: 'onboarding.saveFailed',
      title: "Couldn't save your answers. Try again.",
    });
  },

  networkOffline() {
    Toast.show({
      kind: 'error',
      id: 'network.offline',
      title: "You're offline",
      subtitle: "We'll keep your work safe until you're back",
    });
  },

  notificationsDenied() {
    Toast.show({
      kind: 'error',
      id: 'permission.notifDenied',
      title: 'Notifications are off',
      subtitle: 'Tap to open settings',
      onPress: () => {
        Linking.openSettings().catch(() => undefined);
      },
    });
  },
};
