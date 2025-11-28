/**
 * Application settings interface
 * Contains all user preferences and app configuration
 */
export interface AppSettings {
  /** User's preferred language */
  language: string;

  /** Theme settings */
  theme: ThemeSettings;

  /** Audio settings */
  audio: AudioSettings;

  /** TTS settings */
  tts: TTSSettings;

  /** Session settings */
  session: SessionSettings;

  /** Privacy settings */
  privacy: PrivacySettings;

  /** Notification settings */
  notifications: NotificationSettings;

  /** Data and storage settings */
  data: DataSettings;

  /** Accessibility settings */
  accessibility: AccessibilitySettings;

  /** Last updated timestamp */
  updatedAt: Date;
}

/**
 * Theme and appearance settings
 */
export interface ThemeSettings {
  /** Color scheme preference */
  colorScheme: 'light' | 'dark' | 'auto';

  /** Primary color theme */
  primaryColor: string;

  /** Font size preference */
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';

  /** Whether to use reduced motion */
  reducedMotion: boolean;

  /** Whether to use high contrast */
  highContrast: boolean;
}

/**
 * General audio settings
 */
export interface AudioSettings {
  /** Master volume (0.0 - 1.0) */
  masterVolume: number;

  /** Whether to respect device silent mode */
  respectSilentMode: boolean;

  /** Whether to allow background audio */
  allowBackgroundAudio: boolean;

  /** Audio quality preference */
  audioQuality: 'low' | 'medium' | 'high';

  /** Whether to use spatial audio */
  spatialAudio: boolean;

  /** Background music settings */
  backgroundMusic: {
    /** Whether background music is enabled */
    enabled: boolean;
    /** Background music volume (0.0 - 1.0) */
    volume: number;
  };
}

/**
 * Text-to-speech settings
 */
export interface TTSSettings {
  /** Default voice for TTS (deprecated - use voicesPerLanguage instead) */
  defaultVoice: string;

  /** Selected voice for each language */
  voicesPerLanguage: Record<string, string>;

  /** Default speech rate (0.1 - 2.0) */
  defaultRate: number;

  /** Default speech pitch (0.0 - 2.0) */
  defaultPitch: number;

  /** Default speech volume (0.0 - 1.0) */
  defaultVolume: number;

  /** Default pause between statements (in seconds) */
  defaultPauseBetweenStatements: number;

  /** Whether to use statement-specific TTS settings */
  useStatementSpecificSettings: boolean;

  /** Available voices for each language */
  availableVoices: Record<string, string[]>;
}

/**
 * Session-specific settings
 */
export interface SessionSettings {
  /** Default session duration in minutes */
  defaultSessionDuration: number;

  /** Whether to show session progress */
  showProgress: boolean;

  /** Whether to show time remaining */
  showTimeRemaining: boolean;

  /** Whether to auto-advance to next statement */
  autoAdvance: boolean;

  /** Whether to loop sessions */
  loopSessions: boolean;

  /** Default background music volume */
  defaultBackgroundMusicVolume: number;

  /** Whether to fade in/out audio */
  useAudioFading: boolean;

  /** Fade duration in seconds */
  fadeDuration: number;
}

/**
 * Privacy and data settings
 */
export interface PrivacySettings {
  /** Whether to collect usage analytics */
  collectAnalytics: boolean;

  /** Whether to collect crash reports */
  collectCrashReports: boolean;

  /** Whether to share anonymous usage data */
  shareAnonymousData: boolean;

  /** Whether to store session history */
  storeSessionHistory: boolean;

  /** Session history retention period in days */
  sessionHistoryRetentionDays: number;

  /** Whether to sync data across devices */
  syncAcrossDevices: boolean;
}

/**
 * Notification settings
 */
export interface NotificationSettings {
  /** Whether to enable notifications */
  enabled: boolean;

  /** Whether to show daily reminders */
  dailyReminders: boolean;

  /** Daily reminder time */
  dailyReminderTime: string; // HH:MM format

  /** Whether to show session completion notifications */
  sessionCompletionNotifications: boolean;

  /** Whether to show achievement notifications */
  achievementNotifications: boolean;

  /** Whether to show motivational messages */
  motivationalMessages: boolean;

  /** Quiet hours start time */
  quietHoursStart?: string; // HH:MM format

  /** Quiet hours end time */
  quietHoursEnd?: string; // HH:MM format
}

/**
 * Data and storage settings
 */
export interface DataSettings {
  /** Whether to auto-backup data */
  autoBackup: boolean;

  /** Backup frequency */
  backupFrequency: 'daily' | 'weekly' | 'monthly';

  /** Whether to compress backups */
  compressBackups: boolean;

  /** Maximum storage usage in MB */
  maxStorageUsage: number;

  /** Whether to auto-clean old data */
  autoCleanOldData: boolean;

  /** Data retention period in days */
  dataRetentionDays: number;
}

/**
 * Accessibility settings
 */
export interface AccessibilitySettings {
  /** Whether to enable screen reader support */
  screenReaderSupport: boolean;

  /** Whether to enable voice control */
  voiceControl: boolean;

  /** Whether to enable large text */
  largeText: boolean;

  /** Whether to enable high contrast */
  highContrast: boolean;

  /** Whether to enable reduced motion */
  reducedMotion: boolean;

  /** Whether to enable haptic feedback */
  hapticFeedback: boolean;

  /** Haptic feedback intensity */
  hapticIntensity: 'light' | 'medium' | 'strong';
}

/**
 * Default app settings
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: 'en',
  theme: {
    colorScheme: 'auto',
    primaryColor: '#2196f3',
    fontSize: 'medium',
    reducedMotion: false,
    highContrast: false,
  },
  audio: {
    masterVolume: 0.8,
    respectSilentMode: true,
    allowBackgroundAudio: true,
    audioQuality: 'high',
    spatialAudio: false,
    backgroundMusic: {
      enabled: false,
      volume: 0.3,
    },
  },
  tts: {
    defaultVoice: 'default',
    voicesPerLanguage: {
      en: 'default',
      de: 'default',
      zh: 'default',
    },
    defaultRate: 0.8,
    defaultPitch: 1.0,
    defaultVolume: 0.8,
    defaultPauseBetweenStatements: 5.0,
    useStatementSpecificSettings: true,
    availableVoices: {
      en: ['default'],
      de: ['default'],
      zh: ['default'],
    },
  },
  session: {
    defaultSessionDuration: 10,
    showProgress: true,
    showTimeRemaining: true,
    autoAdvance: true,
    loopSessions: false,
    defaultBackgroundMusicVolume: 0.3,
    useAudioFading: true,
    fadeDuration: 2.0,
  },
  privacy: {
    collectAnalytics: true,
    collectCrashReports: true,
    shareAnonymousData: false,
    storeSessionHistory: true,
    sessionHistoryRetentionDays: 90,
    syncAcrossDevices: false,
  },
  notifications: {
    enabled: true,
    dailyReminders: false,
    dailyReminderTime: '20:00',
    sessionCompletionNotifications: true,
    achievementNotifications: true,
    motivationalMessages: true,
  },
  data: {
    autoBackup: false,
    backupFrequency: 'weekly',
    compressBackups: true,
    maxStorageUsage: 100,
    autoCleanOldData: true,
    dataRetentionDays: 365,
  },
  accessibility: {
    screenReaderSupport: true,
    voiceControl: false,
    largeText: false,
    highContrast: false,
    reducedMotion: false,
    hapticFeedback: true,
    hapticIntensity: 'medium',
  },
  updatedAt: new Date(),
};

/**
 * Settings update input type
 */
export interface UpdateAppSettingsInput {
  language?: string;
  theme?: Partial<ThemeSettings>;
  audio?: Partial<AudioSettings>;
  tts?: Partial<TTSSettings>;
  session?: Partial<SessionSettings>;
  privacy?: Partial<PrivacySettings>;
  notifications?: Partial<NotificationSettings>;
  data?: Partial<DataSettings>;
  accessibility?: Partial<AccessibilitySettings>;
}
