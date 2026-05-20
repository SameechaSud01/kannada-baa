import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface ProgressDotsProps {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: ProgressDotsProps) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            width: i === current ? moderateScale(28) : moderateScale(8),
            height: moderateScale(8),
            borderRadius: moderateScale(4),
            backgroundColor: i === current ? Colors.primaryContainer : Colors.surfaceContainerHighest,
          }}
        />
      ))}
    </View>
  );
}
