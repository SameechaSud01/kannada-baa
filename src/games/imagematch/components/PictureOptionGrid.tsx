import React from 'react';
import { View } from 'react-native';
import { Spacing } from '@/constants/spacing';
import { deriveOptionState } from '../hooks/useImageMatch';
import PictureOptionButton from './PictureOptionButton';
import type { VocabItem } from '../types';

type Props = {
  options:    VocabItem[];
  targetId:   string;
  selectedId: string | null;
  answered:   boolean;
  onSelect:   (id: string) => void;
};

const PictureOptionGrid: React.FC<Props> = ({ options, targetId, selectedId, answered, onSelect }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
    {options.map((opt) => (
      <PictureOptionButton
        key={opt.id}
        item={opt}
        state={deriveOptionState(opt.id, selectedId, targetId, answered)}
        onPress={() => onSelect(opt.id)}
      />
    ))}
  </View>
);

export default PictureOptionGrid;
