/**
 * Translation Service
 *
 * Provides text translation using cloud-based translation providers
 * with caching, error handling, and language detection
 *
 * Follows the established service patterns in the codebase
 */

// import { Platform } from 'react-native';
import { logger } from '../utils/logger';

export interface TranslationOptions {
  /** Text to translate */
  text: string;

  /** Source language code (auto-detect if not provided) */
  sourceLanguage?: string;

  /** Target language code */
  targetLanguage: string;

  /** Whether to use cache */
  useCache?: boolean;

  /** Cache TTL in milliseconds */
  cacheTTL?: number;
}

export interface TranslationResult {
  /** Translated text */
  translatedText: string;

  /** Detected source language */
  detectedLanguage?: string;

  /** Confidence score (0-1) */
  confidence?: number;

  /** Whether result was from cache */
  fromCache: boolean;

  /** Processing time in milliseconds */
  processingTime: number;
}

export interface TranslationState {
  /** Whether the service is initialized */
  isInitialized: boolean;

  /** Current translation statistics */
  statistics: {
    totalTranslations: number;
    successfulTranslations: number;
    failedTranslations: number;
    cacheHits: number;
    averageProcessingTime: number;
  };
}

export class TranslationService {
  private static instance: TranslationService;
  private state: TranslationState;
  private translationCache: Map<string, TranslationResult>;
  private isInitialized = false;

  // Event listeners
  private stateChangeListeners: ((state: TranslationState) => void)[] = [];
  private errorListeners: ((error: Error) => void)[] = [];

  private constructor() {
    this.state = this.createInitialState();
    this.translationCache = new Map();
  }

  public static getInstance(): TranslationService {
    if (!TranslationService.instance) {
      TranslationService.instance = new TranslationService();
    }
    return TranslationService.instance;
  }

  /**
   * Initialize the translation service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    logger.debug('TranslationService: Initializing...');

    try {
      // Initialize any required services
      this.isInitialized = true;
      this.updateState({ isInitialized: true });

      logger.debug('TranslationService: Initialized successfully');
    } catch (error) {
      logger.error('TranslationService: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Translate text from one language to another
   */
  public async translate(
    options: TranslationOptions
  ): Promise<TranslationResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const startTime = Date.now();
    const cacheKey = this.createCacheKey(options);

    try {
      // Check cache first
      if (options.useCache !== false) {
        const cachedResult = this.translationCache.get(cacheKey);
        if (cachedResult && this.isCacheValid(cachedResult, options.cacheTTL)) {
          logger.debug('TranslationService: Cache hit for translation');
          this.updateStatistics({ cacheHits: 1 });
          return {
            ...cachedResult,
            fromCache: true,
            processingTime: Date.now() - startTime,
          };
        }
      }

      logger.debug(
        'TranslationService: Translating text:',
        options.text.substring(0, 50) + '...'
      );
      logger.debug(
        'TranslationService: From',
        options.sourceLanguage || 'auto',
        'to',
        options.targetLanguage
      );

      // Perform translation
      const result = await this.performTranslation(options);

      // Cache the result
      if (options.useCache !== false) {
        this.translationCache.set(cacheKey, result);
      }

      // Update statistics
      this.updateStatistics({
        totalTranslations: 1,
        successfulTranslations: 1,
        averageProcessingTime: Date.now() - startTime,
      });

      return {
        ...result,
        fromCache: false,
        processingTime: Date.now() - startTime,
      };
    } catch (error) {
      logger.error('TranslationService: Translation failed:', error);
      this.updateStatistics({ failedTranslations: 1 });
      this.notifyErrorListeners(error as Error);
      throw error;
    }
  }

  /**
   * Detect the language of the given text
   */
  public async detectLanguage(
    text: string
  ): Promise<{ language: string; confidence: number }> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Use Google Translate API for language detection
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${this.getApiKey()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Language detection failed: ${response.status}`);
      }

      const data = await response.json();
      const detection = data.data.detections[0][0];

      return {
        language: detection.language,
        confidence: detection.confidence,
      };
    } catch (error) {
      logger.error('TranslationService: Language detection failed:', error);
      throw error;
    }
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): string[] {
    return [
      'en',
      'en-US',
      'en-GB',
      'de',
      'de-DE',
      'fr',
      'fr-FR',
      'es',
      'es-ES',
      'it',
      'it-IT',
      'pt',
      'pt-BR',
      'ru',
      'ru-RU',
      'zh',
      'zh-CN',
      'zh-TW',
      'ja',
      'ja-JP',
      'ko',
      'ko-KR',
      'ar',
      'ar-SA',
      'hi',
      'hi-IN',
      'th',
      'th-TH',
      'vi',
      'vi-VN',
      'nl',
      'nl-NL',
      'sv',
      'sv-SE',
      'no',
      'nb-NO',
      'da',
      'da-DK',
      'fi',
      'fi-FI',
      'pl',
      'pl-PL',
      'tr',
      'tr-TR',
      'he',
      'he-IL',
      'uk',
      'uk-UA',
    ];
  }

  /**
   * Get service state
   */
  public getState(): TranslationState {
    return { ...this.state };
  }

  /**
   * Add state change listener
   */
  public addStateListener(
    listener: (state: TranslationState) => void
  ): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      const index = this.stateChangeListeners.indexOf(listener);
      if (index > -1) {
        this.stateChangeListeners.splice(index, 1);
      }
    };
  }

  /**
   * Add error listener
   */
  public addErrorListener(listener: (error: Error) => void): () => void {
    this.errorListeners.push(listener);
    return () => {
      const index = this.errorListeners.indexOf(listener);
      if (index > -1) {
        this.errorListeners.splice(index, 1);
      }
    };
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    this.translationCache.clear();
    this.stateChangeListeners = [];
    this.errorListeners = [];
    this.isInitialized = false;
  }

  // Private methods

  private createInitialState(): TranslationState {
    return {
      isInitialized: false,
      statistics: {
        totalTranslations: 0,
        successfulTranslations: 0,
        failedTranslations: 0,
        cacheHits: 0,
        averageProcessingTime: 0,
      },
    };
  }

  private createCacheKey(options: TranslationOptions): string {
    return `${options.sourceLanguage || 'auto'}-${options.targetLanguage}-${options.text}`;
  }

  private isCacheValid(result: TranslationResult, ttl?: number): boolean {
    if (!ttl) return true;
    return Date.now() - result.processingTime < ttl;
  }

  private async performTranslation(
    options: TranslationOptions
  ): Promise<TranslationResult> {
    try {
      // Use Google Translate API
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${this.getApiKey()}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: options.text,
            source: options.sourceLanguage || 'auto',
            target: options.targetLanguage,
            format: 'text',
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }

      const data = await response.json();
      const translation = data.data.translations[0];

      return {
        translatedText: translation.translatedText,
        detectedLanguage: translation.detectedSourceLanguage,
        confidence: 1.0, // Google Translate doesn't provide confidence scores
        fromCache: false,
        processingTime: 0,
      };
    } catch (error) {
      logger.error('TranslationService: Translation API error:', error);
      throw error;
    }
  }

  private getApiKey(): string {
    // In a real implementation, this would come from environment variables
    return process.env.EXPO_PUBLIC_GOOGLE_TRANSLATE_API_KEY || '';
  }

  private updateState(newState: Partial<TranslationState>): void {
    this.state = { ...this.state, ...newState };
    this.stateChangeListeners.forEach(listener => listener(this.state));
  }

  private updateStatistics(
    updates: Partial<TranslationState['statistics']>
  ): void {
    const newStats = { ...this.state.statistics, ...updates };

    // Calculate average processing time
    if (updates.averageProcessingTime) {
      const total = this.state.statistics.totalTranslations;
      const current = this.state.statistics.averageProcessingTime;
      newStats.averageProcessingTime =
        (current * total + updates.averageProcessingTime) / (total + 1);
    }

    this.updateState({ statistics: newStats });
  }

  private notifyErrorListeners(error: Error): void {
    this.errorListeners.forEach(listener => listener(error));
  }
}

// Export singleton instance
export const translationService = TranslationService.getInstance();
