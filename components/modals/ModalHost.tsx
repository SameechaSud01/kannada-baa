import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import { Backdrop } from './Backdrop';
import { Dialog } from './Dialog';
import { BottomSheet, type BottomSheetHandle } from './BottomSheet';

export type ModalKind = 'dialog' | 'sheet' | 'takeover';

interface BaseShowArgs<P> {
  component: ComponentType<P>;
  props?: P;
  /** Override backdrop dim (dialog/sheet only). */
  dim?: number;
  /** Disable backdrop tap to dismiss (destructive confirms). */
  blockBackdropDismiss?: boolean;
  /** Disable Android hardware back dismissal (destructive confirms). */
  blockHardwareBack?: boolean;
}

interface ShowArgs<P> extends BaseShowArgs<P> {
  kind: ModalKind;
}

interface ModalEntry {
  id: number;
  kind: ModalKind;
  // Casts away the props generic — the host doesn't care.
  Component: ComponentType<unknown>;
  props: unknown;
  dim?: number;
  blockBackdropDismiss?: boolean;
  blockHardwareBack?: boolean;
}

interface ModalContextValue {
  show: <P>(args: ShowArgs<P>) => void;
  dismiss: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

/**
 * Provider that mounts dialogs / sheets / takeovers (MODALS §2).
 * Toasts use a separate provider. Only one modal on screen at a time —
 * showing a second auto-dismisses the first.
 */
export function ModalHost({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<ModalEntry | null>(null);
  const idRef = useRef(0);
  const sheetRef = useRef<BottomSheetHandle | null>(null);

  const dismiss = useCallback(() => {
    setEntry((current) => {
      if (current?.kind === 'sheet' && sheetRef.current) {
        sheetRef.current.close();
        return current;
      }
      return null;
    });
  }, []);

  // Used by BottomSheet onDismiss when the user swipes / taps backdrop.
  const onSheetExternallyDismissed = useCallback(() => {
    setEntry((current) => (current?.kind === 'sheet' ? null : current));
  }, []);

  const show = useCallback(
    <P,>(args: ShowArgs<P>) => {
      idRef.current += 1;
      const next: ModalEntry = {
        id: idRef.current,
        kind: args.kind,
        Component: args.component as ComponentType<unknown>,
        props: args.props ?? {},
        dim: args.dim,
        blockBackdropDismiss: args.blockBackdropDismiss,
        blockHardwareBack: args.blockHardwareBack,
      };
      setEntry(next);
    },
    [],
  );

  // Android hardware back: dismisses non-destructive modals; destructive blocks.
  useEffect(() => {
    if (!entry) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (entry.blockHardwareBack) return true;
      dismiss();
      return true;
    });
    return () => sub.remove();
  }, [entry, dismiss]);

  const value = useMemo<ModalContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss],
  );

  const renderActive = () => {
    if (!entry) return null;
    const Comp = entry.Component;
    const dim = entry.dim ?? 0.55;

    if (entry.kind === 'dialog') {
      return (
        <>
          <Backdrop
            dim={dim}
            onTap={entry.blockBackdropDismiss ? undefined : dismiss}
          />
          <Dialog destructive={entry.blockBackdropDismiss}>
            {/* @ts-expect-error props are validated at the show() call site */}
            <Comp {...entry.props} />
          </Dialog>
        </>
      );
    }

    if (entry.kind === 'sheet') {
      return (
        <BottomSheet
          key={entry.id}
          ref={(handle) => {
            sheetRef.current = handle;
          }}
          onDismiss={onSheetExternallyDismissed}
        >
          {/* @ts-expect-error props are validated at the show() call site */}
          <Comp {...entry.props} />
        </BottomSheet>
      );
    }

    // takeover — no backdrop; component renders full-bleed
    return (
      // @ts-expect-error props are validated at the show() call site
      <Comp {...entry.props} />
    );
  };

  return (
    <ModalContext.Provider value={value}>
      <View style={{ flex: 1 }}>{children}</View>
      <View
        pointerEvents={entry ? 'auto' : 'none'}
        style={StyleSheet.absoluteFill}
      >
        {renderActive()}
      </View>
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error('useModal must be used inside <ModalHost>');
  }
  return ctx;
}
