export type PlayOptions = {
  /** BCP-47 language tag. Defaults to 'kn-IN'. */
  language?: string;
  /** Speech rate. Defaults to 0.9 (slightly slower than normal). */
  rate?: number;
};

export interface AudioService {
  /**
   * Speak the given text via on-device TTS.
   * Stops any currently-playing speech first.
   */
  play(text: string, options?: PlayOptions): Promise<void>;

  /** Stop any current playback. */
  stop(): Promise<void>;

  /** Begin recording from the device mic. */
  startRecording(): Promise<void>;

  /** Stop recording and return the local file URI + duration. */
  stopRecording(): Promise<{ uri: string; durationMs: number }>;

  /** Play back a previously-recorded clip by its URI. */
  playRecording(uri: string): Promise<void>;
}
