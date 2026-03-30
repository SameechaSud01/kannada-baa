import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';

interface CultureCardProps {
  label: string;
  text: string;
}

export function CultureCard({ label, text }: CultureCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.cultureBg,
        borderWidth: 0.5,
        borderColor: '#D4C4A0',
        borderRadius: Radius.lg,
        padding: Spacing.lg,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: 9,
          letterSpacing: 1.2,
          color: '#5D4037',
          textTransform: 'uppercase',
          marginBottom: Spacing.sm,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: Fonts.dmSans.regular,
          fontSize: 12,
          color: Colors.textOnCulture,
          lineHeight: 12 * 1.6,
        }}
      >
        {text}
      </Text>
    </View>
  );
}
