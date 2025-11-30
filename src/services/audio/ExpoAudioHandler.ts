/**
 * Expo Audio Handler
 * Handles audio playback using expo-av for Android, iOS native, and Electron
 */

import { Audio } from 'expo-av';
import { IAudioHandler } from './IAudioHandler';
import { logger } from '../../utils/logger';

export class ExpoAudioHandler implements IAudioHandler {
  private sound: Audio.Sound | null = null;
  private isInitialized = false;
  private playing = false;
  private volume = 0.3;
  private fadeoutCancelled = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    this.isInitialized = true;
    logger.debug('ExpoAudioHandler: Initialized');
  }

  async loadAudio(source: any): Promise<void> {
    try {
      const { sound } = await Audio.Sound.createAsync(source, {
        shouldPlay: false,
        isLooping: true,
        volume: this.volume,
      });

      this.sound = sound;
      logger.debug('ExpoAudioHandler: Audio loaded successfully');
    } catch (error) {
      logger.error('ExpoAudioHandler: Failed to load audio:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (this.sound && !this.playing) {
      try {
        await this.sound.setPositionAsync(0);
        await this.sound.playAsync();
        this.playing = true;
        logger.debug('ExpoAudioHandler: Started playing audio');
      } catch (error) {
        logger.error('ExpoAudioHandler: Failed to play audio:', error);
        throw error;
      }
    }
  }

  async pause(): Promise<void> {
    if (this.sound && this.playing) {
      try {
        this.cancelFadeout();
        await this.sound.pauseAsync();
        this.playing = false;
        logger.debug('ExpoAudioHandler: Paused audio');
      } catch (error) {
        logger.error('ExpoAudioHandler: Failed to pause audio:', error);
        throw error;
      }
    }
  }

  async resume(): Promise<void> {
    if (this.sound && !this.playing) {
      try {
        await this.sound.playAsync();
        this.playing = true;
        logger.debug('ExpoAudioHandler: Resumed audio');
      } catch (error) {
        logger.error('ExpoAudioHandler: Failed to resume audio:', error);
        throw error;
      }
    }
  }

  async stop(): Promise<void> {
    if (this.sound && this.playing) {
      try {
        this.cancelFadeout();
        await this.sound.pauseAsync();
        await this.sound.setPositionAsync(0);
        this.playing = false;
        logger.debug('ExpoAudioHandler: Stopped audio');
      } catch (error) {
        logger.error('ExpoAudioHandler: Failed to stop audio:', error);
        throw error;
      }
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.sound) {
      try {
        await this.sound.setVolumeAsync(this.volume);
        logger.debug('ExpoAudioHandler: Set volume to', this.volume);
      } catch (error) {
        logger.error('ExpoAudioHandler: Failed to set volume:', error);
        throw error;
      }
    }
  }

  async fadeOut(durationSeconds: number = 10): Promise<void> {
    if (!this.sound || !this.playing) {
      return;
    }

    try {
      this.fadeoutCancelled = false;
      const startVolume = this.volume;
      const fadeSteps = 20;
      const stepDuration = (durationSeconds * 1000) / fadeSteps;
      const volumeDecrement = startVolume / fadeSteps;

      for (let i = 0; i < fadeSteps; i++) {
        if (this.fadeoutCancelled) {
          logger.debug('ExpoAudioHandler: Fadeout cancelled');
          return;
        }

        const newVolume = Math.max(0, startVolume - volumeDecrement * (i + 1));
        await this.sound!.setVolumeAsync(newVolume);
        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      if (this.fadeoutCancelled) {
        logger.debug('ExpoAudioHandler: Fadeout cancelled before final stop');
        return;
      }

      await this.sound.setVolumeAsync(0);
      await this.sound.pauseAsync();
      this.playing = false;
      this.volume = startVolume;

      logger.debug(
        'ExpoAudioHandler: Faded out audio over',
        durationSeconds,
        'seconds'
      );
    } catch (error) {
      logger.error('ExpoAudioHandler: Failed to fade out audio:', error);
      await this.stop();
    }
  }

  cancelFadeout(): void {
    this.fadeoutCancelled = true;
  }

  isPlaying(): boolean {
    return this.playing;
  }

  isAvailable(): boolean {
    return this.isInitialized && this.sound !== null;
  }

  getVolume(): number {
    return this.volume;
  }

  async cleanup(): Promise<void> {
    if (this.sound) {
      try {
        await this.sound.unloadAsync();
        this.sound = null;
        this.playing = false;
        this.isInitialized = false;
        logger.debug('ExpoAudioHandler: Cleaned up resources');
      } catch (error) {
        logger.error('ExpoAudioHandler: Failed to cleanup:', error);
      }
    }
  }
}
