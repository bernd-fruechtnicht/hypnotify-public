# Audio Capabilities Matrix

This document outlines the audio capabilities and volume controls across different platforms in the Hypnotify app.

## Volume Control Hierarchy

### 1. System/Device Volume (External Control)
- **Android**: Hardware volume buttons + system volume slider
- **iOS**: Hardware volume buttons + Control Center volume slider  
- **Web**: Browser/system volume controls
- **Electron**: System volume controls
- **Control**: User controls via device/browser
- **Scope**: Affects ALL audio output from the app

### 2. App-Level Volume Controls

| Volume Type | Platform | Control Location | Implementation | Notes |
|-------------|----------|------------------|----------------|-------|
| **Master Volume** | All | Settings → Audio | ❌ Not Implemented | Placeholder setting only |
| **TTS Volume** | All | Settings → TTS | ✅ Implemented | Controls speech volume |
| **Background Music Volume** | All | Settings → Audio | ✅ Implemented | Controls music volume |

## Platform-Specific Audio Capabilities

### Android (Native)
| Feature | Capability | Implementation | Notes |
|---------|------------|----------------|-------|
| TTS Volume | ✅ Fixed at 100% | `expo-speech` | Volume controlled by system |
| Background Music | ✅ Variable | `expo-av` | Independent volume control |
| Audio Mixing | ✅ Supported | Native audio system | TTS + Music can play simultaneously |
| Background Playback | ✅ Supported | Audio session management | Continues when app is backgrounded |

### iOS (Native)
| Feature | Capability | Implementation | Notes |
|---------|------------|----------------|-------|
| TTS Volume | ✅ Variable | `expo-speech` | Can be controlled by app |
| Background Music | ✅ Variable | `expo-av` | Independent volume control |
| Audio Mixing | ✅ Supported | AVAudioSession | TTS + Music can play simultaneously |
| Background Playback | ✅ Supported | Background audio mode | Continues when app is backgrounded |

### Web Browser
| Feature | Capability | Implementation | Notes |
|---------|------------|----------------|-------|
| TTS Volume | ✅ Variable | Web Speech API | Can be controlled by app |
| Background Music | ✅ Variable | Web Audio API + GainNode | Independent volume control (iOS web browsers fixed) |
| Audio Mixing | ✅ Supported | Browser audio context | TTS + Music can play simultaneously |
| Background Playback | ❌ Limited | Browser restrictions | May pause when tab is inactive |

### Electron (Desktop)
| Feature | Capability | Implementation | Notes |
|---------|------------|----------------|-------|
| TTS Volume | ✅ Variable | System TTS (SAPI) | Can be controlled by app |
| Background Music | ✅ Variable | `expo-av` | Independent volume control |
| Audio Mixing | ✅ Supported | System audio mixer | TTS + Music can play simultaneously |
| Background Playback | ✅ Supported | Desktop app | Continues when window is minimized |

## Volume Control Implementation Details

### TTS Volume Control
```typescript
// How TTS volume is applied
const ttsVolume = settings.tts.defaultVolume; // 0.0 - 1.0
const systemVolume = deviceVolume; // Controlled by user

// Final TTS volume = ttsVolume * systemVolume
// Example: TTS setting 50% × System volume 80% = 40% effective volume
```

### Background Music Volume Control
```typescript
// How background music volume is applied
const musicVolume = settings.audio.backgroundMusic.volume; // 0.0 - 1.0
const systemVolume = deviceVolume; // Controlled by user

// Final music volume = musicVolume * systemVolume
// Example: Music setting 30% × System volume 80% = 24% effective volume

// iOS Web Browser Fix:
// Uses Web Audio API with GainNode for proper volume control
// Standard expo-av setVolumeAsync() is ignored on iOS web browsers (Safari, Chrome, etc.)
if (Platform.OS === 'web' && isIOSWeb) {
  gainNode.gain.value = musicVolume; // Direct Web Audio API control
} else {
  await sound.setVolumeAsync(musicVolume); // Standard expo-av control
}
```

### Master Volume (Not Implemented)
```typescript
// If master volume were implemented:
const masterVolume = settings.audio.masterVolume; // 0.0 - 1.0
const ttsVolume = settings.tts.defaultVolume; // 0.0 - 1.0
const musicVolume = settings.audio.backgroundMusic.volume; // 0.0 - 1.0
const systemVolume = deviceVolume; // Controlled by user

// Final volumes would be:
// TTS: masterVolume * ttsVolume * systemVolume
// Music: masterVolume * musicVolume * systemVolume
```

## Audio Session Management

### Android
- **Audio Focus**: Automatically managed by `expo-av`
- **Ducking**: TTS can duck background music
- **Interruption**: Phone calls pause audio, resume after call

### iOS  
- **Audio Session**: Configured for background playback
- **Category**: `AVAudioSessionCategoryPlayback`
- **Options**: `AVAudioSessionCategoryOptionMixWithOthers`

### Web
- **Audio Context**: Single context for all audio
- **User Activation**: Requires user interaction to start audio
- **Autoplay Policy**: Restricted by browser policies

### Electron
- **System Integration**: Uses system audio services
- **No Restrictions**: Full desktop audio capabilities

## Recommendations

### For Users
1. **Primary Volume Control**: Use device/system volume controls
2. **Fine-tuning**: Use app-level TTS and background music volume controls
3. **Audio Mixing**: Adjust TTS and music volumes independently for optimal balance

### For Developers
1. **Master Volume**: Consider implementing if users request it
2. **Volume Persistence**: Ensure volume settings persist across app restarts
3. **Audio Focus**: Handle interruptions gracefully (calls, notifications)
4. **Cross-platform Testing**: Test audio behavior on all target platforms

## Current Implementation Status

| Feature | Android | iOS | Web | Electron | Status |
|---------|---------|-----|-----|----------|--------|
| TTS Volume Control | Fixed (100%) | Variable | Variable | Variable | ✅ Implemented |
| Background Music | Variable | Variable | Variable | Variable | ✅ Implemented |
| Master Volume | N/A | N/A | N/A | N/A | ❌ Not Implemented |
| Audio Mixing | ✅ | ✅ | ✅ | ✅ | ✅ Working |
| Background Playback | ✅ | ✅ | ⚠️ Limited | ✅ | ✅ Working |

## Future Enhancements

1. **Master Volume Implementation**: Add app-level master volume control
2. **Audio Presets**: Pre-configured volume combinations for different scenarios
3. **Dynamic Volume**: Automatically adjust volumes based on content type
4. **Audio Effects**: Add reverb, echo, or other audio processing
5. **Spatial Audio**: Support for 3D audio positioning (iOS/Android)
