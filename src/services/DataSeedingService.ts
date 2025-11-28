/**
 * Data Seeding Service
 * Handles initial data population and database setup
 */

import { storageService } from './StorageService';
import {
  getInitialStatements,
  getStatementsByCategory,
} from '../data/initialStatements';
import { DEFAULT_APP_SETTINGS } from '../types/AppSettings';
import { MeditationSession, StatementCategory, StereoSession, StereoSessionCategory } from '../types';

export class DataSeedingService {
  private static instance: DataSeedingService;
  private isSeeded = false;

  private constructor() {}

  public static getInstance(): DataSeedingService {
    if (!DataSeedingService.instance) {
      DataSeedingService.instance = new DataSeedingService();
    }
    return DataSeedingService.instance;
  }

  /**
   * Check if data has been seeded
   */
  public async isDataSeeded(): Promise<boolean> {
    try {
      const statements = await storageService.loadStatements();
      const sessions = await storageService.loadSessions();
      const settings = await storageService.loadSettings();

      return statements.length > 0 || sessions.length > 0 || settings !== null;
    } catch (error) {
      console.error('Failed to check if data is seeded:', error);
      return false;
    }
  }

  /**
   * Seed initial data
   */
  public async seedInitialData(): Promise<void> {
    if (this.isSeeded) {
      return;
    }

    try {
      console.log('Starting data seeding...');

      // Seed statements
      await this.seedStatements();

      // Seed default sessions
      await this.seedDefaultSessions();

      // Seed stereo sessions
      await this.seedStereoSessions();

      // Seed default settings
      await this.seedDefaultSettings();

      this.isSeeded = true;
      console.log('Data seeding completed successfully');
    } catch (error) {
      console.error('Failed to seed initial data:', error);
      throw new Error(`Data seeding failed: ${error}`);
    }
  }

  /**
   * Seed meditation statements
   */
  private async seedStatements(): Promise<void> {
    try {
      const existingStatements = await storageService.loadStatements();

      if (existingStatements.length > 0) {
        console.log('Statements already exist, skipping seeding');
        return;
      }

      const initialStatements = getInitialStatements();
      await storageService.saveStatements(initialStatements);

      console.log(`Seeded ${initialStatements.length} meditation statements`);
    } catch (error) {
      console.error('Failed to seed statements:', error);
      throw error;
    }
  }

  /**
   * Seed default meditation sessions
   */
  private async seedDefaultSessions(): Promise<void> {
    try {
      const existingSessions = await storageService.loadSessions();

      if (existingSessions.length > 0) {
        console.log('Sessions already exist, skipping seeding');
        return;
      }

      const defaultSessions = this.createDefaultSessions();
      await storageService.saveSessions(defaultSessions);

      console.log(`Seeded ${defaultSessions.length} default sessions`);
    } catch (error) {
      console.error('Failed to seed sessions:', error);
      throw error;
    }
  }

  /**
   * Seed stereo meditation sessions
   */
  private async seedStereoSessions(): Promise<void> {
    try {
      const existingStereoSessions = await storageService.loadStereoSessions();

      if (existingStereoSessions.length > 0) {
        console.log('Stereo sessions already exist, skipping seeding');
        return;
      }

      const defaultStereoSessions = this.createDefaultStereoSessions();
      await storageService.saveStereoSessions(defaultStereoSessions);

      console.log(`Seeded ${defaultStereoSessions.length} default stereo sessions`);
    } catch (error) {
      console.error('Failed to seed stereo sessions:', error);
      throw error;
    }
  }

  /**
   * Seed default app settings
   */
  private async seedDefaultSettings(): Promise<void> {
    try {
      const existingSettings = await storageService.loadSettings();

      if (existingSettings) {
        console.log('Settings already exist, skipping seeding');
        return;
      }

      await storageService.saveSettings(DEFAULT_APP_SETTINGS);
      console.log('Seeded default app settings');
    } catch (error) {
      console.error('Failed to seed settings:', error);
      throw error;
    }
  }

  /**
   * Create default meditation sessions
   */
  private createDefaultSessions(): MeditationSession[] {
    const now = new Date();
    const generateId = () =>
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get statements for each category
    const getStatementIds = (
      category: StatementCategory,
      count: number = 3
    ): string[] => {
      const statements = getStatementsByCategory(category);
      return statements.slice(0, count).map(stmt => stmt.id);
    };

    return [
      // 1. Breathing-focused session (3 statements)
      {
        id: generateId(),
        name: 'Breathing Foundation',
        description:
          'Essential breathing techniques to center and calm your mind.',
        language: 'en',
        multiLanguageContent: {
          en: {
            name: 'Breathing Foundation',
            description:
              'Essential breathing techniques to center and calm your mind.',
          },
          de: {
            name: 'Atem-Grundlage',
            description:
              'Wesentliche Atemtechniken zur Zentrierung und Beruhigung des Geistes.',
          },
          zh: {
            name: '呼吸基础',
            description: '基本的呼吸技巧来集中和平静你的心灵。',
          },
        },
        category: 'breathing' as any,
        statementIds: getStatementIds(StatementCategory.BREATHING, 20),
        isUserCreated: false,
        tags: ['breathing', 'foundation', 'beginner'],
        isActive: true,
        isTemplate: true,
        createdAt: now,
        updatedAt: now,
      },
      // 2. Relaxation-focused session (3 statements)
      {
        id: generateId(),
        name: 'Deep Relaxation',
        description:
          'Progressive relaxation techniques to release tension and stress.',
        language: 'en',
        multiLanguageContent: {
          en: {
            name: 'Deep Relaxation',
            description:
              'Progressive relaxation techniques to release tension and stress.',
          },
          de: {
            name: 'Tiefe Entspannung',
            description:
              'Progressive Entspannungstechniken zur Lockerung von Verspannungen und Stress.',
          },
          zh: {
            name: '深度放松',
            description: '渐进式放松技巧来释放紧张和压力。',
          },
        },
        category: 'relaxation' as any,
        statementIds: getStatementIds(StatementCategory.RELAXATION, 20),
        isUserCreated: false,
        tags: ['relaxation', 'progressive', 'beginner'],
        isActive: true,
        isTemplate: true,
        createdAt: now,
        updatedAt: now,
      },
      // 3. Mindfulness-focused session (3 statements)
      {
        id: generateId(),
        name: 'Mindful Awareness',
        description:
          'Cultivate present-moment awareness and mindful observation.',
        language: 'en',
        multiLanguageContent: {
          en: {
            name: 'Mindful Awareness',
            description:
              'Cultivate present-moment awareness and mindful observation.',
          },
          de: {
            name: 'Achtsame Bewusstheit',
            description:
              'Entwickeln Sie Bewusstheit für den gegenwärtigen Moment und achtsame Beobachtung.',
          },
          zh: {
            name: '正念觉知',
            description: '培养当下的觉知和正念观察。',
          },
        },
        category: 'mindfulness' as any,
        statementIds: getStatementIds(StatementCategory.MINDFULNESS, 20),
        isUserCreated: false,
        tags: ['mindfulness', 'awareness', 'intermediate'],
        isActive: true,
        isTemplate: true,
        createdAt: now,
        updatedAt: now,
      },
      // 4. Short mixed session (5 statements) - for testing
      {
        id: generateId(),
        name: 'Quick Balance',
        description:
          'A brief session combining breathing, relaxation, and mindfulness.',
        language: 'en',
        multiLanguageContent: {
          en: {
            name: 'Quick Balance',
            description:
              'A brief session combining breathing, relaxation, and mindfulness.',
          },
          de: {
            name: 'Schnelle Balance',
            description:
              'Eine kurze Sitzung, die Atmung, Entspannung und Achtsamkeit kombiniert.',
          },
          zh: {
            name: '快速平衡',
            description: '一个简短的课程，结合了呼吸、放松和正念。',
          },
        },
        category: 'mixed' as any,
        statementIds: [
          ...getStatementIds(StatementCategory.BREATHING, 2),
          ...getStatementIds(StatementCategory.RELAXATION, 2),
          ...getStatementIds(StatementCategory.MINDFULNESS, 1),
        ],
        isUserCreated: false,
        tags: ['mixed', 'quick', 'testing'],
        isActive: true,
        isTemplate: true,
        createdAt: now,
        updatedAt: now,
      },
      // 5. Comprehensive mixed session (20 statements)
      {
        id: generateId(),
        name: 'Balanced Journey',
        description:
          'A comprehensive session combining breathing, relaxation, and mindfulness.',
        language: 'en',
        multiLanguageContent: {
          en: {
            name: 'Balanced Journey',
            description:
              'A comprehensive session combining breathing, relaxation, and mindfulness.',
          },
          de: {
            name: 'Ausgewogene Reise',
            description:
              'Eine umfassende Sitzung, die Atmung, Entspannung und Achtsamkeit kombiniert.',
          },
          zh: {
            name: '平衡之旅',
            description: '一个全面的课程，结合了呼吸、放松和正念。',
          },
        },
        category: 'mixed' as any,
        statementIds: [
          ...getStatementIds(StatementCategory.BREATHING, 5),
          ...getStatementIds(StatementCategory.RELAXATION, 5),
          ...getStatementIds(StatementCategory.MINDFULNESS, 5),
          ...getStatementIds(StatementCategory.SLEEP, 3),
          ...getStatementIds(StatementCategory.ANXIETY, 2),
        ],
        isUserCreated: false,
        tags: ['mixed', 'balanced', 'intermediate'],
        isActive: true,
        isTemplate: true,
        createdAt: now,
        updatedAt: now,
      },
      // 6. Complete session (all statements)
      {
        id: generateId(),
        name: 'Complete Meditation',
        description:
          'A comprehensive session featuring all meditation techniques and practices.',
        language: 'en',
        multiLanguageContent: {
          en: {
            name: 'Complete Meditation',
            description:
              'A comprehensive session featuring all meditation techniques and practices.',
          },
          de: {
            name: 'Vollständige Meditation',
            description:
              'Eine umfassende Sitzung mit allen Meditations- und Übungstechniken.',
          },
          zh: {
            name: '完整冥想',
            description: '一个全面的课程，包含所有冥想技巧和练习。',
          },
        },
        category: 'complete' as any,
        statementIds: [
          ...getStatementIds(StatementCategory.BREATHING, 20),
          ...getStatementIds(StatementCategory.RELAXATION, 20),
          ...getStatementIds(StatementCategory.MINDFULNESS, 20),
          ...getStatementIds(StatementCategory.SLEEP, 20),
          ...getStatementIds(StatementCategory.ANXIETY, 20),
          ...getStatementIds(StatementCategory.GRATITUDE, 20),
        ],
        isUserCreated: false,
        tags: ['complete', 'comprehensive', 'advanced'],
        isActive: true,
        isTemplate: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  /**
   * Create default stereo meditation sessions
   */
  private createDefaultStereoSessions(): StereoSession[] {
    const now = new Date();
    const generateId = () =>
      `stereo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get breathing statements for left channel (rational/instructional)
    const getBreathingStatementIds = (): string[] => {
      const breathingStatements = getStatementsByCategory(StatementCategory.BREATHING);
      
      // Filter out counting statements and focus on breathing techniques
      // Check all languages in multiLanguageContent
      const filteredStatements = breathingStatements.filter(stmt => {
        const allTexts = [
          stmt.text,
          ...Object.values(stmt.multiLanguageContent || {}).map(c => c.text)
        ].join(' ').toLowerCase();
        
        return !allTexts.includes('count') &&
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
               !allTexts.includes('fünf');
      });
      
      // If we don't have enough filtered statements, use all breathing statements
      const finalStatements = filteredStatements.length >= 10 
        ? filteredStatements 
        : breathingStatements;
        
      return finalStatements.slice(0, 10).map(stmt => stmt.id);
    };

    // Get mindfulness statements for right channel (emotional/awareness)
    const getMindfulnessStatementIds = (): string[] => {
      const mindfulnessStatements = getStatementsByCategory(StatementCategory.MINDFULNESS);
      
      // Focus on emotional and awareness statements (English and German)
      // Check all languages in multiLanguageContent
      const filteredStatements = mindfulnessStatements.filter(stmt => {
        const allTexts = [
          stmt.text,
          ...Object.values(stmt.multiLanguageContent || {}).map(c => c.text)
        ].join(' ').toLowerCase();
        
        return (
          // English keywords
          allTexts.includes('feel') ||
          allTexts.includes('imagine') ||
          allTexts.includes('sense') ||
          allTexts.includes('aware') ||
          allTexts.includes('notice') ||
          allTexts.includes('observe') ||
          allTexts.includes('emotion') ||
          allTexts.includes('heart') ||
          allTexts.includes('body') ||
          allTexts.includes('mind') ||
          // German keywords
          allTexts.includes('ich fühle') ||
          allTexts.includes('fühle') ||
          allTexts.includes('nimm wahr') ||
          allTexts.includes('wahrnehmen') ||
          allTexts.includes('spüre') ||
          allTexts.includes('bemerke') ||
          allTexts.includes('bemerken') ||
          allTexts.includes('beobachte') ||
          allTexts.includes('beobachten')
        );
      });
      
      // If we don't have enough filtered statements, use all mindfulness statements
      const finalStatements = filteredStatements.length >= 10 
        ? filteredStatements 
        : mindfulnessStatements;
        
      return finalStatements.slice(0, 10).map(stmt => stmt.id);
    };

    return [
      {
        id: generateId(),
        name: 'Breathing & Mindfulness Balance',
        description: 'A stereo meditation combining breathing techniques with mindful awareness.',
        multiLanguageContent: {
          en: {
            name: 'Breathing & Mindfulness Balance',
            description: 'A stereo meditation combining breathing techniques with mindful awareness.',
          },
          de: {
            name: 'Atem- und Achtsamkeits-Balance',
            description: 'Eine Stereo-Meditation, die Atemtechniken mit achtsamer Bewusstheit kombiniert.',
          },
          zh: {
            name: '呼吸与正念平衡',
            description: '结合呼吸技巧和正念觉知的立体冥想。',
          },
        },
        category: StereoSessionCategory.MINDFULNESS,
        subcategory: 'breathing-mindfulness',
        leftChannelStatementIds: getBreathingStatementIds(),
        rightChannelStatementIds: getMindfulnessStatementIds(),
        isUserCreated: false,
        tags: ['breathing', 'mindfulness', 'balance', 'stereo'],
        isActive: true,
        isTemplate: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        name: 'Relaxation & Emotional Awareness',
        description: 'A stereo meditation combining relaxation techniques with emotional awareness.',
        multiLanguageContent: {
          en: {
            name: 'Relaxation & Emotional Awareness',
            description: 'A stereo meditation combining relaxation techniques with emotional awareness.',
          },
          de: {
            name: 'Entspannung & Emotionale Bewusstheit',
            description: 'Eine Stereo-Meditation, die Entspannungstechniken mit emotionaler Bewusstheit kombiniert.',
          },
          zh: {
            name: '放松与情感觉知',
            description: '结合放松技巧和情感觉知的立体冥想。',
          },
        },
        category: StereoSessionCategory.RELAXATION,
        subcategory: 'relaxation-emotional',
        leftChannelStatementIds: getBreathingStatementIds(), // Use breathing for left (rational)
        rightChannelStatementIds: getMindfulnessStatementIds(), // Use mindfulness for right (emotional)
        isUserCreated: false,
        tags: ['relaxation', 'emotional', 'awareness', 'stereo'],
        isActive: true,
        isTemplate: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  /**
   * Reset all data (for development/testing)
   */
  public async resetAllData(): Promise<void> {
    try {
      await storageService.clearAllData();
      this.isSeeded = false;
      console.log('All data reset successfully');
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw new Error(`Data reset failed: ${error}`);
    }
  }

  /**
   * Re-seed data (useful for updates)
   */
  public async reseedData(): Promise<void> {
    try {
      await this.resetAllData();
      await this.seedInitialData(); // Use the new initial data seeding with expanded statements
      console.log('Data re-seeded successfully');
    } catch (error) {
      console.error('Failed to re-seed data:', error);
      throw new Error(`Data re-seeding failed: ${error}`);
    }
  }

  /**
   * Get seeding status
   */
  public getSeedingStatus(): { isSeeded: boolean } {
    return { isSeeded: this.isSeeded };
  }
}

// Export singleton instance
export const dataSeedingService = DataSeedingService.getInstance();
