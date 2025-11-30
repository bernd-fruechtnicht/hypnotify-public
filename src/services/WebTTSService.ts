/**
 * Web Text-to-Speech Service
 * Uses Web Speech API for web platform compatibility
 */

import { Platform } from 'react-native';
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

export class WebTTSService {
  private static instance: WebTTSService;
  private playbackState: TTSPlaybackState;
  private isInitialized = false;
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private userInteracted = false;
  private interactionPromise: Promise<void> | null = null;
  private stoppedUtterances = new Set<SpeechSynthesisUtterance>();

  // Event listeners
  private stateChangeListeners: ((state: TTSPlaybackState) => void)[] = [];
  private errorListeners: ((error: TTSError) => void)[] = [];

  private constructor() {
    this.playbackState = this.createInitialState();
  }

  public static getInstance(): WebTTSService {
    if (!WebTTSService.instance) {
      WebTTSService.instance = new WebTTSService();
    }
    return WebTTSService.instance;
  }

  /**
   * Initialize the Web TTS service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.debug('WebTTSService: Initializing...');
      logger.debug('Platform.OS:', Platform.OS);

      if (Platform.OS === 'web') {
        logger.debug('WebTTSService: Web platform detected');
        this.speechSynthesis = window.speechSynthesis;
        logger.debug(
          'WebTTSService: speechSynthesis available:',
          !!this.speechSynthesis
        );

        if (!this.speechSynthesis) {
          throw new Error('Speech synthesis not supported');
        }

        // Set up user interaction listener for autoplay restrictions
        this.setupUserInteractionListener();

        // Check if we need to wait for voices to load
        if (this.speechSynthesis.getVoices().length === 0) {
          logger.debug(
            'WebTTSService: No voices available, waiting for voices to load...'
          );
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Timeout waiting for voices to load'));
            }, 5000);

            this.speechSynthesis?.addEventListener(
              'voiceschanged',
              () => {
                clearTimeout(timeout);
                logger.debug(
                  'WebTTSService: Voices loaded:',
                  this.speechSynthesis?.getVoices().length
                );
                this.isInitialized = true;
                this.updateState({ status: TTSPlaybackStatus.IDLE });
                logger.debug('WebTTSService: Initialization complete');
                resolve();
              },
              { once: true }
            );
          });
        }
      } else {
        logger.debug(
          'WebTTSService: Not web platform, skipping initialization'
        );
        return;
      }

      this.isInitialized = true;
      this.updateState({ status: TTSPlaybackStatus.IDLE });
      logger.debug('WebTTSService: Initialization complete');
    } catch (error) {
      logger.error('WebTTSService: Initialization failed:', error);
      const ttsError = this.createError(
        TTSErrorType.ENGINE_NOT_AVAILABLE,
        `Failed to initialize Web TTS service: ${error}`
      );
      this.handleError(ttsError);
      throw ttsError;
    }
  }

  /**
   * Speak text with the given configuration
   */
  public async speak(
    text: string,
    config: Partial<TTSPlaybackConfig> = {}
  ): Promise<void> {
    // Return a Promise that resolves when speech completes
    return new Promise<void>((resolve, reject) => {
      const executeSpeech = async () => {
        if (!this.isInitialized) {
          await this.initialize();
        }

        if (Platform.OS !== 'web' || !this.speechSynthesis) {
          throw new Error('Web TTS not available on this platform');
        }

        // Load user's app settings
        let appSettings = null;
        try {
          appSettings = await storageService.loadSettings();
        } catch (error) {
          logger.debug('WebTTSService: Failed to load app settings:', error);
          // Use defaults if settings can't be loaded
        }

        // Use the language from config (statement language) or fall back to app settings
        const targetLanguage = config.language || appSettings?.language || 'en';

        // Prioritize voicesPerLanguage over defaultVoice
        let selectedVoice = 'default';
        if (appSettings?.tts?.voicesPerLanguage?.[targetLanguage]) {
          selectedVoice = appSettings.tts.voicesPerLanguage[targetLanguage];
        } else if (appSettings?.tts?.defaultVoice) {
          selectedVoice = appSettings.tts.defaultVoice;
        }

        // Force refresh voices first to ensure we have the latest installed voices
        await this.refreshVoices();

        try {
          const availableVoices = await this.getAvailableVoices();

          // Only override selectedVoice if it's still 'default' (no voice was selected from settings)
          if (selectedVoice === 'default' && availableVoices.length > 0) {
            // Filter voices for the target language
            const targetVoices = availableVoices.filter(
              voice =>
                voice.lang.startsWith(targetLanguage) ||
                voice.lang === targetLanguage
            );

            if (targetVoices.length > 0) {
              selectedVoice = targetVoices[0].name;
              logger.debug(
                'WebTTSService: Auto-selected voice for language:',
                selectedVoice
              );
            } else {
              // If no voices for target language, try to find fallback voices based on language
              let fallbackVoices: SpeechSynthesisVoice[] = [];

              if (targetLanguage.startsWith('en')) {
                fallbackVoices = availableVoices.filter(
                  voice =>
                    voice.lang.startsWith('en') ||
                    voice.lang.includes('en') ||
                    voice.name.toLowerCase().includes('english')
                );
              } else if (targetLanguage.startsWith('zh')) {
                fallbackVoices = availableVoices.filter(
                  voice =>
                    voice.lang.startsWith('zh') ||
                    voice.lang.includes('zh') ||
                    voice.name.toLowerCase().includes('chinese')
                );
              } else if (targetLanguage.startsWith('de')) {
                fallbackVoices = availableVoices.filter(
                  voice =>
                    voice.lang.startsWith('de') ||
                    voice.lang.includes('de') ||
                    voice.name.toLowerCase().includes('german')
                );
              }

              if (fallbackVoices.length > 0) {
                selectedVoice = fallbackVoices[0].name;
                logger.debug(
                  'WebTTSService: Auto-selected fallback voice:',
                  selectedVoice
                );
              } else {
                // No language-specific voices available - use the first available voice
                selectedVoice = availableVoices[0].name;
                logger.debug(
                  'WebTTSService: Auto-selected first available voice:',
                  selectedVoice
                );
              }
            }
          } else {
            logger.debug(
              'WebTTSService: Using voice from settings:',
              selectedVoice
            );
          }
        } catch {
          // Use default voice if voice selection fails
        }

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

        try {
          this.updateState({
            status: TTSPlaybackStatus.LOADING,
            currentText: text,
            isLoading: true,
          });

          // Cancel any current speech
          this.speechSynthesis.cancel();

          // Create fresh utterance with minimal settings - only text
          const utterance = new SpeechSynthesisUtterance(text);

          // Set properties
          try {
            if (fullConfig.voice && fullConfig.voice !== 'default') {
              const voices = this.speechSynthesis.getVoices();
              logger.debug(
                'WebTTSService: Looking for voice:',
                fullConfig.voice
              );
              logger.debug(
                'WebTTSService: Available voices:',
                voices.map(v => v.name)
              );

              // Try exact match first
              let selectedVoice = voices.find(
                voice => voice.name === fullConfig.voice
              );

              // If no exact match, try partial match (voice name contains the selected voice)
              if (!selectedVoice) {
                selectedVoice = voices.find(
                  voice =>
                    voice.name.includes(fullConfig.voice) ||
                    fullConfig.voice.includes(voice.name)
                );
              }

              // If still no match, try matching by removing language codes
              if (!selectedVoice) {
                const cleanSelectedVoice = fullConfig.voice.replace(
                  /\s*\([^)]*\)\s*$/,
                  ''
                );
                selectedVoice = voices.find(voice => {
                  const cleanVoiceName = voice.name.replace(
                    /\s*\([^)]*\)\s*$/,
                    ''
                  );
                  return cleanVoiceName === cleanSelectedVoice;
                });
              }

              if (selectedVoice) {
                logger.debug(
                  'WebTTSService: Found matching voice:',
                  selectedVoice.name
                );
                utterance.voice = selectedVoice;
              } else {
                logger.debug(
                  'WebTTSService: No matching voice found, using fallback'
                );
                // Try to find any voice for the target language as fallback
                const languageVoice = voices.find(
                  voice =>
                    voice.lang.startsWith(targetLanguage) ||
                    voice.lang.includes(targetLanguage)
                );
                if (languageVoice) {
                  logger.debug(
                    'WebTTSService: Using language fallback voice:',
                    languageVoice.name
                  );
                  utterance.voice = languageVoice;
                } else {
                  // Final fallback to any English voice
                  const englishVoice = voices.find(
                    voice =>
                      voice.lang.startsWith('en') ||
                      voice.lang.includes('en') ||
                      voice.name.toLowerCase().includes('english')
                  );
                  if (englishVoice) {
                    logger.debug(
                      'WebTTSService: Using English fallback voice:',
                      englishVoice.name
                    );
                    utterance.voice = englishVoice;
                  }
                }
              }
            }

            utterance.volume = fullConfig.volume;
            utterance.rate = fullConfig.rate;
            utterance.pitch = fullConfig.pitch;

            // ALWAYS set language - this is crucial for proper pronunciation
            utterance.lang = fullConfig.language;
          } catch {
            // Continue without properties if they fail
          }

          // Set up event listeners
          utterance.onstart = () => {
            this.updateState({
              status: TTSPlaybackStatus.PLAYING,
              isPlaying: true,
              isLoading: false,
              currentText: text,
              currentTime: 0,
              totalDuration: 0, // Will be updated by onboundary events
            });
          };

          utterance.onboundary = event => {
            // This event fires when a word or sentence boundary is reached
            if (event.name === 'word' || event.name === 'sentence') {
              // Update progress based on character position
              const progress = event.charIndex / text.length;
              this.updateState({
                currentTime: progress,
                totalDuration: 1, // Normalize to 1 for percentage calculation
              });
            }
          };

          utterance.onend = () => {
            if (this.stoppedUtterances.has(utterance)) {
              return;
            }
            this.updateState({
              status: TTSPlaybackStatus.COMPLETED,
              isPlaying: false,
              isPaused: false,
              currentTime: 1, // 100% complete
              totalDuration: 1,
            });
            resolve(); // Resolve the Promise when speech completes
          };

          utterance.onerror = event => {
            // Check if this utterance was stopped - if so, don't treat as error
            if (this.stoppedUtterances.has(utterance)) {
              return;
            }

            // Only treat as error if it wasn't intentionally stopped
            const ttsError = this.createError(
              TTSErrorType.AUDIO_PLAYBACK_ERROR,
              `Speech synthesis error: ${event.error}`
            );
            this.handleError(ttsError);
            reject(ttsError); // Reject the Promise on error
          };

          utterance.onpause = () => {
            // Speech paused
          };

          utterance.onresume = () => {
            // Speech resumed
          };

          // Store current utterance for state management
          this.currentUtterance = utterance;

          // Clean up old stopped utterances to prevent memory leaks
          this.stoppedUtterances.clear();

          // Start speech using the proven pattern
          logger.debug('WebTTSService: Starting speech synthesis');
          try {
            this.speechSynthesis.speak(utterance);
            logger.debug(
              'WebTTSService: Speech synthesis started successfully'
            );
            // Don't update state here - let onstart event handle it
          } catch (error) {
            logger.error(
              'WebTTSService: Error starting speech synthesis:',
              error
            );
            const ttsError = this.createError(
              TTSErrorType.AUDIO_PLAYBACK_ERROR,
              `Failed to start speech synthesis: ${error}`
            );
            this.handleError(ttsError);
            reject(ttsError);
            return;
          }

          logger.debug('WebTTSService: Speech synthesis started');

          // Check if it's actually speaking after a short delay
          setTimeout(() => {
            logger.debug(
              'WebTTSService: After 100ms - speaking:',
              this.speechSynthesis?.speaking
            );
            logger.debug(
              'WebTTSService: After 100ms - pending:',
              this.speechSynthesis?.pending
            );
          }, 100);
        } catch (error) {
          logger.error('WebTTSService: Speech synthesis failed:', error);
          const ttsError = this.createError(
            TTSErrorType.AUDIO_PLAYBACK_ERROR,
            `Failed to speak text: ${error}`
          );
          this.handleError(ttsError);
          reject(ttsError);
        }
      };

      executeSpeech();
    }); // Close the Promise
  }

  /**
   * Pause current speech
   */
  public async pause(): Promise<void> {
    if (Platform.OS === 'web' && this.speechSynthesis) {
      logger.debug('WebTTSService: Pausing speech synthesis');
      this.speechSynthesis.pause();
      this.updateState({
        status: TTSPlaybackStatus.PAUSED,
        isPlaying: false,
        isPaused: true,
      });
      logger.debug('WebTTSService: Speech synthesis paused');
    }
  }

  /**
   * Resume paused speech
   */
  public async resume(): Promise<void> {
    if (Platform.OS === 'web' && this.speechSynthesis) {
      logger.debug('WebTTSService: Resuming speech synthesis');
      this.speechSynthesis.resume();
      this.updateState({
        status: TTSPlaybackStatus.PLAYING,
        isPlaying: true,
        isPaused: false,
      });
      logger.debug('WebTTSService: Speech synthesis resumed');
    }
  }

  /**
   * Stop current speech
   */
  public async stop(): Promise<void> {
    if (Platform.OS === 'web' && this.speechSynthesis) {
      // Mark current utterance as stopped to prevent its onend event
      if (this.currentUtterance) {
        this.stoppedUtterances.add(this.currentUtterance);
      }

      // Clear the current utterance reference
      this.currentUtterance = null;

      // Multiple cancel attempts to ensure speech stops
      this.speechSynthesis.cancel();
      this.speechSynthesis.cancel();
      this.speechSynthesis.cancel();

      // Force stop by creating and immediately canceling a dummy utterance
      const dummyUtterance = new SpeechSynthesisUtterance('');
      this.speechSynthesis.speak(dummyUtterance);
      this.speechSynthesis.cancel();

      // Update state immediately
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
   * Get available voices for a language
   */
  public async getAvailableVoices(language?: string): Promise<any[]> {
    if (Platform.OS !== 'web' || !this.speechSynthesis) {
      return [];
    }

    try {
      // Force refresh voices by creating a dummy utterance
      // This sometimes helps load newly installed voices
      const dummyUtterance = new SpeechSynthesisUtterance('');
      this.speechSynthesis.speak(dummyUtterance);
      this.speechSynthesis.cancel();

      const voices = this.speechSynthesis.getVoices();

      // Transform voices to have consistent structure with identifier property
      const transformedVoices = voices.map(voice => this.transformVoice(voice));

      if (language) {
        const filteredVoices = filterVoicesByLanguage(
          transformedVoices,
          language
        );
        return filteredVoices;
      }
      return transformedVoices;
    } catch (error) {
      const ttsError = this.createError(
        TTSErrorType.VOICE_NOT_FOUND,
        `Failed to get available voices: ${error}`
      );
      this.handleError(ttsError);
      throw ttsError;
    }
  }

  /**
   * Transform a voice object to have friendly names and consistent structure
   */
  private transformVoice(voice: SpeechSynthesisVoice): any {
    const friendlyName = this.getFriendlyVoiceName(voice);

    return {
      identifier: voice.name, // Use voice.name as identifier for web
      name: friendlyName, // Friendly display name for UI
      lang: voice.lang,
    };
  }

  /**
   * Get a friendly name for a voice
   */
  private getFriendlyVoiceName(voice: SpeechSynthesisVoice): string {
    // For web voices, use the name directly but clean it up
    let name = voice.name;

    // Remove common prefixes/suffixes that make names less user-friendly
    name = name.replace(/^Microsoft /, '');
    name = name.replace(/^Google /, '');
    name = name.replace(/ \(.*\)$/, ''); // Remove language codes in parentheses

    return name || 'Default Voice';
  }

  /**
   * Force refresh voices - useful after installing new language packs
   */
  public async refreshVoices(): Promise<void> {
    if (Platform.OS !== 'web' || !this.speechSynthesis) {
      return;
    }

    logger.debug('WebTTSService: Forcing voice refresh...');

    try {
      // Create multiple dummy utterances to force voice loading
      for (let i = 0; i < 3; i++) {
        const dummyUtterance = new SpeechSynthesisUtterance('');
        this.speechSynthesis.speak(dummyUtterance);
        this.speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Wait for voices to load
      await new Promise(resolve => setTimeout(resolve, 200));

      const voices = this.speechSynthesis.getVoices();
      logger.debug('WebTTSService: Voices after refresh:', voices.length);

      // Log all voices for debugging
      voices.forEach((voice, index) => {
        logger.debug(
          `${index + 1}. ${voice.name} (${voice.lang}) - ${voice.localService ? 'Local' : 'Remote'}`
        );
      });
    } catch (error) {
      logger.error('WebTTSService: Failed to refresh voices:', error);
    }
  }

  /**
   * Check if speech is currently available
   */
  public async isAvailable(): Promise<boolean> {
    if (Platform.OS !== 'web' || !window.speechSynthesis) {
      return false;
    }

    // Test if speech synthesis actually works
    try {
      const testUtterance = new SpeechSynthesisUtterance('test');
      testUtterance.volume = 0; // Silent test
      window.speechSynthesis.speak(testUtterance);
      return true;
    } catch (error) {
      logger.error('WebTTSService: Speech synthesis test failed:', error);
      return false;
    }
  }

  /**
   * Check if pause/resume functionality is supported
   */
  public isPauseResumeSupported(): boolean {
    // Web Speech API supports pause/resume
    return Platform.OS === 'web' && !!window.speechSynthesis;
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
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    await this.stop();
    this.stateChangeListeners = [];
    this.errorListeners = [];
    this.isInitialized = false;
  }

  /**
   * Manually trigger user interaction (for testing)
   */
  public triggerUserInteraction(): void {
    logger.debug('WebTTSService: Manually triggering user interaction');
    this.userInteracted = true;

    // Resolve the interaction promise if it exists
    if (this.interactionPromise) {
      // Create a resolved promise to replace the pending one
      this.interactionPromise = Promise.resolve();
    }
  }

  /**
   * Check if user has interacted with the page
   */
  public hasUserInteracted(): boolean {
    return this.userInteracted;
  }

  /**
   * Wait for user interaction (returns immediately if already interacted)
   */
  public async waitForUserInteraction(): Promise<void> {
    if (this.userInteracted) {
      return Promise.resolve();
    }

    if (this.interactionPromise) {
      return this.interactionPromise;
    }

    // If no interaction promise exists, create one
    this.setupUserInteractionListener();
    return this.interactionPromise || Promise.resolve();
  }

  // Private methods

  private createInitialState(): TTSPlaybackState {
    return {
      status: TTSPlaybackStatus.IDLE,
      currentText: '',
      currentPosition: 0,
      totalLength: 0,
      currentTime: 0,
      totalDuration: 0,
      isPlaying: false,
      isPaused: false,
      isLoading: false,
    };
  }

  private updateState(updates: Partial<TTSPlaybackState>): void {
    this.playbackState = { ...this.playbackState, ...updates };
    this.notifyStateChangeListeners();
  }

  private notifyStateChangeListeners(): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.playbackState);
      } catch (error) {
        logger.error('Error in state change listener:', error);
      }
    });
  }

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

  private createError(type: TTSErrorType, message: string): TTSError {
    return {
      type,
      message,
      timestamp: new Date(),
      isRecoverable: type !== TTSErrorType.ENGINE_NOT_AVAILABLE,
    };
  }

  private setupUserInteractionListener(): void {
    if (Platform.OS !== 'web') return;

    // Create a promise that resolves when user interacts
    this.interactionPromise = new Promise<void>(resolve => {
      const handleUserInteraction = () => {
        logger.debug('WebTTSService: User interaction detected');
        this.userInteracted = true;
        resolve();

        // Remove listeners after first interaction
        document.removeEventListener('click', handleUserInteraction);
        document.removeEventListener('touchstart', handleUserInteraction);
        document.removeEventListener('keydown', handleUserInteraction);
        document.removeEventListener('mousedown', handleUserInteraction);
      };

      // Listen for various user interactions
      document.addEventListener('click', handleUserInteraction, { once: true });
      document.addEventListener('touchstart', handleUserInteraction, {
        once: true,
      });
      document.addEventListener('keydown', handleUserInteraction, {
        once: true,
      });
      document.addEventListener('mousedown', handleUserInteraction, {
        once: true,
      });
    });
  }
}

// Export singleton instance
export const webTtsService = WebTTSService.getInstance();

// Make available globally for testing (web only)
if (typeof window !== 'undefined') {
  (window as any).webTtsService = webTtsService;
}
