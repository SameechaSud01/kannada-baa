import { forwardRef, useCallback, useImperativeHandle, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import GorhomBottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';
import { Shadows } from '../../constants/shadows';

export interface BottomSheetHandle {
  close: () => void;
}

export interface BottomSheetProps {
  children: ReactNode;
  onDismiss: () => void;
}

/**
 * Bottom sheet primitive (MODALS §4.2). Wraps @gorhom/bottom-sheet.
 * - Dynamic sizing to content
 * - Drag handle styled per spec (38×5, surfaceDim, marginBottom 8)
 * - Backdrop tap and swipe-down both dismiss
 * - Slide-up 250ms ease-out, slide-down 200ms ease-in (defaults from lib)
 */
export const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
  function BottomSheet({ children, onDismiss }, ref) {
    const sheetRef = useRef<GorhomBottomSheet>(null);

    useImperativeHandle(ref, () => ({
      close: () => sheetRef.current?.close(),
    }));

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.55}
          pressBehavior="close"
        />
      ),
      [],
    );

    const handleChange = useCallback(
      (index: number) => {
        if (index === -1) onDismiss();
      },
      [onDismiss],
    );

    return (
      <GorhomBottomSheet
        ref={sheetRef}
        index={0}
        enableDynamicSizing
        enablePanDownToClose
        animateOnMount
        onChange={handleChange}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: Colors.surfaceContainerLow,
          borderTopLeftRadius: Radius.xl,
          borderTopRightRadius: Radius.xl,
          ...Shadows.modal,
        }}
        handleStyle={{
          paddingTop: moderateScale(10),
          paddingBottom: moderateScale(8),
        }}
        handleIndicatorStyle={{
          width: moderateScale(38),
          height: moderateScale(5),
          borderRadius: moderateScale(3),
          backgroundColor: Colors.surfaceDim,
        }}
        accessible
        accessibilityLabel="Bottom sheet"
      >
        <View accessibilityViewIsModal style={{ flexShrink: 1 }}>
          {children}
        </View>
      </GorhomBottomSheet>
    );
  },
);
