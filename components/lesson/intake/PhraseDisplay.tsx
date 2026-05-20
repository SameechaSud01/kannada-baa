import { View, Text, Pressable, Image } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { resolveImage } from '../../../constants/lessons/imageAssets';
import type { Phrase } from '../../../constants/lessons/types';

interface PhraseDisplayProps {
  phrase: Phrase;
  hintRevealed: boolean;
  onRevealHint: () => void;
  /** Tap the Kannada hero text to open the PhraseDetailSheet (MODALS §6.4). */
  onPressHero?: () => void;
}

export function PhraseDisplay({ phrase, hintRevealed, onRevealHint, onPressHero }: PhraseDisplayProps) {
  const imageSource = resolveImage(phrase.imageKey);

  return (
    <View
      style={{
        backgroundColor: Colors.surfaceContainerHighest,
        borderRadius: Radius.xl,
        paddingVertical: Spacing.xxl,
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
      }}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={{
            width: '100%',
            height: moderateScale(140),
            borderRadius: Radius.lg,
            marginBottom: Spacing.lg,
          }}
          resizeMode="cover"
          accessibilityLabel={`Illustration for ${phrase.english}`}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: moderateScale(140),
            borderRadius: Radius.lg,
            backgroundColor: Colors.secondaryFixed,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: Spacing.lg,
            paddingHorizontal: Spacing.md,
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.regular,
              fontSize: moderateScale(28),
              color: Colors.onSecondaryContainer,
              textAlign: 'center',
              lineHeight: moderateScale(44),
            }}
          >
            {phrase.kannada}
          </Text>
        </View>
      )}

      <Pressable
        onPress={onPressHero}
        disabled={!onPressHero}
        accessibilityRole={onPressHero ? 'button' : 'text'}
        accessibilityLabel={
          onPressHero
            ? `Kannada: ${phrase.kannada}. Tap for breakdown.`
            : `Kannada: ${phrase.kannada}`
        }
        hitSlop={6}
        style={({ pressed }) => ({
          opacity: pressed && onPressHero ? 0.7 : 1,
          paddingHorizontal: Spacing.sm,
        })}
      >
        <Text
          style={{
            fontFamily: Fonts.notoSerifKannada.regular,
            fontSize: moderateScale(34),
            color: Colors.primaryContainer,
            textAlign: 'center',
            lineHeight: moderateScale(54),
            paddingTop: Spacing.sm,
            marginBottom: Spacing.md,
          }}
        >
          {phrase.kannada}
        </Text>
      </Pressable>

      <Text
        style={{
          fontFamily: Fonts.lora.italic,
          fontSize: moderateScale(15),
          color: Colors.tertiary,
          textAlign: 'center',
          marginBottom: Spacing.lg,
        }}
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
      >
        {phrase.transliteration}
      </Text>

      {hintRevealed ? (
        <Text
          style={{
            fontFamily: Fonts.dmSans.regular,
            fontSize: moderateScale(14),
            color: Colors.onSurface,
            textAlign: 'center',
            paddingVertical: Spacing.sm,
          }}
        >
          {phrase.english}
        </Text>
      ) : (
        <Pressable
          onPress={onRevealHint}
          accessibilityRole="button"
          accessibilityLabel="Show English hint"
          style={{
            paddingVertical: Spacing.sm,
            paddingHorizontal: Spacing.md,
            minHeight: moderateScale(44),
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(14),
              color: Colors.tertiary,
              textAlign: 'center',
            }}
          >
            Show English hint
          </Text>
        </Pressable>
      )}
    </View>
  );
}
