# 🧪 Testing Guide for Hypnotify

## Quick Start Testing

### 1. **Run the Mock Service Test**

```bash
node test-services.js
```

This will test our service mocks and show you what to expect.

### 2. **Start the Development Server**

```bash
npx expo start
```

### 3. **Choose Your Testing Platform**

#### **Option A: Mobile Device (Recommended)**

1. Install **Expo Go** app on your phone
2. Scan the QR code from the terminal
3. The app will load on your device

#### **Option B: Web Browser**

1. Press `w` in the terminal
2. App opens in your browser
3. Good for quick UI testing

#### **Option C: Android Emulator**

1. Press `a` in the terminal
2. Requires Android Studio setup
3. Best for Android-specific testing

#### **Option D: iOS Simulator (Mac only)**

1. Press `i` in the terminal
2. Requires Xcode setup
3. Best for iOS-specific testing

## 🔍 What to Test

### **Core Functionality Tests**

#### **1. App Initialization**

- [ ] App loads without crashes
- [ ] Loading screen appears
- [ ] Services initialize successfully
- [ ] Service status shows green checkmarks

#### **2. Language Support**

- [ ] App detects device language
- [ ] Language selector opens when tapped
- [ ] Can switch between English, German, Chinese
- [ ] UI updates immediately after language change

#### **3. Service Health**

- [ ] TTS service shows as available
- [ ] Audio service shows as initialized
- [ ] Storage service shows as working

### **Service-Specific Tests**

#### **TTS Service Testing**

```javascript
// In browser console or React Native debugger:
// Test TTS functionality
import { ttsService } from './src/services';
await ttsService.speak('Hello, this is a test');
```

#### **Storage Service Testing**

```javascript
// Test storage functionality
import { storageService } from './src/services';
await storageService.saveStatement({
  id: 'test-1',
  text: 'Test statement',
  language: 'en',
  category: 'breathing',
  difficulty: 'beginner',
  createdAt: new Date(),
});
```

#### **Audio Service Testing**

```javascript
// Test audio functionality
import { audioService } from './src/services';
await audioService.playBackgroundMusic({
  enabled: true,
  musicPath: 'https://example.com/music.mp3',
  volume: 0.5,
  loop: true,
});
```

## 🐛 Troubleshooting

### **Common Issues & Solutions**

#### **1. "Metro bundler" errors**

```bash
# Clear cache and restart
npx expo start --clear
```

#### **2. "Tunnel connection failed"**

```bash
# Use local network instead
npx expo start --lan
```

#### **3. "Services not initializing"**

- Check console logs for specific errors
- Verify all dependencies are installed
- Try restarting the development server

#### **4. "Language not changing"**

- Check if i18n is properly initialized
- Verify translation files exist
- Clear app cache and restart

#### **5. "Expo Go fails to download/load app"**

- **Issue**: Expo Go shows "failed to download" or "none of these files exist" errors
- **Solution**: Log in to Expo account in Expo Go app
  - Open Expo Go app on your device
  - Go to profile/settings and log in with your Expo account
  - Or log in via terminal: `npx expo login`
  - Then scan QR code again
- **Root Cause**: Unverified apps require Expo account login in Expo Go
- **Note**: This is different from `expo-dev-client` - even without dev-client, login may be required

### **Debug Mode**

#### **Enable Debug Logging**

```bash
# Start with debug logs
npx expo start --dev-client
```

#### **React Native Debugger**

1. Press `j` in the terminal
2. Opens React Native debugger
3. View console logs and network requests

#### **Expo DevTools**

1. Press `shift+m` in the terminal
2. Opens Expo DevTools
3. View performance metrics and logs

## 📊 Performance Testing

### **Load Testing**

```bash
# Test with performance monitoring
npx expo start --dev-client --minify
```

### **Memory Usage**

- Monitor memory usage in DevTools
- Check for memory leaks during service initialization
- Test app performance with multiple language switches

## 🔧 Manual Testing Checklist

### **UI/UX Testing**

- [ ] App loads within 3 seconds
- [ ] Smooth animations and transitions
- [ ] Proper text scaling for different languages
- [ ] Touch targets are appropriately sized
- [ ] No layout issues on different screen sizes

### **Functionality Testing**

- [ ] All buttons respond to touch
- [ ] Language selector modal opens/closes properly
- [ ] Service status updates correctly
- [ ] No crashes during normal usage
- [ ] App handles network interruptions gracefully

### **Cross-Platform Testing**

- [ ] Test on Android device
- [ ] Test on iOS device (if available)
- [ ] Test on web browser
- [ ] Verify consistent behavior across platforms

## 📱 Device-Specific Testing

### **Android Testing**

```bash
# Build and test on Android
npx expo run:android
```

### **iOS Testing**

```bash
# Build and test on iOS (Mac only)
npx expo run:ios
```

### **Web Testing**

```bash
# Build for web
npx expo export --platform web
```

## 🚀 Production Testing

### **Build Testing**

```bash
# Test production build
npx expo build:android
npx expo build:ios
```

### **EAS Build Testing**

```bash
# Test with EAS Build
npx eas build --platform all --profile preview
```

## 📝 Test Results Template

```
Test Date: ___________
Device: ___________
OS Version: ___________
App Version: ___________

✅ Passed Tests:
- [ ] App initialization
- [ ] Language switching
- [ ] Service health
- [ ] UI responsiveness

❌ Failed Tests:
- [ ] Issue 1: Description
- [ ] Issue 2: Description

🔧 Issues Found:
- Issue: Description
- Solution: Description

📊 Performance:
- Load time: ___ seconds
- Memory usage: ___ MB
- Battery impact: Low/Medium/High
```

## 🎯 Next Steps After Testing

1. **Fix any critical issues** found during testing
2. **Optimize performance** based on test results
3. **Update documentation** with any new findings
4. **Prepare for Phase 3** development

---

**Happy Testing! 🎉**

Remember: Testing is an iterative process. Run tests frequently during development to catch issues early.
