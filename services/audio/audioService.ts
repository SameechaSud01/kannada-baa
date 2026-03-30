import { Audio } from 'expo-av';

let currentSound: Audio.Sound | null = null;
let currentRecording: Audio.Recording | null = null;

export async function playAudio(audioFile: string): Promise<void> {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    // For MVP, we try to load from assets/audio/ folder
    // In production, these would be bundled or fetched from storage
    // For now, we'll gracefully handle missing files
    const { sound } = await Audio.Sound.createAsync(
      { uri: `asset:///audio/${audioFile}` },
      { shouldPlay: true }
    );
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        currentSound = null;
      }
    });
  } catch {
    // Audio file not available — fail silently for MVP
    console.log(`Audio file not found: ${audioFile}`);
  }
}

export async function startRecording(): Promise<void> {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    currentRecording = recording;
  } catch (err) {
    console.log('Failed to start recording:', err);
  }
}

export async function stopRecording(): Promise<string | null> {
  try {
    if (!currentRecording) return null;

    await currentRecording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });

    const uri = currentRecording.getURI();
    currentRecording = null;
    return uri;
  } catch (err) {
    console.log('Failed to stop recording:', err);
    return null;
  }
}
