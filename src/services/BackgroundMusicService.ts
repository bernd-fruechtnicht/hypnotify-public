/**
 * Background Music Service
 * Handles background music playback during meditation sessions
 * Uses strategy pattern for platform-specific audio handling
 */

import { storageService } from './StorageService';
import { IAudioHandler } from './audio/IAudioHandler';
import { AudioHandlerFactory } from './audio/AudioHandlerFactory';

export class BackgroundMusicService {
  private static instance: BackgroundMusicService;
  private audioHandler: IAudioHandler;
  private isInitialized = false;
  private volume = 0.3; // Default volume (30%)
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    // Create the appropriate audio handler for the current platform
    this.audioHandler = AudioHandlerFactory.createHandler();
    // Start background initialization immediately
    this.initializeInBackground();
  }

  /**
   * Initialize in background without blocking
   */
  private async initializeInBackground(): Promise<void> {
    try {
      // Small delay to let app startup complete
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log(
        'BackgroundMusicService: Starting background initialization...'
      );
      await this.initialize();
      console.log(
        'BackgroundMusicService: Background initialization completed'
      );
    } catch (error) {
      console.warn(
        'BackgroundMusicService: Background initialization failed:',
        error
      );
    }
  }

  public static getInstance(): BackgroundMusicService {
    if (!BackgroundMusicService.instance) {
      BackgroundMusicService.instance = new BackgroundMusicService();
    }
    return BackgroundMusicService.instance;
  }

  /**
   * Initialize the background music service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load user settings for background music
      const settings = await storageService.loadSettings();
      this.volume = settings?.audio?.backgroundMusic?.volume || 0.3;

      // Initialize the audio handler
      await this.audioHandler.initialize();

      // Load the background music file
      // Note: The audio file should be placed in assets/audio/background-music/breath-of-life_15-minutes-320860.mp3
      // If the file doesn't exist, this will throw an error which is handled below
      try {
        const audioSource = require('../../assets/audio/background-music/breath-of-life_15-minutes-320860.mp3');
        await this.audioHandler.loadAudio(audioSource);

        // Set initial volume
        await this.audioHandler.setVolume(this.volume);

        this.isInitialized = true;
        console.log('BackgroundMusicService: Initialized successfully');
      } catch (fileError) {
        console.warn(
          'BackgroundMusicService: Audio file not found or invalid:',
          fileError
        );
        console.log(
          'BackgroundMusicService: Please place a valid audio file at assets/audio/background-music/breath-of-life_15-minutes-320860.mp3'
        );
        this.isInitialized = false;
        // Don't throw error - just mark as not available
        return;
      }
    } catch (error) {
      console.error('BackgroundMusicService: Failed to initialize:', error);
      this.isInitialized = false;
      // Don't throw error - just mark as not available
    }
  }

  /**
   * Ensure the service is initialized (lazy initialization with persistence)
   */
  private async ensureInitialized(): Promise<boolean> {
    if (!this.isInitialized) {
      // If initialization is already in progress, wait for it
      if (this.initializationPromise) {
        await this.initializationPromise;
      } else {
        // Start new initialization
        this.initializationPromise = this.initialize();
        await this.initializationPromise;
        this.initializationPromise = null;
      }
    }
    return this.isInitialized;
  }

  /**
   * Start playing background music
   */
  public async play(): Promise<void> {
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      console.warn(
        'BackgroundMusicService: Cannot play - service not initialized'
      );
      return;
    }

    try {
      await this.audioHandler.play();
    } catch (error) {
      console.error(
        'BackgroundMusicService: Failed to play background music:',
        error
      );
    }
  }

  /**
   * Pause background music (without resetting position)
   */
  public async pause(): Promise<void> {
    try {
      await this.audioHandler.pause();
    } catch (error) {
      console.error(
        'BackgroundMusicService: Failed to pause background music:',
        error
      );
    }
  }

  /**
   * Resume background music from current position
   */
  public async resume(): Promise<void> {
    try {
      await this.audioHandler.resume();
    } catch (error) {
      console.error(
        'BackgroundMusicService: Failed to resume background music:',
        error
      );
    }
  }

  /**
   * Stop playing background music (with position reset)
   */
  public async stop(): Promise<void> {
    try {
      await this.audioHandler.stop();
    } catch (error) {
      console.error(
        'BackgroundMusicService: Failed to stop background music:',
        error
      );
    }
  }

  /**
   * Fade out background music over a specified duration
   */
  public async fadeOut(durationSeconds: number = 10): Promise<void> {
    try {
      await this.audioHandler.fadeOut(durationSeconds);
    } catch (error) {
      console.error(
        'BackgroundMusicService: Failed to fade out background music:',
        error
      );
      // Fallback to immediate stop
      await this.stop();
    }
  }

  /**
   * Cancel any ongoing fadeout
   */
  public cancelFadeout(): void {
    this.audioHandler.cancelFadeout();
  }

  /**
   * Set the volume of background music
   */
  public async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1

    try {
      await this.audioHandler.setVolume(this.volume);
    } catch (error) {
      console.error('BackgroundMusicService: Failed to set volume:', error);
    }
  }

  /**
   * Check if background music is currently playing
   */
  public isBackgroundMusicPlaying(): boolean {
    return this.audioHandler.isPlaying();
  }

  /**
   * Check if background music is available (file exists and service is initialized)
   */
  public isBackgroundMusicAvailable(): boolean {
    return this.isInitialized && this.audioHandler.isAvailable();
  }

  /**
   * Check if background music is available (async version with lazy initialization)
   */
  public async isBackgroundMusicAvailableAsync(): Promise<boolean> {
    const initialized = await this.ensureInitialized();

    // If we think we're initialized but audio handler is not available, try to reinitialize
    if (initialized && !this.audioHandler.isAvailable()) {
      console.log(
        'BackgroundMusicService: Audio handler became unavailable, attempting reinitialization...'
      );
      this.isInitialized = false;
      const reinitialized = await this.ensureInitialized();
      return reinitialized && this.audioHandler.isAvailable();
    }

    return initialized && this.audioHandler.isAvailable();
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.audioHandler.getVolume();
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      await this.audioHandler.cleanup();
      this.isInitialized = false;
      console.log('BackgroundMusicService: Cleaned up resources');
    } catch (error) {
      console.error('BackgroundMusicService: Failed to cleanup:', error);
    }
  }
}

// Export singleton instance
export const backgroundMusicService = BackgroundMusicService.getInstance();
