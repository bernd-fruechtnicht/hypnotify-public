/**
 * Client-side stereo panning utility using Web Audio API
 * This handles stereo panning without requiring server-side FFmpeg
 */

export interface StereoPanningOptions {
  /** Audio data as base64 string */
  audioData: string;
  /** Pan position: -1 (left), 0 (center), 1 (right) */
  pan: number;
  /** Audio context for processing */
  audioContext: AudioContext;
}

export interface StereoPanningResult {
  /** Processed audio buffer */
  audioBuffer: AudioBuffer;
  /** Left channel audio buffer */
  leftBuffer: AudioBuffer;
  /** Right channel audio buffer */
  rightBuffer: AudioBuffer;
}

/**
 * Convert base64 audio to AudioBuffer
 */
async function base64ToAudioBuffer(
  base64Audio: string,
  audioContext: AudioContext
): Promise<AudioBuffer> {
  // Convert base64 to ArrayBuffer
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Decode audio data
  return await audioContext.decodeAudioData(bytes.buffer);
}

/**
 * Create stereo audio with panning
 */
export async function createStereoAudio(
  options: StereoPanningOptions
): Promise<StereoPanningResult> {
  const { audioData, pan, audioContext } = options;

  try {
    // Convert base64 to AudioBuffer
    const sourceBuffer = await base64ToAudioBuffer(audioData, audioContext);

    // Create stereo buffer
    const stereoBuffer = audioContext.createBuffer(
      2, // 2 channels (stereo)
      sourceBuffer.length,
      sourceBuffer.sampleRate
    );

    // Get source data (assuming mono input)
    const sourceData = sourceBuffer.getChannelData(0);
    const leftChannel = stereoBuffer.getChannelData(0);
    const rightChannel = stereoBuffer.getChannelData(1);

    // Calculate pan coefficients
    // pan = -1 (left only), 0 (center), 1 (right only)
    const leftGain = pan <= 0 ? 1 : 1 - pan;
    const rightGain = pan >= 0 ? 1 : 1 + pan;

    // Apply panning
    for (let i = 0; i < sourceData.length; i++) {
      leftChannel[i] = sourceData[i] * leftGain;
      rightChannel[i] = sourceData[i] * rightGain;
    }

    // Create separate left and right buffers for independent playback
    const leftBuffer = audioContext.createBuffer(
      1,
      sourceBuffer.length,
      sourceBuffer.sampleRate
    );
    const rightBuffer = audioContext.createBuffer(
      1,
      sourceBuffer.length,
      sourceBuffer.sampleRate
    );

    const leftData = leftBuffer.getChannelData(0);
    const rightData = rightBuffer.getChannelData(0);

    for (let i = 0; i < sourceData.length; i++) {
      leftData[i] = sourceData[i] * leftGain;
      rightData[i] = sourceData[i] * rightGain;
    }

    return {
      audioBuffer: stereoBuffer,
      leftBuffer,
      rightBuffer,
    };
  } catch (error) {
    console.error('Stereo panning failed:', error);
    throw new Error(
      `Stereo panning failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Create hard-panned audio (left or right channel only)
 */
export async function createHardPannedAudio(
  audioData: string,
  channel: 'left' | 'right',
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const sourceBuffer = await base64ToAudioBuffer(audioData, audioContext);

  // Create stereo buffer with hard panning
  const stereoBuffer = audioContext.createBuffer(
    2,
    sourceBuffer.length,
    sourceBuffer.sampleRate
  );
  const sourceData = sourceBuffer.getChannelData(0);
  const leftChannel = stereoBuffer.getChannelData(0);
  const rightChannel = stereoBuffer.getChannelData(1);

  for (let i = 0; i < sourceData.length; i++) {
    if (channel === 'left') {
      leftChannel[i] = sourceData[i];
      rightChannel[i] = 0;
    } else {
      leftChannel[i] = 0;
      rightChannel[i] = sourceData[i];
    }
  }

  return stereoBuffer;
}

/**
 * Create rational (left) or emotional (right) panned audio
 */
export async function createMeditationAudio(
  audioData: string,
  type: 'rational' | 'emotional',
  audioContext: AudioContext
): Promise<AudioBuffer> {
  const channel = type === 'rational' ? 'left' : 'right';
  return await createHardPannedAudio(audioData, channel, audioContext);
}
