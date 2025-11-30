/**
 * iOS Web Audio Handler
 * Specialized handler for iOS web browsers (Safari, Chrome, etc.) with enhanced Web Audio API support
 * All iOS browsers use WebKit and have the same audio limitations
 */

import { WebAudioHandler } from './WebAudioHandler';
import { logger } from '../../utils/logger';

export class IOSWebAudioHandler extends WebAudioHandler {
  private isIOSWeb = false;

  async initialize(): Promise<void> {
    // Check if we're on any iOS web browser (Safari, Chrome, etc.)
    this.isIOSWeb = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!this.isIOSWeb) {
      logger.debug(
        'IOSWebAudioHandler: Not iOS web browser, skipping initialization'
      );
      return;
    }

    logger.debug('IOSWebAudioHandler: Initializing for iOS web browser');
    await super.initialize();
  }

  async loadAudio(source: any): Promise<void> {
    if (!this.isIOSWeb) {
      logger.debug(
        'IOSWebAudioHandler: Not iOS web browser, skipping audio load'
      );
      return;
    }

    logger.debug('IOSWebAudioHandler: Loading audio for iOS web browser');
    await super.loadAudio(source);
  }

  async play(): Promise<void> {
    if (!this.isIOSWeb) {
      logger.debug('IOSWebAudioHandler: Not iOS web browser, skipping play');
      return;
    }

    logger.debug('IOSWebAudioHandler: Playing audio on iOS web browser');
    await super.play();
  }

  async pause(): Promise<void> {
    if (!this.isIOSWeb) {
      logger.debug('IOSWebAudioHandler: Not iOS web browser, skipping pause');
      return;
    }

    logger.debug('IOSWebAudioHandler: Pausing audio on iOS web browser');
    await super.pause();
  }

  async resume(): Promise<void> {
    if (!this.isIOSWeb) {
      logger.debug('IOSWebAudioHandler: Not iOS web browser, skipping resume');
      return;
    }

    logger.debug('IOSWebAudioHandler: Resuming audio on iOS web browser');
    await super.resume();
  }

  async stop(): Promise<void> {
    if (!this.isIOSWeb) {
      logger.debug('IOSWebAudioHandler: Not iOS web browser, skipping stop');
      return;
    }

    logger.debug('IOSWebAudioHandler: Stopping audio on iOS web browser');
    await super.stop();
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.isIOSWeb) {
      logger.debug(
        'IOSWebAudioHandler: Not iOS web browser, skipping volume set'
      );
      return;
    }

    logger.debug(
      'IOSWebAudioHandler: Setting volume on iOS web browser to',
      volume
    );
    await super.setVolume(volume);
  }

  async fadeOut(durationSeconds: number = 10): Promise<void> {
    if (!this.isIOSWeb) {
      logger.debug('IOSWebAudioHandler: Not iOS web browser, skipping fadeout');
      return;
    }

    logger.debug('IOSWebAudioHandler: Fading out audio on iOS web browser');
    await super.fadeOut(durationSeconds);
  }

  isAvailable(): boolean {
    if (!this.isIOSWeb) {
      return false;
    }
    return super.isAvailable();
  }
}
