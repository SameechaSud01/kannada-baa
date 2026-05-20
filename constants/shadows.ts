import type { ViewStyle } from 'react-native';
import { Colors } from './colors';

type ShadowToken = Pick<
  ViewStyle,
  'shadowColor' | 'shadowOffset' | 'shadowOpacity' | 'shadowRadius' | 'elevation'
>;

/**
 * Shadow tokens for the modal/overlay system (MODALS §5).
 *
 * Single source of truth for drop shadows used by dialogs, sheets, toasts,
 * takeovers, and decorative medallions. RN's elevation is set on Android
 * to approximate iOS shadow depth; values are tuned, not 1:1.
 */
export const Shadows = {
  modal: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.22,
    shadowRadius: 60,
    elevation: 24,
  } satisfies ShadowToken,

  toastDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 18,
  } satisfies ShadowToken,

  toastSoft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 30,
    elevation: 12,
  } satisfies ShadowToken,

  medallion: {
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 12,
  } satisfies ShadowToken,
} as const;

export type ShadowName = keyof typeof Shadows;
