# Development Workflow

This document outlines the development workflow for the Hypnotify app to ensure safe, tested deployments and preserve build minutes.

## Branch Strategy

### Main Branches
- **`main`** - Production branch, only merged code that has been tested and reviewed
- **`develop`** - Development branch for integration testing (optional)

### Feature Branches
- **`feature/description`** - New features (e.g., `feature/voice-selection-fix`)
- **`fix/description`** - Bug fixes (e.g., `fix/vercel-config`)
- **`hotfix/description`** - Critical production fixes

## Development Process

### 1. Create Feature Branch
```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes and Test Locally
```bash
# Make your changes
# Test locally using:
npm start
npm run web
npm run android
npm run ios

# Ensure all tests pass
npm run type-check
npm run lint
```

### 3. Commit Changes
```bash
git add .
git commit -m "feat: add voice selection fix for web platform"
```

### 4. Push Feature Branch
```bash
git push origin feature/your-feature-name
```

### 5. Create Pull Request
- Go to GitHub repository
- Create Pull Request from feature branch to `main`
- Add description of changes
- Request review if needed

### 6. Review and Merge
- Review the changes
- Ensure all checks pass
- Merge to `main` when ready
- Delete feature branch after merge

## Commit Message Convention

Use conventional commit messages:
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add voice selection for web platform
fix: resolve vercel deployment configuration issues
docs: update development workflow documentation
```

## Testing Requirements

### Before Creating PR
- [ ] Code compiles without TypeScript errors
- [ ] All linting rules pass
- [ ] Feature works on target platform(s)
- [ ] No console errors in browser/dev tools
- [ ] Manual testing of the feature

### Before Merging to Main
- [ ] All automated checks pass
- [ ] Code review completed
- [ ] Feature tested on multiple platforms if applicable
- [ ] No breaking changes without documentation

## Deployment Strategy

### Automatic Deployments
- **Feature branches** → Preview deployments (for testing)
- **Main branch** → Production deployment (after PR merge)

### Manual Deployments
- Use Vercel CLI for manual deployments when needed
- Always test in preview environment first

## Emergency Hotfixes

For critical production issues:

```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-issue

# Make minimal fix
# Test thoroughly
# Create PR and merge immediately
```

## Best Practices

### DO:
- ✅ Always create feature branches for changes
- ✅ Test locally before pushing
- ✅ Use descriptive commit messages
- ✅ Create PRs for code review
- ✅ Test on multiple platforms when possible
- ✅ Keep commits focused and atomic

### DON'T:
- ❌ Push directly to main branch
- ❌ Commit without testing
- ❌ Create large, unfocused commits
- ❌ Skip code review for significant changes
- ❌ Deploy without proper testing

## Build Minutes Conservation

To preserve Vercel build minutes:
- Use feature branches for all development
- Test locally before pushing
- Only merge to main when ready for production
- Use preview deployments for testing
- Avoid unnecessary commits and pushes

## Local Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run web      # Web development
npm run android  # Android development
npm run ios      # iOS development (macOS only)

# Run quality checks
npm run type-check  # TypeScript checking
npm run lint        # ESLint checking
npm run lint:fix    # Auto-fix linting issues
```

## Troubleshooting

### Common Issues
1. **Build failures** - Check TypeScript errors and linting issues
2. **Deployment issues** - Verify vercel.json configuration
3. **Voice selection not working** - Check platform-specific TTS service implementation

### Getting Help
- Check existing issues in GitHub
- Review this documentation
- Test locally before asking for help
- Provide detailed error messages and steps to reproduce

---

**Remember: Always test locally before pushing to preserve build minutes and ensure quality deployments.**
