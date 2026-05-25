import React from 'react';
<<<<<<< Updated upstream
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import { Icons } from '@/constants/icons';
=======
import { View, Text, Pressable } from 'react-native';
>>>>>>> Stashed changes

type Props = {
  word: string;
  tr: string;
  meaning: string;
  streak: number;
  hintUsed: boolean;
  isAnswered: boolean;
  onHint: () => void;
};

<<<<<<< Updated upstream
const QuestionCard: React.FC<Props> = ({ word, tr, meaning, streak }) => (
  <View
    style={{
      borderRadius: Radius.xl,
      backgroundColor: Colors.surfaceContainerLow,
      padding: Spacing.xxl,
      width: '100%',
      alignItems: 'center',
    }}
  >
    <Text
      style={{
        fontFamily: Fonts.dmSans.medium,
        fontSize: moderateScale(12),
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: Colors.tertiary,
        marginBottom: Spacing.sm,
      }}
    >
=======
const QuestionCard: React.FC<Props> = ({ word, tr, meaning, streak, hintUsed, isAnswered, onHint }) => (
  <View className='rounded-2xl bg-gray-100 p-6 w-full items-center'>
    <Text className='text-xs uppercase tracking-widest text-gray-400 mb-2'>
>>>>>>> Stashed changes
      find the opposite of
    </Text>
    <Text
      style={{
        fontFamily: Fonts.notoSerifKannada.bold,
        fontSize: moderateScale(48),
        textAlign: 'center',
        color: Colors.onSurface,
      }}
    >
      {word}
    </Text>
<<<<<<< Updated upstream
    <Text
      style={{
        fontFamily: Fonts.lora.italic,
        fontSize: moderateScale(14),
        color: Colors.tertiary,
        marginTop: Spacing.xs,
      }}
    >
      {tr}
    </Text>
    <Text
      style={{
        fontFamily: Fonts.dmSans.regular,
        fontSize: moderateScale(12),
        color: Colors.tertiary,
        marginTop: moderateScale(2),
      }}
    >
      ({meaning})
    </Text>
=======
    <Text className='text-sm italic text-gray-500 mt-1'>{tr}</Text>

    {hintUsed ? (
      <Text className='text-xs text-amber-700 mt-2 font-medium'>({meaning})</Text>
    ) : !isAnswered ? (
      <Pressable
        onPress={onHint}
        className='mt-3 border border-amber-400 rounded-full px-4 py-1'
      >
        <Text className='text-amber-700 text-xs font-semibold'>Hint</Text>
      </Pressable>
    ) : null}
>>>>>>> Stashed changes

    {streak >= 2 && (
      <View
        style={{
          position: 'absolute',
          top: Spacing.md,
          right: Spacing.md,
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(4),
          backgroundColor: Colors.secondaryFixed,
          borderRadius: Radius.full,
          paddingHorizontal: Spacing.sm,
          paddingVertical: moderateScale(2),
        }}
      >
        <Icons.streak size={moderateScale(12)} color={Colors.secondary} />
        <Text
          style={{
            color: Colors.secondary,
            fontSize: moderateScale(12),
            fontFamily: Fonts.dmSans.bold,
          }}
        >
          {streak}
        </Text>
      </View>
    )}
  </View>
);

export default QuestionCard;
