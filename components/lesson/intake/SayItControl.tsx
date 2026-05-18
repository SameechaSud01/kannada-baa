import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import type { Phrase, SelfRating } from '../../../constants/lessons/types';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

type SayState = 'idle' | 'recording' | 'playing-back' | 'rating' | 'done';

interface SayItControlProps {
  phrase: Phrase;
  onComplete: (rating: SelfRating) => void;
}

const RATING_OPTIONS: { value: SelfRating; Icon: TablerIcon; label: string }[] = [
  { value: 'hard', Icon: Icons.ratingHard, label: 'Hard' },
  { value: 'ok', Icon: Icons.ratingOk, label: 'OK' },
  { value: 'easy', Icon: Icons.ratingEasy, label: 'Easy' },
];

export function SayItControl({ phrase, onComplete }: SayItControlProps) {
  const [state, setState] = useState<SayState>('idle');
  const playbackSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    setState('idle');
  }, [phrase.id]);

  useEffect(() => {
    return () => {
      playbackSoundRef.current?.unloadAsync().catch(() => undefined);
      playbackSoundRef.current = null;
    };
  }, []);

  const handleTap = async () => {
    if (state === 'idle') {
      try {
        await deviceTtsAudioService.startRecording();
        setState('recording');
      } catch (err) {
        console.warn('[audio] startRecording failed', err);
      }
      return;
    }

    if (state === 'recording') {
      let uri = '';
      try {
        const result = await deviceTtsAudioService.stopRecording();
        uri = result.uri;
      } catch (err) {
        console.warn('[audio] stopRecording failed', err);
      }

      if (!uri) {
        setState('rating');
        return;
      }

      setState('playing-back');
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
        );
        playbackSoundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync().catch(() => undefined);
            if (playbackSoundRef.current === sound) {
              playbackSoundRef.current = null;
            }
            setState('rating');
          }
        });
      } catch (err) {
        console.warn('[audio] playback failed', err);
        setState('rating');
      }
    }
  };

  const handleRate = (rating: SelfRating) => {
    setState('done');
    onComplete(rating);
  };

  if (state === 'rating') {
    return (
      <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: 13,
            color: Colors.tertiary,
            marginBottom: Spacing.md,
          }}
        >
          How did that feel?
        </Text>
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          {RATING_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => handleRate(opt.value)}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
              style={({ pressed }) => ({
                backgroundColor: pressed ? Colors.surfaceContainerHigh : Colors.surfaceContainerHighest,
                borderRadius: Radius.lg,
                paddingVertical: Spacing.md,
                paddingHorizontal: Spacing.lg,
                minWidth: 64,
                minHeight: 64,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <opt.Icon size={26} color={Colors.primary} />
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: 11,
                  color: Colors.tertiary,
                  marginTop: Spacing.xs,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const labelText =
    state === 'idle'
      ? 'Say it'
      : state === 'recording'
        ? 'Stop'
        : state === 'playing-back'
          ? 'Playing back…'
          : 'Done';

  const LeadingIcon: TablerIcon | null =
    state === 'idle' || state === 'recording'
      ? Icons.mic
      : state === 'done'
        ? Icons.correct
        : null;

  const tappable = state === 'idle' || state === 'recording';
  const iconColor = state === 'recording' ? Colors.onPrimary : Colors.primaryContainer;

  return (
    <View style={{ alignItems: 'center', marginTop: Spacing.lg }}>
      <Pressable
        onPress={tappable ? handleTap : undefined}
        disabled={!tappable}
        accessibilityRole="button"
        accessibilityLabel={labelText}
        style={({ pressed }) => ({
          backgroundColor:
            state === 'done'
              ? Colors.secondaryFixed
              : state === 'recording'
                ? Colors.primaryContainer
                : pressed && tappable
                  ? Colors.primary
                  : Colors.secondaryFixed,
          borderRadius: Radius.md,
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing.xl,
          minHeight: 44,
          minWidth: 44,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: Spacing.sm,
        })}
      >
        {LeadingIcon && <LeadingIcon size={16} color={iconColor} />}
        <Text
          style={{
            fontFamily: Fonts.dmSans.medium,
            fontSize: 14,
            color: state === 'recording' ? Colors.onPrimary : Colors.primaryContainer,
          }}
        >
          {labelText}
        </Text>
      </Pressable>
    </View>
  );
}
