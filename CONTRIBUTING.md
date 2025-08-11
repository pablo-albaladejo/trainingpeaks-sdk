# Contributing to TrainingPeaks SDK

Thank you for your interest in contributing to TrainingPeaks SDK! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch
4. **Make** your changes
5. **Test** your changes
6. **Commit** with conventional commit format
7. **Push** to your fork
8. **Create** a pull request

## 📋 Prerequisites

- Node.js 20+ and npm
- Git
- Basic knowledge of TypeScript and functional programming

## 🏗️ Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/trainingpeaks-sdk.git
cd trainingpeaks-sdk

# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Check types
npm run type-check

# Build package
npm run build
```

## 🔧 Development Guidelines

### Code Style

- **TypeScript**: Use only types, no interfaces
- **Functional**: Use functional patterns, no classes
- **Immutability**: Prefer immutable data structures
- **Pure functions**: Write pure functions when possible
- **Error handling**: Use Result types for error handling
- **Logging**: Use the logger instead of console.log

### Architecture Principles

- **Clean Architecture**: Follow the established layer structure
- **Dependency Injection**: Pass dependencies as parameters
- **Separation of Concerns**: Keep layers independent
- **Single Responsibility**: Each function/module has one purpose
- **Testability**: Write testable code

### File Organization

```
src/
├── domain/           # Business logic and entities
├── application/      # Use cases and service contracts
├── adapters/         # External integrations and concrete implementations
└── shared/           # Shared utilities and types
```

### Testing Requirements

- **Coverage**: Maintain high test coverage
- **Fixtures**: Use Rosie Factory for test data
- **Isolation**: Each test should be independent
- **Naming**: Test files named after function being tested
- **Scenarios**: Test happy path, edge cases, and errors

## 📝 Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
type(scope): description

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `chore`: Build/tooling changes
- `ci`: CI/CD changes
- `security`: Security improvements
- `breaking`: Breaking changes

### Scopes

- `auth`: Authentication related
- `workouts`: Workout management
- `users`: User management
- `http`: HTTP client
- `storage`: Data storage
- `validation`: Data validation
- `logging`: Logging system
- `testing`: Testing framework
- `build`: Build system
- `ci`: CI/CD
- `docs`: Documentation
- `deps`: Dependencies

### Examples

```
feat(auth): add OAuth 2.0 support
fix(workouts): resolve workout sync issue
docs(api): update authentication examples
refactor(http): improve error handling
perf(validation): optimize schema validation
test(workouts): add workout fixture tests
chore(deps): update dependencies
ci(workflow): add security scanning
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

# Run specific test file
npm test -- src/domain/entities/workout.test.ts

# Run tests matching pattern
npm test -- --grep "workout"
```

### Writing Tests

- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- Use fixtures for test data
- Mock external dependencies
- Test error scenarios
- Test edge cases

### Test Structure

```typescript
describe('Workout Entity', () => {
  describe('create', () => {
    it('should create a valid workout', () => {
      // Arrange
      const workoutData = workoutFixture.build();

      // Act
      const result = Workout.create(workoutData);

      // Assert
      expect(result.isSuccess()).toBe(true);
      expect(result.value).toBeInstanceOf(Workout);
    });

    it('should fail with invalid data', () => {
      // Arrange
      const invalidData = { ...workoutFixture.build(), name: '' };

      // Act
      const result = Workout.create(invalidData);

      // Assert
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('Workout name cannot be empty');
    });
  });
});
```

## 🔍 Code Review Process

1. **Create PR**: Use the provided template
2. **Self-review**: Review your own code first
3. **CI checks**: Ensure all CI checks pass
4. **Review request**: Request review from maintainers
5. **Address feedback**: Make requested changes
6. **Approval**: Get approval from maintainers
7. **Merge**: Maintainers will merge when ready

### PR Checklist

- [ ] Code follows project standards
- [ ] Tests pass and coverage maintained
- [ ] Documentation updated
- [ ] Changelogs updated
- [ ] No breaking changes (or documented)
- [ ] Performance impact considered
- [ ] Security implications reviewed

## 🐛 Bug Reports

When reporting bugs, please include:

- **Description**: Clear description of the issue
- **Steps**: Steps to reproduce
- **Expected**: Expected behavior
- **Actual**: Actual behavior
- **Environment**: OS, Node.js version, etc.
- **Code**: Minimal code to reproduce

## ✨ Feature Requests

When requesting features, please include:

- **Use case**: Why this feature is needed
- **Proposal**: How it should work
- **Alternatives**: Other solutions considered
- **Impact**: Who benefits and how

## 📚 Documentation

- Keep documentation up to date
- Include examples and use cases
- Document breaking changes
- Update changelogs for all changes
- Use clear and concise language

## 🚫 What Not to Do

- Don't commit secrets or sensitive data
- Don't ignore failing tests
- Don't skip code review
- Don't merge without approval
- Don't break existing functionality without migration plan
- Don't use console.log (use logger instead)

## 🤝 Community

- Be respectful and inclusive
- Help other contributors
- Share knowledge and best practices
- Report issues promptly
- Suggest improvements

## 📞 Getting Help

- **Issues**: Use GitHub issues for bugs and features
- **Discussions**: Use GitHub discussions for questions
- **Security**: Email security@trainingpeaks.com for security issues
- **Documentation**: Check the docs folder first

## 🏆 Recognition

Contributors will be recognized in:

- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors list

Thank you for contributing to TrainingPeaks SDK! 🎉
