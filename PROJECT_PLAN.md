# 🧘 Hypnotify - Project Plan & Implementation Guide

## 📋 Current Status

### ✅ Completed Features
- **Multi-language Support** (EN, DE, ZH) with proper i18n
- **Text-to-Speech Integration** (Web, Android, iOS)
- **Voice Selection** per language with friendly names
- **Session Management** with pause/resume functionality
- **Settings Persistence** with proper migration
- **Background Music** with onboarding setup
- **Audio Cleanup** for all navigation scenarios
- **Platform-specific Logic** (Android volume fixed, etc.)
- **Stereo Meditation Foundation** (UI and data structure ready)

### 🔧 Recent Fixes
- **Settings Persistence**: Onboarding no longer overrides settings page values
- **Android Crash Fix**: Proper window.addEventListener check for web platforms
- **Audio File Loading**: Background initialization with retry logic
- **Package Names**: Dev version uses `.dev` suffix for coexistence

## 🎯 Development Strategy

### Phase 1: Android Focus (Current)
- **Platform**: Android development builds
- **Development**: Windows PC with `npx expo start --lan`
- **Testing**: Android device with development build
- **Package**: `de.hypnohh.hypnotify.dev`

### Phase 2: iOS Testing (Future)
- **Platform**: iOS via Expo Go initially
- **Development**: Same Windows PC setup
- **Testing**: iPhone with Expo Go app
- **Package**: `de.hypnohh.hypnotify.dev`

### Phase 3: Production Builds (Future)
- **Android**: EAS Build from Windows
- **iOS**: Hybrid approach (certificates on Mac, builds from Windows)
- **Package**: `de.hypnohh.hypnotify` (production)

## 🛠️ Technical Implementation

### Development Environment
```bash
# Current setup
npx expo start --lan

# Android testing
- Development build installed
- Package: de.hypnohh.hypnotify.dev
- Works offline after initial load
```

### Audio System Architecture
- **BackgroundMusicService**: Lazy initialization with background loading
- **TTSService**: Platform-specific (Web, Android, iOS)
- **Audio Cleanup**: Comprehensive cleanup on navigation/unmount
- **Settings Persistence**: Proper merging without overriding

### Platform-Specific Features
- **Android**: Volume fixed, native TTS voices
- **Web**: Web Speech API, volume control
- **iOS**: Native TTS (when implemented)

## 📱 iOS Implementation Plan

### Step 1: Expo Go Testing
- **Requirements**: iPhone with iOS 11.0+
- **Setup**: Install Expo Go from App Store
- **Testing**: Scan QR code, test all features
- **No Mac required**

### Step 2: Development Builds
- **Requirements**: Mac for certificate generation
- **Process**: 
  1. Generate certificates on Mac (one-time)
  2. Store in EAS
  3. Build from Windows using stored certificates
- **Result**: Full native features on iOS

### Step 3: Production/Ad Hoc Distribution
- **Requirements**: Apple Developer Account ($99/year)
- **Process**: EAS Build with ad hoc provisioning
- **Result**: Production-quality builds for testing/demos

## 🔄 Build Strategy

### Development Builds
```bash
# Android (Windows)
eas build --platform android --profile development

# iOS (Hybrid approach)
# 1. Setup certificates on Mac (one-time)
# 2. Store in EAS
# 3. Build from Windows
eas build --platform ios --profile development
```

### Production Builds
```bash
# Android (Windows)
eas build --platform android --profile production

# iOS (Hybrid approach)
eas build --platform ios --profile production
```

## 📋 Testing Checklist

### Android Testing
- [ ] App startup and navigation
- [ ] TTS functionality with voice selection
- [ ] Background music setup and playback
- [ ] Settings persistence across app restarts
- [ ] Audio cleanup on navigation
- [ ] Offline functionality

### iOS Testing (Future)
- [ ] Expo Go installation and QR code scanning
- [ ] TTS functionality
- [ ] Background music (if supported in Expo Go)
- [ ] Settings persistence
- [ ] Navigation and cleanup

## 🚨 Known Issues & Solutions

### Audio File Loading
- **Issue**: Music file takes time to load on first startup
- **Solution**: Background initialization with retry logic
- **Status**: Implemented, needs testing

### Development Build Persistence
- **Issue**: Audio stops working after a while in dev builds
- **Solution**: Reinitialization logic when cache expires
- **Status**: Implemented, needs testing

### Platform Detection
- **Issue**: Scattered platform checks throughout code
- **Solution**: Centralized platform service (future enhancement)
- **Status**: Not implemented (avoided to prevent more issues)

## 📝 Development Guidelines

### Code Quality
- **Test before commit** - Always verify functionality
- **Understand the problem** - Don't make changes without context
- **Preserve working functionality** - Don't break what works
- **Follow proper engineering practices** - Plan before implementing

### Git Workflow
- **Commit frequently** with descriptive messages
- **Test on device** before pushing
- **Use feature branches** for major changes
- **Document breaking changes**

### Platform Considerations
- **Android**: Volume fixed, native TTS
- **Web**: Web Speech API, volume control
- **iOS**: Native TTS (when implemented)
- **Cross-platform**: Use proper platform detection

## 🎧 Stereo Meditation Strategy

### Current Status
- **POC Complete**: Basic stereo meditation working with pre-generated audio files
- **Challenge**: Need dynamic TTS generation with cloud services
- **Solution**: Cloud TTS + FFmpeg processing + dynamic stereo assembly

### Implementation Plan

#### Phase 1: Backend Service Setup
- **Supabase Project**: Set up project and Edge Functions
- **Google Cloud TTS**: Configure API key and TTS synthesis
- **Cloud TTS Service**: Create `CloudTTSService.ts` for text-to-audio conversion
- **Audio Processing**: FFmpeg integration for stereo panning
- **Caching System**: Store generated audio files for repeated usage

#### Phase 2: Combined Editor/Player Screen
- **New Screen**: `StereoSessionScreen.tsx` (editor + player combined)
- **Statement Selection**: Reuse existing `EditSession` component
- **Left/Right Channels**: Edit statements for rational (left) and emotional (right)
- **Simple Player**: Play/pause/stop controls with statement counters
- **Statement Display**: Show current playing statements for testing

#### Phase 3: Asynchronous Stereo Playback
- **Independent Channels**: Left and right play independently
- **Random Timing**: Overlapping playback with random delays (0.5-2 seconds)
- **Dynamic Generation**: Generate TTS audio on-demand (1-2 second delay, cached)
- **True Stereo**: Pre-processed audio files with FFmpeg for proper panning

#### Phase 4: Integration with Regular Sessions
- **Session Configuration**: Add stereo session option to regular sessions
- **Pre-play Option**: Play stereo session before regular session starts
- **Toggle Control**: "Play Stereo First" option in session settings

### Technical Architecture

#### Backend Service
```typescript
// Supabase Edge Function for TTS
const ttsResponse = await fetch(
  `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
  {
    method: 'POST',
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: language, name: voice },
      audioConfig: { audioEncoding: 'MP3' }
    })
  }
);
```

#### Stereo Session Data Structure
```typescript
interface StereoSession {
  id: string;
  name: string;
  leftChannelStatements: MeditationStatement[];
  rightChannelStatements: MeditationStatement[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Asynchronous Playback Logic
```typescript
class StereoPlayerService {
  async playStereoSession(session: StereoSession) {
    // Start left channel immediately
    this.playChannel(session.leftChannelStatements, 'left');
    
    // Start right channel with random delay
    const randomDelay = Math.random() * 2000 + 500;
    setTimeout(() => {
      this.playChannel(session.rightChannelStatements, 'right');
    }, randomDelay);
  }
}
```

### UI Design

#### StereoSessionScreen Layout
```
┌─────────────────────────────────────┐
│ Stereo Meditation Session           │
├─────────────────────────────────────┤
│ Session: "Bilateral Relaxation"     │
│                                     │
│ Left Channel (Rational):            │
│ ┌─────────────────────────────────┐ │
│ │ [Edit Left Statements] Button   │ │
│ │ Selected: 5 statements          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Right Channel (Emotional):          │
│ ┌─────────────────────────────────┐ │
│ │ [Edit Right Statements] Button  │ │
│ │ Selected: 6 statements          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │        [▶️ Play]                │ │
│ │     [⏸️ Pause] [⏹️ Stop]        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Left: 5/20  Right: 6/20            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Left: "You are completely safe  │ │
│ │ and secure in this moment."     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Right: "Feel the warmth of      │ │
│ │ complete acceptance flowing..." │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Benefits
- **Full Flexibility**: Any text, any time with cloud TTS
- **True Stereo**: Proper left/right channel separation via FFmpeg
- **Natural Randomness**: Asynchronous playback for therapeutic effect
- **Cached Performance**: 1-2 second delay only on first generation
- **Testing Focused**: Statement display for verification
- **Easy Integration**: Can be added to regular sessions

## 🎯 Next Steps

### Immediate (Current Focus)
1. **Set up Supabase project** and configure Edge Functions
2. **Create CloudTTSService** for Google Cloud TTS integration
3. **Implement StereoSessionScreen** (combined editor/player)
4. **Add statement selection** using existing EditSession component
5. **Test basic stereo playback** with dynamic TTS generation

### Short Term
1. **Implement asynchronous playback** with random timing
2. **Add FFmpeg processing** for stereo panning
3. **Create caching system** for generated audio files
4. **Integrate with regular sessions** (stereo pre-play option)
5. **Update navigation** (replace experimental menu item)

### Long Term
1. **User account system** for custom stereo meditations
2. **Advanced audio processing** (noise reduction, normalization)
3. **Multiple TTS providers** (AWS Polly, Azure, ElevenLabs)
4. **Analytics and crash reporting**
5. **Advanced stereo meditation features** (binaural beats, etc.)

### File Structure Updates
```
src/
├── screens/
│   ├── StereoSessionScreen.tsx        ← New (combined editor/player)
│   └── PlayerScreen.tsx               ← Updated (stereo integration)
├── services/
│   ├── CloudTTSService.ts             ← New (Google Cloud TTS)
│   ├── StereoSessionService.ts        ← New (session management)
│   └── StereoPlayerService.ts         ← New (asynchronous playback)
├── types/
│   └── StereoSession.ts               ← New (data structure)
└── components/
    └── EditSession.tsx                ← Updated (channel prop support)
```

## 📝 Documentation Updates Needed

### Files to Update
- [ ] **README.md** - Add stereo meditation feature description
- [ ] **README_PRD.txt** - Update product requirements with stereo meditation
- [ ] **docs/AUDIO_CAPABILITIES.md** - Document stereo meditation capabilities
- [ ] **TESTING.md** - Add stereo meditation testing procedures
- [ ] **CONTRIBUTING.md** - Update contribution guidelines for new features

### Documentation Tasks
- [ ] **Feature Overview** - Document stereo meditation concept and benefits
- [ ] **Technical Architecture** - Explain Web Speech API + native playback approach
- [ ] **User Guide** - How to create and use stereo meditations
- [ ] **Developer Guide** - Implementation details and code structure
- [ ] **Testing Guide** - How to test stereo meditation features
- [ ] **Deployment Guide** - Web and native deployment considerations

### Reminder Checklist
- [ ] Update main README with stereo meditation section
- [ ] Document Web Speech API implementation
- [ ] Add stereo meditation to feature list
- [ ] Update audio capabilities documentation
- [ ] Add testing procedures for stereo features
- [ ] Update contribution guidelines

## 📚 Resources

### Documentation
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

### Tools
- **Development**: `npx expo start --lan`
- **Builds**: `eas build`
- **Testing**: Android dev build, iOS Expo Go
- **Package Management**: `de.hypnohh.hypnotify.dev` (dev), `de.hypnohh.hypnotify` (prod)

---

*Last updated: $(date)*
*Version: 1.0.0*
