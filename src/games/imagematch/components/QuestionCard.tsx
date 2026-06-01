import React from 'react';
import { View, Text } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '@/constants/colors';
import { Spacing, Radius } from '@/constants/spacing';
import { Fonts } from '@/constants/fonts';
import HintButton from './HintButton';
import type { Question } from '../types';

type Props = {
  question:     Question;
  hintVisible:  boolean;
  onHintPress:  () => void;
};

const LABEL: Record<Question['type'], string> = {
  'word-to-picture': 'which picture matches this word?',
  'picture-to-word': 'which word matches this picture?',
};

const QuestionCard: React.FC<Props> = ({ question, hintVisible, onHintPress }) => {
  const { type, target } = question;
  const isW2P = type === 'word-to-picture';

  return (
    <View
      style={{
        borderRadius: Radius.xl,
        backgroundColor: Colors.surfaceContainerLow,
        padding: Spacing.xxl,
        width: '100%',
        alignItems: 'center',
        position: 'relative',
        marginBottom: Spacing.xs,
      }}
    >
      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: moderateScale(11),
          textTransform: 'uppercase',
          letterSpacing: 1.5,
          color: Colors.tertiary,
          marginBottom: Spacing.md,
          textAlign: 'center',
        }}
      >
        {LABEL[type]}
      </Text>

      {isW2P ? (
        <>
          {target.ph ? (
            <Text
              style={{
                fontFamily: Fonts.lora.italic,
                fontSize: moderateScale(34),
                lineHeight: moderateScale(44),
                textAlign: 'center',
                color: Colors.onSurface,
              }}
              adjustsFontSizeToFit
              numberOfLines={2}
              maxFontSizeMultiplier={1.2}
            >
              {target.ph}
            </Text>
          ) : null}
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.tertiary,
              marginTop: Spacing.sm,
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.3}
          >
            {target.en}
          </Text>
          <Text
            style={{
              fontFamily: 'NotoSansKannada_400Regular',
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              marginTop: Spacing.sm,
              textAlign: 'center',
              opacity: 0.7,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {target.kn}
          </Text>
          <HintButton hintVisible={hintVisible} onPress={onHintPress} />
        </>
      ) : (
        <>
          <View
            style={{
              width: moderateScale(112),
              height: moderateScale(112),
              backgroundColor: Colors.surface,
              borderRadius: Radius.xl,
              borderWidth: 1,
              borderColor: Colors.surfaceContainerHigh,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: moderateScale(56), textAlign: 'center' }}>{target.emoji}</Text>
          </View>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              marginTop: Spacing.sm,
              textAlign: 'center',
            }}
          >
            {target.en}
          </Text>
        </>
      )}
    </View>
  );
};

export default QuestionCard;
