import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

interface OptionCardProps {
  label: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
}

export function OptionCard({ label, subtitle, selected, onPress }: OptionCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: selected ? Colors.errorContainerLow : Colors.surfaceContainerLowest,
        borderWidth: moderateScale(2),
        borderColor: selected ? Colors.primaryContainer : Colors.surfaceContainerHighest,
        borderRadius: moderateScale(16),
        padding: moderateScale(18),
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View style={{ flex: 1, marginRight: Spacing.md }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.bold,
            fontSize: moderateScale(16),
            color: Colors.onSurface,
            marginBottom: subtitle ? Spacing.xs : 0,
          }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {selected && (
        <View
          style={{
            width: moderateScale(24),
            height: moderateScale(24),
            borderRadius: moderateScale(12),
            backgroundColor: Colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
            <Path
              d="M5 12l5 5L20 7"
              stroke={Colors.onPrimary}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
      )}
    </Pressable>
  );
}
