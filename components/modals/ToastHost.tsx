import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { Toast as ToastComponent, type ToastKind } from './Toast';

export interface ToastShowArgs {
  kind: ToastKind;
  title: string;
  subtitle?: string;
  /** Stable id — second show() with same id replaces the first. */
  id?: string;
  onPress?: () => void;
}

interface ToastEntry extends ToastShowArgs {
  uid: number;
}

interface ToastContextValue {
  show: (args: ToastShowArgs) => void;
  dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Module-level ref so callers outside React (services, error handlers) can fire
// toasts via `Toast.show({...})` per MODALS §2.
let bridge: ToastContextValue | null = null;

export const Toast = {
  show(args: ToastShowArgs) {
    if (!bridge) {
      console.warn('[toast] show called before ToastHost mounted', args);
      return;
    }
    bridge.show(args);
  },
  dismiss(id?: string) {
    if (!bridge) return;
    bridge.dismiss(id);
  },
};

/**
 * Toast provider (MODALS §4.4). Mounts above ModalHost in the tree.
 * Single-slot queue: a new show() replaces the previous unless dismissed.
 */
export function ToastHost({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<ToastEntry | null>(null);
  const uidRef = useRef(0);

  const show = useCallback((args: ToastShowArgs) => {
    uidRef.current += 1;
    setEntry({ ...args, uid: uidRef.current });
  }, []);

  const dismiss = useCallback((id?: string) => {
    setEntry((current) => {
      if (!current) return null;
      if (id && current.id !== id) return current;
      return null;
    });
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss],
  );

  useEffect(() => {
    bridge = value;
    return () => {
      if (bridge === value) bridge = null;
    };
  }, [value]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
        {entry ? (
          <ToastView
            key={entry.uid}
            entry={entry}
            onComplete={() => setEntry(null)}
          />
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

function ToastView({ entry, onComplete }: { entry: ToastEntry; onComplete: () => void }) {
  return (
    <ToastComponent
      kind={entry.kind}
      title={entry.title}
      subtitle={entry.subtitle}
      onPress={entry.onPress}
      onDismiss={onComplete}
    />
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastHost>');
  }
  return ctx;
}
