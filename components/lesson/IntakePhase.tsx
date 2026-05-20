import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { PhaseHeader } from './PhaseHeader';
import { PhraseDisplay } from './intake/PhraseDisplay';
import { AudioControls, speakablePhrase } from './intake/AudioControls';
import { SayItControl } from './intake/SayItControl';
import { IntakeFooter } from './intake/IntakeFooter';
import { deviceTtsAudioService } from '../../services/audio/deviceTtsAudioService';
import { useModal } from '../../components/modals/ModalHost';
import { PhraseDetailSheet } from '../../components/modals/instances/PhraseDetailSheet';
import type { Lesson, SelfRating } from '../../constants/lessons/types';

interface IntakePhaseProps {
  lesson: Lesson;
  phraseIndex: number;
  onAdvance: () => void;
}

export function IntakePhase({ lesson, phraseIndex, onAdvance }: IntakePhaseProps) {
  const phrase = lesson.intake[phraseIndex];
  const total = lesson.intake.length;
  const isLastPhrase = phraseIndex >= total - 1;

  const [hintsRevealedInSession, setHintsRevealedInSession] = useState(false);
  const [rating, setRating] = useState<SelfRating | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modal = useModal();

  useEffect(() => {
    if (!phrase) return;

    // Reset per-phrase state.
    setRating(null);

    // Fade in.
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true,
    }).start();

    // Auto-play TTS.
    deviceTtsAudioService.play(speakablePhrase(phrase)).catch((err) => {
      console.warn('[audio] auto-play failed', err);
    });

    return () => {
      // Stop any ongoing speech when leaving this phrase.
      deviceTtsAudioService.stop().catch(() => undefined);
    };
  }, [phrase?.id]);

  if (!phrase) return null;

  const handleAdvance = () => {
    console.log('[intake] advance', { phraseId: phrase.id, rating });
    onAdvance();
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.surface }}>
      <PhaseHeader phase="intake" intakeProgress={{ current: phraseIndex + 1, total }} />

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: Spacing.lg,
            paddingTop: Spacing.xl,
            paddingBottom: Spacing.lg,
          }}
        >
          <PhraseDisplay
            phrase={phrase}
            hintRevealed={hintsRevealedInSession}
            onRevealHint={() => setHintsRevealedInSession(true)}
            onPressHero={() =>
              modal.show({
                kind: 'sheet',
                component: PhraseDetailSheet,
                props: {
                  phrase,
                  onDismiss: () => modal.dismiss(),
                },
              })
            }
          />

          <AudioControls phrase={phrase} />

          <SayItControl
            phrase={phrase}
            onComplete={(r) => setRating(r)}
          />
        </ScrollView>
      </Animated.View>

      <IntakeFooter
        canAdvance={rating !== null}
        onAdvance={handleAdvance}
        isLastPhrase={isLastPhrase}
      />
    </View>
  );
}
