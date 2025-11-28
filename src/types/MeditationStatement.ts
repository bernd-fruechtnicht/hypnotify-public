/**
 * Core meditation statement interface
 * Represents a single statement that can be used in meditation sessions
 */
export interface MeditationStatement {
  /** Unique identifier for the statement */
  id: string;

  /** The text content of the statement (deprecated - use multiLanguageContent instead) */
  text: string;

  /** Language code (deprecated - use multiLanguageContent instead) */
  language: string;

  /** Multi-language content for the statement */
  multiLanguageContent: {
    [languageCode: string]: {
      text: string;
    };
  };

  /** Primary tag for main categorization (first tag in tags array) */
  primaryTag: string;

  /** Whether this is a user-created statement */
  isUserCreated: boolean;

  /** User who created this statement (if user-created) */
  createdBy?: string;

  /** Creation timestamp */
  createdAt: Date;

  /** Last modification timestamp */
  updatedAt: Date;

  /** Tags for search and filtering (first tag is primary) */
  tags: string[];

  /** Whether this statement is active/available for use */
  isActive: boolean;

  /** Custom TTS settings for this statement */
  ttsSettings?: StatementTTSSettings;
}

/**
 * Categories for organizing meditation statements
 */
export enum StatementCategory {
  BREATHING = 'breathing',
  RELAXATION = 'relaxation',
  MINDFULNESS = 'mindfulness',
  VISUALIZATION = 'visualization',
  AFFIRMATION = 'affirmation',
  BODY_SCAN = 'body_scan',
  LOVING_KINDNESS = 'loving_kindness',
  SLEEP = 'sleep',
  ANXIETY = 'anxiety',
  STRESS = 'stress',
  FOCUS = 'focus',
  GRATITUDE = 'gratitude',
  SELF_CARE = 'self_care',
  HEALING = 'healing',
  CUSTOM = 'custom',
}

/**
 * TTS-specific settings for individual statements
 */
export interface StatementTTSSettings {
  /** Voice to use for this statement */
  voice?: string;

  /** Speech rate (0.1 - 2.0) */
  rate?: number;

  /** Speech pitch (0.0 - 2.0) */
  pitch?: number;

  /** Speech volume (0.0 - 1.0) */
  volume?: number;

  /** Pause duration before this statement (in seconds) */
  pauseBefore?: number;

  /** Pause duration after this statement (in seconds) */
  pauseAfter?: number;
}

/**
 * Get localized statement text for a given language
 */
export const getStatementText = (
  statement: MeditationStatement,
  language: string
): string => {
  if (statement.multiLanguageContent?.[language]?.text) {
    return statement.multiLanguageContent[language].text;
  }
  // Fallback to first available language if requested language not found
  const availableLanguages = Object.keys(statement.multiLanguageContent || {});
  if (availableLanguages.length > 0) {
    return statement.multiLanguageContent![availableLanguages[0]].text;
  }
  return '';
};

/**
 * Get all available languages for a statement
 */
export const getStatementLanguages = (
  statement: MeditationStatement
): string[] => {
  return Object.keys(statement.multiLanguageContent || {});
};

/**
 * Check if a statement has content for a specific language
 */
export const hasStatementLanguage = (
  statement: MeditationStatement,
  language: string
): boolean => {
  return !!statement.multiLanguageContent?.[language]?.text;
};

/**
 * Input type for creating new statements
 */
export interface CreateMeditationStatementInput {
  text?: string; // Deprecated - use multiLanguageContent instead
  language?: string; // Deprecated - use multiLanguageContent instead
  multiLanguageContent: {
    [languageCode: string]: {
      text: string;
    };
  };
  primaryTag: string;
  tags?: string[]; // First tag should match primaryTag
  ttsSettings?: StatementTTSSettings;
}

/**
 * Input type for updating existing statements
 */
export interface UpdateMeditationStatementInput {
  text?: string;
  category?: StatementCategory;
  subcategory?: string;
  tags?: string[];
  isActive?: boolean;
  ttsSettings?: StatementTTSSettings;
}

/**
 * Filter options for searching statements
 */
export interface StatementFilter {
  category?: StatementCategory;
  subcategory?: string;
  language?: string;
  tags?: string[];
  isUserCreated?: boolean;
  isActive?: boolean;
  searchText?: string;
}

/**
 * Sort options for statement lists
 */
export interface StatementSort {
  field: 'createdAt' | 'updatedAt' | 'text' | 'category';
  direction: 'asc' | 'desc';
}
