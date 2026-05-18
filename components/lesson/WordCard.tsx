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
          {kannadaScript}
        </Text>
      )}

      {showTransliteration && (
        <Text
          style={{
            fontFamily: Fonts.lora.italic,
            fontSize: showScript ? 15 : 22,
            color: Colors.tertiary,
            textAlign: 'center',
            marginBottom: Spacing.sm,
          }}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
        >
          {transliteration}
        </Text>
      )}

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
