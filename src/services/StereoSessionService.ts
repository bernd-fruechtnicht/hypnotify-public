/**
 * Stereo Session Service
 *
 * Manages stereo meditation sessions including CRUD operations,
 * filtering, sorting, and session statistics
 *
 * Follows the established service patterns in the codebase
 */

import {
  StereoSession,
  CreateStereoSessionInput,
  UpdateStereoSessionInput,
  StereoSessionFilter,
  StereoSessionSort,
  StereoSessionCategory,
  validateStereoSession,
} from '../types/StereoSession';
import { MeditationStatement, ApiError } from '../types';
import { storageService } from './StorageService';
import { logger } from '../utils/logger';

export interface StereoSessionServiceState {
  /** Whether the service is initialized */
  isInitialized: boolean;

  /** Whether a operation is in progress */
  isLoading: boolean;

  /** Last error */
  error?: string;

  /** Total number of sessions */
  totalSessions: number;

  /** Number of user-created sessions */
  userCreatedSessions: number;

  /** Number of template sessions */
  templateSessions: number;
}

export class StereoSessionService {
  private static instance: StereoSessionService;
  private state: StereoSessionServiceState;
  private sessions: Map<string, StereoSession>;
  private isInitialized = false;
  private hasAttemptedDefaultCreation = false;

  // Event listeners
  private stateChangeListeners: ((state: StereoSessionServiceState) => void)[] =
    [];
  private errorListeners: ((error: ApiError) => void)[] = [];

  // Storage keys
  private readonly STORAGE_KEY = 'stereo_sessions';

  private constructor() {
    this.state = this.createInitialState();
    this.sessions = new Map();
  }

  public static getInstance(): StereoSessionService {
    if (!StereoSessionService.instance) {
      StereoSessionService.instance = new StereoSessionService();
    }
    return StereoSessionService.instance;
  }

  /**
   * Initialize the Stereo Session service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      logger.debug('StereoSessionService: Initializing...');

      // Load sessions from storage
      await this.loadSessionsFromStorage();

      // Create default sessions if none exist (only once)
      if (this.sessions.size === 0 && !this.hasAttemptedDefaultCreation) {
        this.hasAttemptedDefaultCreation = true;
        await this.createDefaultSessions();
      } else if (this.sessions.size > 0) {
        // Check if we have old sessions with invalid statement IDs
        const sessionsWithInvalidIds = Array.from(
          this.sessions.values()
        ).filter(
          session =>
            session.leftChannelStatementIds.some(id =>
              id.startsWith('default_')
            ) ||
            session.rightChannelStatementIds.some(id =>
              id.startsWith('default_')
            )
        );

        if (sessionsWithInvalidIds.length > 0) {
          logger.debug(
            'StereoSessionService: Found sessions with invalid statement IDs, recreating...'
          );
          // Clear old sessions and recreate with valid IDs
          this.sessions.clear();
          await this.createDefaultSessions();
        }
      }

      this.isInitialized = true;
      this.updateState({
        isInitialized: true,
        totalSessions: this.sessions.size,
        userCreatedSessions: this.getUserCreatedSessionsCount(),
        templateSessions: this.getTemplateSessionsCount(),
      });

      logger.debug('StereoSessionService: Initialized successfully');
    } catch (error) {
      logger.error('StereoSessionService: Initialization failed:', error);
      // Don't throw error, just mark as initialized with empty state
      this.isInitialized = true;
      this.updateState({
        isInitialized: true,
        totalSessions: 0,
        userCreatedSessions: 0,
        templateSessions: 0,
        error: `Initialization failed: ${error}`,
      });
    }
  }

  /**
   * Create a new stereo session
   */
  public async createSession(
    input: CreateStereoSessionInput
  ): Promise<StereoSession> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.updateState({ isLoading: true, error: undefined });

    try {
      logger.debug('StereoSessionService: Creating new session:', input.name);

      // Validate input
      const validationErrors = validateStereoSession(
        input as Partial<StereoSession>
      );
      if (validationErrors.length > 0) {
        const apiError = this.createApiError(
          'VALIDATION_FAILED',
          'Session validation failed',
          400,
          validationErrors
        );
        this.handleError(apiError);
        throw apiError;
      }

      // Create session
      const session: StereoSession = {
        id: this.generateId(),
        name: input.name,
        description: input.description,
        multiLanguageContent: input.multiLanguageContent,
        category: input.category,
        subcategory: input.subcategory,
        leftChannelStatementIds: input.leftChannelStatementIds,
        rightChannelStatementIds: input.rightChannelStatementIds,
        tags: input.tags || [],
        isUserCreated: true,
        isActive: true,
        isTemplate: input.isTemplate || false,
        ttsSettings: input.ttsSettings,
        statistics: {
          playCount: 0,
          totalTimeSpent: 0,
          averageCompletionRate: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to storage
      this.sessions.set(session.id, session);

      // Try to save to storage, but don't fail if it doesn't work
      try {
        await this.saveSessionsToStorage();
      } catch (storageError) {
        logger.warn(
          'StereoSessionService: Failed to save session to storage:',
          storageError
        );
      }

      this.updateState({
        isLoading: false,
        totalSessions: this.sessions.size,
        userCreatedSessions: this.getUserCreatedSessionsCount(),
      });

      logger.debug(
        'StereoSessionService: Session created successfully:',
        session.id
      );
      return session;
    } catch (error) {
      this.updateState({ isLoading: false });

      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw API errors
      }

      const apiError = this.createApiError(
        'CREATE_FAILED',
        `Failed to create session: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Update an existing stereo session
   */
  public async updateSession(
    id: string,
    input: UpdateStereoSessionInput
  ): Promise<StereoSession> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.updateState({ isLoading: true, error: undefined });

    try {
      logger.debug('StereoSessionService: Updating session:', id);
      logger.debug('StereoSessionService: Update input:', input);

      const existingSession = this.sessions.get(id);
      logger.debug(
        'StereoSessionService: Existing session found:',
        !!existingSession
      );

      if (!existingSession) {
        logger.debug('StereoSessionService: Session not found, throwing error');
        const apiError = this.createApiError(
          'SESSION_NOT_FOUND',
          `Session with id ${id} not found`,
          404
        );
        this.handleError(apiError);
        throw apiError;
      }

      // Validate input
      logger.debug('StereoSessionService: Validating input...');
      const updatedSession = { ...existingSession, ...input };
      logger.debug(
        'StereoSessionService: Updated session object:',
        updatedSession
      );

      const validationErrors = validateStereoSession(updatedSession);
      logger.debug(
        'StereoSessionService: Validation errors:',
        validationErrors
      );

      if (validationErrors.length > 0) {
        logger.debug('StereoSessionService: Validation failed, throwing error');
        const apiError = this.createApiError(
          'VALIDATION_FAILED',
          'Session validation failed',
          400,
          validationErrors
        );
        this.handleError(apiError);
        throw apiError;
      }

      // Update session
      logger.debug('StereoSessionService: Creating final session object...');
      const session: StereoSession = {
        ...updatedSession,
        updatedAt: new Date(),
      };
      logger.debug('StereoSessionService: Final session object:', session);

      // Save to storage
      logger.debug('StereoSessionService: Saving to sessions map...');
      this.sessions.set(session.id, session);

      logger.debug('StereoSessionService: Saving to storage...');
      await this.saveSessionsToStorage();
      logger.debug('StereoSessionService: Storage save completed');

      this.updateState({ isLoading: false });

      logger.debug(
        'StereoSessionService: Session updated successfully:',
        session.id
      );
      return session;
    } catch (error) {
      this.updateState({ isLoading: false });

      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw API errors
      }

      const apiError = this.createApiError(
        'UPDATE_FAILED',
        `Failed to update session: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Delete a stereo session
   */
  public async deleteSession(id: string): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.updateState({ isLoading: true, error: undefined });

    try {
      logger.debug('StereoSessionService: Deleting session:', id);

      const session = this.sessions.get(id);
      if (!session) {
        const apiError = this.createApiError(
          'SESSION_NOT_FOUND',
          `Session with id ${id} not found`,
          404
        );
        this.handleError(apiError);
        throw apiError;
      }

      // Delete session
      this.sessions.delete(id);
      await this.saveSessionsToStorage();

      this.updateState({
        isLoading: false,
        totalSessions: this.sessions.size,
        userCreatedSessions: this.getUserCreatedSessionsCount(),
        templateSessions: this.getTemplateSessionsCount(),
      });

      logger.debug('StereoSessionService: Session deleted successfully:', id);
    } catch (error) {
      this.updateState({ isLoading: false });

      if (error instanceof Error && 'code' in error) {
        throw error; // Re-throw API errors
      }

      const apiError = this.createApiError(
        'DELETE_FAILED',
        `Failed to delete session: ${error}`,
        500
      );
      this.handleError(apiError);
      throw apiError;
    }
  }

  /**
   * Get a stereo session by ID
   */
  public async getSession(id: string): Promise<StereoSession | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const session = this.sessions.get(id);
    return session ? { ...session } : null;
  }

  /**
   * Get all stereo sessions with optional filtering and sorting
   */
  public async getSessions(
    filter?: StereoSessionFilter,
    sort?: StereoSessionSort
  ): Promise<StereoSession[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let sessions = Array.from(this.sessions.values());

    // Apply filters
    if (filter) {
      sessions = this.applyFilters(sessions, filter);
    }

    // Apply sorting
    if (sort) {
      sessions = this.applySorting(sessions, sort);
    }

    return sessions.map(session => ({ ...session }));
  }

  /**
   * Update session statistics
   */
  public async updateSessionStatistics(
    id: string,
    playCount?: number,
    timeSpent?: number,
    completionRate?: number
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const session = this.sessions.get(id);
      if (!session) {
        return;
      }

      // Initialize statistics if they don't exist
      const currentStatistics = session.statistics || {
        playCount: 0,
        totalTimeSpent: 0,
        averageCompletionRate: 0,
      };

      const updatedSession: StereoSession = {
        ...session,
        statistics: {
          ...currentStatistics,
          playCount:
            playCount !== undefined
              ? playCount
              : currentStatistics.playCount + 1,
          totalTimeSpent:
            timeSpent !== undefined
              ? timeSpent
              : currentStatistics.totalTimeSpent,
          averageCompletionRate:
            completionRate !== undefined
              ? completionRate
              : currentStatistics.averageCompletionRate,
          lastPlayedAt: new Date(),
        },
        updatedAt: new Date(),
      };

      this.sessions.set(id, updatedSession);
      await this.saveSessionsToStorage();
    } catch (error) {
      logger.error(
        'StereoSessionService: Failed to update session statistics:',
        error
      );
    }
  }

  /**
   * Get current service state
   */
  public getState(): StereoSessionServiceState {
    return { ...this.state };
  }

  /**
   * Add state change listener
   */
  public addStateChangeListener(
    listener: (state: StereoSessionServiceState) => void
  ): void {
    this.stateChangeListeners.push(listener);
  }

  /**
   * Remove state change listener
   */
  public removeStateChangeListener(
    listener: (state: StereoSessionServiceState) => void
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
   * Check if a statement is being used in any stereo session
   */
  public isStatementInUse(statementId: string): boolean {
    return Array.from(this.sessions.values()).some(
      session =>
        session.leftChannelStatementIds.includes(statementId) ||
        session.rightChannelStatementIds.includes(statementId)
    );
  }

  /**
   * Get all sessions that use a specific statement
   */
  public getSessionsUsingStatement(statementId: string): StereoSession[] {
    return Array.from(this.sessions.values()).filter(
      session =>
        session.leftChannelStatementIds.includes(statementId) ||
        session.rightChannelStatementIds.includes(statementId)
    );
  }

  /**
   * Get statements for a channel, filtering out missing statements
   */
  public async getChannelStatements(
    session: StereoSession,
    channel: 'left' | 'right'
  ): Promise<MeditationStatement[]> {
    const statementIds =
      channel === 'left'
        ? session.leftChannelStatementIds
        : session.rightChannelStatementIds;

    const allStatements = await storageService.loadStatements();
    const statements = statementIds
      .map(id => allStatements.find(stmt => stmt.id === id))
      .filter((stmt): stmt is MeditationStatement => stmt !== undefined);

    // Log missing statements for debugging
    const missingIds = statementIds.filter(
      id => !allStatements.some(stmt => stmt.id === id)
    );

    if (missingIds.length > 0) {
      logger.warn(
        `StereoSessionService: Missing statements in ${channel} channel:`,
        missingIds
      );

      // Auto-cleanup: Remove invalid statement IDs from the session
      const validIds = statementIds.filter(id =>
        allStatements.some(stmt => stmt.id === id)
      );

      if (validIds.length !== statementIds.length) {
        logger.debug(
          `StereoSessionService: Auto-cleaning invalid statement IDs from ${channel} channel`
        );
        await this.updateSession(session.id, {
          [channel === 'left'
            ? 'leftChannelStatementIds'
            : 'rightChannelStatementIds']: validIds,
        });
      }
    }

    return statements;
  }

  /**
   * Clean up sessions with invalid statement IDs
   */
  public async cleanupInvalidSessions(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const allStatements = await storageService.loadStatements();
      const validStatementIds = new Set(allStatements.map(s => s.id));

      let hasChanges = false;

      for (const [sessionId, session] of this.sessions.entries()) {
        const validLeftIds = session.leftChannelStatementIds.filter(id =>
          validStatementIds.has(id)
        );
        const validRightIds = session.rightChannelStatementIds.filter(id =>
          validStatementIds.has(id)
        );

        if (
          validLeftIds.length !== session.leftChannelStatementIds.length ||
          validRightIds.length !== session.rightChannelStatementIds.length
        ) {
          logger.debug(
            `StereoSessionService: Cleaning up invalid IDs in session ${sessionId}`
          );

          const updatedSession = {
            ...session,
            leftChannelStatementIds: validLeftIds,
            rightChannelStatementIds: validRightIds,
            updatedAt: new Date(),
          };

          this.sessions.set(sessionId, updatedSession);
          hasChanges = true;
        }
      }

      if (hasChanges) {
        await this.saveSessionsToStorage();
        logger.debug('StereoSessionService: Cleaned up invalid statement IDs');
      }
    } catch (error) {
      logger.error(
        'StereoSessionService: Failed to cleanup invalid sessions:',
        error
      );
    }
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    await this.saveSessionsToStorage();
    this.stateChangeListeners = [];
    this.errorListeners = [];
    this.isInitialized = false;
    logger.debug('StereoSessionService: Cleaned up');
  }

  // Private methods

  private createInitialState(): StereoSessionServiceState {
    return {
      isInitialized: false,
      isLoading: false,
      totalSessions: 0,
      userCreatedSessions: 0,
      templateSessions: 0,
    };
  }

  private async loadSessionsFromStorage(): Promise<void> {
    try {
      const storedSessions = await storageService.loadStereoSessions();
      if (storedSessions && Array.isArray(storedSessions)) {
        this.sessions.clear();
        let needsMigration = false;

        for (const session of storedSessions) {
          try {
            // Convert date strings back to Date objects
            session.createdAt = new Date(session.createdAt);
            session.updatedAt = new Date(session.updatedAt);
            if (session.statistics?.lastPlayedAt) {
              session.statistics.lastPlayedAt = new Date(
                session.statistics.lastPlayedAt
              );
            }

            // Migration: Add multi-language content if missing
            if (
              !session.multiLanguageContent &&
              session.name === 'Bilateral Relaxation'
            ) {
              session.multiLanguageContent = {
                en: {
                  name: 'Bilateral Relaxation',
                  description:
                    'A basic bilateral stimulation session for relaxation',
                },
                de: {
                  name: 'Bilaterale Entspannung',
                  description:
                    'Eine grundlegende bilaterale Stimulationssitzung zur Entspannung',
                },
                zh: {
                  name: '双侧放松',
                  description: '一个基本的双侧刺激放松会话',
                },
              };
              needsMigration = true;
            }

            this.sessions.set(session.id, session);
          } catch (sessionError) {
            logger.warn(
              'StereoSessionService: Failed to load session:',
              session.id,
              sessionError
            );
          }
        }

        // Save the updated sessions back to storage if migration was needed
        if (needsMigration) {
          try {
            await this.saveSessionsToStorage();
          } catch (saveError) {
            logger.warn(
              'StereoSessionService: Failed to save migrated sessions:',
              saveError
            );
          }
        }
        logger.debug(
          'StereoSessionService: Loaded',
          this.sessions.size,
          'sessions from storage'
        );
      } else {
        logger.debug('StereoSessionService: No sessions found in storage');
      }
    } catch (error) {
      logger.warn(
        'StereoSessionService: Failed to load sessions from storage:',
        error
      );
      // Continue with empty sessions map
    }
  }

  private async saveSessionsToStorage(): Promise<void> {
    try {
      logger.debug('StereoSessionService: Starting saveSessionsToStorage...');
      const sessionsArray = Array.from(this.sessions.values());
      logger.debug(
        'StereoSessionService: Sessions to save:',
        sessionsArray.length
      );
      logger.debug(
        'StereoSessionService: Calling storageService.saveStereoSessions...'
      );

      await storageService.saveStereoSessions(sessionsArray);
      logger.debug('StereoSessionService: Storage service save completed');
      logger.debug(
        'StereoSessionService: Saved',
        sessionsArray.length,
        'sessions to storage'
      );
    } catch (error) {
      logger.error(
        'StereoSessionService: Failed to save sessions to storage:',
        error
      );
      throw error; // Re-throw to see the error in the calling function
    }
  }

  private async createDefaultSessions(): Promise<void> {
    try {
      logger.debug('StereoSessionService: Creating default sessions');

      // Load actual statements to get real IDs
      const allStatements = await storageService.loadStatements();
      logger.debug(
        'StereoSessionService: Loaded statements:',
        allStatements.length
      );

      if (allStatements.length === 0) {
        logger.debug(
          'StereoSessionService: No statements available, skipping default session creation'
        );
        return;
      }

      // Get breathing statements for left channel (rational, no counting)
      const breathingStatements = allStatements.filter(
        s => s.primaryTag === 'breathing' || s.tags.includes('breathing')
      );
      const leftChannelStatements = breathingStatements.filter(s => {
        // Check all languages in multiLanguageContent
        const allTexts = [
          s.text,
          ...Object.values(s.multiLanguageContent || {}).map(c => c.text),
        ]
          .join(' ')
          .toLowerCase();

        return (
          !allTexts.includes('count') &&
          !allTexts.includes('one') &&
          !allTexts.includes('two') &&
          !allTexts.includes('three') &&
          !allTexts.includes('four') &&
          !allTexts.includes('five') &&
          !allTexts.includes('six') &&
          !allTexts.includes('seven') &&
          !allTexts.includes('eight') &&
          !allTexts.includes('nine') &&
          !allTexts.includes('ten') &&
          !allTexts.includes('eins') &&
          !allTexts.includes('zwei') &&
          !allTexts.includes('drei') &&
          !allTexts.includes('vier') &&
          !allTexts.includes('fünf')
        );
      });
      const leftChannelIds = (
        leftChannelStatements.length >= 10
          ? leftChannelStatements
          : breathingStatements
      )
        .slice(0, 10)
        .map(s => s.id);

      // Get mindfulness statements for right channel (emotional/awareness)
      const mindfulnessStatements = allStatements.filter(
        s => s.primaryTag === 'mindfulness' || s.tags.includes('mindfulness')
      );
      const rightChannelStatements = mindfulnessStatements.filter(s => {
        // Check all languages in multiLanguageContent
        const allTexts = [
          s.text,
          ...Object.values(s.multiLanguageContent || {}).map(c => c.text),
        ]
          .join(' ')
          .toLowerCase();

        return (
          allTexts.includes('feel') ||
          allTexts.includes('ich fühle') ||
          allTexts.includes('fühle') ||
          allTexts.includes('nimm wahr') ||
          allTexts.includes('wahrnehmen') ||
          allTexts.includes('sense') ||
          allTexts.includes('spüre') ||
          allTexts.includes('notice') ||
          allTexts.includes('bemerke') ||
          allTexts.includes('observe') ||
          allTexts.includes('beobachte')
        );
      });
      const rightChannelIds = (
        rightChannelStatements.length >= 10
          ? rightChannelStatements
          : mindfulnessStatements
      )
        .slice(0, 10)
        .map(s => s.id);

      logger.debug(
        'StereoSessionService: Using left channel IDs:',
        leftChannelIds
      );
      logger.debug(
        'StereoSessionService: Using right channel IDs:',
        rightChannelIds
      );

      // Create a default bilateral stimulation session
      const defaultSession: CreateStereoSessionInput = {
        name: 'Bilateral Relaxation',
        description: 'A basic bilateral stimulation session for relaxation',
        category: StereoSessionCategory.BILATERAL_STIMULATION,
        leftChannelStatementIds: leftChannelIds,
        rightChannelStatementIds: rightChannelIds,
        tags: ['relaxation', 'bilateral'],
        isTemplate: true,
        ttsSettings: {
          leftChannelVoice: 'en-US-Wavenet-D',
          rightChannelVoice: 'en-US-Wavenet-F',
          rate: 1.0,
          pitch: 0.0,
          volume: 0.8,
          leftChannelVolume: 0.8,
          rightChannelVolume: 0.8,
          randomDelayRange: { min: 500, max: 2000 },
          useStatementSettings: false,
        },
      };

      // Create session directly without calling createSession to avoid recursion
      const session: StereoSession = {
        id: this.generateId(),
        name: defaultSession.name,
        description: defaultSession.description,
        category: defaultSession.category,
        subcategory: defaultSession.subcategory,
        leftChannelStatementIds: defaultSession.leftChannelStatementIds,
        rightChannelStatementIds: defaultSession.rightChannelStatementIds,
        tags: defaultSession.tags || [],
        isUserCreated: true,
        isActive: true,
        isTemplate: defaultSession.isTemplate || false,
        ttsSettings: defaultSession.ttsSettings,
        statistics: {
          playCount: 0,
          totalTimeSpent: 0,
          averageCompletionRate: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to sessions map
      this.sessions.set(session.id, session);

      // Try to save to storage (but don't fail if it doesn't work)
      try {
        await this.saveSessionsToStorage();
      } catch (storageError) {
        logger.warn(
          'StereoSessionService: Failed to save default session to storage:',
          storageError
        );
      }

      logger.debug(
        'StereoSessionService: Default session created successfully'
      );
    } catch (error) {
      logger.error(
        'StereoSessionService: Failed to create default sessions:',
        error
      );
      // Don't throw, just log the error
    }
  }

  private applyFilters(
    sessions: StereoSession[],
    filter: StereoSessionFilter
  ): StereoSession[] {
    return sessions.filter(session => {
      if (filter.category && session.category !== filter.category) return false;
      if (filter.subcategory && session.subcategory !== filter.subcategory)
        return false;
      if (filter.language && !this.sessionHasLanguage(session, filter.language))
        return false;
      if (filter.tags && !this.sessionHasTags(session, filter.tags))
        return false;
      if (
        filter.isUserCreated !== undefined &&
        session.isUserCreated !== filter.isUserCreated
      )
        return false;
      if (filter.isActive !== undefined && session.isActive !== filter.isActive)
        return false;
      if (
        filter.isTemplate !== undefined &&
        session.isTemplate !== filter.isTemplate
      )
        return false;
      if (
        filter.searchText &&
        !this.sessionMatchesSearch(session, filter.searchText)
      )
        return false;
      return true;
    });
  }

  private applySorting(
    sessions: StereoSession[],
    sort: StereoSessionSort
  ): StereoSession[] {
    return sessions.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sort.field) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'category':
          aValue = a.category;
          bValue = b.category;
          break;
        case 'playCount':
          aValue = a.statistics?.playCount || 0;
          bValue = b.statistics?.playCount || 0;
          break;
        default:
          return 0;
      }

      if (sort.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  private async sessionHasLanguage(
    session: StereoSession,
    language: string
  ): Promise<boolean> {
    // Check if any statement in either channel has the specified language
    const [leftStatements, rightStatements] = await Promise.all([
      this.getChannelStatements(session, 'left'),
      this.getChannelStatements(session, 'right'),
    ]);

    const leftHasLanguage = leftStatements.some(
      stmt => stmt.multiLanguageContent?.[language]
    );
    const rightHasLanguage = rightStatements.some(
      stmt => stmt.multiLanguageContent?.[language]
    );
    return leftHasLanguage || rightHasLanguage;
  }

  private sessionHasTags(session: StereoSession, tags: string[]): boolean {
    return tags.some(tag => session.tags.includes(tag));
  }

  private sessionMatchesSearch(
    session: StereoSession,
    searchText: string
  ): boolean {
    const search = searchText.toLowerCase();
    return (
      session.name.toLowerCase().includes(search) ||
      (session.description &&
        session.description.toLowerCase().includes(search)) ||
      session.tags.some(tag => tag.toLowerCase().includes(search))
    );
  }

  private getUserCreatedSessionsCount(): number {
    return Array.from(this.sessions.values()).filter(
      session => session.isUserCreated
    ).length;
  }

  private getTemplateSessionsCount(): number {
    return Array.from(this.sessions.values()).filter(
      session => session.isTemplate
    ).length;
  }

  private updateState(updates: Partial<StereoSessionServiceState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyStateChangeListeners();
  }

  private notifyStateChangeListeners(): void {
    this.stateChangeListeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        logger.error(
          'Error in StereoSessionService state change listener:',
          error
        );
      }
    });
  }

  private handleError(error: ApiError): void {
    this.updateState({ error: error.message });
    this.errorListeners.forEach(listener => {
      try {
        listener(error);
      } catch (listenerError) {
        logger.error(
          'Error in StereoSessionService error listener:',
          listenerError
        );
      }
    });
  }

  private createApiError(
    code: string,
    message: string,
    statusCode: number,
    validationErrors?: any[]
  ): ApiError {
    return {
      message,
      code,
      statusCode,
      validationErrors,
    };
  }

  private generateId(): string {
    return `stereo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const stereoSessionService = StereoSessionService.getInstance();
