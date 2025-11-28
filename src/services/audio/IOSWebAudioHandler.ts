/**
 * iOS Web Audio Handler
 * Specialized handler for iOS web browsers (Safari, Chrome, etc.) with enhanced Web Audio API support
 * All iOS browsers use WebKit and have the same audio limitations
 */

import { WebAudioHandler } from './WebAudioHandler';

export class IOSWebAudioHandler extends WebAudioHandler {
  private isIOSWeb = false;

  async initialize(): Promise<void> {
    // Check if we're on any iOS web browser (Safari, Chrome, etc.)
    this.isIOSWeb = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (!this.isIOSWeb) {
      console.log(
        'IOSWebAudioHandler: Not iOS web browser, skipping initialization'
      );
      return;
    }

    console.log('IOSWebAudioHandler: Initializing for iOS web browser');
    await super.initialize();
  }

  async loadAudio(source: any): Promise<void> {
    if (!this.isIOSWeb) {
      console.log(
        'IOSWebAudioHandler: Not iOS web browser, skipping audio load'
      );
      return;
    }

    console.log('IOSWebAudioHandler: Loading audio for iOS web browser');
    await super.loadAudio(source);
  }

  async play(): Promise<void> {
    if (!this.isIOSWeb) {
      console.log('IOSWebAudioHandler: Not iOS web browser, skipping play');
      return;
    }

    console.log('IOSWebAudioHandler: Playing audio on iOS web browser');
    await super.play();
  }

  async pause(): Promise<void> {
    if (!this.isIOSWeb) {
      console.log('IOSWebAudioHandler: Not iOS web browser, skipping pause');
      return;
    }

    console.log('IOSWebAudioHandler: Pausing audio on iOS web browser');
    await super.pause();
  }

  async resume(): Promise<void> {
    if (!this.isIOSWeb) {
      console.log('IOSWebAudioHandler: Not iOS web browser, skipping resume');
      return;
    }

    console.log('IOSWebAudioHandler: Resuming audio on iOS web browser');
    await super.resume();
  }

  async stop(): Promise<void> {
    if (!this.isIOSWeb) {
      console.log('IOSWebAudioHandler: Not iOS web browser, skipping stop');
      return;
    }

    console.log('IOSWebAudioHandler: Stopping audio on iOS web browser');
    await super.stop();
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.isIOSWeb) {
      console.log(
        'IOSWebAudioHandler: Not iOS web browser, skipping volume set'
      );
      return;
    }

    console.log(
      'IOSWebAudioHandler: Setting volume on iOS web browser to',
      volume
    );
    await super.setVolume(volume);
  }

  async fadeOut(durationSeconds: number = 10): Promise<void> {
    if (!this.isIOSWeb) {
      console.log('IOSWebAudioHandler: Not iOS web browser, skipping fadeout');
      return;
    }

    console.log('IOSWebAudioHandler: Fading out audio on iOS web browser');
    await super.fadeOut(durationSeconds);
  }

  isAvailable(): boolean {
    if (!this.isIOSWeb) {
      return false;
    }
    return super.isAvailable();
  }
}
