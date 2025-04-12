# Development Workflow Guide

## Git Workflow

### Branch Naming Convention
- `feature/`: New features (e.g., `feature/dice-animation`)
- `bugfix/`: Bug fixes (e.g., `bugfix/score-calculation`)
- `hotfix/`: Urgent fixes (e.g., `hotfix/auth-error`)
- `release/`: Release preparation (e.g., `release/v1.0.0`)

### Commit Message Format
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test-related changes
- `chore`: Build process or auxiliary tool changes

### Pull Request Process
1. Create feature branch from `main`
2. Implement changes
3. Run tests and linting
4. Create pull request
5. Request review
6. Address feedback
7. Merge after approval

## Development Environment

### Local Setup
```bash
# Clone repository
git clone https://github.com/yourusername/maxi-yatzy.git
cd maxi-yatzy

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Required Tools
- Node.js 18+
- npm 9+
- Git
- VS Code (recommended)
- ESLint extension
- Prettier extension

## Testing

### Test Categories
- **Unit Tests:** Component and utility functions
- **Integration Tests:** API routes and game logic
- **E2E Tests:** User flows and game scenarios

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
# npm test -- path/to/test.ts # Jest specific pattern might differ
npm test -- <path/to/file.test.ts>

# Run tests with coverage
# npm run test:coverage # Needs coverage script/config
npm test -- --coverage
```

## Code Quality

### Linting
```bash
# Run ESLint
npm run lint

# Fix linting issues
npm run lint:fix
```

### Type Checking
```bash
# Run TypeScript compiler
npm run typecheck
```

## Deployment

### Staging Deployment
1. Merge to `staging` branch
2. Automatic deployment to staging environment
3. Run automated tests
4. Manual testing
5. Approval for production

### Production Deployment
1. Create release branch
2. Update version number
3. Update changelog
4. Create pull request
5. Review and approve
6. Merge to `main`
7. Create release tag
8. Automatic deployment

### Environment Variables
```env
# Required for all environments
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Optional
NEXT_PUBLIC_ENABLE_BETTING=false
NEXT_PUBLIC_ENABLE_SOUND=true
```

## Monitoring

### Error Tracking
- Sentry integration
- Error boundary implementation
- Logging service

### Performance Monitoring
- Vercel Analytics
- Custom performance metrics
- User experience monitoring

## Documentation

### Documentation Updates
1. Update relevant documentation
2. Include code examples
3. Add screenshots if needed
4. Update version numbers
5. Commit with `docs` type

### Documentation Review
- Technical accuracy
- Code examples
- Clarity and completeness
- Formatting consistency

## Release Process

### Pre-release Checklist
- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version numbers updated
- [ ] Dependencies checked
- [ ] Security audit completed

### Release Steps
1. Create release branch
2. Update version numbers
3. Update changelog
4. Create pull request
5. Review and approve
6. Merge to main
7. Create release tag
8. Deploy to production

### Post-release Tasks
- [ ] Verify deployment
- [ ] Monitor for issues
- [ ] Update documentation
- [ ] Archive release branch 

## Recent Updates and Fixes

### Gameplay Logic
- **Fixed**: First player now correctly gets all three rolls (including the automatic first roll) on their initial turn
  - Fixed in: `src/components/game/dice-container.tsx`
  - Fix involved:
    - Removing redundant `useEffect` hook that was causing a race condition
    - Adding additional logging for debugging
    - Ensuring roll count is properly tracked for all players
  - Status: ✅ Verified working

### Build Improvements
- **Fixed**: Production build issues with ESLint warnings and errors
  - The application now builds successfully with `npm run build`
  - Fixes implemented:
    - Added missing dependencies to useEffect hooks in play/page.tsx and dice-container.tsx
    - Fixed unescaped apostrophes by using &apos; entity
    - Updated .eslintrc.json to disable the react/no-unescaped-entities rule
    - Wrapped callback functions in useCallback to prevent unnecessary re-renders
    - Reorganized code to fix dependency ordering issues
  - Status: ✅ Build passing

### Remaining Issues
- **Authentication**: Multiple issues with the auth flow need to be addressed
- **UI/UX**: Mobile responsiveness and animations need improvement
- **Documentation**: Continue updating as features are completed

### Next Development Focus
1. Authentication fixes
2. UI polish
3. Testing improvements 