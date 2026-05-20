import { Text, View } from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { RoundIconButton } from '../../ui/RoundIconButton';
import { Button, ButtonRow } from '../../ui/Button';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import { Toasts } from './toastCatalog';
import type { Phrase } from '../../../constants/lessons/types';

export interface PhraseDetailSheetProps {
  phrase: Phrase;
  onDismiss: () => void;
}

function speakable(kannada: string): string {
  return kannada.replace(/\[name\]/g, '').trim();
}

/**
 * Bottom sheet showing a phrase's full breakdown (MODALS §6.4). Renders inside
 * <BottomSheet> — the parent provides drag handle, dynamic sizing, dismiss.
 */
export function PhraseDetailSheet({ phrase, onDismiss }: PhraseDetailSheetProps) {
  const handlePlay = () => {
    const txt = speakable(phrase.kannada);
    if (!txt) return;
    deviceTtsAudioService.play(txt).catch((err) => {
      console.warn('[audio] phrase-detail play failed', err);
      Toasts.audioFailed(handlePlay);
    });
  };

  return (
    <BottomSheetScrollView
      bounces={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        gap: moderateScale(16),
        paddingTop: moderateScale(12),
        paddingHorizontal: moderateScale(20),
        paddingBottom: moderateScale(36),
      }}
    >
      {/* Header row — phrase + play button */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: moderateScale(16),
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: Fonts.notoSerifKannada.medium,
              fontSize: moderateScale(32),
              lineHeight: moderateScale(54),
              color: Colors.onSurface,
              includeFontPadding: false,
            }}
            maxFontSizeMultiplier={1.3}
            numberOfLines={2}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {speakable(phrase.kannada) || phrase.kannada}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.lora.mediumItalic,
              fontSize: moderateScale(18),
              color: Colors.secondary,
              marginTop: moderateScale(4),
            }}
            maxFontSizeMultiplier={1.4}
          >
            {phrase.transliteration}
          </Text>
          <Text
            style={{
              fontFamily: Fonts.dmSans.regular,
              fontSize: moderateScale(13),
              color: Colors.tertiary,
              marginTop: moderateScale(2),
            }}
            maxFontSizeMultiplier={1.4}
          >
            {phrase.english}
          </Text>
        </View>
        <RoundIconButton
          icon="play"
          variant="primary"
          size={48}
          onPress={handlePlay}
          accessibilityLabel={`Hear: ${phrase.english}`}
        />
      </View>

      {phrase.gloss && phrase.gloss.length > 0 ? (
        <>
          <GoldRule label="Break it down" />
          <View style={{ gap: moderateScale(8) }}>
            {phrase.gloss.map((atom, idx) => (
              <View
                key={`${atom.atom}-${idx}`}
                style={{
                  backgroundColor: Colors.surfaceContainerHighest,
                  borderRadius: Radius.lg,
                  padding: moderateScale(12),
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: moderateScale(10),
                }}
              >
                <Text
                  style={{
                    fontFamily: Fonts.notoSerifKannada.medium,
                    fontSize: moderateScale(18),
                    color: Colors.onSurface,
                  }}
                  maxFontSizeMultiplier={1.3}
                >
                  {atom.atom}
                </Text>
                {atom.transliteration ? (
                  <Text
                    style={{
                      fontFamily: Fonts.lora.italic,
                      fontSize: moderateScale(13),
                      color: Colors.secondary,
                    }}
                    maxFontSizeMultiplier={1.4}
                  >
                    {atom.transliteration}
                  </Text>
                ) : null}
                <View style={{ flex: 1 }} />
                <Text
                  style={{
                    fontFamily: Fonts.dmSans.regular,
                    fontSize: moderateScale(12),
                    color: Colors.tertiary,
                    textAlign: 'right',
                  }}
                  maxFontSizeMultiplier={1.4}
                >
                  {atom.en}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {phrase.note ? (
        <View
          style={{
            backgroundColor: Colors.secondaryFixed,
            borderRadius: Radius.lg,
            padding: moderateScale(12),
            flexDirection: 'row',
            gap: moderateScale(10),
          }}
        >
          <Icons.sparkle
            size={moderateScale(16)}
            color={Colors.onSecondaryContainer}
          />
          <Text
            style={{
              flex: 1,
              fontFamily: Fonts.dmSans.medium,
              fontSize: moderateScale(12),
              lineHeight: moderateScale(17),
              color: Colors.onSecondaryContainer,
            }}
            maxFontSizeMultiplier={1.4}
          >
            {phrase.note}
          </Text>
        </View>
      ) : null}

      <ButtonRow>
        <Button
          label="Save"
          variant="ghost"
          onPress={onDismiss}
          disabled
          accessibilityHint="Coming soon"
          flex
        />
        <Button label="Got it" variant="primary" onPress={onDismiss} flex />
      </ButtonRow>
      <View style={{ height: Spacing.sm }} />
    </BottomSheetScrollView>
  );
}

function GoldRule({ label }: { label: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: moderateScale(10),
      }}
    >
      <Dots />
      <Text
        style={{
          fontFamily: Fonts.dmSans.bold,
          fontSize: moderateScale(10),
          letterSpacing: 2,
          color: Colors.secondary,
          textTransform: 'uppercase',
        }}
        maxFontSizeMultiplier={1.4}
      >
        {label}
      </Text>
      <Dots />
    </View>
  );
}

function Dots() {
  return (
    <View
      style={{
        flex: 1,
        borderBottomWidth: 1,
        borderColor: Colors.secondary,
        opacity: 0.35,
        borderStyle: 'dotted',
        height: 1,
      }}
    />
  );
}
