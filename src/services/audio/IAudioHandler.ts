/**
 * Audio Handler Interface
 * Defines the contract for platform-specific audio implementations
 */

export interface IAudioHandler {
  /**
   * Initialize the audio handler
   */
  initialize(): Promise<void>;

  /**
   * Load audio from the specified source
   */
  loadAudio(source: any): Promise<void>;

  /**
   * Start playing audio
   */
  play(): Promise<void>;

  /**
   * Pause audio playback
   */
  pause(): Promise<void>;

  /**
   * Resume audio playback
   */
  resume(): Promise<void>;

  /**
   * Stop audio playback and reset position
   */
  stop(): Promise<void>;

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): Promise<void>;

  /**
   * Fade out audio over specified duration
   */
  fadeOut(durationSeconds: number): Promise<void>;

  /**
   * Cancel any ongoing fadeout
   */
  cancelFadeout(): void;

  /**
   * Check if audio is currently playing
   */
  isPlaying(): boolean;

  /**
   * Check if audio is available/loaded
   */
  isAvailable(): boolean;

  /**
   * Get current volume
   */
  getVolume(): number;

  /**
   * Clean up resources
   */
  cleanup(): Promise<void>;
}
