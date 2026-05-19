import React from 'react';
import { View } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import OptionButton, { type OptionState } from './OptionButton';
import type { Option, AnswerState } from '../types';

type Props = {
  opts: Option[];
  answerState: AnswerState;
  selectedOpt: string | null;
  correctAnswer: string;
  onSelect: (kn: string) => void;
};

function deriveState(
  kn: string,
  selectedOpt: string | null,
  answerState: AnswerState,
  correctAnswer: string,
): OptionState {
  if (answerState === 'unanswered') return 'default';
  if (kn === selectedOpt && answerState === 'correct') return 'correct';
  if (kn === selectedOpt && answerState === 'wrong') return 'wrong';
  if (kn === correctAnswer && answerState === 'wrong') return 'reveal';
  return 'disabled';
}

const OptionGrid: React.FC<Props> = ({ opts, answerState, selectedOpt, correctAnswer, onSelect }) => (
  <View
    style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: moderateScale(10),
    }}
  >
    {opts.map((opt) => (
      <View key={opt.kn} style={{ width: '48%' }}>
        <OptionButton
          option={opt}
          state={deriveState(opt.kn, selectedOpt, answerState, correctAnswer)}
          onPress={() => onSelect(opt.kn)}
        />
      </View>
    ))}
  </View>
);

export default OptionGrid;
