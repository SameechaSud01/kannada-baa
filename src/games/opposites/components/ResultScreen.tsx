import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';

type Props = {
  score: number;
  total: number;
  onReplay: () => void;
};

function getEmoji(score: number, total: number): string {
  const ratio = score / total;
  if (ratio === 1) return '🎉';
  if (ratio >= 0.7) return '😊';
  if (ratio >= 0.4) return '😅';
  return '📚';
}

function getTitle(score: number, total: number): string {
  const ratio = score / total;
  if (ratio === 1) return 'Perfect score!';
  if (ratio >= 0.7) return 'Well done!';
  if (ratio >= 0.4) return 'Keep practising!';
  return 'Keep learning!';
}

const ResultScreen: React.FC<Props> = ({ score, total, onReplay }) => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xxl,
      gap: Spacing.lg,
    }}
  >
    <Text style={{ fontSize: moderateScale(48) }}>{getEmoji(score, total)}</Text>
    <Text
      style={{
        fontSize: moderateScale(20),
        fontFamily: Fonts.dmSans.bold,
        color: Colors.onSurface,
      }}
    >
      {getTitle(score, total)}
    </Text>
    <Text
      style={{
        fontSize: moderateScale(48),
        fontFamily: Fonts.dmSans.bold,
        color: Colors.primary,
      }}
    >
      {score}
    </Text>
    <Text
      style={{
        fontSize: moderateScale(14),
        color: Colors.tertiary,
        fontFamily: Fonts.dmSans.regular,
      }}
    >
      out of {total} correct
    </Text>
    <Pressable
      style={{
        width: '100%',
        backgroundColor: Colors.primary,
        borderRadius: Radius.xl,
        paddingVertical: moderateScale(14),
        alignItems: 'center',
        marginTop: Spacing.lg,
      }}
      onPress={onReplay}
    >
      <Text
        style={{
          color: Colors.onPrimary,
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(16),
        }}
      >
        Play again ▸
      </Text>
    </Pressable>
  </View>
);

export default ResultScreen;
