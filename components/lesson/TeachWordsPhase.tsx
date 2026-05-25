import { useEffect } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/colors';
import { Fonts } from '../../constants/fonts';
import { Spacing, Radius } from '../../constants/spacing';
import { Icons } from '../../constants/icons';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { Toasts } from '../../components/modals/instances/toastCatalog';
import { LessonProgressBar } from './LessonProgressBar';
import type { Word } from '../../constants/lessons/types';

interface TeachWordsPhaseProps {
  words: Word[];
  wordIndex: number;
  onAdvance: () => void;
}

export function TeachWordsPhase({ words, wordIndex, onAdvance }: TeachWordsPhaseProps) {
  const insets = useSafeAreaInsets();
  const word = words[wordIndex];
  const total = words.length;
  const isLast = wordIndex >= total - 1;

  useEffect(() => {
    if (!word) return;
    deviceTtsAudioService.play(word.kannada).catch((err) => {
      console.warn('[teach_words] auto-play failed', err);
    });
    return () => {
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [word?.kannada]);

  if (!word) return null;

  const handleReplay = () => {
    deviceTtsAudioService.play(word.kannada).catch((err) => {
      console.warn('[teach_words] replay failed', err);
      Toasts.audioFailed(handleReplay);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <View style={{ paddingTop: insets.top + Spacing.lg, paddingHorizontal: Spacing.lg }}>
        <LessonProgressBar
          current={wordIndex + 1}
          total={total}
          label={`Word ${wordIndex + 1} of ${total}`}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: Spacing.lg,
          paddingTop: Spacing.xxl,
          paddingBottom: Spacing.lg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View
          style={{
            backgroundColor: Colors.surfaceContainerLow,
            borderRadius: Radius.xl,
            paddingVertical: Spacing.xxxl,
            paddingHorizontal: Spacing.lg,
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.lora.italic,
              fontSize: moderateScale(42),
              lineHeight: moderateScale(54),
              color: Colors.onSurface,
              textAlign: 'center',
            }}
            maxFontSizeMultiplier={1.2}
            adjustsFontSizeToFit
            numberOfLines={2}
          >
            {word.transliteration}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(18),
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: Spacing.md,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {word.english}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              textAlign: 'center',
              marginTop: Spacing.lg,
              opacity: 0.7,
            }}
            maxFontSizeMultiplier={1.3}
          >
            {word.kannada}
          </Text>
        </View>

        <Pressable
          onPress={handleReplay}
          accessibilityRole="button"
          accessibilityLabel={`Hear ${word.english} again`}
          hitSlop={8}
          style={({ pressed }) => ({
            marginTop: Spacing.xxl,
            width: moderateScale(64),
            height: moderateScale(64),
            borderRadius: Radius.full,
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.94 : 1 }],
          })}
        >
          <Icons.audio size={moderateScale(26)} color={Colors.onPrimary} />
        </Pressable>
      </ScrollView>

      <View style={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.lg }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Start practising words' : 'Got it, next word'}
          onPress={onAdvance}
          style={({ pressed }) => ({
            backgroundColor: pressed ? Colors.primary : Colors.primaryContainer,
            borderRadius: Radius.md,
            paddingVertical: Spacing.md + moderateScale(2),
            alignItems: 'center',
            transform: [{ scale: pressed ? 0.96 : 1 }],
            minHeight: moderateScale(44),
            justifyContent: 'center',
          })}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(15),
              color: Colors.onPrimary,
            }}
          >
            {isLast ? 'Start practising words' : 'Got it'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
