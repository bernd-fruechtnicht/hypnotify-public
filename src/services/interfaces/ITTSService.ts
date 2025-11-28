/**
 * TTS Service Interface
 * Defines the contract that all TTS implementations must follow
 */

import {
  TTSPlaybackConfig,
  TTSPlaybackState,
  // TTSPlaybackStatus,
  TTSError,
  TTSQueueItem,
  TTSQueueConfig,
  TTSPerformanceMetrics,
} from '../../types/TTSConfig';

/**
 * Interface for all TTS service implementations
 * Ensures consistent API across different platforms (Web, Electron, iOS, Android)
 */
export interface ITTSService {
  /**
   * Initialize the TTS service
   */
  initialize(): Promise<void>;

  /**
   * Check if the TTS service is available on this platform
   */
  isAvailable(): boolean;

  /**
   * Check if pause/resume functionality is supported
   */
  isPauseResumeSupported(): boolean;

  /**
   * Speak text with the given configuration
   */
  speak(text: string, config?: Partial<TTSPlaybackConfig>): Promise<void>;

  /**
   * Stop current speech
   */
  stop(): Promise<void>;

  /**
   * Pause current speech
   */
  pause(): Promise<void>;

  /**
   * Resume paused speech
   */
  resume(): Promise<void>;

  /**
   * Get current playback state
   */
  getPlaybackState(): TTSPlaybackState;

  /**
   * Get available voices for the given language
   */
  getAvailableVoices(language?: string): Promise<any[]>;

  /**
   * Refresh available voices (useful after installing new language packs)
   */
  refreshVoices(): Promise<void>;

  /**
   * Queue management
   */
  addToQueue(item: TTSQueueItem): void;
  clearQueue(): void;
  getQueue(): TTSQueueItem[];
  setQueueConfig(config: TTSQueueConfig): void;

  /**
   * Performance metrics
   */
  getPerformanceMetrics(): TTSPerformanceMetrics;
  resetPerformanceMetrics(): void;

  /**
   * Event listeners
   */
  addStateChangeListener(listener: (state: TTSPlaybackState) => void): void;
  removeStateChangeListener(listener: (state: TTSPlaybackState) => void): void;
  addErrorListener(listener: (error: TTSError) => void): void;
  removeErrorListener(listener: (error: TTSError) => void): void;

  /**
   * Cleanup resources
   */
  cleanup(): Promise<void>;
}

/**
 * Platform-specific TTS service configuration
 */
export interface TTSPlatformConfig {
  /** Platform identifier */
  platform: 'web' | 'electron' | 'ios' | 'android' | 'desktop';

  /** Engine type used by this platform */
  engine: 'web-speech-api' | 'system-tts' | 'expo-speech' | 'native';

  /** Platform-specific capabilities */
  capabilities: {
    /** Can set custom voices */
    customVoices: boolean;
    /** Can set rate/pitch/volume */
    customParameters: boolean;
    /** Supports SSML */
    ssmlSupport: boolean;
    /** Supports audio preloading */
    audioPreloading: boolean;
    /** Requires user interaction for autoplay */
    requiresUserInteraction: boolean;
  };

  /** Platform-specific limitations */
  limitations: {
    /** Maximum text length per utterance */
    maxTextLength?: number;
    /** Supported audio formats */
    supportedFormats: string[];
    /** Rate range */
    rateRange: { min: number; max: number };
    /** Pitch range */
    pitchRange: { min: number; max: number };
    /** Volume range */
    volumeRange: { min: number; max: number };
  };
}

/**
 * TTS Service Factory Interface
 */
export interface ITTSServiceFactory {
  /**
   * Create appropriate TTS service for current platform
   */
  createService(): ITTSService;

  /**
   * Get platform configuration
   */
  getPlatformConfig(): TTSPlatformConfig;

  /**
   * Check if platform is supported
   */
  isPlatformSupported(): boolean;
}
