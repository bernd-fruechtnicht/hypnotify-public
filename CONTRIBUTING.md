# Contributing to Hypnotify

Thank you for your interest in contributing to Hypnotify! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Expo CLI (`npm install -g @expo/cli`)

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/yourusername/hypnotify.git
   cd hypnotify
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: All code must be written in TypeScript
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Code is automatically formatted with Prettier
- **Naming**: Use camelCase for variables and functions, PascalCase for components

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(i18n): add German language support
fix(tts): resolve audio playback issue
docs(readme): update installation instructions
```

### Pull Request Process

1. **Create a feature branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests for new functionality
   - Update documentation if needed

3. **Run quality checks**

   ```bash
   npm run lint
   npm run type-check
   npm run format:check
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for utility functions
- Write integration tests for services
- Write component tests for UI components
- Aim for high test coverage (>80%)

## 🌍 Internationalization

When adding new text to the app:

1. **Add translations to all language files:**
   - `src/locales/en/common.json`
   - `src/locales/de/common.json`
   - `src/locales/zh/common.json`

2. **Use the translation key in your component:**

   ```typescript
   const { t } = useTranslation();
   return <Text>{t('your.translation.key')}</Text>;
   ```

3. **Test in all languages** to ensure proper display

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the bug
- **Steps to reproduce**: Detailed steps to reproduce the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Environment**: OS, device, app version
- **Screenshots**: If applicable

## ✨ Feature Requests

When requesting features:

- **Description**: Clear description of the feature
- **Use case**: Why this feature would be useful
- **Proposed solution**: How you think it should work
- **Alternatives**: Other solutions you've considered

## 📱 Platform Considerations

### Mobile (iOS/Android)

- Test on both platforms
- Consider different screen sizes
- Test with different device orientations
- Ensure accessibility compliance

### Web

- Test in different browsers
- Ensure responsive design
- Consider keyboard navigation
- Test with different screen resolutions

## 🔒 Security

- Never commit sensitive information (API keys, passwords, etc.)
- Use environment variables for configuration
- Follow security best practices
- Report security vulnerabilities privately

## 📚 Documentation

- Update README.md for significant changes
- Add JSDoc comments for functions and components
- Update API documentation if applicable
- Include examples in your code

## 🎯 Areas for Contribution

### High Priority

- Core meditation functionality
- TTS and audio playback
- Session management
- User interface improvements

### Medium Priority

- Performance optimizations
- Additional language support
- Accessibility improvements
- Testing coverage

### Low Priority

- Documentation improvements
- Code refactoring
- Developer experience improvements

## 💬 Communication

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and ideas
- **Pull Requests**: For code contributions

## 📄 License

By contributing to Hypnotify, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Hypnotify! 🧘‍♀️
