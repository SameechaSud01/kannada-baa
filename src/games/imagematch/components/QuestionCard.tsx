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
          <Text
            style={{
              fontFamily: 'NotoSansKannada_700Bold',
              fontSize: moderateScale(40),
              textAlign: 'center',
              color: Colors.onSurface,
            }}
          >
            {target.kn}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              marginTop: Spacing.xs,
              textAlign: 'center',
            }}
          >
            {target.ph}
          </Text>
          {hintVisible && (
            <View
              style={{
                marginTop: Spacing.md,
                backgroundColor: Colors.surface,
                borderWidth: 1,
                borderColor: Colors.surfaceContainerHigh,
                borderRadius: Radius.md,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
                alignSelf: 'stretch',
              }}
            >
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(12),
                  color: Colors.tertiary,
                }}
              >
                word meaning: {target.en}
              </Text>
            </View>
          )}
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
