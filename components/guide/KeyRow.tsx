import { Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing } from '../../constants/spacing';

interface KeyRowProps {
  symbol: string;
  example: string;
}

export function KeyRow({ symbol, example }: KeyRowProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
      }}
      accessibilityRole="text"
      accessibilityLabel={`${symbol} — ${example}`}
    >
      <Text
        style={{
          fontFamily: Fonts.lora.mediumItalic,
          fontSize: moderateScale(15),
          color: Colors.onSurface,
          minWidth: moderateScale(60),
        }}
        maxFontSizeMultiplier={1.3}
      >
        {symbol}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(13),
          color: Colors.tertiary,
          marginHorizontal: Spacing.sm,
        }}
      >
        –
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: moderateScale(14),
          color: Colors.tertiary,
          flex: 1,
        }}
        maxFontSizeMultiplier={1.4}
      >
        {example}
      </Text>
    </View>
  );
}
