/**
 * Services Integration
 * Central export and initialization for all app services
 */

import { Platform } from 'react-native';
import { TTSService, ttsService } from './TTSService';
import { WebTTSService, webTtsService } from './WebTTSService';
import { ElectronTTSService, electronTtsService } from './ElectronTTSService';
import { NativeTTSService } from './NativeTTSService';
import { AudioService, audioService } from './AudioService';
import { StorageService, storageService } from './StorageService';
import { DataSeedingService, dataSeedingService } from './DataSeedingService';
import {
  BackgroundMusicService,
  backgroundMusicService,
} from './BackgroundMusicService';
import { CloudTTSService, cloudTTSService } from './CloudTTSService';
import {
  StereoSessionService,
  stereoSessionService,
} from './StereoSessionService';
import {
  StereoPlayerService,
  stereoPlayerService,
} from './StereoPlayerService';

// Create native TTS service instance
const nativeTtsService = NativeTTSService.getInstance();

export { TTSService, ttsService };
export { WebTTSService, webTtsService };
export { ElectronTTSService, electronTtsService };
export { NativeTTSService, nativeTtsService };
export { AudioService, audioService };
export { StorageService, storageService };
export { DataSeedingService, dataSeedingService };
export { BackgroundMusicService, backgroundMusicService };
export { CloudTTSService, cloudTTSService };
export { StereoSessionService, stereoSessionService };
export { StereoPlayerService, stereoPlayerService };

/**
 * Initialize all services
 */
export const initializeServices = async (): Promise<void> => {
  try {
    // Initialize services in parallel for better performance
    const initPromises = [
      ttsService.initialize(),
      audioService.initialize(),
      storageService.initialize(),
      cloudTTSService.initialize(),
      stereoSessionService.initialize(),
      stereoPlayerService.initialize(),
      // backgroundMusicService.initialize(), // Initialize lazily when needed
    ];

    // Only initialize platform-specific TTS services
    if (Platform.OS === 'web' || electronTtsService.isAvailable()) {
      initPromises.push(webTtsService.initialize());
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      initPromises.push(nativeTtsService.initialize());
    }

    await Promise.all(initPromises);

    // Seed initial data if needed
    const isSeeded = await dataSeedingService.isDataSeeded();
    if (!isSeeded) {
      await dataSeedingService.seedInitialData();
    }

    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize services:', error);
    throw new Error(`Service initialization failed: ${error}`);
  }
};

/**
 * Cleanup all services
 */
export const cleanupServices = async (): Promise<void> => {
  try {
    // Cleanup services in parallel
    await Promise.all([
      ttsService.cleanup(),
      audioService.cleanup(),
      cloudTTSService.cleanup(),
      stereoSessionService.cleanup(),
      stereoPlayerService.cleanup(),
      // backgroundMusicService.cleanup() // Only cleanup if initialized
    ]);

    console.log('All services cleaned up successfully');
  } catch (error) {
    console.error('Failed to cleanup services:', error);
    throw new Error(`Service cleanup failed: ${error}`);
  }
};

/**
 * Get service health status
 */
export const getServiceHealth = async (): Promise<{
  tts: boolean;
  audio: boolean;
  storage: boolean;
}> => {
  try {
    console.log('getServiceHealth: Checking service health...');

    const [ttsAvailable, audioInitialized, storageInitialized] =
      await Promise.all([
        ttsService.isAvailable(),
        Promise.resolve(audioService.getPlayerState() !== null),
        Promise.resolve(storageService.getStorageInfo() !== null),
      ]);

    console.log('getServiceHealth: Results:', {
      tts: ttsAvailable,
      audio: audioInitialized,
      storage: storageInitialized,
    });

    return {
      tts: ttsAvailable,
      audio: audioInitialized,
      storage: storageInitialized,
    };
  } catch (error) {
    console.error('Failed to get service health:', error);
    return {
      tts: false,
      audio: false,
      storage: false,
    };
  }
};
