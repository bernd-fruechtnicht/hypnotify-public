/**
 * Text-to-Speech configuration types
 * Handles TTS engine configuration and voice management
 */

/**
 * TTS Engine configuration
 */
export interface TTSEngineConfig {
  /** TTS engine type */
  engine: TTSEngine;

  /** Engine-specific configuration */
  config: Record<string, any>;

  /** Whether the engine is available */
  isAvailable: boolean;

  /** Engine version */
  version?: string;
}

/**
 * Available TTS engines
 */
export enum TTSEngine {
  EXPO_SPEECH = 'expo-speech',
  SYSTEM = 'system',
  GOOGLE = 'google',
  AMAZON = 'amazon',
  MICROSOFT = 'microsoft',
  APPLE = 'apple',
}

/**
 * Voice configuration for TTS
 */
export interface TTSVoice {
  /** Voice identifier */
  id: string;

  /** Voice name */
  name: string;

  /** Language code */
  language: string;

  /** Voice gender */
  gender: 'male' | 'female' | 'neutral' | 'unknown';

  /** Voice quality rating (1-5) */
  quality: number;

  /** Whether this is a premium voice */
  isPremium: boolean;

  /** Voice characteristics */
  characteristics: VoiceCharacteristics;

  /** Whether this voice is available */
  isAvailable: boolean;
}

/**
 * Voice characteristics
 */
export interface VoiceCharacteristics {
  /** Voice age range */
  age: 'child' | 'young' | 'adult' | 'elderly' | 'unknown';

  /** Voice accent */
  accent?: string;

  /** Voice style */
  style:
    | 'neutral'
    | 'calm'
    | 'energetic'
    | 'soothing'
    | 'authoritative'
    | 'friendly';

  /** Voice speed preference */
  speedPreference: 'slow' | 'normal' | 'fast';

  /** Voice pitch preference */
  pitchPreference: 'low' | 'medium' | 'high';
}

/**
 * TTS playback configuration
 */
export interface TTSPlaybackConfig {
  /** Voice to use */
  voice: string;

  /** Speech rate (0.1 - 2.0) */
  rate: number;

  /** Speech pitch (0.0 - 2.0) */
  pitch: number;

  /** Speech volume (0.0 - 1.0) */
  volume: number;

  /** Language for TTS */
  language: string;

  /** Whether to use SSML (Speech Synthesis Markup Language) */
  useSSML: boolean;

  /** Audio format preferences */
  audioFormat: AudioFormat;

  /** Whether to preload audio */
  preloadAudio: boolean;

  /** Maximum preload duration in seconds */
  maxPreloadDuration: number;
}

/**
 * Audio format configuration
 */
export interface AudioFormat {
  /** Audio codec */
  codec: 'mp3' | 'aac' | 'wav' | 'ogg';

  /** Audio bitrate */
  bitrate: number;

  /** Audio sample rate */
  sampleRate: number;

  /** Audio channels */
  channels: 1 | 2;
}

/**
 * TTS cache configuration
 */
export interface TTSCacheConfig {
  /** Whether to enable caching */
  enabled: boolean;

  /** Maximum cache size in MB */
  maxCacheSize: number;

  /** Cache expiration time in hours */
  expirationHours: number;

  /** Whether to compress cached audio */
  compressAudio: boolean;

  /** Cache storage location */
  storageLocation: 'local' | 'temp' | 'persistent';
}

/**
 * TTS error types
 */
export enum TTSErrorType {
  ENGINE_NOT_AVAILABLE = 'engine_not_available',
  VOICE_NOT_FOUND = 'voice_not_found',
  LANGUAGE_NOT_SUPPORTED = 'language_not_supported',
  AUDIO_PLAYBACK_ERROR = 'audio_playback_error',
  NETWORK_ERROR = 'network_error',
  PERMISSION_DENIED = 'permission_denied',
  INVALID_CONFIG = 'invalid_config',
  CACHE_ERROR = 'cache_error',
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * TTS error information
 */
export interface TTSError {
  /** Error type */
  type: TTSErrorType;

  /** Error message */
  message: string;

  /** Error code */
  code?: string;

  /** Additional error details */
  details?: Record<string, any>;

  /** Timestamp when error occurred */
  timestamp: Date;

  /** Whether this error is recoverable */
  isRecoverable: boolean;
}

/**
 * TTS playback state
 */
export interface TTSPlaybackState {
  /** Current playback status */
  status: TTSPlaybackStatus;

  /** Current text being spoken */
  currentText: string;

  /** Current position in the text */
  currentPosition: number;

  /** Total text length */
  totalLength: number;

  /** Current playback time in seconds */
  currentTime: number;

  /** Total estimated duration in seconds */
  totalDuration: number;

  /** Whether audio is currently playing */
  isPlaying: boolean;

  /** Whether audio is paused */
  isPaused: boolean;

  /** Whether audio is loading */
  isLoading: boolean;

  /** Current error (if any) */
  error?: TTSError;
}

/**
 * TTS playback status
 */
export enum TTSPlaybackStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  ERROR = 'error',
}

/**
 * TTS queue item
 */
export interface TTSQueueItem {
  /** Unique identifier for this queue item */
  id: string;

  /** Text to be spoken */
  text: string;

  /** TTS configuration for this item */
  config: TTSPlaybackConfig;

  /** Priority in the queue (higher = more priority) */
  priority: number;

  /** Whether this item can be interrupted */
  interruptible: boolean;

  /** Callback to execute when playback starts */
  onStart?: () => void;

  /** Callback to execute when playback completes */
  onComplete?: () => void;

  /** Callback to execute when playback fails */
  onError?: (error: TTSError) => void;

  /** Timestamp when item was added to queue */
  addedAt: Date;
}

/**
 * TTS queue configuration
 */
export interface TTSQueueConfig {
  /** Maximum queue size */
  maxQueueSize: number;

  /** Whether to auto-play next item */
  autoPlayNext: boolean;

  /** Default priority for new items */
  defaultPriority: number;

  /** Whether to clear queue on error */
  clearOnError: boolean;

  /** Maximum retry attempts for failed items */
  maxRetryAttempts: number;
}

/**
 * TTS performance metrics
 */
export interface TTSPerformanceMetrics {
  /** Average time to start playback in milliseconds */
  averageStartTime: number;

  /** Average time to generate audio in milliseconds */
  averageGenerationTime: number;

  /** Cache hit rate (0.0 - 1.0) */
  cacheHitRate: number;

  /** Error rate (0.0 - 1.0) */
  errorRate: number;

  /** Total number of successful playbacks */
  successfulPlaybacks: number;

  /** Total number of failed playbacks */
  failedPlaybacks: number;

  /** Last updated timestamp */
  lastUpdated: Date;
}
