import {
  TTSPlaybackConfig,
  TTSPlaybackStatus,
  TTSPlaybackState,
  TTSErrorType,
} from '../types';
import { storageService } from './StorageService';

/**
 * Electron-specific TTS service that uses system TTS via IPC
 */
export class ElectronTTSService {
  private state: TTSPlaybackState = {
    status: TTSPlaybackStatus.IDLE,
    currentText: '',
    currentPosition: 0,
    totalLength: 0,
    currentTime: 0,
    totalDuration: 0,
    isPlaying: false,
    isPaused: false,
    isLoading: false,
    error: undefined,
  };

  private stateListeners: ((state: TTSPlaybackState) => void)[] = [];
  private errorListeners: ((error: any) => void)[] = [];

  constructor() {
    logger.debug('ElectronTTSService: Initialized');
  }

  /**
   * Check if Electron TTS is available
   */
  isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      (window as any).electronAPI &&
      typeof (window as any).electronAPI.ttsSpeak === 'function'
    );
  }

  /**
   * Check if pause/resume functionality is supported
   */
  isPauseResumeSupported(): boolean {
    // Electron uses Web Speech API, so it supports pause/resume
    return this.isAvailable();
  }

  /**
   * Get available voices (not implemented for system TTS)
   */
  async getAvailableVoices(): Promise<any[]> {
    logger.debug(
      'ElectronTTSService: getAvailableVoices not implemented for system TTS'
    );
    return [];
  }

  /**
   * Speak text using system TTS
   */
  async speak(
    text: string,
    config: Partial<TTSPlaybackConfig> = {}
  ): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('Electron TTS API not available');
    }

    logger.debug('ElectronTTSService: Speaking text:', text);
    logger.debug('ElectronTTSService: Config:', config);

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

        // Load user settings from storage
        let appSettings = null;
        try {
          appSettings = await storageService.loadSettings();
          logger.debug('ElectronTTSService: Loaded app settings:', appSettings);
        } catch (error) {
          logger.debug(
            'ElectronTTSService: Failed to load app settings, using defaults:',
            error
          );
        }

        // Use the language from config (statement language) or fall back to app settings
        const targetLanguage = config.language || appSettings?.language || 'en';
        logger.debug(
          'ElectronTTSService: Target language (from statement):',
          targetLanguage
        );

        // Select the best voice for the target language
        // Prioritize voicesPerLanguage over defaultVoice
        let selectedVoice = 'default';
        if (config.voice) {
          selectedVoice = config.voice;
        } else if (appSettings?.tts?.voicesPerLanguage?.[targetLanguage]) {
          selectedVoice = appSettings.tts.voicesPerLanguage[targetLanguage];
        } else if (appSettings?.tts?.defaultVoice) {
          selectedVoice = appSettings.tts.defaultVoice;
        }

        logger.debug('ElectronTTSService: Voice selection debug:', {
          targetLanguage,
          voicesPerLanguage: appSettings?.tts?.voicesPerLanguage,
          selectedVoice,
          defaultVoice: appSettings?.tts?.defaultVoice,
        });

        // For English, try to select a specific English voice
        if (targetLanguage.startsWith('en') && selectedVoice === 'default') {
          // Common English voice names in Windows (exact names as they appear in the system)
          const englishVoices = [
            'Microsoft David Desktop',
            'Microsoft Zira Desktop',
            'Microsoft Mark Desktop',
            'Microsoft David',
            'Microsoft Zira',
            'Microsoft Mark',
            'Microsoft Hazel Desktop',
            'Microsoft Susan Desktop',
          ];

          // Use the first English voice as default
          selectedVoice = englishVoices[0];
          logger.debug(
            'ElectronTTSService: Selected English voice:',
            selectedVoice
          );
        } else if (
          targetLanguage.startsWith('zh') &&
          selectedVoice === 'default'
        ) {
          // Common Chinese voice names in Windows (exact names as they appear in the system)
          const chineseVoices = [
            'Microsoft Huihui Desktop',
            'Microsoft Yaoyao Desktop',
            'Microsoft Kangkang Desktop',
            'Microsoft Huihui',
            'Microsoft Yaoyao',
            'Microsoft Kangkang',
          ];

          // Use the first Chinese voice as default
          selectedVoice = chineseVoices[0];
          logger.debug(
            'ElectronTTSService: Selected Chinese voice:',
            selectedVoice
          );
        } else if (
          targetLanguage.startsWith('de') &&
          selectedVoice === 'default'
        ) {
          // Common German voice names in Windows (exact names as they appear in the system)
          const germanVoices = [
            'Microsoft Hedda Desktop',
            'Microsoft Katja Desktop',
            'Microsoft Stefan Desktop',
            'Microsoft Hedda',
            'Microsoft Katja',
            'Microsoft Stefan',
          ];

          // Use the first German voice as default
          selectedVoice = germanVoices[0];
          logger.debug(
            'ElectronTTSService: Selected German voice:',
            selectedVoice
          );
        }

        // Prepare options for system TTS with user settings
        const options = {
          rate: config.rate || appSettings?.tts?.defaultRate || 1.0, // User's custom rate
          pitch: config.pitch || appSettings?.tts?.defaultPitch || 1.0, // User's custom pitch
          volume: config.volume || appSettings?.tts?.defaultVolume || 0.8, // User's custom volume
          voice: selectedVoice, // Selected voice name
          language: targetLanguage, // Statement language
        };

        logger.debug(
          'ElectronTTSService: Calling system TTS with options:',
          options
        );
        logger.debug(
          'ElectronTTSService: Parameter conversion for Windows SAPI:'
        );
        logger.debug(
          '  - Rate:',
          options.rate,
          '→ SAPI Rate:',
          Math.round((options.rate - 1) * 10)
        );
        logger.debug(
          '  - Volume:',
          options.volume,
          '→ SAPI Volume:',
          Math.round(options.volume * 100)
        );
        logger.debug('  - Pitch:', options.pitch, '(not supported by SAPI)');
        logger.debug('  - Voice:', options.voice);
        logger.debug('  - Language:', options.language);

        // Keep state as loading until TTS actually starts
        this.updateState({
          status: TTSPlaybackStatus.LOADING,
          currentText: text,
          isLoading: true,
          error: undefined,
          currentTime: 0,
          totalDuration: 1, // Normalized for percentage calculation
        });

        logger.debug('ElectronTTSService: Starting TTS call...');

        // Wait for TTS to actually start, then update to playing
        // System TTS needs time to initialize, especially with voice selection
        setTimeout(() => {
          logger.debug('ElectronTTSService: TTS should be playing now');
          this.updateState({
            status: TTSPlaybackStatus.PLAYING,
            isLoading: false,
          });
        }, 1000); // Give TTS 1 second to start (voice selection + initialization)

        // Call Electron TTS via IPC and wait for it to complete
        (window as any).electronAPI
          .ttsSpeak(text, options)
          .then(() => {
            logger.debug('ElectronTTSService: TTS completed successfully');
            this.updateState({
              status: TTSPlaybackStatus.COMPLETED,
              currentText: text,
              isLoading: false,
              error: undefined,
              currentTime: 1,
            });
            resolve(); // Resolve the Promise when speech completes
          })
          .catch((error: any) => {
            logger.error('ElectronTTSService: TTS error:', error);
            this.updateState({
              status: TTSPlaybackStatus.ERROR,
              error: error.message || 'TTS failed',
            });
            reject(error);
          });
      } catch (error) {
        logger.error('ElectronTTSService: Speech failed:', error);
        this.updateState({
          status: TTSPlaybackStatus.ERROR,
          currentText: text,
          isLoading: false,
          error: {
            type: TTSErrorType.AUDIO_PLAYBACK_ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date(),
            isRecoverable: true,
          },
        });
        reject(error);
        }
      };
      
      executeSpeech();
    }); // Close the Promise
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    logger.debug('ElectronTTSService: Stop requested');

    // Call Electron TTS stop via IPC
    if ((window as any).electronAPI?.ttsStop) {
      try {
        await (window as any).electronAPI.ttsStop();
        logger.debug('ElectronTTSService: TTS stopped successfully');
      } catch (error) {
        logger.error('ElectronTTSService: Error stopping TTS:', error);
      }
    }

    this.updateState({
      status: TTSPlaybackStatus.STOPPED,
      isPlaying: false,
      isPaused: false,
      currentText: '',
      currentTime: 0,
    });
  }

  /**
   * Get current state
   */
  getState(): TTSPlaybackState {
    return { ...this.state };
  }

  /**
   * Add state change listener
   */
  addStateChangeListener(listener: (state: TTSPlaybackState) => void): void {
    this.stateListeners.push(listener);
  }

  /**
   * Remove state change listener
   */
  removeStateChangeListener(listener: (state: TTSPlaybackState) => void): void {
    const index = this.stateListeners.indexOf(listener);
    if (index > -1) {
      this.stateListeners.splice(index, 1);
    }
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: (error: any) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  removeErrorListener(listener: (error: any) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Update state and notify listeners
   */
  private updateState(newState: Partial<TTSPlaybackState>): void {
    this.state = { ...this.state, ...newState };
    logger.debug(
      'ElectronTTSService: State updated:',
      newState,
      'Listeners:',
      this.stateListeners.length
    );
    this.stateListeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        logger.error('Error in state change listener:', error);
      }
    });
  }
}

// Export singleton instance
export const electronTtsService = new ElectronTTSService();
