/**
 * Text-to-Speech Service
 * Routes TTS calls to platform-specific implementations
 */

import { Platform } from 'react-native';
import { webTtsService } from './WebTTSService';
import { electronTtsService } from './ElectronTTSService';
import { NativeTTSService } from './NativeTTSService';
// import { storageService } from './StorageService';

// Create TTS service instances
const nativeTtsService = NativeTTSService.getInstance();
import {
  TTSPlaybackConfig,
  TTSPlaybackState,
  TTSPlaybackStatus,
  TTSError,
  TTSErrorType,
  TTSQueueItem,
  TTSQueueConfig,
  TTSPerformanceMetrics,
} from '../types/TTSConfig';

export class TTSService {
  private static instance: TTSService;
  private playbackState: TTSPlaybackState;
  private queue: TTSQueueItem[] = [];
  private queueConfig: TTSQueueConfig;
  private performanceMetrics: TTSPerformanceMetrics;
  private isInitialized = false;
  private currentQueueItem: TTSQueueItem | null = null;
  private playbackStartTime: number = 0;
  private generationStartTime: number = 0;

  // Event listeners
  private stateChangeListeners: ((state: TTSPlaybackState) => void)[] = [];
  private errorListeners: ((error: TTSError) => void)[] = [];

  private constructor() {
    this.playbackState = this.createInitialState();
    this.queueConfig = this.createDefaultQueueConfig();
    this.performanceMetrics = this.createInitialMetrics();
  }

  public static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Set up state forwarding from underlying service to TTSService listeners
   */
  private setupStateForwarding(service: any): void {
    // Remove any existing listeners first
    this.clearStateForwarding();

    // Add a listener to the underlying service that forwards to our listeners
    const forwardListener = (state: TTSPlaybackState) => {
      this.playbackState = { ...this.playbackState, ...state };
      this.notifyStateChangeListeners();
    };

    service.addStateChangeListener(forwardListener);

    // Store the listener for cleanup
    (this as any).currentForwardListener = forwardListener;
    (this as any).currentService = service;
  }

  /**
   * Clear state forwarding
   */
  private clearStateForwarding(): void {
    if ((this as any).currentForwardListener && (this as any).currentService) {
      (this as any).currentService.removeStateChangeListener(
        (this as any).currentForwardListener
      );
      (this as any).currentForwardListener = null;
      (this as any).currentService = null;
    }
  }

  /**
   * Initialize the TTS service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('TTS service initializing...');
      this.isInitialized = true;
      this.updateState({ status: TTSPlaybackStatus.IDLE });
    } catch (error) {
      const ttsError = this.createError(
        TTSErrorType.ENGINE_NOT_AVAILABLE,
        `Failed to initialize TTS service: ${error}`
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
    // Route to appropriate service based on platform
    if (Platform.OS === 'ios') {
      // Use native TTS for iOS
      this.setupStateForwarding(nativeTtsService);
      return nativeTtsService.speak(text, config);
    } else if (Platform.OS === 'android') {
      // Use native TTS for Android
      this.setupStateForwarding(nativeTtsService);
      return nativeTtsService.speak(text, config);
    } else if (electronTtsService.isAvailable()) {
      // Use Web Speech API for Electron (better control than system TTS)
      this.setupStateForwarding(webTtsService);
      return webTtsService.speak(text, config);
    } else {
      // Use Web Speech API for web
      this.setupStateForwarding(webTtsService);
      return webTtsService.speak(text, config);
    }
  }

  /**
   * Add text to the speech queue
   */
  public async queueSpeech(
    text: string,
    config: Partial<TTSPlaybackConfig> = {},
    priority: number = 5,
    interruptible: boolean = true
  ): Promise<string> {
    const queueItem: TTSQueueItem = {
      id: this.generateId(),
      text,
      config: {
        voice: 'default',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8,
        language: 'en',
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
      },
      priority,
      interruptible,
      addedAt: new Date(),
    };

    // Add to queue with priority sorting
    this.queue.push(queueItem);
    this.queue.sort((a, b) => b.priority - a.priority);

    // Trim queue if it exceeds max size
    if (this.queue.length > this.queueConfig.maxQueueSize) {
      this.queue = this.queue.slice(0, this.queueConfig.maxQueueSize);
    }

    // Start processing queue if not already playing
    if (this.playbackState.status === TTSPlaybackStatus.IDLE) {
      this.processQueue();
    }

    return queueItem.id;
  }

  /**
   * Pause current speech
   */
  public async pause(): Promise<void> {
    // Route to appropriate service based on platform
    if (Platform.OS === 'ios') {
      return nativeTtsService.pause();
    } else if (Platform.OS === 'android') {
      return nativeTtsService.pause();
    } else {
      return webTtsService.pause();
    }
  }

  /**
   * Resume paused speech
   */
  public async resume(): Promise<void> {
    // Route to appropriate service based on platform
    if (Platform.OS === 'ios') {
      return nativeTtsService.resume();
    } else if (Platform.OS === 'android') {
      return nativeTtsService.resume();
    } else {
      return webTtsService.resume();
    }
  }

  /**
   * Stop current speech and clear queue
   */
  public async stop(): Promise<void> {
    // Clear state forwarding
    this.clearStateForwarding();

    // Route to appropriate service based on platform
    if (Platform.OS === 'ios') {
      return nativeTtsService.stop();
    } else if (Platform.OS === 'android') {
      return nativeTtsService.stop();
    } else {
      return webTtsService.stop();
    }
  }

  /**
   * Get current playback state
   */
  public getPlaybackState(): TTSPlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics(): TTSPerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  /**
   * Get available voices for a language
   */
  public async getAvailableVoices(language?: string): Promise<any[]> {
    if (Platform.OS === 'web') {
      return webTtsService.getAvailableVoices(language);
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return nativeTtsService.getAvailableVoices(language);
    }

    if (electronTtsService.isAvailable()) {
      return electronTtsService.getAvailableVoices();
    }

    return [];
  }

  /**
   * Check if speech is currently available
   */
  public async isAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return webTtsService.isAvailable();
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      return nativeTtsService.isAvailable();
    }

    if (electronTtsService.isAvailable()) {
      return true;
    }

    return false;
  }

  /**
   * Check if pause/resume functionality is supported
   */
  public isPauseResumeSupported(): boolean {
    if (Platform.OS === 'ios') {
      return nativeTtsService.isPauseResumeSupported();
    } else if (Platform.OS === 'android') {
      // Check if WebView TTS should be used for better control
      return nativeTtsService.isPauseResumeSupported();
    } else {
      // Web and Electron support pause/resume
      return true;
    }
  }

  /**
   * Check if WebView TTS should be used for Android
   */
  private shouldUseWebViewTTS(): boolean {
    // Disable WebView TTS due to syntax errors and UI corruption
    return false;
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
   * Notify all state change listeners
   */
  private notifyStateChangeListeners(): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.playbackState);
      } catch (error) {
        console.error('Error in TTSService state change listener:', error);
      }
    });
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

  private createDefaultQueueConfig(): TTSQueueConfig {
    return {
      maxQueueSize: 50,
      autoPlayNext: true,
      defaultPriority: 5,
      clearOnError: false,
      maxRetryAttempts: 3,
    };
  }

  private createInitialMetrics(): TTSPerformanceMetrics {
    return {
      averageStartTime: 0,
      averageGenerationTime: 0,
      cacheHitRate: 0,
      errorRate: 0,
      successfulPlaybacks: 0,
      failedPlaybacks: 0,
      lastUpdated: new Date(),
    };
  }

  private async processQueue(): Promise<void> {
    if (this.queue.length === 0) {
      this.updateState({ status: TTSPlaybackStatus.IDLE });
      return;
    }

    const nextItem = this.queue.shift();
    if (!nextItem) {
      return;
    }

    this.currentQueueItem = nextItem;

    try {
      // Execute onStart callback
      if (nextItem.onStart) {
        nextItem.onStart();
      }

      await this.speak(nextItem.text, nextItem.config);

      // Execute onComplete callback
      if (nextItem.onComplete) {
        nextItem.onComplete();
      }

      // Process next item if auto-play is enabled
      if (this.queueConfig.autoPlayNext && this.queue.length > 0) {
        setTimeout(() => this.processQueue(), 100);
      } else {
        this.updateState({ status: TTSPlaybackStatus.COMPLETED });
      }
    } catch (error) {
      // Execute onError callback
      if (nextItem.onError) {
        const ttsError = this.createError(
          TTSErrorType.AUDIO_PLAYBACK_ERROR,
          `Queue item failed: ${error}`
        );
        nextItem.onError(ttsError);
      }

      // Handle queue error
      if (this.queueConfig.clearOnError) {
        this.queue = [];
      }

      this.updatePerformanceMetrics(false);
    }
  }

  private updateState(updates: Partial<TTSPlaybackState>): void {
    this.playbackState = { ...this.playbackState, ...updates };
    this.notifyStateChangeListeners();
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
        console.error('Error in error listener:', listenerError);
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

  private updatePerformanceMetrics(success: boolean): void {
    const now = Date.now();
    const startTime = now - this.playbackStartTime;
    const generationTime = now - this.generationStartTime;

    if (success) {
      this.performanceMetrics.successfulPlaybacks++;
      this.performanceMetrics.averageStartTime =
        (this.performanceMetrics.averageStartTime *
          (this.performanceMetrics.successfulPlaybacks - 1) +
          startTime) /
        this.performanceMetrics.successfulPlaybacks;
      this.performanceMetrics.averageGenerationTime =
        (this.performanceMetrics.averageGenerationTime *
          (this.performanceMetrics.successfulPlaybacks - 1) +
          generationTime) /
        this.performanceMetrics.successfulPlaybacks;
    } else {
      this.performanceMetrics.failedPlaybacks++;
    }

    const totalPlaybacks =
      this.performanceMetrics.successfulPlaybacks +
      this.performanceMetrics.failedPlaybacks;
    this.performanceMetrics.errorRate =
      this.performanceMetrics.failedPlaybacks / totalPlaybacks;

    this.performanceMetrics.lastUpdated = new Date();
  }

  private generateId(): string {
    return `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const ttsService = TTSService.getInstance();
