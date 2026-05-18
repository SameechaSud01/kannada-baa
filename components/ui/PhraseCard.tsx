import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { AudioButtons } from './AudioButtons';

interface PhraseCardProps {
  script: string;
  roman: string;
  meaning: string;
  showScript: boolean;
  onPlay: () => void;
  onRecord: () => void;
  onCheck: () => void;
  isPlaying?: boolean;
  isRecording?: boolean;
}

export function PhraseCard({
  script,
  roman,
  meaning,
  showScript,
  onPlay,
  onRecord,
  onCheck,
  isPlaying,
  isRecording,
}: PhraseCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.surfaceContainerHighest,
        borderRadius: Radius.xl,
        padding: Spacing.xxl,
        alignItems: 'center',
      }}
    >
      {showScript && (
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.regular,
            fontSize: 34,
            color: Colors.primaryContainer,
            textAlign: 'center',
            lineHeight: 54,
            paddingTop: 8,
            marginBottom: Spacing.md,
          }}
        >
          {script}
        </Text>
      )}

      <Text
        style={{
          fontFamily: Fonts.lora.italic,
          fontSize: showScript ? 15 : 22,
          color: Colors.tertiary,
          textAlign: 'center',
          marginBottom: Spacing.sm,
        }}
      >
        {roman}
      </Text>

      <Text
        style={{
          fontFamily: Fonts.dmSans.medium,
          fontSize: 14,
          color: Colors.onSurface,
          textAlign: 'center',
        }}
      >
        {meaning}
      </Text>

      <AudioButtons
        onPlay={onPlay}
        onRecord={onRecord}
        onCheck={onCheck}
        isPlaying={isPlaying}
        isRecording={isRecording}
      />
    </View>
  );
}
