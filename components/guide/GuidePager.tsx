import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  type Ref,
} from 'react';
import {
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { GUIDE_SECTIONS } from '../../constants/guide';
import { GuidePage } from './GuidePage';

export interface GuidePagerHandle {
  goToPage: (index: number) => void;
}

interface GuidePagerProps {
  showOnboardingHeader?: boolean;
  onPageChange?: (index: number) => void;
}

export const GuidePager = forwardRef(function GuidePager(
  { showOnboardingHeader = false, onPageChange }: GuidePagerProps,
  ref: Ref<GuidePagerHandle>,
) {
  const scrollRef = useRef<ScrollView>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const activePageRef = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      goToPage: (index) => {
        if (size.width <= 0) return;
        const clamped = Math.max(0, Math.min(index, GUIDE_SECTIONS.length - 1));
        scrollRef.current?.scrollTo({ x: clamped * size.width, animated: true });
      },
    }),
    [size.width],
  );

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (size.width <= 0) return;
    const newPage = Math.round(e.nativeEvent.contentOffset.x / size.width);
    if (newPage !== activePageRef.current) {
      activePageRef.current = newPage;
      onPageChange?.(newPage);
    }
  };

  return (
    <View
      style={{ flex: 1 }}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width !== size.width || height !== size.height) {
          setSize({ width, height });
        }
      }}
    >
      {size.width > 0 && size.height > 0 && (
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleMomentumEnd}
        >
          {GUIDE_SECTIONS.map((section, idx) => (
            <GuidePage
              key={section.slug}
              section={section}
              width={size.width}
              height={size.height}
              showOnboardingHeader={showOnboardingHeader && idx === 0}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
});
