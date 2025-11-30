/**
 * Native Text-to-Speech Service
 * Uses expo-speech for iOS and Android platforms
 */

import { Platform } from 'react-native';
import * as Speech from 'expo-speech';
import { storageService } from './StorageService';
import {
  TTSPlaybackConfig,
  TTSPlaybackState,
  TTSPlaybackStatus,
  TTSError,
  TTSErrorType,
} from '../types/TTSConfig';
import { filterVoicesByLanguage } from '../utils/voiceUtils';
import { logger } from '../utils/logger';

export class NativeTTSService {
  private static instance: NativeTTSService;
  private playbackState: TTSPlaybackState;
  private isInitialized = false;
  private currentUtterance: any = null;

  // Event listeners
  private stateChangeListeners: ((state: TTSPlaybackState) => void)[] = [];
  private errorListeners: ((error: TTSError) => void)[] = [];

  private constructor() {
    this.playbackState = this.createInitialState();
  }

  public static getInstance(): NativeTTSService {
    if (!NativeTTSService.instance) {
      NativeTTSService.instance = new NativeTTSService();
    }
    return NativeTTSService.instance;
  }

  /**
   * Initialize the Native TTS service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // expo-speech doesn't require explicit initialization
        this.isInitialized = true;
        this.updateState({ status: TTSPlaybackStatus.IDLE });
      } else {
        throw new Error('Native TTS not available on this platform');
      }
    } catch (error) {
      const ttsError = this.createError(
        TTSErrorType.ENGINE_NOT_AVAILABLE,
        `Native TTS initialization failed: ${error}`
      );
      this.handleError(ttsError);
      throw ttsError;
    }
  }

  /**
   * Check if the service is available
   */
  public isAvailable(): boolean {
    const available = Platform.OS === 'ios' || Platform.OS === 'android';
    logger.debug(
      `NativeTTSService: isAvailable() called - Platform: ${Platform.OS}, Available: ${available}`
    );
    logger.debug(`NativeTTSService: Platform.OS type: ${typeof Platform.OS}`);
    logger.debug(
      `NativeTTSService: Platform.OS === 'android': ${Platform.OS === 'android'}`
    );
    logger.debug(
      `NativeTTSService: Platform.OS === 'ios': ${Platform.OS === 'ios'}`
    );
    return available;
  }

  /**
   * Check if pause/resume functionality is supported
   */
  public isPauseResumeSupported(): boolean {
    // iOS supports pause/resume, Android does not
    return Platform.OS === 'ios';
  }

  /**
   * Speak text with the given configuration
   */
  public async speak(
    text: string,
    config: Partial<TTSPlaybackConfig> = {}
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.isAvailable()) {
      throw new Error('Native TTS not available on this platform');
    }

    // Return a Promise that resolves when speech completes
    return new Promise<void>((resolve, reject) => {
      const executeSpeech = async () => {
        try {
          this.updateState({
            status: TTSPlaybackStatus.LOADING,
            currentText: text,
            isLoading: true,
            error: undefined,
          });

        // Load user's app settings
        let appSettings = null;
        try {
          appSettings = await storageService.loadSettings();
        } catch {
          // Use defaults if settings can't be loaded
        }

        // Use the language from config (statement language) or fall back to app settings
        const targetLanguage = config.language || appSettings?.language || 'en';

        // Get voice identifier from config or settings
        const selectedVoice =
          config.voice ||
          appSettings?.tts?.voicesPerLanguage?.[targetLanguage] ||
          'default';

        const fullConfig: TTSPlaybackConfig = {
          voice: selectedVoice,
          rate: appSettings?.tts?.defaultRate || 1.0,
          pitch: appSettings?.tts?.defaultPitch || 1.0,
          volume: appSettings?.tts?.defaultVolume || 0.8,
          language: targetLanguage,
          useSSML: false,
          audioFormat: {
            codec: 'mp3',
            bitrate: 128,
            sampleRate: 22050,
            channels: 1,
          },
          preloadAudio: false,
          maxPreloadDuration: 30,
          ...config,
        };

        // Convert rate to expo-speech format (0.1 to 2.0)
        const expoRate = Math.max(0.1, Math.min(2.0, fullConfig.rate));
        const expoPitch = Math.max(0.0, Math.min(2.0, fullConfig.pitch));
        const expoVolume = Math.max(0.0, Math.min(1.0, fullConfig.volume));

        logger.debug('NativeTTSService: TTS parameters:', {
          rate: expoRate,
          pitch: expoPitch,
          volume: expoVolume,
          language: fullConfig.language,
          platform: Platform.OS,
        });

        // Stop any current speech
        Speech.stop();

        // Set up completion handler
        const onDone = () => {
          this.updateState({
            status: TTSPlaybackStatus.COMPLETED,
            isPlaying: false,
            isPaused: false,
            currentTime: 1,
            totalDuration: 1,
          });
          resolve();
        };

        const onError = (error: any) => {
          const ttsError = this.createError(
            TTSErrorType.AUDIO_PLAYBACK_ERROR,
            `Native TTS error: ${error}`
          );
          this.handleError(ttsError);
          reject(ttsError);
        };

        // Start speech
        this.updateState({
          status: TTSPlaybackStatus.PLAYING,
          isPlaying: true,
          isLoading: false,
          currentText: text,
          currentTime: 0,
          totalDuration: 1,
        });

        const speechOptions = {
          rate: expoRate,
          pitch: expoPitch,
          volume: expoVolume,
          language: fullConfig.language,
          voice: fullConfig.voice !== 'default' ? fullConfig.voice : undefined,
          onDone,
          onError,
        };

        logger.debug(
          'NativeTTSService: Calling Speech.speak with options:',
          speechOptions
        );
        logger.debug('NativeTTSService: Voice being used:', fullConfig.voice);
        logger.debug(
          'NativeTTSService: Is voice different from default?',
          fullConfig.voice !== 'default'
        );

        Speech.speak(text, speechOptions);
        } catch (error) {
          const ttsError = this.createError(
            TTSErrorType.AUDIO_PLAYBACK_ERROR,
            `Native TTS speak error: ${error}`
          );
          this.handleError(ttsError);
          reject(ttsError);
        }
      };
      
      executeSpeech();
    });
  }

  /**
   * Pause current speech
   */
  public async pause(): Promise<void> {
    logger.debug('NativeTTSService: Pause called');
    if (this.isAvailable()) {
      if (Platform.OS === 'android') {
        // Android doesn't support pause - just stop and let AudioPlayer handle it
        logger.debug(
          'NativeTTSService: Android pause - stopping current speech (pause not supported)'
        );
        Speech.stop();
        this.updateState({
          status: TTSPlaybackStatus.STOPPED,
          isPlaying: false,
          isPaused: false,
        });
        logger.debug(
          'NativeTTSService: Android pause - state updated to STOPPED'
        );
      } else {
        // iOS - use native pause
        logger.debug('NativeTTSService: iOS pause - calling Speech.pause()');
        try {
          Speech.pause();
          logger.debug('NativeTTSService: Speech.pause() called successfully');
          this.updateState({
            status: TTSPlaybackStatus.PAUSED,
            isPlaying: false,
            isPaused: true,
          });
          logger.debug('NativeTTSService: State updated to PAUSED');
        } catch (error) {
          logger.error(
            'NativeTTSService: Error calling Speech.pause():',
            error
          );
          throw error;
        }
      }
    } else {
      logger.debug('NativeTTSService: Platform not available for pause');
    }
  }

  /**
   * Resume paused speech
   */
  public async resume(): Promise<void> {
    logger.debug('NativeTTSService: Resume called');
    if (this.isAvailable()) {
      if (Platform.OS === 'android') {
        // Android doesn't support resume - this should not be called
        logger.debug(
          'NativeTTSService: Android resume - not supported, doing nothing'
        );
        // Don't change state - let AudioPlayer handle restarting the statement
      } else {
        // iOS - use native resume
        logger.debug('NativeTTSService: iOS resume - calling Speech.resume()');
        try {
          Speech.resume();
          logger.debug('NativeTTSService: Speech.resume() called successfully');
          this.updateState({
            status: TTSPlaybackStatus.PLAYING,
            isPlaying: true,
            isPaused: false,
          });
          logger.debug('NativeTTSService: State updated to PLAYING');
        } catch (error) {
          logger.error(
            'NativeTTSService: Error calling Speech.resume():',
            error
          );
          throw error;
        }
      }
    } else {
      logger.debug('NativeTTSService: Platform not available for resume');
    }
  }

  /**
   * Stop current speech
   */
  public async stop(): Promise<void> {
    if (this.isAvailable()) {
      Speech.stop();
      this.updateState({
        status: TTSPlaybackStatus.STOPPED,
        isPlaying: false,
        isPaused: false,
        currentText: '',
        currentTime: 0,
      });
    }
  }

  /**
   * Get current playback state
   */
  public getPlaybackState(): TTSPlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Get available voices
   */
  public async getAvailableVoices(language?: string): Promise<any[]> {
    if (!this.isAvailable()) {
      logger.debug('NativeTTSService: Not available on this platform');
      return [];
    }

    try {
      const voices = await Speech.getAvailableVoicesAsync();

      if (voices.length === 0) {
        logger.warn('NativeTTSService: No voices available');
        return [];
      }

      // Transform voices to have friendly names and consistent structure
      const transformedVoices = voices.map(voice => this.transformVoice(voice));

      if (language) {
        return filterVoicesByLanguage(transformedVoices, language);
      }

      return transformedVoices;
    } catch (error) {
      logger.error('NativeTTSService: Error getting voices:', error);
      return [];
    }
  }

  /**
   * Transform a voice object to have friendly names and consistent structure
   */
  private transformVoice(voice: any): any {
    const friendlyName = this.getFriendlyVoiceName(voice);

    return {
      identifier: voice.identifier, // Expo-speech identifier for TTS calls
      name: friendlyName, // Friendly display name for UI
      lang: voice.language,
    };
  }

  /**
   * Convert cryptic voice names to friendly human-readable names
   */
  private getFriendlyVoiceName(voice: any): string {
    const originalName = voice.name || '';
    const language = voice.language || '';
    const quality = voice.quality || '';

    // Use the language code to create a friendly name
    if (language) {
      const languageName = this.getLanguageName(language);
      const countryCode = this.getCountryCode(language);

      // Try to extract more specific information from the original name
      let voiceVariant = '';
      let voiceNumber = '';

      // Check for gender indicators
      if (originalName.includes('male')) {
        voiceVariant = ' (Male)';
      } else if (originalName.includes('female')) {
        voiceVariant = ' (Female)';
      }

      // Check for quality/type indicators
      if (originalName.includes('neural')) {
        voiceVariant += ' (Neural)';
      } else if (originalName.includes('enhanced')) {
        voiceVariant += ' (Enhanced)';
      } else if (originalName.includes('standard')) {
        voiceVariant += ' (Standard)';
      }

      // Try to extract voice number or variant from the name
      const numberMatch = originalName.match(/(\d+)/);
      if (numberMatch) {
        voiceNumber = ` #${numberMatch[1]}`;
      }

      // If we still don't have enough differentiation, use part of the original name
      if (!voiceVariant && !voiceNumber) {
        // Extract the unique part after the language code
        const uniquePart = originalName
          .replace(language.toLowerCase(), '')
          .replace('-language', '');
        if (uniquePart && uniquePart !== '-') {
          voiceVariant = ` (${uniquePart.replace(/^-+/, '')})`;
        }
      }

      // Add quality information if available and not already included
      const qualityText =
        quality && quality !== 'Default' && !voiceVariant.includes(quality)
          ? ` (${quality})`
          : '';

      return `${languageName}${countryCode}${voiceVariant}${voiceNumber}${qualityText}`;
    }

    // Fallback: try to extract from the name
    if (originalName.includes('-language')) {
      const langCode = originalName.replace('-language', '');
      const languageName = this.getLanguageName(langCode);
      const countryCode = this.getCountryCode(langCode);
      return `${languageName}${countryCode}`;
    }

    // Last resort: return original name
    return originalName;
  }

  /**
   * Get human-readable language name from language code
   */
  private getLanguageName(code: string): string {
    // Handle language codes with country codes (e.g., "en-US" -> "en")
    const languageCode = code.split('-')[0];

    const languageNames: { [key: string]: string } = {
      en: 'English',
      de: 'German',
      zh: 'Chinese',
      fr: 'French',
      es: 'Spanish',
      it: 'Italian',
      ja: 'Japanese',
      ko: 'Korean',
      pt: 'Portuguese',
      ru: 'Russian',
      ar: 'Arabic',
      hi: 'Hindi',
      th: 'Thai',
      vi: 'Vietnamese',
      nl: 'Dutch',
      sv: 'Swedish',
      da: 'Danish',
      no: 'Norwegian',
      fi: 'Finnish',
      pl: 'Polish',
      tr: 'Turkish',
      he: 'Hebrew',
      id: 'Indonesian',
      ms: 'Malay',
      tl: 'Filipino',
      ur: 'Urdu',
    };

    return (
      languageNames[languageCode.toLowerCase()] || languageCode.toUpperCase()
    );
  }

  /**
   * Get country code from language code
   */
  private getCountryCode(code: string): string {
    const parts = code.split('-');
    if (parts.length >= 2) {
      const countryCode = parts[1];
      return ` (${countryCode.toUpperCase()})`;
    }
    return '';
  }

  /**
   * Refresh voices (no-op for native)
   */
  public async refreshVoices(): Promise<void> {
    // Native voices don't need refreshing
  }

  /**
   * Add state change listener
   */
  public addStateChangeListener(
    listener: (state: TTSPlaybackState) => void
  ): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Remove state change listener
   */
  public removeStateChangeListener(
    listener: (state: TTSPlaybackState) => void
  ): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  /**
   * Add error listener
   */
  public addErrorListener(listener: (error: TTSError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  public removeErrorListener(listener: (error: TTSError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    if (this.isAvailable()) {
      Speech.stop();
    }
    this.stateChangeListeners = [];
    this.errorListeners = [];
  }

  // Queue methods (not implemented for native)
  public addToQueue(_item: any): void {
    // Not implemented for native
  }

  public clearQueue(): void {
    // Not implemented for native
  }

  public getQueue(): any[] {
    return [];
  }

  public setQueueConfig(_config: any): void {
    // Not implemented for native
  }

  public getPerformanceMetrics(): any {
    return {
      totalSpeeches: 0,
      averageLatency: 0,
      errorRate: 0,
    };
  }

  public resetPerformanceMetrics(): void {
    // Not implemented for native
  }

  /**
   * Create initial state
   */
  private createInitialState(): TTSPlaybackState {
    return {
      status: TTSPlaybackStatus.IDLE,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
      currentText: '',
      currentTime: 0,
      totalDuration: 0,
      currentPosition: 0,
      totalLength: 0,
      error: undefined,
    };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<TTSPlaybackState>): void {
    this.playbackState = { ...this.playbackState, ...updates };
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.playbackState);
      } catch (error) {
        logger.error('Error in state change listener:', error);
      }
    });
  }

  /**
   * Handle error
   */
  private handleError(error: TTSError): void {
    this.updateState({
      status: TTSPlaybackStatus.ERROR,
      error,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
    });

    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        logger.error('Error in error listener:', listenerError);
      }
    });
  }

  /**
   * Create error object
   */
  private createError(type: TTSErrorType, message: string): TTSError {
    return {
      type,
      message,
      timestamp: new Date(),
      isRecoverable: type !== TTSErrorType.ENGINE_NOT_AVAILABLE,
    };
  }
}

// Export singleton instance
export const nativeTtsService = NativeTTSService.getInstance();
