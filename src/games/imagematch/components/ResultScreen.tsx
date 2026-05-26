import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';

type Props = {
  score:    number;
  total:    number;
  onReplay: () => void;
};

function getResultIcon(score: number, total: number) {
  const r = score / total;
  if (r === 1)   return Icons.lessonDone;
  if (r >= 0.7)  return Icons.ratingEasy;
  if (r >= 0.4)  return Icons.ratingOk;
  return Icons.tabLearn;
}

function getTitle(score: number, total: number): string {
  const r = score / total;
  if (r === 1)   return 'Perfect score!';
  if (r >= 0.7)  return 'Well done!';
  if (r >= 0.4)  return 'Keep practising!';
  return 'Keep learning!';
}

const ResultScreen: React.FC<Props> = ({ score, total, onReplay }) => {
  const router = useRouter();
  const ResultIcon = getResultIcon(score, total);

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxl,
        gap: Spacing.lg,
      }}
    >
      <ResultIcon size={moderateScale(24)} color={Colors.primary} />
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
        out of {total} correct · {Math.round((score / total) * 100)}%
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
      <View style={{ flexDirection: 'row', gap: Spacing.md, width: '100%' }}>
        <Pressable
          onPress={() => router.replace('/(tabs)/practice')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: Radius.lg,
            paddingVertical: moderateScale(14),
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              color: Colors.onSurface,
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(15),
            }}
          >
            Back to games
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/(tabs)/')}
          style={({ pressed }) => ({
            flex: 1,
            backgroundColor: Colors.surfaceContainerHighest,
            borderRadius: Radius.lg,
            paddingVertical: moderateScale(14),
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              color: Colors.onSurface,
              fontFamily: Fonts.dmSans.bold,
              fontSize: moderateScale(15),
            }}
          >
            Back home
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ResultScreen;
