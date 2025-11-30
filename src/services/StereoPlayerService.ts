/**
 * Stereo Player Service
 *
 * Handles asynchronous stereo meditation playback with independent channels,
 * random timing, and cloud TTS integration
 *
 * Follows the established service patterns in the codebase
 */

import { Platform } from 'react-native';
import { Audio } from 'expo-av';
import {
  StereoSession,
  StereoSessionPlaybackState,
  StereoPlaybackStatus,
  StereoTTSSettings,
} from '../types/StereoSession';
import { MeditationStatement } from '../types/MeditationStatement';
import { cloudTTSService, CloudTTSOptions } from './CloudTTSService';
import { stereoSessionService } from './StereoSessionService';
import { logger } from '../utils/logger';
// Define ApiError locally
interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface StereoPlayerConfig {
  /** Whether to use cloud TTS for audio generation */
  useCloudTTS: boolean;

  /** Whether to cache generated audio */
  useAudioCache: boolean;

  /** Default TTS settings */
  defaultTTSSettings: StereoTTSSettings;

  /** Random delay range for channel start (in milliseconds) */
  randomDelayRange: {
    min: number;
    max: number;
  };

  /** Maximum concurrent audio streams */
  maxConcurrentStreams: number;
}

export interface StereoPlayerState {
  /** Whether the service is initialized */
  isInitialized: boolean;

  /** Whether playback is in progress */
  isPlaying: boolean;

  /** Whether playback is paused */
  isPaused: boolean;

  /** Whether audio is being generated */
  isGenerating: boolean;

  /** Current playback state */
  playbackState: StereoSessionPlaybackState | null;

  /** Last error */
  error?: string;

  /** Performance metrics */
  performance: {
    totalPlaybacks: number;
    successfulPlaybacks: number;
    failedPlaybacks: number;
    averageGenerationTime: number;
    averagePlaybackTime: number;
  };
}

export class StereoPlayerService {
  private static instance: StereoPlayerService;
  private config: StereoPlayerConfig;
  private state: StereoPlayerState;
  private isInitialized = false;

  // Audio management
  private leftChannelSounds: Map<string, Audio.Sound> = new Map();
  private rightChannelSounds: Map<string, Audio.Sound> = new Map();
  private currentSession: StereoSession | null = null;
  private currentLanguage: string | null = null;
  private playbackStartTime: number = 0;
  private generationStartTime: number = 0;

  // Playback control
  private leftChannelIndex: number = 0;
  private rightChannelIndex: number = 0;
  private isStopping: boolean = false;
  private activeTimeouts: Set<NodeJS.Timeout> = new Set();

  // Event listeners
  private stateChangeListeners: ((state: StereoPlayerState) => void)[] = [];
  private errorListeners: ((error: ApiError) => void)[] = [];

  private constructor() {
    this.config = this.createDefaultConfig();
    this.state = this.createInitialState();
  }

  public static getInstance(): StereoPlayerService {
    if (!StereoPlayerService.instance) {
      StereoPlayerService.instance = new StereoPlayerService();
    }
    return StereoPlayerService.instance;
  }

  /**
   * Initialize the Stereo Player service
   */
  public async initialize(config?: Partial<StereoPlayerConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.debug('StereoPlayerService: Initializing...');

      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Initialize audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      this.updateState({ isInitialized: true });

      logger.debug('StereoPlayerService: Initialized successfully');
    } catch (error) {
      const apiError = this.createApiError(
        'INITIALIZATION_FAILED',
        `Failed to initialize Stereo Player service: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Play a stereo session
   */
  public async playSession(
    session: StereoSession,
    currentLanguage?: string
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.state.isPlaying) {
      try {
        await this.stopPlayback();
      } catch (error) {
        // Ignore errors when stopping previous playback - we'll start fresh anyway
        logger.debug(
          'StereoPlayerService: Error stopping previous playback, continuing:',
          error
        );
      }
    }

    this.generationStartTime = Date.now();
    this.updateState({
      isGenerating: true,
      error: undefined,
      playbackState: {
        sessionId: session.id,
        leftChannelIndex: 0,
        rightChannelIndex: 0,
        status: StereoPlaybackStatus.LOADING,
        currentPosition: 0,
        totalDuration: 0,
        leftChannelPlaying: false,
        rightChannelPlaying: false,
        startTime: new Date(),
      },
    });

    try {
      logger.debug(
        'StereoPlayerService: Starting session playback:',
        session.name
      );

      this.currentSession = session;
      this.currentLanguage = currentLanguage || null;
      this.leftChannelIndex = 0;
      this.rightChannelIndex = 0;
      this.isStopping = false;
      this.playbackStartTime = Date.now();

      // Start both channels with platform-specific timing to prevent audio glitches
      await this.startChannel('rational', currentLanguage);

      // Add platform-specific delay to prevent audio glitches
      const timing = this.getPlatformTiming();
      const timeoutId = setTimeout(async () => {
        this.activeTimeouts.delete(timeoutId);
        if (!this.isStopping) {
          await this.startChannel('emotional', currentLanguage);
        }
      }, timing.channelStartDelay);
      this.activeTimeouts.add(timeoutId);

      this.updateState({
        isGenerating: false,
        isPlaying: true,
        playbackState: {
          ...this.state.playbackState!,
          status: StereoPlaybackStatus.PLAYING,
          leftChannelPlaying: true,
        },
      });

      logger.debug(
        'StereoPlayerService: Session playback started successfully'
      );
    } catch (error) {
      this.updateState({
        isGenerating: false,
        playbackState: {
          ...this.state.playbackState!,
          status: StereoPlaybackStatus.ERROR,
        },
      });

      const apiError = this.createApiError(
        'PLAYBACK_FAILED',
        `Failed to start session playback: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Update the current language during playback
   */
  public updateLanguage(currentLanguage: string): void {
    this.currentLanguage = currentLanguage;
    logger.debug('StereoPlayerService: Language updated to:', currentLanguage);
  }

  /**
   * Pause current playback
   */
  public async pausePlayback(): Promise<void> {
    if (!this.state.isPlaying) {
      return;
    }

    try {
      logger.debug('StereoPlayerService: Pausing playback');

      // Clear all active timeouts to prevent new statements from starting
      this.activeTimeouts.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      this.activeTimeouts.clear();

      // Pause all active sounds
      await this.pauseAllSounds();

      this.updateState({
        isPaused: true,
        playbackState: {
          ...this.state.playbackState!,
          status: StereoPlaybackStatus.PAUSED,
          pauseTime: new Date(),
        },
      });

      logger.debug('StereoPlayerService: Playback paused');
    } catch (error) {
      const apiError = this.createApiError(
        'PAUSE_FAILED',
        `Failed to pause playback: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Resume paused playback
   */
  public async resumePlayback(): Promise<void> {
    if (!this.state.isPaused) {
      return;
    }

    try {
      logger.debug('StereoPlayerService: Resuming playback');

      // Resume all paused sounds
      await this.resumeAllSounds();

      this.updateState({
        isPaused: false,
        playbackState: {
          ...this.state.playbackState!,
          status: StereoPlaybackStatus.PLAYING,
          pauseTime: undefined,
        },
      });

      // Restart statement scheduling for both channels
      await this.restartStatementScheduling();

      logger.debug('StereoPlayerService: Playback resumed');
    } catch (error) {
      const apiError = this.createApiError(
        'RESUME_FAILED',
        `Failed to resume playback: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Stop current playback
   */
  public async stopPlayback(): Promise<void> {
    if (!this.state.isPlaying && !this.state.isPaused) {
      return;
    }

    try {
      logger.debug('StereoPlayerService: Stopping playback');

      this.isStopping = true;

      // Clear all active timeouts to prevent old statements from playing
      this.activeTimeouts.forEach(timeoutId => {
        clearTimeout(timeoutId);
      });
      this.activeTimeouts.clear();

      // Stop all sounds
      await this.stopAllSounds();

      // Update session statistics
      if (this.currentSession) {
        const playbackTime = Date.now() - this.playbackStartTime;
        await stereoSessionService.updateSessionStatistics(
          this.currentSession.id,
          undefined,
          playbackTime / 1000,
          undefined
        );
      }

      this.updateState({
        isPlaying: false,
        isPaused: false,
        playbackState: {
          ...this.state.playbackState!,
          status: StereoPlaybackStatus.STOPPED,
        },
      });

      // Reset all state first
      this.currentSession = null;
      this.currentLanguage = null;
      this.leftChannelIndex = 0;
      this.rightChannelIndex = 0;
      this.isStopping = false;

      logger.debug('StereoPlayerService: Playback stopped');

      // Unload all sounds after resetting state (non-blocking)
      // Don't throw errors here - we've already stopped playback
      try {
        await this.unloadAllSounds();
      } catch (error) {
        logger.debug(
          'StereoPlayerService: Error unloading sounds after stop (non-critical):',
          error
        );
      }
    } catch (error) {
      // Reset state even if stopping failed
      this.currentSession = null;
      this.currentLanguage = null;
      this.leftChannelIndex = 0;
      this.rightChannelIndex = 0;
      this.isStopping = false;

      const apiError = this.createApiError(
        'STOP_FAILED',
        `Failed to stop playback: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Get current service state
   */
  public getState(): StereoPlayerState {
    return { ...this.state };
  }

  /**
   * Get current playback state
   */
  public getPlaybackState(): StereoSessionPlaybackState | null {
    return this.state.playbackState ? { ...this.state.playbackState } : null;
  }

  /**
   * Add state change listener
   */
  public addStateChangeListener(
    listener: (state: StereoPlayerState) => void
  ): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Remove state change listener
   */
  public removeStateChangeListener(
    listener: (state: StereoPlayerState) => void
  ): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  /**
   * Add error listener
   */
  public addErrorListener(listener: (error: ApiError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  public removeErrorListener(listener: (error: ApiError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    await this.stopPlayback();
    await this.unloadAllSounds();
    this.stateChangeListeners = [];
    this.errorListeners = [];
    this.isInitialized = false;
    logger.debug('StereoPlayerService: Cleaned up');
  }

  // Private methods

  private createDefaultConfig(): StereoPlayerConfig {
    return {
      useCloudTTS: true, // Enable cloud TTS for dynamic generation
      useAudioCache: true,
      defaultTTSSettings: {
        leftChannelVoice: 'en-US-Wavenet-D',
        rightChannelVoice: 'en-US-Wavenet-F',
        rate: 1.0,
        pitch: 0.0,
        volume: 0.8,
        leftChannelVolume: 0.8,
        rightChannelVolume: 0.8,
        randomDelayRange: { min: 500, max: 2000 },
        useStatementSettings: false,
      },
      randomDelayRange: { min: 500, max: 2000 },
      maxConcurrentStreams: 4,
    };
  }

  /**
   * Get platform-specific timing values
   */
  private getPlatformTiming() {
    return {
      channelStartDelay: Platform.OS === 'ios' ? 200 : 50,
      statementCompletionDelay: Platform.OS === 'ios' ? 100 : 25,
    };
  }

  private createInitialState(): StereoPlayerState {
    return {
      isInitialized: false,
      isPlaying: false,
      isPaused: false,
      isGenerating: false,
      playbackState: null,
      performance: {
        totalPlaybacks: 0,
        successfulPlaybacks: 0,
        failedPlaybacks: 0,
        averageGenerationTime: 0,
        averagePlaybackTime: 0,
      },
    };
  }

  private async startChannel(
    type: 'rational' | 'emotional',
    currentLanguage?: string
  ): Promise<void> {
    if (!this.currentSession || this.isStopping) {
      return;
    }

    // Map type to channel for statement retrieval
    const channel = type === 'rational' ? 'left' : 'right';

    // Load the actual statement objects
    const statements = await stereoSessionService.getChannelStatements(
      this.currentSession,
      channel
    );

    const currentIndex =
      channel === 'left' ? this.leftChannelIndex : this.rightChannelIndex;

    if (currentIndex >= statements.length) {
      logger.debug(`StereoPlayerService: ${type} channel completed`);
      return;
    }

    const statement = statements[currentIndex];
    logger.debug(
      `StereoPlayerService: Playing ${type} channel statement ${currentIndex + 1}/${statements.length}:`,
      statement.text.substring(0, 50) + '...'
    );

    try {
      // Generate or get audio for the statement
      const audioUri = await this.generateAudioForStatement(
        statement,
        type,
        currentLanguage
      );

      // Create and play sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        {
          shouldPlay: true,
          volume: this.getChannelVolume(channel),
        }
      );

      // Store sound reference
      const soundMap =
        channel === 'left' ? this.leftChannelSounds : this.rightChannelSounds;
      soundMap.set(statement.id, sound);

      // Set up completion handler
      sound.setOnPlaybackStatusUpdate(status => {
        if (status.isLoaded && status.didJustFinish) {
          this.onStatementCompleted(channel, statement);
        }
      });

      // Update playback state
      this.updatePlaybackState(channel, true, statement);
    } catch (error) {
      logger.error(
        `StereoPlayerService: Failed to play ${channel} channel statement:`,
        error
      );
      // Continue with next statement even if one fails
      this.onStatementCompleted(channel, statement);
    }
  }

  private async generateAudioForStatement(
    statement: MeditationStatement,
    type: 'rational' | 'emotional',
    currentLanguage?: string
  ): Promise<string> {
    try {
      // Get text in current language
      const { getStatementText } = await import('../types/MeditationStatement');
      const textInCurrentLanguage = getStatementText(
        statement,
        currentLanguage || 'en'
      );

      const ttsOptions: CloudTTSOptions = {
        text: textInCurrentLanguage,
        type: type,
        language: currentLanguage || 'en',
        rate:
          statement.ttsSettings?.rate || this.config.defaultTTSSettings.rate,
        pitch:
          statement.ttsSettings?.pitch || this.config.defaultTTSSettings.pitch,
        volume:
          statement.ttsSettings?.volume ||
          this.config.defaultTTSSettings.volume,
        useCache: this.config.useAudioCache,
      };

      logger.debug('StereoPlayerService: Attempting cloud TTS generation');
      logger.debug('StereoPlayerService: Current language:', currentLanguage);
      logger.debug(
        'StereoPlayerService: TTS options language:',
        ttsOptions.language
      );
      logger.debug(
        'StereoPlayerService: Text to synthesize:',
        textInCurrentLanguage.substring(0, 50) + '...'
      );
      const result = await cloudTTSService.synthesize(ttsOptions);

      // Convert base64 to blob URL for web or return data URI
      if (Platform.OS === 'web') {
        return this.createBlobUrl(result.audioContent, 'audio/mpeg');
      } else {
        return `data:audio/mpeg;base64,${result.audioContent}`;
      }
    } catch (error) {
      logger.error('StereoPlayerService: Cloud TTS failed:', error);
      throw error; // Don't fallback, let the error propagate
    }
  }

  private getChannelVoice(channel: 'left' | 'right'): string {
    const settings =
      this.currentSession?.ttsSettings || this.config.defaultTTSSettings;
    return channel === 'left'
      ? settings.leftChannelVoice ||
          this.config.defaultTTSSettings.leftChannelVoice!
      : settings.rightChannelVoice ||
          this.config.defaultTTSSettings.rightChannelVoice!;
  }

  private getChannelVolume(channel: 'left' | 'right'): number {
    const settings =
      this.currentSession?.ttsSettings || this.config.defaultTTSSettings;
    return channel === 'left'
      ? settings.leftChannelVolume ||
          this.config.defaultTTSSettings.leftChannelVolume!
      : settings.rightChannelVolume ||
          this.config.defaultTTSSettings.rightChannelVolume!;
  }

  private async onStatementCompleted(
    channel: 'left' | 'right',
    _statement: MeditationStatement
  ): Promise<void> {
    if (this.isStopping) {
      return;
    }

    // Update channel index
    if (channel === 'left') {
      this.leftChannelIndex++;
    } else {
      this.rightChannelIndex++;
    }

    // Update playback state
    this.updatePlaybackState(channel, false);

    // Check if channel is complete
    const statements = await stereoSessionService.getChannelStatements(
      this.currentSession!,
      channel
    );

    const currentIndex =
      channel === 'left' ? this.leftChannelIndex : this.rightChannelIndex;

    if (currentIndex >= statements.length) {
      logger.debug(`StereoPlayerService: ${channel} channel completed`);

      // Check if both channels are complete
      const [leftStatements, rightStatements] = await Promise.all([
        stereoSessionService.getChannelStatements(this.currentSession!, 'left'),
        stereoSessionService.getChannelStatements(
          this.currentSession!,
          'right'
        ),
      ]);

      if (
        this.leftChannelIndex >= leftStatements.length &&
        this.rightChannelIndex >= rightStatements.length
      ) {
        await this.onSessionCompleted();
      }
    } else {
      // Add platform-specific delay to prevent audio glitches
      const timing = this.getPlatformTiming();
      const timeoutId = setTimeout(async () => {
        this.activeTimeouts.delete(timeoutId);
        if (!this.isStopping) {
          const type = channel === 'left' ? 'rational' : 'emotional';
          await this.startChannel(type, this.currentLanguage || undefined);
        }
      }, timing.statementCompletionDelay);
      this.activeTimeouts.add(timeoutId);
    }
  }

  private async onSessionCompleted(): Promise<void> {
    logger.debug('StereoPlayerService: Session completed');

    try {
      // Stop all sounds first
      await this.stopAllSounds();

      // Update state
      this.updateState({
        isPlaying: false,
        playbackState: {
          ...this.state.playbackState!,
          status: StereoPlaybackStatus.COMPLETED,
        },
      });

      // Update session statistics
      if (this.currentSession) {
        const playbackTime = Date.now() - this.playbackStartTime;
        await stereoSessionService.updateSessionStatistics(
          this.currentSession.id,
          undefined,
          playbackTime / 1000,
          1.0 // 100% completion
        );
      }

      this.updatePerformanceMetrics(true);

      // Clean up sounds after a short delay to allow final audio to finish
      setTimeout(async () => {
        await this.unloadAllSounds();
      }, 500);
    } catch (error) {
      logger.error('StereoPlayerService: Error completing session:', error);
      // Still update state even if cleanup fails
      this.updateState({
        isPlaying: false,
        playbackState: {
          ...this.state.playbackState!,
          status: StereoPlaybackStatus.COMPLETED,
        },
      });
    }
  }

  private updatePlaybackState(
    channel: 'left' | 'right',
    isPlaying: boolean,
    statement?: MeditationStatement
  ): void {
    if (!this.state.playbackState) return;

    const playbackState = { ...this.state.playbackState };

    if (channel === 'left') {
      playbackState.leftChannelPlaying = isPlaying;
      playbackState.leftChannelIndex = this.leftChannelIndex;
      if (statement) {
        playbackState.currentLeftStatement = statement;
      }
    } else {
      playbackState.rightChannelPlaying = isPlaying;
      playbackState.rightChannelIndex = this.rightChannelIndex;
      if (statement) {
        playbackState.currentRightStatement = statement;
      }
    }

    this.updateState({ playbackState });
  }

  private async pauseAllSounds(): Promise<void> {
    const allSounds = [
      ...this.leftChannelSounds.values(),
      ...this.rightChannelSounds.values(),
    ];
    await Promise.all(allSounds.map(sound => sound.pauseAsync()));
  }

  private async resumeAllSounds(): Promise<void> {
    const allSounds = [
      ...this.leftChannelSounds.values(),
      ...this.rightChannelSounds.values(),
    ];
    await Promise.all(allSounds.map(sound => sound.playAsync()));
  }

  private async restartStatementScheduling(): Promise<void> {
    if (!this.currentSession || this.isStopping) {
      return;
    }

    try {
      // Check which channels are currently playing and need next statements scheduled
      const [leftStatements, rightStatements] = await Promise.all([
        stereoSessionService.getChannelStatements(this.currentSession, 'left'),
        stereoSessionService.getChannelStatements(this.currentSession, 'right'),
      ]);

      // Schedule next statement for left channel if it's not complete
      if (this.leftChannelIndex < leftStatements.length) {
        const timing = this.getPlatformTiming();
        const timeoutId = setTimeout(async () => {
          this.activeTimeouts.delete(timeoutId);
          if (!this.isStopping && !this.state.isPaused) {
            await this.startChannel(
              'rational',
              this.currentLanguage || undefined
            );
          }
        }, timing.channelStartDelay);
        this.activeTimeouts.add(timeoutId);
      }

      // Schedule next statement for right channel if it's not complete
      if (this.rightChannelIndex < rightStatements.length) {
        const timing = this.getPlatformTiming();
        const timeoutId = setTimeout(async () => {
          this.activeTimeouts.delete(timeoutId);
          if (!this.isStopping && !this.state.isPaused) {
            await this.startChannel(
              'emotional',
              this.currentLanguage || undefined
            );
          }
        }, timing.channelStartDelay);
        this.activeTimeouts.add(timeoutId);
      }
    } catch (error) {
      logger.error(
        'StereoPlayerService: Failed to restart statement scheduling:',
        error
      );
    }
  }

  private async stopAllSounds(): Promise<void> {
    const allSounds = [
      ...this.leftChannelSounds.values(),
      ...this.rightChannelSounds.values(),
    ];

    // Stop all sounds safely, ignoring errors for non-existent players
    await Promise.all(
      allSounds.map(async sound => {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.stopAsync();
          }
        } catch {
          // Ignore errors for non-existent or already unloaded players
          logger.debug(
            'StereoPlayerService: Sound already stopped or unloaded'
          );
        }
      })
    );
  }

  private async unloadAllSounds(): Promise<void> {
    const allSounds = [
      ...this.leftChannelSounds.values(),
      ...this.rightChannelSounds.values(),
    ];

    // Unload all sounds safely, ignoring errors for non-existent or already unloaded players
    await Promise.all(
      allSounds.map(async sound => {
        try {
          const status = await sound.getStatusAsync();
          if (status.isLoaded) {
            await sound.unloadAsync();
          }
        } catch {
          // Ignore errors for non-existent or already unloaded players
          logger.debug(
            'StereoPlayerService: Sound already unloaded or does not exist'
          );
        }
      })
    );

    this.leftChannelSounds.clear();
    this.rightChannelSounds.clear();
  }

  private createBlobUrl(base64Data: string, mimeType: string): string {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  private updatePerformanceMetrics(success: boolean): void {
    const now = Date.now();
    const generationTime = now - this.generationStartTime;
    const playbackTime = now - this.playbackStartTime;

    this.state.performance.totalPlaybacks++;

    if (success) {
      this.state.performance.successfulPlaybacks++;
      this.state.performance.averageGenerationTime =
        (this.state.performance.averageGenerationTime *
          (this.state.performance.successfulPlaybacks - 1) +
          generationTime) /
        this.state.performance.successfulPlaybacks;
      this.state.performance.averagePlaybackTime =
        (this.state.performance.averagePlaybackTime *
          (this.state.performance.successfulPlaybacks - 1) +
          playbackTime) /
        this.state.performance.successfulPlaybacks;
    } else {
      this.state.performance.failedPlaybacks++;
    }
  }

  private updateState(updates: Partial<StereoPlayerState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyStateChangeListeners();
  }

  private notifyStateChangeListeners(): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        logger.error(
          'Error in StereoPlayerService state change listener:',
          error
        );
      }
    });
  }

  private handleError(error: ApiError): void {
    this.updateState({ error: error.message });
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        logger.error(
          'Error in StereoPlayerService error listener:',
          listenerError
        );
      }
    });
  }

  private createApiError(
    code: string,
    message: string,
    statusCode: number
  ): ApiError {
    return {
      message,
      code,
      statusCode,
    };
  }
}

// Export singleton instance
export const stereoPlayerService = StereoPlayerService.getInstance();
