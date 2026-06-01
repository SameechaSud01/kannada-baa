import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Radius } from '../../constants/spacing';

interface GuideDotsProps {
  total: number;
  current: number;
}

/**
 * Page-position dots for the Beginners' Guide pager. Decorative.
 * Active dot is wider and uses Colors.primary; inactive use surfaceContainerHighest.
 */
export function GuideDots({ total, current }: GuideDotsProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(6),
      }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
    >
      {Array.from({ length: total }).map((_, idx) => {
        const isActive = idx === current;
        return (
          <View
            key={idx}
            style={{
              height: moderateScale(6),
              width: isActive ? moderateScale(18) : moderateScale(6),
              borderRadius: Radius.full,
              backgroundColor: isActive
                ? Colors.primary
                : Colors.surfaceContainerHighest,
            }}
          />
        );
      })}
    </View>
  );
}
