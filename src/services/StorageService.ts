/**
 * Storage Service
 * Handles data persistence using AsyncStorage with encryption and compression support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import {
  MeditationStatement,
  MeditationSession,
  AppSettings,
  StorageItem,
  StorageConfig,
} from '../types';
import { StereoSession } from '../types/StereoSession';

export class StorageService {
  private static instance: StorageService;
  private config: StorageConfig;
  private isInitialized = false;

  // Storage keys
  private readonly KEYS = {
    STATEMENTS: 'meditation_statements',
    SESSIONS: 'meditation_sessions',
    STEREO_SESSIONS: 'stereo_sessions',
    SETTINGS: 'app_settings',
    USER_DATA: 'user_data',
    CACHE: 'cache_data',
  } as const;

  private constructor() {
    this.config = this.createDefaultConfig();
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  /**
   * Initialize the storage service
   */
  public async initialize(config?: Partial<StorageConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Test storage availability
      await AsyncStorage.getItem('test_key');
      await AsyncStorage.removeItem('test_key');

      this.isInitialized = true;
    } catch (error) {
      logger.error('Failed to initialize StorageService:', error);
      throw new Error(`Storage service initialization failed: ${error}`);
    }
  }

  /**
   * Save meditation statements
   */
  public async saveStatements(
    statements: MeditationStatement[]
  ): Promise<void> {
    await this.ensureInitialized();
    try {
      const storageItem: StorageItem<MeditationStatement[]> = {
        key: this.KEYS.STATEMENTS,
        value: statements,
        timestamp: new Date(),
      };

      const serialized = await this.serialize(storageItem);
      await AsyncStorage.setItem(this.KEYS.STATEMENTS, serialized);
    } catch (error) {
      logger.error('Failed to save statements:', error);
      throw new Error(`Failed to save statements: ${error}`);
    }
  }

  /**
   * Load meditation statements
   */
  public async loadStatements(): Promise<MeditationStatement[]> {
    await this.ensureInitialized();
    try {
      const serialized = await AsyncStorage.getItem(this.KEYS.STATEMENTS);
      if (!serialized) {
        return [];
      }

      const storageItem =
        await this.deserialize<MeditationStatement[]>(serialized);
      return storageItem.value;
    } catch (error) {
      logger.error('Failed to load statements:', error);
      return [];
    }
  }

  /**
   * Save meditation sessions
   */
  public async saveSessions(sessions: MeditationSession[]): Promise<void> {
    await this.ensureInitialized();
    try {
      const storageItem: StorageItem<MeditationSession[]> = {
        key: this.KEYS.SESSIONS,
        value: sessions,
        timestamp: new Date(),
      };

      const serialized = await this.serialize(storageItem);
      await AsyncStorage.setItem(this.KEYS.SESSIONS, serialized);
    } catch (error) {
      logger.error('Failed to save sessions:', error);
      throw new Error(`Failed to save sessions: ${error}`);
    }
  }

  /**
   * Load meditation sessions
   */
  public async loadSessions(): Promise<MeditationSession[]> {
    await this.ensureInitialized();
    try {
      const serialized = await AsyncStorage.getItem(this.KEYS.SESSIONS);
      if (!serialized) {
        return [];
      }

      const storageItem =
        await this.deserialize<MeditationSession[]>(serialized);
      return storageItem.value;
    } catch (error) {
      logger.error('Failed to load sessions:', error);
      return [];
    }
  }

  /**
   * Save app settings
   */
  public async saveSettings(settings: AppSettings): Promise<void> {
    await this.ensureInitialized();
    try {
      const storageItem: StorageItem<AppSettings> = {
        key: this.KEYS.SETTINGS,
        value: settings,
        timestamp: new Date(),
      };

      const serialized = await this.serialize(storageItem);
      await AsyncStorage.setItem(this.KEYS.SETTINGS, serialized);
    } catch (error) {
      logger.error('Failed to save settings:', error);
      throw new Error(`Failed to save settings: ${error}`);
    }
  }

  /**
   * Load app settings
   */
  public async loadSettings(): Promise<AppSettings | null> {
    await this.ensureInitialized();
    try {
      const serialized = await AsyncStorage.getItem(this.KEYS.SETTINGS);
      if (!serialized) {
        logger.debug('StorageService: No settings found, returning null');
        return null;
      }

      const storageItem = await this.deserialize<AppSettings>(serialized);
      const settings = storageItem.value;

      logger.debug('StorageService: Raw loaded settings:', settings);

      // Migrate old settings to include voicesPerLanguage if missing
      if (settings && settings.tts && !settings.tts.voicesPerLanguage) {
        logger.debug(
          'StorageService: Migrating old settings to include voicesPerLanguage'
        );
        settings.tts.voicesPerLanguage = {
          en: settings.tts.defaultVoice || 'default',
          de: settings.tts.defaultVoice || 'default',
          zh: settings.tts.defaultVoice || 'default',
        };
        logger.debug(
          'StorageService: Migrated voicesPerLanguage:',
          settings.tts.voicesPerLanguage
        );
        // Save the migrated settings
        await this.saveSettings(settings);
        logger.debug('StorageService: Migrated settings saved');
      } else if (settings && settings.tts && settings.tts.voicesPerLanguage) {
        logger.debug(
          'StorageService: voicesPerLanguage already exists:',
          settings.tts.voicesPerLanguage
        );
      }

      // Clear defaultVoice if it's not 'default' since we're now using voicesPerLanguage
      if (
        settings &&
        settings.tts &&
        settings.tts.defaultVoice &&
        settings.tts.defaultVoice !== 'default'
      ) {
        logger.debug(
          'StorageService: Clearing old defaultVoice:',
          settings.tts.defaultVoice
        );
        settings.tts.defaultVoice = 'default';
        await this.saveSettings(settings);
        logger.debug('StorageService: Cleared defaultVoice and saved settings');
      }

      logger.debug('StorageService: Final settings being returned:', settings);
      return settings;
    } catch (error) {
      logger.error('Failed to load settings:', error);
      return null;
    }
  }

  /**
   * Save a single statement
   */
  public async saveStatement(statement: MeditationStatement): Promise<void> {
    const statements = await this.loadStatements();
    const existingIndex = statements.findIndex(s => s.id === statement.id);

    if (existingIndex >= 0) {
      statements[existingIndex] = statement;
    } else {
      statements.push(statement);
    }

    await this.saveStatements(statements);
  }

  /**
   * Delete a statement
   */
  public async deleteStatement(statementId: string): Promise<void> {
    const statements = await this.loadStatements();
    const filtered = statements.filter(s => s.id !== statementId);
    await this.saveStatements(filtered);
  }

  /**
   * Save a single session
   */
  public async saveSession(session: MeditationSession): Promise<void> {
    const sessions = await this.loadSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);

    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    await this.saveSessions(sessions);
  }

  /**
   * Delete a session
   */
  public async deleteSession(sessionId: string): Promise<void> {
    const sessions = await this.loadSessions();
    const filtered = sessions.filter(s => s.id !== sessionId);
    await this.saveSessions(filtered);
  }

  /**
   * Get storage usage information
   */
  public async getStorageInfo(): Promise<{
    totalKeys: number;
    estimatedSize: number;
    keys: string[];
  }> {
    await this.ensureInitialized();
    try {
      const keys = await AsyncStorage.getAllKeys();
      let estimatedSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          estimatedSize += value.length;
        }
      }

      return {
        totalKeys: keys.length,
        estimatedSize,
        keys: [...keys],
      };
    } catch (error) {
      logger.error('Failed to get storage info:', error);
      return { totalKeys: 0, estimatedSize: 0, keys: [] };
    }
  }

  /**
   * Clear specific data type
   */
  public async clearData(
    type: 'statements' | 'sessions' | 'settings'
  ): Promise<void> {
    await this.ensureInitialized();
    try {
      const key = this.KEYS[type.toUpperCase() as keyof typeof this.KEYS];
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error(`Failed to clear ${type} data:`, error);
      throw new Error(`Failed to clear ${type} data: ${error}`);
    }
  }

  /**
   * Export all data for backup
   */
  public async exportData(): Promise<{
    statements: MeditationStatement[];
    sessions: MeditationSession[];
    settings: AppSettings | null;
    exportDate: Date;
  }> {
    await this.ensureInitialized();
    try {
      const [statements, sessions, settings] = await Promise.all([
        this.loadStatements(),
        this.loadSessions(),
        this.loadSettings(),
      ]);

      return {
        statements,
        sessions,
        settings,
        exportDate: new Date(),
      };
    } catch (error) {
      logger.error('Failed to export data:', error);
      throw new Error(`Failed to export data: ${error}`);
    }
  }

  /**
   * Import data from backup
   */
  public async importData(data: {
    statements?: MeditationStatement[];
    sessions?: MeditationSession[];
    settings?: AppSettings;
  }): Promise<void> {
    await this.ensureInitialized();
    try {
      const promises: Promise<void>[] = [];

      if (data.statements) {
        promises.push(this.saveStatements(data.statements));
      }

      if (data.sessions) {
        promises.push(this.saveSessions(data.sessions));
      }

      if (data.settings) {
        promises.push(this.saveSettings(data.settings));
      }

      await Promise.all(promises);
    } catch (error) {
      logger.error('Failed to import data:', error);
      throw new Error(`Failed to import data: ${error}`);
    }
  }

  /**
   * Clean up old data based on retention policy
   */
  public async cleanupOldData(): Promise<void> {
    await this.ensureInitialized();
    try {
      const now = new Date();
      const retentionDays = this.config.dataRetentionDays || 365;
      const cutoffDate = new Date(
        now.getTime() - retentionDays * 24 * 60 * 60 * 1000
      );

      // Clean up old statements
      const statements = await this.loadStatements();
      const filteredStatements = statements.filter(
        s => s.createdAt >= cutoffDate
      );
      if (filteredStatements.length !== statements.length) {
        await this.saveStatements(filteredStatements);
      }

      // Clean up old sessions
      const sessions = await this.loadSessions();
      const filteredSessions = sessions.filter(s => s.createdAt >= cutoffDate);
      if (filteredSessions.length !== sessions.length) {
        await this.saveSessions(filteredSessions);
      }
    } catch (error) {
      logger.error('Failed to cleanup old data:', error);
      throw new Error(`Failed to cleanup old data: ${error}`);
    }
  }

  // Private methods

  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  private createDefaultConfig(): StorageConfig {
    return {
      maxSize: 50 * 1024 * 1024, // 50MB
      compressionEnabled: false,
      encryptionEnabled: false,
      backupEnabled: true,
      dataRetentionDays: 365,
    };
  }

  private async serialize<T>(item: StorageItem<T>): Promise<string> {
    let data = JSON.stringify(item);

    // Apply compression if enabled
    if (this.config.compressionEnabled) {
      // In a real implementation, you would use a compression library
      // For now, we'll just return the JSON string
    }

    // Apply encryption if enabled
    if (this.config.encryptionEnabled) {
      // In a real implementation, you would use an encryption library
      // For now, we'll just return the data as-is
    }

    return data;
  }

  private async deserialize<T>(data: string): Promise<StorageItem<T>> {
    let item: StorageItem<T>;

    // Apply decryption if enabled
    if (this.config.encryptionEnabled) {
      // In a real implementation, you would decrypt the data
    }

    // Apply decompression if enabled
    if (this.config.compressionEnabled) {
      // In a real implementation, you would decompress the data
    }

    try {
      item = JSON.parse(data);

      // Convert date strings back to Date objects for sessions
      if (item.value && Array.isArray(item.value)) {
        (item as any).value = (item.value as any[]).map((session: any) => {
          if (session.createdAt && typeof session.createdAt === 'string') {
            session.createdAt = new Date(session.createdAt);
          }
          if (session.updatedAt && typeof session.updatedAt === 'string') {
            session.updatedAt = new Date(session.updatedAt);
          }
          return session;
        });
      }
    } catch (error) {
      throw new Error(`Failed to deserialize data: ${error}`);
    }

    return item;
  }

  /**
   * Load stereo sessions from storage
   */
  public async loadStereoSessions(): Promise<StereoSession[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.STEREO_SESSIONS);
      if (data) {
        const sessions = JSON.parse(data);
        return Array.isArray(sessions) ? sessions : [];
      }
      return [];
    } catch (error) {
      logger.error('StorageService: Failed to load stereo sessions:', error);
      return [];
    }
  }

  /**
   * Save stereo sessions to storage
   */
  public async saveStereoSessions(sessions: StereoSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.STEREO_SESSIONS,
        JSON.stringify(sessions)
      );
    } catch (error) {
      logger.error('StorageService: Failed to save stereo sessions:', error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   */
  public async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(this.KEYS.STATEMENTS),
        AsyncStorage.removeItem(this.KEYS.SESSIONS),
        AsyncStorage.removeItem(this.KEYS.STEREO_SESSIONS),
        AsyncStorage.removeItem(this.KEYS.SETTINGS),
        AsyncStorage.removeItem(this.KEYS.USER_DATA),
        AsyncStorage.removeItem(this.KEYS.CACHE),
      ]);
    } catch (error) {
      logger.error('StorageService: Failed to clear all data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();
