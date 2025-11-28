/**
 * Stereo Meditation Session Types
 *
 * Comprehensive type definitions for stereo meditation sessions
 * following the established patterns in the codebase
 */

import { BaseEntity, ValidationError } from './index';
import { MeditationStatement } from './MeditationStatement';

/**
 * Core stereo meditation session interface
 * Represents a complete stereo meditation session with left and right channel statements
 */
export interface StereoSession extends BaseEntity {
  /** Name of the stereo session */
  name: string;

  /** Description of the stereo session */
  description?: string;

  /** Multi-language content for the session */
  multiLanguageContent?: {
    [languageCode: string]: {
      name: string;
      description?: string;
    };
  };

  /** Category for organizing stereo sessions */
  category: StereoSessionCategory;

  /** Subcategory for more specific organization */
  subcategory?: string;

  /** Statement IDs for the left channel (rational/logical content) */
  leftChannelStatementIds: string[];

  /** Statement IDs for the right channel (emotional/subconscious content) */
  rightChannelStatementIds: string[];

  /** Loaded statement objects for the left channel (runtime only) */
  leftChannelStatements?: MeditationStatement[];

  /** Loaded statement objects for the right channel (runtime only) */
  rightChannelStatements?: MeditationStatement[];

  /** Whether this is a user-created session */
  isUserCreated: boolean;

  /** User who created this session (if user-created) */
  createdBy?: string;

  /** Tags for search and filtering */
  tags: string[];

  /** Whether this session is active/available for use */
  isActive: boolean;

  /** Whether this session is a template */
  isTemplate: boolean;

  /** Stereo-specific TTS settings */
  ttsSettings?: StereoTTSSettings;

  /** Session statistics */
  statistics?: StereoSessionStatistics;
}

/**
 * Categories for organizing stereo meditation sessions
 */
export enum StereoSessionCategory {
  BILATERAL_STIMULATION = 'bilateral_stimulation',
  COGNITIVE_DISSONANCE = 'cognitive_dissonance',
  RELAXATION = 'relaxation',
  ANXIETY_RELIEF = 'anxiety_relief',
  STRESS_RELIEF = 'stress_relief',
  FOCUS = 'focus',
  MINDFULNESS = 'mindfulness',
  SLEEP = 'sleep',
  HEALING = 'healing',
  CUSTOM = 'custom',
}

/**
 * TTS settings specific to stereo sessions
 */
export interface StereoTTSSettings {
  /** Default voice for left channel (rational) */
  leftChannelVoice?: string;

  /** Default voice for right channel (emotional) */
  rightChannelVoice?: string;

  /** Default speech rate (0.1 - 2.0) */
  rate?: number;

  /** Default speech pitch (0.0 - 2.0) */
  pitch?: number;

  /** Default speech volume (0.0 - 1.0) */
  volume?: number;

  /** Left channel volume (0.0 - 1.0) */
  leftChannelVolume?: number;

  /** Right channel volume (0.0 - 1.0) */
  rightChannelVolume?: number;

  /** Random delay range for channel start (in milliseconds) */
  randomDelayRange?: {
    min: number;
    max: number;
  };

  /** Whether to use statement-specific TTS settings */
  useStatementSettings: boolean;
}

/**
 * Stereo session usage statistics
 */
export interface StereoSessionStatistics {
  /** Number of times this session has been played */
  playCount: number;

  /** Total time spent in this session (in seconds) */
  totalTimeSpent: number;

  /** Average completion rate (0.0 - 1.0) */
  averageCompletionRate: number;

  /** Last played timestamp */
  lastPlayedAt?: Date;

  /** User rating (1-5 stars) */
  userRating?: number;

  /** User notes about the session */
  userNotes?: string;
}

/**
 * Input type for creating new stereo sessions
 */
export interface CreateStereoSessionInput {
  name: string;
  description?: string;
  multiLanguageContent?: {
    [languageCode: string]: {
      name: string;
      description?: string;
    };
  };
  category: StereoSessionCategory;
  subcategory?: string;
  leftChannelStatementIds: string[];
  rightChannelStatementIds: string[];
  tags?: string[];
  isTemplate?: boolean;
  ttsSettings?: StereoTTSSettings;
}

/**
 * Input type for updating existing stereo sessions
 */
export interface UpdateStereoSessionInput {
  name?: string;
  description?: string;
  category?: StereoSessionCategory;
  subcategory?: string;
  leftChannelStatementIds?: string[];
  rightChannelStatementIds?: string[];
  tags?: string[];
  isActive?: boolean;
  isTemplate?: boolean;
  ttsSettings?: StereoTTSSettings;
}

/**
 * Filter options for searching stereo sessions
 */
export interface StereoSessionFilter {
  category?: StereoSessionCategory;
  subcategory?: string;
  language?: string;
  tags?: string[];
  isUserCreated?: boolean;
  isActive?: boolean;
  isTemplate?: boolean;
  searchText?: string;
  minDuration?: number;
  maxDuration?: number;
}

/**
 * Sort options for stereo session lists
 */
export interface StereoSessionSort {
  field: 'createdAt' | 'updatedAt' | 'name' | 'category' | 'playCount';
  direction: 'asc' | 'desc';
}

/**
 * Stereo session playback state
 */
export interface StereoSessionPlaybackState {
  /** Current session being played */
  sessionId: string;

  /** Current left channel statement index */
  leftChannelIndex: number;

  /** Current right channel statement index */
  rightChannelIndex: number;

  /** Playback status */
  status: StereoPlaybackStatus;

  /** Current playback position in seconds */
  currentPosition: number;

  /** Total session duration in seconds */
  totalDuration: number;

  /** Whether left channel is playing */
  leftChannelPlaying: boolean;

  /** Whether right channel is playing */
  rightChannelPlaying: boolean;

  /** Start time of current playback */
  startTime?: Date;

  /** Pause time of current playback */
  pauseTime?: Date;

  /** Current left channel statement */
  currentLeftStatement?: MeditationStatement;

  /** Current right channel statement */
  currentRightStatement?: MeditationStatement;
}

/**
 * Stereo playback status enum
 */
export enum StereoPlaybackStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  ERROR = 'error',
}

/**
 * Cloud TTS configuration
 */
export interface CloudTTSConfig {
  /** Provider type */
  provider: 'google' | 'aws' | 'azure' | 'elevenlabs';

  /** API endpoint URL */
  endpoint: string;

  /** API key */
  apiKey: string;

  /** Default voice settings */
  defaultVoice: {
    language: string;
    name: string;
    gender?: 'male' | 'female' | 'neutral';
  };

  /** Audio format settings */
  audioFormat: {
    codec: 'mp3' | 'wav' | 'ogg';
    bitrate: number;
    sampleRate: number;
    channels: 1 | 2;
  };

  /** Request timeout in milliseconds */
  timeout: number;

  /** Maximum retry attempts */
  maxRetries: number;
}

/**
 * Cloud TTS result
 */
export interface CloudTTSResult {
  /** Base64 encoded audio content */
  audioContent: string;

  /** Original text that was synthesized */
  text: string;

  /** Voice used for synthesis */
  voice: string;

  /** Language used */
  language: string;

  /** Audio duration in seconds */
  duration?: number;

  /** Audio format */
  format: string;

  /** Generation timestamp */
  generatedAt: Date;
}

/**
 * Audio cache entry
 */
export interface AudioCacheEntry {
  /** Cache key (text + voice + language hash) */
  key: string;

  /** Cached audio content */
  audioContent: string;

  /** Original text */
  text: string;

  /** Voice used */
  voice: string;

  /** Language used */
  language: string;

  /** Cache creation timestamp */
  createdAt: Date;

  /** Last accessed timestamp */
  lastAccessedAt: Date;

  /** Access count */
  accessCount: number;

  /** Audio duration in seconds */
  duration?: number;
}

/**
 * Get localized stereo session name for a given language
 */
export const getStereoSessionName = (
  session: StereoSession,
  language: string
): string => {
  if (session.multiLanguageContent?.[language]?.name) {
    return session.multiLanguageContent[language].name;
  }
  return session.name;
};

/**
 * Get localized stereo session description for a given language
 */
export const getStereoSessionDescription = (
  session: StereoSession,
  language: string
): string | undefined => {
  if (session.multiLanguageContent?.[language]?.description) {
    return session.multiLanguageContent[language].description;
  }
  return session.description;
};

/**
 * Validate stereo session data
 */
export const validateStereoSession = (
  session: Partial<StereoSession>
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!session.name || session.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Session name is required',
      code: 'REQUIRED',
    });
  }

  if (!session.category) {
    errors.push({
      field: 'category',
      message: 'Session category is required',
      code: 'REQUIRED',
    });
  }

  if (
    !session.leftChannelStatementIds ||
    session.leftChannelStatementIds.length === 0
  ) {
    errors.push({
      field: 'leftChannelStatementIds',
      message: 'At least one left channel statement ID is required',
      code: 'REQUIRED',
    });
  }

  if (
    !session.rightChannelStatementIds ||
    session.rightChannelStatementIds.length === 0
  ) {
    errors.push({
      field: 'rightChannelStatementIds',
      message: 'At least one right channel statement ID is required',
      code: 'REQUIRED',
    });
  }

  return errors;
};
