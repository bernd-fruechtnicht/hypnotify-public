/**
 * Core meditation session interface
 * Represents a complete meditation session composed of multiple statements
 */
export interface MeditationSession {
  /** Unique identifier for the session */
  id: string;

  /** Name of the session */
  name: string;

  /** Description of the session */
  description?: string;

  /** Language of the session (deprecated - use multiLanguageContent instead) */
  language: string;

  /** Multi-language content for the session */
  multiLanguageContent?: {
    [languageCode: string]: {
      name: string;
      description?: string;
    };
  };

  /** Category for organizing sessions */
  category: SessionCategory;

  /** Subcategory for more specific organization */
  subcategory?: string;

  /** Ordered list of statement IDs in this session */
  statementIds: string[];

  /** Whether this is a user-created session */
  isUserCreated: boolean;

  /** User who created this session (if user-created) */
  createdBy?: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last modification timestamp */
  updatedAt: Date;

  /** Tags for search and filtering */
  tags: string[];

  /** Whether this session is active/available for use */
  isActive: boolean;

  /** Whether this session is a template */
  isTemplate: boolean;

  /** Background music settings */
  backgroundMusic?: BackgroundMusicSettings;

  /** Session-specific TTS settings */
  ttsSettings?: SessionTTSSettings;

  /** Session statistics */
  statistics?: SessionStatistics;
}

/**
 * Categories for organizing meditation sessions
 */
export enum SessionCategory {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  SLEEP = 'sleep',
  ANXIETY_RELIEF = 'anxiety_relief',
  STRESS_RELIEF = 'stress_relief',
  FOCUS = 'focus',
  MINDFULNESS = 'mindfulness',
  BODY_SCAN = 'body_scan',
  LOVING_KINDNESS = 'loving_kindness',
  BREATHING = 'breathing',
  VISUALIZATION = 'visualization',
  QUICK_RELAX = 'quick_relax',
  DEEP_RELAX = 'deep_relax',
  CUSTOM = 'custom',
}

/**
 * Background music settings for sessions
 */
export interface BackgroundMusicSettings {
  /** Whether background music is enabled */
  enabled: boolean;

  /** Music file path, URL, or asset object */
  musicPath?: string | any;

  /** Music volume (0.0 - 1.0) */
  volume: number;

  /** Whether to loop the music */
  loop: boolean;

  /** Fade in duration in seconds */
  fadeInDuration?: number;

  /** Fade out duration in seconds */
  fadeOutDuration?: number;
}

/**
 * TTS settings specific to a session
 */
export interface SessionTTSSettings {
  /** Default voice for the session */
  voice?: string;

  /** Default speech rate (0.1 - 2.0) */
  rate?: number;

  /** Default speech pitch (0.0 - 2.0) */
  pitch?: number;

  /** Default speech volume (0.0 - 1.0) */
  volume?: number;

  /** Default pause between statements (in seconds) */
  pauseBetweenStatements?: number;

  /** Whether to use statement-specific TTS settings */
  useStatementSettings: boolean;
}

/**
 * Session usage statistics
 */
export interface SessionStatistics {
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
 * Input type for creating new sessions
 */
export interface CreateMeditationSessionInput {
  name: string;
  description?: string;
  language: string;
  category: SessionCategory;
  subcategory?: string;
  statementIds: string[];
  tags?: string[];
  isTemplate?: boolean;
  backgroundMusic?: BackgroundMusicSettings;
  ttsSettings?: SessionTTSSettings;
}

/**
 * Input type for updating existing sessions
 */
export interface UpdateMeditationSessionInput {
  name?: string;
  description?: string;
  category?: SessionCategory;
  subcategory?: string;
  statementIds?: string[];
  tags?: string[];
  isActive?: boolean;
  isTemplate?: boolean;
  backgroundMusic?: BackgroundMusicSettings;
  ttsSettings?: SessionTTSSettings;
}

/**
 * Filter options for searching sessions
 */
export interface SessionFilter {
  category?: SessionCategory;
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
 * Sort options for session lists
 */
export interface SessionSort {
  field: 'createdAt' | 'updatedAt' | 'name' | 'category' | 'playCount';
  direction: 'asc' | 'desc';
}

/**
 * Session playback state
 */
export interface SessionPlaybackState {
  /** Current session being played */
  sessionId: string;

  /** Current statement index */
  currentStatementIndex: number;

  /** Playback status */
  status: PlaybackStatus;

  /** Current playback position in seconds */
  currentPosition: number;

  /** Total session duration in seconds */
  totalDuration: number;

  /** Whether background music is playing */
  backgroundMusicPlaying: boolean;

  /** Start time of current playback */
  startTime?: Date;

  /** Pause time of current playback */
  pauseTime?: Date;
}

/**
 * Get localized session name for a given language
 */
export const getSessionName = (
  session: MeditationSession,
  language: string
): string => {
  if (session.multiLanguageContent?.[language]?.name) {
    return session.multiLanguageContent[language].name;
  }
  return session.name;
};

/**
 * Get localized session description for a given language
 */
export const getSessionDescription = (
  session: MeditationSession,
  language: string
): string | undefined => {
  if (session.multiLanguageContent?.[language]?.description) {
    return session.multiLanguageContent[language].description;
  }
  return session.description;
};

/**
 * Playback status enum
 */
export enum PlaybackStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  PLAYING = 'playing',
  PAUSED = 'paused',
  STOPPED = 'stopped',
  COMPLETED = 'completed',
  ERROR = 'error',
}
