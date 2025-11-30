/**
 * Cloud TTS Service
 *
 * Provides text-to-speech synthesis using cloud-based TTS providers
 * with caching, error handling, and performance monitoring
 *
 * Follows the established service patterns in the codebase
 */

// import { Platform } from 'react-native';
import {
  CloudTTSConfig,
  CloudTTSResult,
  AudioCacheEntry,
} from '../types/StereoSession';
import { logger } from '../utils/logger';

// Define ApiError locally
interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface CloudTTSOptions {
  /** Text to synthesize */
  text: string;

  /** Voice to use */
  voice?: string;

  /** Type for voice selection and stereo panning */
  type?: 'rational' | 'emotional';

  /** Language code */
  language?: string;

  /** Speech rate (0.1 - 2.0) */
  rate?: number;

  /** Speech pitch (0.0 - 2.0) */
  pitch?: number;

  /** Speech volume (0.0 - 1.0) */
  volume?: number;

  /** Whether to use cache */
  useCache?: boolean;

  /** Cache TTL in milliseconds */
  cacheTTL?: number;
}

export interface CloudTTSState {
  /** Whether the service is initialized */
  isInitialized: boolean;

  /** Whether a request is in progress */
  isLoading: boolean;

  /** Last error */
  error?: string;

  /** Cache statistics */
  cacheStats: {
    hits: number;
    misses: number;
    size: number;
    hitRate: number;
  };

  /** Performance metrics */
  performance: {
    averageResponseTime: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
  };
}

export class CloudTTSService {
  private static instance: CloudTTSService;
  private config: CloudTTSConfig;
  private state: CloudTTSState;
  private audioCache: Map<string, AudioCacheEntry>;
  private isInitialized = false;

  // Event listeners
  private stateChangeListeners: ((state: CloudTTSState) => void)[] = [];
  private errorListeners: ((error: ApiError) => void)[] = [];

  private constructor() {
    this.config = this.createDefaultConfig();
    this.state = this.createInitialState();
    this.audioCache = new Map();
  }

  public static getInstance(): CloudTTSService {
    if (!CloudTTSService.instance) {
      CloudTTSService.instance = new CloudTTSService();
    }
    return CloudTTSService.instance;
  }

  /**
   * Initialize the Cloud TTS service
   */
  public async initialize(config?: Partial<CloudTTSConfig>): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.debug('CloudTTSService: Initializing...');

      if (config) {
        this.config = { ...this.config, ...config };
      }

      // Validate configuration
      this.validateConfig();

      // Load cache from storage if available
      await this.loadCacheFromStorage();

      this.isInitialized = true;
      this.updateState({ isInitialized: true });

      logger.debug('CloudTTSService: Initialized successfully');
    } catch (error) {
      const apiError = this.createApiError(
        'INITIALIZATION_FAILED',
        `Failed to initialize Cloud TTS service: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Synthesize text to audio using cloud TTS
   */
  public async synthesize(options: CloudTTSOptions): Promise<CloudTTSResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Check configuration early and provide clear error message
    if (!this.config.endpoint || !this.config.endpoint.trim()) {
      const errorMessage =
        'Supabase Edge Function endpoint not configured. ' +
        'Please set EXPO_PUBLIC_SUPABASE_FUNCTION_URL in your .env file for local development, ' +
        'or configure it in your deployment environment (e.g., Vercel). ' +
        'See STEREO_SETUP.md for setup instructions.';

      const apiError = this.createApiError(
        'CONFIGURATION_MISSING',
        errorMessage,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }

    const startTime = Date.now();
    this.updateState({ isLoading: true, error: undefined });

    try {
      logger.debug(
        'CloudTTSService: Synthesizing text:',
        options.text.substring(0, 50) + '...'
      );

      // Check cache first
      if (options.useCache !== false) {
        const cachedResult = this.getCachedAudio(options);
        if (cachedResult) {
          logger.debug('CloudTTSService: Cache hit');
          this.updateCacheStats(true);
          this.updatePerformanceMetrics(Date.now() - startTime, true);
          this.updateState({ isLoading: false });
          return cachedResult;
        }
      }

      logger.debug('CloudTTSService: Cache miss, calling cloud API');
      this.updateCacheStats(false);

      // Call cloud TTS API
      const result = await this.callCloudTTSAPI(options);

      // Cache the result
      if (options.useCache !== false) {
        this.cacheAudio(options, result);
      }

      this.updatePerformanceMetrics(Date.now() - startTime, true);
      this.updateState({ isLoading: false });

      logger.debug('CloudTTSService: Synthesis completed successfully');
      return result;
    } catch (error) {
      this.updatePerformanceMetrics(Date.now() - startTime, false);
      this.updateState({ isLoading: false });

      const apiError = this.createApiError(
        'SYNTHESIS_FAILED',
        `TTS synthesis failed: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Get current service state
   */
  public getState(): CloudTTSState {
    return { ...this.state };
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return { ...this.state.cacheStats };
  }

  /**
   * Get performance metrics
   */
  public getPerformanceMetrics() {
    return { ...this.state.performance };
  }

  /**
   * Clear audio cache
   */
  public clearCache(): void {
    this.audioCache.clear();
    this.updateState({
      cacheStats: {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
      },
    });
    logger.debug('CloudTTSService: Cache cleared');
  }

  /**
   * Add state change listener
   */
  public addStateChangeListener(
    listener: (state: CloudTTSState) => void
  ): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Remove state change listener
   */
  public removeStateChangeListener(
    listener: (state: CloudTTSState) => void
  ): void {
    const index = this.stateChangeListeners.indexOf(listener);
    if (index > -1) {
      this.stateChangeListeners.splice(index, 1);
    }
  }

  /**
   * Add error listener
   */
  public addErrorListener(listener: (error: ApiError) => void): void {
    this.errorListeners.push(listener);
  }

  /**
   * Remove error listener
   */
  public removeErrorListener(listener: (error: ApiError) => void): void {
    const index = this.errorListeners.indexOf(listener);
    if (index > -1) {
      this.errorListeners.splice(index, 1);
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    await this.saveCacheToStorage();
    this.stateChangeListeners = [];
    this.errorListeners = [];
    this.isInitialized = false;
    logger.debug('CloudTTSService: Cleaned up');
  }

  // Private methods

  private createDefaultConfig(): CloudTTSConfig {
    // Use Environment Variables for Supabase configuration
    // These should be set via EXPO_PUBLIC_SUPABASE_FUNCTION_URL and EXPO_PUBLIC_SUPABASE_API_KEY
    const supabaseFunctionUrl =
      process.env.EXPO_PUBLIC_SUPABASE_FUNCTION_URL || '';

    const supabaseApiKey = process.env.EXPO_PUBLIC_SUPABASE_API_KEY || '';

    if (supabaseFunctionUrl) {
      logger.debug(
        'CloudTTSService: Using Supabase Edge Function URL from environment:',
        supabaseFunctionUrl
      );
    } else {
      logger.warn(
        'CloudTTSService: EXPO_PUBLIC_SUPABASE_FUNCTION_URL not set. Cloud TTS will not be available.'
      );
    }

    if (supabaseApiKey) {
      logger.debug(
        'CloudTTSService: Supabase API Key is set (length:',
        supabaseApiKey.length,
        'characters)'
      );
    } else {
      logger.error(
        'CloudTTSService: EXPO_PUBLIC_SUPABASE_API_KEY is NOT set! This will cause 401 errors.'
      );
    }

    return {
      provider: 'google',
      endpoint: supabaseFunctionUrl,
      apiKey: supabaseApiKey,
      defaultVoice: {
        language: 'en',
        name: 'default',
        gender: 'male',
      },
      audioFormat: {
        codec: 'mp3',
        bitrate: 128,
        sampleRate: 22050,
        channels: 2, // Stereo output
      },
      timeout: 30000,
      maxRetries: 3,
    };
  }

  private createInitialState(): CloudTTSState {
    return {
      isInitialized: false,
      isLoading: false,
      cacheStats: {
        hits: 0,
        misses: 0,
        size: 0,
        hitRate: 0,
      },
      performance: {
        averageResponseTime: 0,
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
      },
    };
  }

  private validateConfig(): void {
    if (!this.config.apiKey) {
      logger.warn(
        'CloudTTSService: No API key configured. Cloud TTS will not be available. Using fallback audio files.'
      );
      return; // Don't throw error, just warn and continue
    }

    if (!this.config.endpoint) {
      logger.warn(
        'CloudTTSService: No endpoint configured. Cloud TTS will not be available. Using fallback audio files.'
      );
      return; // Don't throw error, just warn and continue
    }
  }

  private async callCloudTTSAPI(
    options: CloudTTSOptions
  ): Promise<CloudTTSResult> {
    // This check should not be necessary here since we check earlier,
    // but keeping it as a safety measure
    if (!this.config.endpoint || !this.config.endpoint.trim()) {
      throw new Error(
        'Supabase Edge Function endpoint not configured. Please check your Supabase project setup.'
      );
    }

    const requestBody = {
      text: options.text,
      language: options.language || 'en',
      type: options.type,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API key if available (for Supabase Edge Functions)
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      logger.debug(
        'CloudTTSService: Authorization header set (API key length:',
        this.config.apiKey.length,
        'characters)'
      );
    } else {
      logger.error(
        'CloudTTSService: WARNING - No API key configured! Request will fail with 401.'
      );
    }

    logger.debug(
      'CloudTTSService: Calling Supabase Edge Function:',
      this.config.endpoint
    );
    logger.debug('CloudTTSService: Request body:', requestBody);
    logger.debug('CloudTTSService: Language being sent:', requestBody.language);
    // Headers are not logged for security reasons (contains API key)

    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Supabase Edge Function error: ${response.status} ${errorText}`
      );
    }

    // Supabase now returns binary audio directly, not JSON
    const audioBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to base64 using a Unicode-safe method
    const audioContent = this.arrayBufferToBase64(audioBuffer);

    return {
      audioContent,
      text: options.text,
      voice: requestBody.type || 'default',
      language: requestBody.language,
      format: this.config.audioFormat.codec,
      generatedAt: new Date(),
    };
  }

  private getCachedAudio(options: CloudTTSOptions): CloudTTSResult | null {
    const cacheKey = this.generateCacheKey(options);
    const cached = this.audioCache.get(cacheKey);

    if (!cached) {
      return null;
    }

    // Check if cache entry is expired
    const now = Date.now();
    const cacheAge = now - cached.createdAt.getTime();
    const ttl = options.cacheTTL || 24 * 60 * 60 * 1000; // Default 24 hours

    if (cacheAge > ttl) {
      this.audioCache.delete(cacheKey);
      return null;
    }

    // Update access statistics
    cached.lastAccessedAt = new Date();
    cached.accessCount++;

    return {
      audioContent: cached.audioContent,
      text: cached.text,
      voice: cached.voice,
      language: cached.language,
      format: this.config.audioFormat.codec,
      generatedAt: cached.createdAt,
    };
  }

  private cacheAudio(options: CloudTTSOptions, result: CloudTTSResult): void {
    const cacheKey = this.generateCacheKey(options);

    const cacheEntry: AudioCacheEntry = {
      key: cacheKey,
      audioContent: result.audioContent,
      text: options.text,
      voice: result.voice,
      language: result.language,
      createdAt: new Date(),
      lastAccessedAt: new Date(),
      accessCount: 1,
    };

    this.audioCache.set(cacheKey, cacheEntry);

    // Limit cache size (keep most recently accessed entries)
    if (this.audioCache.size > 100) {
      const entries = Array.from(this.audioCache.entries());
      entries.sort(
        (a, b) => b[1].lastAccessedAt.getTime() - a[1].lastAccessedAt.getTime()
      );

      // Remove oldest 20% of entries
      const toRemove = entries.slice(-20);
      toRemove.forEach(([key]) => this.audioCache.delete(key));
    }
  }

  private generateCacheKey(options: CloudTTSOptions): string {
    // Create a simple hash-based cache key that avoids JSON.stringify Unicode issues
    const textHash = this.simpleHash(options.text);
    const voiceHash = this.simpleHash(options.voice || 'default');
    const languageHash = this.simpleHash(options.language || 'en');
    const rate = options.rate || 1.0;
    const pitch = options.pitch || 0.0;
    const volume = options.volume || 1.0;

    // Combine all parameters into a single hash
    const combined = `${textHash}-${voiceHash}-${languageHash}-${rate}-${pitch}-${volume}`;
    return this.simpleHash(combined);
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private updateCacheStats(hit: boolean): void {
    if (hit) {
      this.state.cacheStats.hits++;
    } else {
      this.state.cacheStats.misses++;
    }

    const total = this.state.cacheStats.hits + this.state.cacheStats.misses;
    this.state.cacheStats.hitRate =
      total > 0 ? this.state.cacheStats.hits / total : 0;
    this.state.cacheStats.size = this.audioCache.size;
  }

  private updatePerformanceMetrics(
    responseTime: number,
    success: boolean
  ): void {
    this.state.performance.totalRequests++;

    if (success) {
      this.state.performance.successfulRequests++;
      this.state.performance.averageResponseTime =
        (this.state.performance.averageResponseTime *
          (this.state.performance.successfulRequests - 1) +
          responseTime) /
        this.state.performance.successfulRequests;
    } else {
      this.state.performance.failedRequests++;
    }
  }

  private updateState(updates: Partial<CloudTTSState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyStateChangeListeners();
  }

  private notifyStateChangeListeners(): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        logger.error('Error in CloudTTSService state change listener:', error);
      }
    });
  }

  private handleError(error: ApiError): void {
    this.updateState({ error: error.message });
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        logger.error('Error in CloudTTSService error listener:', listenerError);
      }
    });
  }

  private createApiError(
    code: string,
    message: string,
    statusCode: number
  ): ApiError {
    return {
      message,
      code,
      statusCode,
    };
  }

  private async loadCacheFromStorage(): Promise<void> {
    try {
      // TODO: Implement cache loading from AsyncStorage
      logger.debug('CloudTTSService: Cache loading not yet implemented');
    } catch (error) {
      logger.warn('CloudTTSService: Failed to load cache from storage:', error);
    }
  }

  private async saveCacheToStorage(): Promise<void> {
    try {
      // TODO: Implement cache saving to AsyncStorage
      logger.debug('CloudTTSService: Cache saving not yet implemented');
    } catch (error) {
      logger.warn('CloudTTSService: Failed to save cache to storage:', error);
    }
  }

  /**
   * Convert ArrayBuffer to base64 string using a Unicode-safe method
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    const base64Chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;

    while (i < bytes.length) {
      const a = bytes[i++];
      const b = i < bytes.length ? bytes[i++] : 0;
      const c = i < bytes.length ? bytes[i++] : 0;

      const bitmap = (a << 16) | (b << 8) | c;

      result += base64Chars.charAt((bitmap >> 18) & 63);
      result += base64Chars.charAt((bitmap >> 12) & 63);
      result +=
        i - 2 < bytes.length ? base64Chars.charAt((bitmap >> 6) & 63) : '=';
      result += i - 1 < bytes.length ? base64Chars.charAt(bitmap & 63) : '=';
    }

    return result;
  }
}

// Export singleton instance
export const cloudTTSService = CloudTTSService.getInstance();
