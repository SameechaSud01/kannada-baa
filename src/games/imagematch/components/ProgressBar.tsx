import React from 'react';
import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Radius } from '@/constants/spacing';

type Props = { current: number; total: number };

const ProgressBar: React.FC<Props> = ({ current, total }) => (
  <View
    style={{
      height: moderateScale(6),
      width: '100%',
      borderRadius: Radius.full,
      backgroundColor: Colors.surfaceContainerHigh,
    }}
  >
    <View
      style={{
        height: '100%',
        borderRadius: Radius.full,
        backgroundColor: Colors.primary,
        width: `${(current / total) * 100}%`,
      }}
    />
  </View>
);

export default ProgressBar;
