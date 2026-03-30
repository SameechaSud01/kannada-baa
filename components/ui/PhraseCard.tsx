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
        backgroundColor: Colors.cardBg,
        borderRadius: Radius.xl,
        borderWidth: 0.5,
        borderColor: Colors.border,
        padding: Spacing.xxl,
        alignItems: 'center',
      }}
    >
      {showScript && (
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.regular,
            fontSize: 32,
            color: Colors.textPrimary,
            textAlign: 'center',
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
          color: '#8D6E63',
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
          color: Colors.textBody,
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
