/**
 * Audio Service
 * Handles background music and audio playback using expo-av
 */

import { Audio } from 'expo-av';
import { logger } from '../utils/logger';
import { BackgroundMusicSettings, MediaPlayerState } from '../types';

export class AudioService {
  private static instance: AudioService;
  private backgroundMusic: Audio.Sound | null = null;
  private isInitialized = false;
  private currentMusicSettings: BackgroundMusicSettings | null = null;
  private playerState: MediaPlayerState;

  // Event listeners
  private stateChangeListeners: ((state: MediaPlayerState) => void)[] = [];

  private constructor() {
    this.playerState = this.createInitialState();
  }

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Initialize the audio service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set audio mode for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      this.updateState({ isLoading: false });
    } catch (error) {
      logger.error('Failed to initialize AudioService:', error);
      throw new Error(`Audio service initialization failed: ${error}`);
    }
  }

  /**
   * Load and play background music
   */
  public async playBackgroundMusic(
    settings: BackgroundMusicSettings
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Stop current background music if playing
      await this.stopBackgroundMusic();

      if (!settings.enabled || !settings.musicPath) {
        return;
      }

      // Create new sound object
      // Handle both local assets and remote URLs
      const soundSource =
        typeof settings.musicPath === 'string' &&
        settings.musicPath.startsWith('http')
          ? { uri: settings.musicPath }
          : settings.musicPath;

      logger.debug('AudioService: Loading audio source:', soundSource);

      const { sound } = await Audio.Sound.createAsync(soundSource, {
        shouldPlay: true,
        isLooping: settings.loop,
        volume: settings.volume,
      });

      this.backgroundMusic = sound;
      this.currentMusicSettings = settings;

      // Set up status update listener
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded) {
          this.updateState({
            isPlaying: status.isPlaying,
            isPaused: !status.isPlaying && status.positionMillis > 0,
            currentTime: status.positionMillis / 1000,
            duration: status.durationMillis ? status.durationMillis / 1000 : 0,
            volume: status.volume,
            playbackRate: status.rate,
          });
        }
      });

      // Apply fade in if specified
      if (settings.fadeInDuration && settings.fadeInDuration > 0) {
        await this.fadeIn(settings.fadeInDuration);
      }

      this.updateState({ isPlaying: true });
    } catch (error) {
      logger.error('Failed to play background music:', error);
      throw new Error(`Background music playback failed: ${error}`);
    }
  }

  /**
   * Pause background music
   */
  public async pauseBackgroundMusic(): Promise<void> {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.pauseAsync();
        this.updateState({ isPlaying: false, isPaused: true });
      } catch (error) {
        logger.error('Failed to pause background music:', error);
        throw new Error(`Background music pause failed: ${error}`);
      }
    }
  }

  /**
   * Resume background music
   */
  public async resumeBackgroundMusic(): Promise<void> {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.playAsync();
        this.updateState({ isPlaying: true, isPaused: false });
      } catch (error) {
        logger.error('Failed to resume background music:', error);
        throw new Error(`Background music resume failed: ${error}`);
      }
    }
  }

  /**
   * Stop background music
   */
  public async stopBackgroundMusic(): Promise<void> {
    if (!this.backgroundMusic) {
      logger.debug('AudioService: No background music to stop');
      return;
    }

    try {
      const musicToStop = this.backgroundMusic;

      // Apply fade out if specified
      if (
        this.currentMusicSettings?.fadeOutDuration &&
        this.currentMusicSettings.fadeOutDuration > 0
      ) {
        await this.fadeOut(this.currentMusicSettings.fadeOutDuration);
      }

      // Check if music still exists after fade out
      if (musicToStop) {
        await musicToStop.stopAsync();
        await musicToStop.unloadAsync();
      }

      this.backgroundMusic = null;
      this.currentMusicSettings = null;
      this.updateState(this.createInitialState());

      logger.debug('AudioService: Background music stopped successfully');
    } catch (error) {
      logger.error('AudioService: Failed to stop background music:', error);
      // Clean up state even if stop failed
      this.backgroundMusic = null;
      this.currentMusicSettings = null;
      this.updateState(this.createInitialState());
      throw new Error(`Background music stop failed: ${error}`);
    }
  }

  /**
   * Set background music volume
   */
  public async setBackgroundMusicVolume(volume: number): Promise<void> {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.setVolumeAsync(volume);
        this.updateState({ volume });
      } catch (error) {
        logger.error('Failed to set background music volume:', error);
        throw new Error(`Volume adjustment failed: ${error}`);
      }
    }
  }

  /**
   * Set background music playback rate
   */
  public async setBackgroundMusicPlaybackRate(rate: number): Promise<void> {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.setRateAsync(rate, true);
        this.updateState({ playbackRate: rate });
      } catch (error) {
        logger.error('Failed to set background music playback rate:', error);
        throw new Error(`Playback rate adjustment failed: ${error}`);
      }
    }
  }

  /**
   * Check if background music is playing
   */
  public isBackgroundMusicPlaying(): boolean {
    return this.playerState.isPlaying;
  }

  /**
   * Get current player state
   */
  public getPlayerState(): MediaPlayerState {
    return { ...this.playerState };
  }

  /**
   * Get current background music settings
   */
  public getCurrentMusicSettings(): BackgroundMusicSettings | null {
    return this.currentMusicSettings ? { ...this.currentMusicSettings } : null;
  }

  /**
   * Add state change listener
   */
  public addStateChangeListener(
    listener: (state: MediaPlayerState) => void
  ): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Remove state change listener
   */
  public removeStateChangeListener(
    listener: (state: MediaPlayerState) => void
  ): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    await this.stopBackgroundMusic();
    this.stateChangeListeners = [];
    this.isInitialized = false;
  }

  // Private methods

  private createInitialState(): MediaPlayerState {
    return {
      isPlaying: false,
      isPaused: false,
      isLoading: true,
      currentTime: 0,
      duration: 0,
      volume: 1.0,
      playbackRate: 1.0,
    };
  }

  private updateState(updates: Partial<MediaPlayerState>): void {
    this.playerState = { ...this.playerState, ...updates };
    this.notifyStateChangeListeners();
  }

  private notifyStateChangeListeners(): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.playerState);
      } catch (error) {
        logger.error('Error in audio state change listener:', error);
      }
    });
  }

  /**
   * Fade in the background music
   */
  private async fadeIn(duration: number): Promise<void> {
    if (!this.backgroundMusic) return;

    const steps = 20; // Number of fade steps
    const stepDuration = duration / steps;
    const _volumeStep = this.currentMusicSettings?.volume || 1.0 / steps;

    for (let i = 0; i <= steps; i++) {
      const volume = (i / steps) * (this.currentMusicSettings?.volume || 1.0);
      await this.backgroundMusic.setVolumeAsync(volume);
      await new Promise(resolve => setTimeout(resolve, stepDuration * 1000));
    }
  }

  /**
   * Fade out the background music
   */
  private async fadeOut(duration: number): Promise<void> {
    if (!this.backgroundMusic) {
      logger.debug('AudioService: No background music to fade out');
      return;
    }

    try {
      const steps = 20; // Number of fade steps
      const stepDuration = duration / steps;
      const currentVolume = this.currentMusicSettings?.volume || 1.0;

      for (let i = steps; i >= 0; i--) {
        // Check if music still exists before each step
        if (!this.backgroundMusic) {
          logger.debug(
            'AudioService: Background music became null during fade out'
          );
          break;
        }

        const volume = (i / steps) * currentVolume;
        await this.backgroundMusic.setVolumeAsync(volume);
        await new Promise(resolve => setTimeout(resolve, stepDuration * 1000));
      }

      logger.debug('AudioService: Fade out completed');
    } catch (error) {
      logger.error('AudioService: Error during fade out:', error);
      // Don't throw error, just log it
    }
  }
}

// Export singleton instance
export const audioService = AudioService.getInstance();
