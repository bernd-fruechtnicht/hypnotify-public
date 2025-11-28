# 🧘 Hypnotify - Personalized Meditation & Hypnosis App

[![CI/CD Pipeline](https://github.com/bernd-fruechtnicht/hypnotify-public/actions/workflows/ci.yml/badge.svg)](https://github.com/bernd-fruechtnicht/hypnotify-public/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?logo=expo&logoColor=white)](https://expo.dev/)

A cross-platform meditation and hypnosis app that enables users to create personalized sessions by assembling predefined statements with text-to-speech delivery. Built with React Native, Expo, and TypeScript.

## 🌟 Features

- **🌍 Multi-language Support** - English, German, and Chinese
- **🎯 Personalized Sessions** - Create custom meditation sessions
- **🗣️ Text-to-Speech** - High-quality TTS delivery
- **📱 Cross-platform** - iOS, Android, and Web support
- **🎨 Modern UI** - Clean, intuitive interface
- **🔧 TypeScript** - Full type safety and better developer experience

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/bernd-fruechtnicht/hypnotify-public.git
   cd hypnotify-public
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm start
   ```

4. **Run on your device**
   - Install Expo Go on your phone
   - Scan the QR code from the terminal
   - Or press `w` to open in web browser

## 📱 Development

### Available Scripts

```bash
# Start development server
npm start

# Run on specific platforms
npm run android    # Android
npm run ios        # iOS (macOS only)
npm run web        # Web browser

# Code quality
npm run lint       # ESLint
npm run lint:fix   # Fix linting issues
npm run format     # Prettier formatting
npm run format:check # Check formatting
npm run type-check # TypeScript checking
```

### Project Structure

```
hypnotify/
├── src/
│   ├── components/     # Reusable UI components
│   ├── screens/        # App screens
│   ├── services/       # Business logic and API services
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   ├── constants/      # App constants
│   ├── hooks/          # Custom React hooks
│   ├── contexts/       # React contexts
│   ├── assets/         # Images and static assets
│   └── locales/        # Internationalization files
├── .github/            # GitHub Actions workflows
├── assets/             # Expo assets
└── docs/               # Documentation
```

## 🌍 Internationalization

The app supports three languages:

- **English** (en) - Default
- **German** (de) - Deutsch
- **Chinese** (zh) - 中文

Language files are located in `src/locales/` and the app automatically detects your device language.

## 🏗️ Architecture

This project follows clean architecture principles:

- **Presentation Layer** - React components and screens
- **Business Logic Layer** - Services and contexts
- **Data Layer** - Types and data models
- **Infrastructure Layer** - External dependencies and utilities

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📦 Building for Production

### Android

```bash
# Build APK
npx eas build --platform android

# Build AAB for Play Store
npx eas build --platform android --profile production
```

### iOS

```bash
# Build for iOS
npx eas build --platform ios

# Build for App Store
npx eas build --platform ios --profile production
```

### Web

```bash
# Build web app
npx expo export --platform web

# Deploy to hosting service
npm run deploy:web
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run quality checks (`npm run lint && npm run type-check`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Usage Notice

This project is open source for educational and demonstration purposes. While the MIT License allows commercial use, the original author reserves the right to monetize future premium features, cloud services, and commercial offerings. The core application code is provided as-is for learning and portfolio demonstration.

**Commercial Use**: You are free to use, modify, and distribute this code under the MIT License. However, future premium features, backend services, and commercial versions may be subject to separate licensing terms.

## 🔧 Backend Services

This repository contains the frontend application code only. Backend services (TTS synthesis with stereo panning, audio processing) are **proprietary** and maintained in separate private repositories.

### Environment Variables

To use cloud-based TTS features, you need to configure the following environment variables (see `.env.example` for template):

- `EXPO_PUBLIC_SUPABASE_FUNCTION_URL`: URL to your TTS synthesis service endpoint
- `EXPO_PUBLIC_SUPABASE_API_KEY`: API key for authentication

**Note**: 
- The backend services are **not included** in this repository and are proprietary
- You can implement your own backend services following the same interface
- For local development, the app will fall back to device-native TTS capabilities
- Backend API interface documentation will be added in a future update

## 🗺️ Roadmap

### Phase 1: MVP (Current)

- [x] Project setup and i18n foundation
- [x] Data models and types
- [x] Core services (TTS, audio playback, storage)
- [x] UI components and navigation
- [x] Basic meditation session creation and playback

### Phase 2: Enhanced Features

- [x] Background music integration
- [x] Advanced session features (stereo meditation)
- [x] User preferences and settings

### Phase 3: Future Enhancements

- [ ] Session sharing and export
- [ ] Cloud synchronization
- [ ] AI-generated meditation statements
- [ ] Personalized recommendations
- [ ] Natural language session creation

## 📞 Support

This is an open source project. For support, please use:
- 🐛 [GitHub Issues](https://github.com/bernd-fruechtnicht/hypnotify-public/issues) - Report bugs or request features
- 💬 [GitHub Discussions](https://github.com/bernd-fruechtnicht/hypnotify-public/discussions) - Ask questions or share ideas

## 🙏 Acknowledgments

- [Expo](https://expo.dev/) for the amazing development platform
- [React Native](https://reactnative.dev/) for cross-platform development
- [i18next](https://www.i18next.com/) for internationalization
- [TypeScript](https://www.typescriptlang.org/) for type safety

---

Made with ❤️ for better mental health and mindfulness.
