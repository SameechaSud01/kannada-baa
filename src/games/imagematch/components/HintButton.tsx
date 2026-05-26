import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';

type Props = {
  hintVisible: boolean;
  onPress:     () => void;
};

const HintButton: React.FC<Props> = ({ hintVisible, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={hintVisible ? 'Hide hint' : 'Show hint'}
    style={({ pressed }) => ({
      position: 'absolute',
      top: Spacing.sm,
      right: Spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
      gap: moderateScale(4),
      backgroundColor: Colors.surface,
      borderWidth: 1,
      borderColor: Colors.surfaceContainerHigh,
      borderRadius: Radius.sm,
      paddingHorizontal: Spacing.sm,
      paddingVertical: moderateScale(4),
      opacity: pressed ? 0.7 : 1,
    })}
  >
    <Icons.sparkle size={moderateScale(12)} color={Colors.tertiary} />
    <Text
      style={{
        fontFamily: Fonts.dmSans.regular,
        fontSize: moderateScale(11),
        color: Colors.tertiary,
      }}
    >
      {hintVisible ? 'hide hint' : 'hint'}
    </Text>
  </Pressable>
);

export default HintButton;
