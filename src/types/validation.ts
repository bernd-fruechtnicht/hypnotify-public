/**
 * Data validation schemas using Zod
 * Provides runtime type validation for all data models
 */

import { z } from 'zod';
import {
  StatementCategory,
  SessionCategory,
  TTSEngine,
  TTSErrorType,
  TTSPlaybackStatus,
  PlaybackStatus,
} from './index';

// Base validation schemas
export const BaseEntitySchema = z.object({
  id: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Meditation Statement validation schemas
export const StatementCategorySchema = z.nativeEnum(StatementCategory);

export const StatementTTSSettingsSchema = z.object({
  voice: z.string().optional(),
  rate: z.number().min(0.1).max(2.0).optional(),
  pitch: z.number().min(0.0).max(2.0).optional(),
  volume: z.number().min(0.0).max(1.0).optional(),
  pauseBefore: z.number().min(0).optional(),
  pauseAfter: z.number().min(0).optional(),
});

export const MeditationStatementSchema = BaseEntitySchema.extend({
  text: z.string().min(1).max(1000),
  language: z.string().length(2),
  multiLanguageContent: z.record(
    z.string(),
    z.object({
      text: z.string(),
    })
  ),
  primaryTag: z.string(),
  isUserCreated: z.boolean(),
  createdBy: z.string().optional(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  ttsSettings: StatementTTSSettingsSchema.optional(),
});

export const CreateMeditationStatementInputSchema = z.object({
  text: z.string().min(1).max(1000),
  language: z.string().length(2),
  multiLanguageContent: z.record(
    z.string(),
    z.object({
      text: z.string(),
    })
  ),
  primaryTag: z.string(),
  tags: z.array(z.string()).optional(),
  ttsSettings: StatementTTSSettingsSchema.optional(),
});

export const UpdateMeditationStatementInputSchema = z.object({
  text: z.string().min(1).max(1000).optional(),
  multiLanguageContent: z
    .record(
      z.string(),
      z.object({
        text: z.string(),
      })
    )
    .optional(),
  primaryTag: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  ttsSettings: StatementTTSSettingsSchema.optional(),
});

export const StatementFilterSchema = z.object({
  category: StatementCategorySchema.optional(),
  subcategory: z.string().optional(),
  language: z.string().length(2).optional(),
  tags: z.array(z.string()).optional(),
  isUserCreated: z.boolean().optional(),
  isActive: z.boolean().optional(),
  searchText: z.string().optional(),
});

export const StatementSortSchema = z.object({
  field: z.enum(['createdAt', 'updatedAt', 'text', 'category', 'difficulty']),
  direction: z.enum(['asc', 'desc']),
});

// Meditation Session validation schemas
export const SessionCategorySchema = z.nativeEnum(SessionCategory);

export const BackgroundMusicSettingsSchema = z.object({
  enabled: z.boolean(),
  musicPath: z.any().optional(), // Allow both string URLs and asset objects
  volume: z.number().min(0.0).max(1.0),
  loop: z.boolean(),
  fadeInDuration: z.number().min(0).optional(),
  fadeOutDuration: z.number().min(0).optional(),
});

export const SessionTTSSettingsSchema = z.object({
  voice: z.string().optional(),
  rate: z.number().min(0.1).max(2.0).optional(),
  pitch: z.number().min(0.0).max(2.0).optional(),
  volume: z.number().min(0.0).max(1.0).optional(),
  pauseBetweenStatements: z.number().min(0).optional(),
  useStatementSettings: z.boolean(),
});

export const SessionStatisticsSchema = z.object({
  playCount: z.number().min(0),
  totalTimeSpent: z.number().min(0),
  averageCompletionRate: z.number().min(0.0).max(1.0),
  lastPlayedAt: z.date().optional(),
  userRating: z.number().min(1).max(5).optional(),
  userNotes: z.string().optional(),
});

export const MeditationSessionSchema = BaseEntitySchema.extend({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  language: z.string().length(2),
  category: SessionCategorySchema,
  subcategory: z.string().optional(),
  statementIds: z.array(z.string().uuid()),
  isUserCreated: z.boolean(),
  createdBy: z.string().optional(),
  tags: z.array(z.string()),
  isActive: z.boolean(),
  isTemplate: z.boolean(),
  backgroundMusic: BackgroundMusicSettingsSchema.optional(),
  ttsSettings: SessionTTSSettingsSchema.optional(),
  statistics: SessionStatisticsSchema.optional(),
});

export const CreateMeditationSessionInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  language: z.string().length(2),
  category: SessionCategorySchema,
  subcategory: z.string().optional(),
  statementIds: z.array(z.string().uuid()),
  tags: z.array(z.string()).optional(),
  isTemplate: z.boolean().optional(),
  backgroundMusic: BackgroundMusicSettingsSchema.optional(),
  ttsSettings: SessionTTSSettingsSchema.optional(),
});

export const UpdateMeditationSessionInputSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  category: SessionCategorySchema.optional(),
  subcategory: z.string().optional(),
  statementIds: z.array(z.string().uuid()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  backgroundMusic: BackgroundMusicSettingsSchema.optional(),
  ttsSettings: SessionTTSSettingsSchema.optional(),
});

export const SessionFilterSchema = z.object({
  category: SessionCategorySchema.optional(),
  subcategory: z.string().optional(),
  language: z.string().length(2).optional(),
  tags: z.array(z.string()).optional(),
  isUserCreated: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isTemplate: z.boolean().optional(),
  searchText: z.string().optional(),
  minDuration: z.number().min(0).optional(),
  maxDuration: z.number().min(0).optional(),
});

export const SessionSortSchema = z.object({
  field: z.enum(['createdAt', 'updatedAt', 'name', 'category', 'playCount']),
  direction: z.enum(['asc', 'desc']),
});

export const PlaybackStatusSchema = z.nativeEnum(PlaybackStatus);

export const SessionPlaybackStateSchema = z.object({
  sessionId: z.string().uuid(),
  currentStatementIndex: z.number().min(0),
  status: PlaybackStatusSchema,
  currentPosition: z.number().min(0),
  totalDuration: z.number().min(0),
  backgroundMusicPlaying: z.boolean(),
  startTime: z.date().optional(),
  pauseTime: z.date().optional(),
});

// App Settings validation schemas
export const ThemeSettingsSchema = z.object({
  colorScheme: z.enum(['light', 'dark', 'auto']),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontSize: z.enum(['small', 'medium', 'large', 'extra-large']),
  reducedMotion: z.boolean(),
  highContrast: z.boolean(),
});

export const AudioSettingsSchema = z.object({
  masterVolume: z.number().min(0.0).max(1.0),
  respectSilentMode: z.boolean(),
  allowBackgroundAudio: z.boolean(),
  audioQuality: z.enum(['low', 'medium', 'high']),
  spatialAudio: z.boolean(),
});

export const TTSSettingsSchema = z.object({
  defaultVoice: z.string(),
  defaultRate: z.number().min(0.1).max(2.0),
  defaultPitch: z.number().min(0.0).max(2.0),
  defaultVolume: z.number().min(0.0).max(1.0),
  defaultPauseBetweenStatements: z.number().min(0),
  useStatementSpecificSettings: z.boolean(),
  availableVoices: z.record(z.string(), z.array(z.string())),
});

export const SessionSettingsSchema = z.object({
  defaultSessionDuration: z.number().min(1).max(120),
  showProgress: z.boolean(),
  showTimeRemaining: z.boolean(),
  autoAdvance: z.boolean(),
  loopSessions: z.boolean(),
  defaultBackgroundMusicVolume: z.number().min(0.0).max(1.0),
  useAudioFading: z.boolean(),
  fadeDuration: z.number().min(0).max(10),
});

export const PrivacySettingsSchema = z.object({
  collectAnalytics: z.boolean(),
  collectCrashReports: z.boolean(),
  shareAnonymousData: z.boolean(),
  storeSessionHistory: z.boolean(),
  sessionHistoryRetentionDays: z.number().min(1).max(3650),
  syncAcrossDevices: z.boolean(),
});

export const NotificationSettingsSchema = z.object({
  enabled: z.boolean(),
  dailyReminders: z.boolean(),
  dailyReminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  sessionCompletionNotifications: z.boolean(),
  achievementNotifications: z.boolean(),
  motivationalMessages: z.boolean(),
  quietHoursStart: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  quietHoursEnd: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
});

export const DataSettingsSchema = z.object({
  autoBackup: z.boolean(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']),
  compressBackups: z.boolean(),
  maxStorageUsage: z.number().min(1).max(10000),
  autoCleanOldData: z.boolean(),
  dataRetentionDays: z.number().min(1).max(3650),
});

export const AccessibilitySettingsSchema = z.object({
  screenReaderSupport: z.boolean(),
  voiceControl: z.boolean(),
  largeText: z.boolean(),
  highContrast: z.boolean(),
  reducedMotion: z.boolean(),
  hapticFeedback: z.boolean(),
  hapticIntensity: z.enum(['light', 'medium', 'strong']),
});

export const AppSettingsSchema = z.object({
  language: z.string().length(2),
  theme: ThemeSettingsSchema,
  audio: AudioSettingsSchema,
  tts: TTSSettingsSchema,
  session: SessionSettingsSchema,
  privacy: PrivacySettingsSchema,
  notifications: NotificationSettingsSchema,
  data: DataSettingsSchema,
  accessibility: AccessibilitySettingsSchema,
  updatedAt: z.date(),
});

export const UpdateAppSettingsInputSchema = z.object({
  language: z.string().length(2).optional(),
  theme: ThemeSettingsSchema.partial().optional(),
  audio: AudioSettingsSchema.partial().optional(),
  tts: TTSSettingsSchema.partial().optional(),
  session: SessionSettingsSchema.partial().optional(),
  privacy: PrivacySettingsSchema.partial().optional(),
  notifications: NotificationSettingsSchema.partial().optional(),
  data: DataSettingsSchema.partial().optional(),
  accessibility: AccessibilitySettingsSchema.partial().optional(),
});

// TTS Configuration validation schemas
export const TTSEngineSchema = z.nativeEnum(TTSEngine);

export const TTSEngineConfigSchema = z.object({
  engine: TTSEngineSchema,
  config: z.record(z.string(), z.any()),
  isAvailable: z.boolean(),
  version: z.string().optional(),
});

export const VoiceCharacteristicsSchema = z.object({
  age: z.enum(['child', 'young', 'adult', 'elderly', 'unknown']),
  accent: z.string().optional(),
  style: z.enum([
    'neutral',
    'calm',
    'energetic',
    'soothing',
    'authoritative',
    'friendly',
  ]),
  speedPreference: z.enum(['slow', 'normal', 'fast']),
  pitchPreference: z.enum(['low', 'medium', 'high']),
});

export const TTSVoiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  language: z.string().length(2),
  gender: z.enum(['male', 'female', 'neutral', 'unknown']),
  quality: z.number().min(1).max(5),
  isPremium: z.boolean(),
  characteristics: VoiceCharacteristicsSchema,
  isAvailable: z.boolean(),
});

export const AudioFormatSchema = z.object({
  codec: z.enum(['mp3', 'aac', 'wav', 'ogg']),
  bitrate: z.number().min(64).max(320),
  sampleRate: z.number().min(8000).max(48000),
  channels: z.union([z.literal(1), z.literal(2)]),
});

export const TTSPlaybackConfigSchema = z.object({
  voice: z.string(),
  rate: z.number().min(0.1).max(2.0),
  pitch: z.number().min(0.0).max(2.0),
  volume: z.number().min(0.0).max(1.0),
  language: z.string().length(2),
  useSSML: z.boolean(),
  audioFormat: AudioFormatSchema,
  preloadAudio: z.boolean(),
  maxPreloadDuration: z.number().min(0).max(300),
});

export const TTSCacheConfigSchema = z.object({
  enabled: z.boolean(),
  maxCacheSize: z.number().min(1).max(10000),
  expirationHours: z.number().min(1).max(8760),
  compressAudio: z.boolean(),
  storageLocation: z.enum(['local', 'temp', 'persistent']),
});

export const TTSErrorTypeSchema = z.nativeEnum(TTSErrorType);

export const TTSErrorSchema = z.object({
  type: TTSErrorTypeSchema,
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.string(), z.any()).optional(),
  timestamp: z.date(),
  isRecoverable: z.boolean(),
});

export const TTSPlaybackStatusSchema = z.nativeEnum(TTSPlaybackStatus);

export const TTSPlaybackStateSchema = z.object({
  status: TTSPlaybackStatusSchema,
  currentText: z.string(),
  currentPosition: z.number().min(0),
  totalLength: z.number().min(0),
  currentTime: z.number().min(0),
  totalDuration: z.number().min(0),
  isPlaying: z.boolean(),
  isPaused: z.boolean(),
  isLoading: z.boolean(),
  error: TTSErrorSchema.optional(),
});

export const TTSQueueItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string(),
  config: TTSPlaybackConfigSchema,
  priority: z.number().min(0).max(10),
  interruptible: z.boolean(),
  onStart: z.function().optional(),
  onComplete: z.function().optional(),
  onError: z.function().optional(),
  addedAt: z.date(),
});

export const TTSQueueConfigSchema = z.object({
  maxQueueSize: z.number().min(1).max(1000),
  autoPlayNext: z.boolean(),
  defaultPriority: z.number().min(0).max(10),
  clearOnError: z.boolean(),
  maxRetryAttempts: z.number().min(0).max(10),
});

export const TTSPerformanceMetricsSchema = z.object({
  averageStartTime: z.number().min(0),
  averageGenerationTime: z.number().min(0),
  cacheHitRate: z.number().min(0.0).max(1.0),
  errorRate: z.number().min(0.0).max(1.0),
  successfulPlaybacks: z.number().min(0),
  failedPlaybacks: z.number().min(0),
  lastUpdated: z.date(),
});

// Utility validation functions
export const validateMeditationStatement = (data: unknown) => {
  return MeditationStatementSchema.parse(data);
};

export const validateMeditationSession = (data: unknown) => {
  return MeditationSessionSchema.parse(data);
};

export const validateAppSettings = (data: unknown) => {
  return AppSettingsSchema.parse(data);
};

export const validateTTSPlaybackConfig = (data: unknown) => {
  return TTSPlaybackConfigSchema.parse(data);
};

// Type inference from schemas
export type ValidatedMeditationStatement = z.infer<
  typeof MeditationStatementSchema
>;
export type ValidatedMeditationSession = z.infer<
  typeof MeditationSessionSchema
>;
export type ValidatedAppSettings = z.infer<typeof AppSettingsSchema>;
export type ValidatedTTSPlaybackConfig = z.infer<
  typeof TTSPlaybackConfigSchema
>;
