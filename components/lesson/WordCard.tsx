import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { AudioButtons } from '../ui/AudioButtons';
import { useUserStore } from '../../stores/useUserStore';

interface WordCardProps {
  kannadaScript: string;
  transliteration: string;
  meaning: string;
  onPlay: () => void;
  onRecord: () => void;
  onCheck: () => void;
  isPlaying?: boolean;
  isRecording?: boolean;
}

export function WordCard({
  kannadaScript,
  transliteration,
  meaning,
  onPlay,
  onRecord,
  onCheck,
  isPlaying,
  isRecording,
}: WordCardProps) {
  const learningMode = useUserStore((s) => s.learningMode) ?? 'both';

  const showScript = learningMode !== 'spoken';
  const showTransliteration = learningMode !== 'written';

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
            fontSize: 34,
            color: Colors.primary,
            textAlign: 'center',
            lineHeight: 54,
            paddingTop: 8,
            marginBottom: Spacing.md,
          }}
        >
          {kannadaScript}
        </Text>
      )}

      {showTransliteration && (
        <Text
          style={{
            fontFamily: Fonts.lora.italic,
            fontSize: showScript ? 15 : 22,
            color: Colors.textSecondary,
            textAlign: 'center',
            marginBottom: Spacing.sm,
          }}
        >
          {transliteration}
        </Text>
      )}

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
