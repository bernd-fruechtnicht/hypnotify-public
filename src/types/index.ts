/**
 * Type definitions for Hypnotify meditation app
 * Central export file for all TypeScript interfaces and types
 */

// Meditation Statement types
export * from './MeditationStatement';

// Meditation Session types
export * from './MeditationSession';

// App Settings types
export * from './AppSettings';

// TTS Configuration types
export * from './TTSConfig';

// Stereo Session types
export * from './StereoSession';

// Common utility types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  validationErrors?: ValidationError[];
}

// Language and localization types
export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export interface TranslationKey {
  key: string;
  namespace: string;
  defaultValue?: string;
}

// Audio and media types
export interface AudioFile {
  id: string;
  name: string;
  path: string;
  duration: number;
  format: string;
  size: number;
  createdAt: Date;
}

export interface MediaPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

// User and authentication types
export interface User {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
  preferences: Partial<import('./AppSettings').AppSettings>;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  preferences: import('./AppSettings').AppSettings;
  statistics: UserStatistics;
}

export interface UserStatistics {
  totalSessionsCompleted: number;
  totalTimeSpent: number;
  favoriteCategory: string;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  progress: number;
  maxProgress: number;
}

// Navigation types
export interface NavigationRoute {
  name: string;
  params?: Record<string, any>;
}

export interface TabBarIcon {
  focused: boolean;
  color: string;
  size: number;
}

// Theme types
export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

export interface Typography {
  h1: TextStyle;
  h2: TextStyle;
  h3: TextStyle;
  body: TextStyle;
  caption: TextStyle;
  button: TextStyle;
}

export interface TextStyle {
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing?: number;
}

// Storage types
export interface StorageItem<T = any> {
  key: string;
  value: T;
  timestamp: Date;
  expiresAt?: Date;
}

export interface StorageConfig {
  maxSize: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupEnabled: boolean;
  dataRetentionDays?: number;
}

// Event types
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
}

export interface EventListener {
  eventType: string;
  callback: (event: AppEvent) => void;
  once?: boolean;
}

// Error handling types
export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export interface ErrorReport {
  error: Error;
  errorInfo: any;
  userId?: string;
  timestamp: Date;
  context: Record<string, any>;
}

// Performance monitoring types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  sessionId: string;
  userId?: string;
  timestamp: Date;
}
