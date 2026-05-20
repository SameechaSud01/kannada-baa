import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Audio } from 'expo-av';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../../constants/colors';
import { Fonts } from '../../../constants/fonts';
import { Spacing, Radius } from '../../../constants/spacing';
import { Icons } from '../../../constants/icons';
import { deviceTtsAudioService } from '../../../services/audio/deviceTtsAudioService';
import { useModal } from '../../../components/modals/ModalHost';
import { PermissionDialog } from '../../../components/modals/instances/PermissionDialog';
import { useUserStore } from '../../../stores/useUserStore';
import type { Phrase, SelfRating } from '../../../constants/lessons/types';
import type { Icon as TablerIcon } from '@tabler/icons-react-native';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

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
  const modal = useModal();
  const micDeniedAt = useUserStore((s) => s.permissionDenials.mic);
  const recordPermissionDenial = useUserStore((s) => s.recordPermissionDenial);

  const ensureMicPermission = async (): Promise<boolean> => {
    const existing = await Audio.getPermissionsAsync();
    if (existing.granted) return true;
    if (existing.canAskAgain === false) return false;

    // Skip the explainer if user said "Not now" within the last week.
    if (micDeniedAt) {
      const last = new Date(micDeniedAt).getTime();
      if (Date.now() - last < ONE_WEEK_MS) return false;
    }

    return new Promise<boolean>((resolve) => {
      modal.show({
        kind: 'dialog',
        component: PermissionDialog,
        props: {
          kind: 'mic',
          onAllow: () => {
            modal.dismiss();
            resolve(true);
          },
          onDeny: () => {
            recordPermissionDenial('mic');
            modal.dismiss();
            resolve(false);
          },
        },
      });
    });
  };

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
      const allowed = await ensureMicPermission();
      if (!allowed) return;
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
            fontSize: moderateScale(13),
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
                minWidth: moderateScale(64),
                minHeight: moderateScale(64),
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <opt.Icon size={26} color={Colors.primary} />
              <Text
                style={{
                  fontFamily: Fonts.dmSans.regular,
                  fontSize: moderateScale(11),
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
          minHeight: moderateScale(44),
          minWidth: moderateScale(44),
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
            fontSize: moderateScale(14),
            color: state === 'recording' ? Colors.onPrimary : Colors.primaryContainer,
          }}
        >
          {labelText}
        </Text>
      </Pressable>
    </View>
  );
}
