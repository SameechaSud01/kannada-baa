import React from 'react';
import { View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { deriveOptionState } from '../hooks/useImageMatch';
import WordOptionButton from './WordOptionButton';
import type { VocabItem } from '../types';

type Props = {
  options:     VocabItem[];
  targetId:    string;
  selectedId:  string | null;
  answered:    boolean;
  hintVisible: boolean;
  onSelect:    (id: string) => void;
};

const WordOptionList: React.FC<Props> = ({ options, targetId, selectedId, answered, hintVisible, onSelect }) => (
  <View style={{ gap: Spacing.sm }}>
    {options.map((opt) => (
      <WordOptionButton
        key={opt.id}
        item={opt}
        state={deriveOptionState(opt.id, selectedId, targetId, answered)}
        hintVisible={hintVisible}
        onPress={() => onSelect(opt.id)}
      />
    ))}
  </View>
);

export default WordOptionList;
