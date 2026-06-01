import { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../constants/colors';
import { Fonts } from '../constants/fonts';
import { Spacing, Radius } from '../constants/spacing';
import { Icons } from '../constants/icons';
import { GUIDE_SECTIONS } from '../constants/guide';
import { GuidePager } from '../components/guide/GuidePager';
import { GuideDots } from '../components/guide/GuideDots';
import { useUserStore } from '../stores/useUserStore';

/**
 * Voluntary re-entry to the Beginners' Guide from the Learn tab.
 * Same pager as /onboarding/basics, no ProgressDots, no sticky CTA — the user
 * can swipe freely between sections and exit via the back chip.
 * See spec_beginners_guide.md.
 */
export default function GuideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const hasSeenBasicsGuide = useUserStore((s) => s.hasSeenBasicsGuide);
  const setHasSeenBasicsGuide = useUserStore((s) => s.setHasSeenBasicsGuide);
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    if (!hasSeenBasicsGuide) {
      setHasSeenBasicsGuide(true);
    }
  }, [hasSeenBasicsGuide, setHasSeenBasicsGuide]);

  const handlePageChange = useCallback((idx: number) => {
    setActivePage(idx);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View
        style={{
          paddingTop: insets.top + Spacing.sm,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.xxl,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(14),
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={12}
          style={({ pressed }) => ({
            width: moderateScale(40),
            height: moderateScale(40),
            borderRadius: Radius.full,
            backgroundColor: Colors.surfaceContainerHighest,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.back size={20} color={Colors.primary} />
        </Pressable>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(18),
            color: Colors.onSurface,
          }}
          maxFontSizeMultiplier={1.3}
          numberOfLines={1}
        >
          Kannada basics
        </Text>
      </View>

      <GuidePager onPageChange={handlePageChange} />

      <View
        style={{
          paddingHorizontal: Spacing.xxl,
          paddingTop: Spacing.md,
          paddingBottom: insets.bottom + Spacing.lg,
          backgroundColor: Colors.surface,
        }}
      >
        <GuideDots total={GUIDE_SECTIONS.length} current={activePage} />
      </View>
    </View>
  );
}
