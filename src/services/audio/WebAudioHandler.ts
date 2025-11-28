/**
 * Web Audio Handler
 * Handles audio playback using Web Audio API for web browsers
 */

import { IAudioHandler } from './IAudioHandler';

export class WebAudioHandler implements IAudioHandler {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaElementSource: MediaElementAudioSourceNode | null = null;
  private isInitialized = false;
  private playing = false;
  private volume = 0.3;
  private fadeoutCancelled = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('WebAudioHandler: Initializing Web Audio API');

      // Create AudioContext
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Create GainNode for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = this.volume;

      // Connect gain node to destination
      this.gainNode.connect(this.audioContext.destination);

      this.isInitialized = true;
      console.log('WebAudioHandler: Initialized successfully');
    } catch (error) {
      console.error('WebAudioHandler: Failed to initialize:', error);
      throw error;
    }
  }

  async loadAudio(source: any): Promise<void> {
    try {
      // Create HTML audio element for Web Audio API
      console.log('WebAudioHandler: Creating HTML audio element');
      this.audioElement = document.createElement('audio');
      this.audioElement.loop = true;
      this.audioElement.preload = 'auto';
      this.audioElement.volume = 1.0; // Set to max, we'll control via GainNode

      // Resolve the audio source for web
      // require() in web builds may return a relative path or object
      let audioSrc: string;
      if (typeof source === 'string') {
        audioSrc = source;
      } else if (source && typeof source === 'object' && source.uri) {
        audioSrc = source.uri;
      } else if (source && typeof source === 'object' && source.default) {
        audioSrc = source.default;
      } else if (source && typeof source === 'object' && source.__packager_asset) {
        // Expo asset object - construct path from asset
        const assetPath = source.__packager_asset.localUri || source.__packager_asset.uri;
        audioSrc = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
      } else {
        // Try to convert to string (fallback)
        audioSrc = String(source);
      }

      // If it's a relative path, make it absolute
      if (audioSrc && !audioSrc.startsWith('http') && !audioSrc.startsWith('/')) {
        audioSrc = `/${audioSrc}`;
      }

      console.log('WebAudioHandler: Loading audio from:', audioSrc);
      
      // Set the audio source
      this.audioElement.src = audioSrc;

      // Wait for audio to be ready
      await new Promise((resolve, reject) => {
        this.audioElement!.addEventListener('canplaythrough', resolve, {
          once: true,
        });
        this.audioElement!.addEventListener('error', reject, { once: true });
      });

      // Create media element source
      this.mediaElementSource = this.audioContext!.createMediaElementSource(
        this.audioElement
      );

      // Disconnect default connection and connect through gain node
      this.mediaElementSource.connect(this.gainNode!);

      console.log('WebAudioHandler: Audio loaded successfully');
    } catch (error) {
      console.error('WebAudioHandler: Failed to load audio:', error);
      throw error;
    }
  }

  async play(): Promise<void> {
    if (this.audioElement && !this.playing) {
      try {
        // Resume AudioContext if suspended (required for iOS)
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        // Only rewind if this is the first play (not a resume)
        if (this.audioElement.currentTime === 0 || this.audioElement.paused) {
          this.audioElement.currentTime = 0;
        }

        await this.audioElement.play();
        this.playing = true;
        console.log('WebAudioHandler: Started playing audio');
      } catch (error) {
        console.error('WebAudioHandler: Failed to play audio:', error);
        throw error;
      }
    }
  }

  async pause(): Promise<void> {
    if (this.audioElement && this.playing) {
      try {
        this.cancelFadeout();

        // Quick fade out to prevent stuttering
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(
            this.gainNode.gain.value,
            this.audioContext!.currentTime
          );
          this.gainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext!.currentTime + 0.05
          );
        }

        // Wait for fade to complete, then pause
        setTimeout(() => {
          this.audioElement!.pause();
          // Restore volume for resume
          if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(
              this.volume,
              this.audioContext!.currentTime
            );
          }
        }, 50);

        this.playing = false;
        console.log('WebAudioHandler: Paused audio');
      } catch (error) {
        console.error('WebAudioHandler: Failed to pause audio:', error);
        throw error;
      }
    }
  }

  async resume(): Promise<void> {
    if (this.audioElement && !this.playing) {
      try {
        // Resume AudioContext if suspended (required for iOS)
        if (this.audioContext && this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }

        await this.audioElement.play();
        this.playing = true;
        console.log('WebAudioHandler: Resumed audio');
      } catch (error) {
        console.error('WebAudioHandler: Failed to resume audio:', error);
        throw error;
      }
    }
  }

  async stop(): Promise<void> {
    if (this.audioElement && this.playing) {
      try {
        this.cancelFadeout();

        // Fade out quickly to prevent stuttering
        if (this.gainNode) {
          this.gainNode.gain.setValueAtTime(
            this.gainNode.gain.value,
            this.audioContext!.currentTime
          );
          this.gainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext!.currentTime + 0.1
          );
        }

        // Wait for fade to complete, then stop
        setTimeout(() => {
          this.audioElement!.pause();
          this.audioElement!.currentTime = 0;
          // Restore volume for next play
          if (this.gainNode) {
            this.gainNode.gain.setValueAtTime(
              this.volume,
              this.audioContext!.currentTime
            );
          }
        }, 100);

        this.playing = false;
        console.log('WebAudioHandler: Stopped audio');
      } catch (error) {
        console.error('WebAudioHandler: Failed to stop audio:', error);
        throw error;
      }
    }
  }

  async setVolume(volume: number): Promise<void> {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.gainNode) {
      try {
        this.gainNode.gain.value = this.volume;
        console.log('WebAudioHandler: Set volume to', this.volume);
      } catch (error) {
        console.error('WebAudioHandler: Failed to set volume:', error);
        throw error;
      }
    }
  }

  async fadeOut(durationSeconds: number = 10): Promise<void> {
    if (!this.audioElement || !this.playing) {
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
          console.log('WebAudioHandler: Fadeout cancelled');
          return;
        }

        const newVolume = Math.max(0, startVolume - volumeDecrement * (i + 1));
        if (this.gainNode) {
          this.gainNode.gain.value = newVolume;
        }

        await new Promise(resolve => setTimeout(resolve, stepDuration));
      }

      if (this.fadeoutCancelled) {
        console.log('WebAudioHandler: Fadeout cancelled before final stop');
        return;
      }

      // Ensure volume is 0 and stop
      if (this.gainNode) {
        this.gainNode.gain.value = 0;
      }
      if (this.audioElement) {
        this.audioElement.pause();
      }

      this.playing = false;
      this.volume = startVolume;

      console.log(
        'WebAudioHandler: Faded out audio over',
        durationSeconds,
        'seconds'
      );
    } catch (error) {
      console.error('WebAudioHandler: Failed to fade out audio:', error);
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
    return this.isInitialized && this.audioElement !== null;
  }

  getVolume(): number {
    return this.volume;
  }

  async cleanup(): Promise<void> {
    // Clean up Web Audio API resources
    if (this.mediaElementSource) {
      try {
        this.mediaElementSource.disconnect();
        this.mediaElementSource = null;
      } catch (error) {
        console.warn(
          'WebAudioHandler: Failed to disconnect media element source:',
          error
        );
      }
    }

    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
        this.gainNode = null;
      } catch (error) {
        console.warn('WebAudioHandler: Failed to disconnect gain node:', error);
      }
    }

    if (this.audioContext) {
      try {
        await this.audioContext.close();
        this.audioContext = null;
      } catch (error) {
        console.warn('WebAudioHandler: Failed to close audio context:', error);
      }
    }

    this.audioElement = null;
    this.isInitialized = false;
    this.playing = false;

    console.log('WebAudioHandler: Cleaned up resources');
  }
}
