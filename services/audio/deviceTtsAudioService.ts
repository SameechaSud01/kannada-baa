import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import type { AudioService, PlayOptions } from './AudioService';

const DEFAULT_LANGUAGE = 'kn-IN';
const DEFAULT_RATE = 0.7;

let currentRecording: Audio.Recording | null = null;
let currentPlaybackSound: Audio.Sound | null = null;

/**
 * Checks if a Kannada voice is available on this device.
 * Call once at app startup; surface a warning to the user if false.
 */
export async function isKannadaVoiceAvailable(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const knVoices = voices.filter((v) => v.language.toLowerCase().startsWith('kn'));
    return knVoices.length > 0;
  } catch (err) {
    console.warn('[audio] getAvailableVoicesAsync threw', err);
    return false;
  }
}

export const deviceTtsAudioService: AudioService = {
  async play(text: string, options?: PlayOptions) {
    const language = options?.language ?? DEFAULT_LANGUAGE;
    const rate = options?.rate ?? DEFAULT_RATE;
    Speech.stop();
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      Speech.speak(text, {
        language,
        rate,
        onDone: () => {
          if (settled) return;
          settled = true;
          resolve();
        },
        onError: (err) => {
          if (settled) return;
          settled = true;
          console.warn('[audio] onError', { text, err });
          reject(err);
        },
        onStopped: () => {
          if (settled) return;
          settled = true;
          resolve();
        },
      });
    });
  },

  async stop() {
    Speech.stop();
    if (currentPlaybackSound) {
      try {
        await currentPlaybackSound.stopAsync();
        await currentPlaybackSound.unloadAsync();
      } catch {
        // sound may already be unloaded
      }
      currentPlaybackSound = null;
    }
  },

  async startRecording() {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      throw new Error('Microphone permission denied');
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    currentRecording = recording;
  },

  async stopRecording() {
    if (!currentRecording) {
      return { uri: '', durationMs: 0 };
    }
    await currentRecording.stopAndUnloadAsync();
    const uri = currentRecording.getURI() ?? '';
    const status = await currentRecording.getStatusAsync();
    const durationMs = status.durationMillis ?? 0;
    currentRecording = null;
    return { uri, durationMs };
  },

  async playRecording(uri: string) {
    if (!uri) return;
    if (currentPlaybackSound) {
      try {
        await currentPlaybackSound.unloadAsync();
      } catch {
        // ignore
      }
      currentPlaybackSound = null;
    }
    const { sound } = await Audio.Sound.createAsync({ uri });
    currentPlaybackSound = sound;
    await sound.playAsync();
  },
};
