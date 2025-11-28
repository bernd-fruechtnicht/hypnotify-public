/**
 * Audio Handler Factory
 * Creates the appropriate audio handler based on the platform
 */

import { Platform } from 'react-native';
import { IAudioHandler } from './IAudioHandler';
import { ExpoAudioHandler } from './ExpoAudioHandler';
import { WebAudioHandler } from './WebAudioHandler';
import { IOSWebAudioHandler } from './IOSWebAudioHandler';

export class AudioHandlerFactory {
  /**
   * Create the appropriate audio handler for the current platform
   */
  static createHandler(): IAudioHandler {
    if (Platform.OS === 'web') {
      // Check if we're on any iOS web browser (Safari, Chrome, etc.)
      // All iOS browsers use WebKit and have the same audio limitations
      const isIOSWeb = /iPad|iPhone|iPod/.test(navigator.userAgent);

      if (isIOSWeb) {
        console.log(
          'AudioHandlerFactory: Creating iOS Web Audio Handler (Safari/Chrome)'
        );
        return new IOSWebAudioHandler();
      } else {
        console.log('AudioHandlerFactory: Creating Web Audio Handler');
        return new WebAudioHandler();
      }
    } else {
      // Android, iOS native, Electron
      console.log(
        'AudioHandlerFactory: Creating Expo Audio Handler for',
        Platform.OS
      );
      return new ExpoAudioHandler();
    }
  }
}
