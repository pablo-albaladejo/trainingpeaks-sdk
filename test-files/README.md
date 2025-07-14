# Test Files Directory

This directory contains sample workout files for integration testing with the TrainingPeaks SDK's Function-First Architecture.

## File Types

- **GPX**: GPS Exchange Format files for GPS-based workouts
- **TCX**: Training Center XML files from Garmin devices
- **FIT**: Flexible and Interoperable Data Transfer files

## Usage

These files are used by the integration tests to validate actual file upload functionality using the SDK's factory function patterns. The integration tests create test files dynamically, but you can also place real workout files here for more comprehensive testing.

### Integration Testing with Function-First Architecture

The integration tests use the new `createTrainingPeaksClient()` factory function:

```typescript
import { createTrainingPeaksClient } from '../src';

// Tests use the factory function pattern
const client = createTrainingPeaksClient({
  authMethod: 'web',
  debug: false,
});
```

## Environment Setup

Before running integration tests, ensure you have:

1. **Environment Configuration**:

   ```bash
   cp .env.example .env
   ```

2. **Fill in your TrainingPeaks credentials** in `.env`:

   ```env
   TRAININGPEAKS_TEST_USERNAME=your-test-username
   TRAININGPEAKS_TEST_PASSWORD=your-test-password
   TRAININGPEAKS_AUTH_METHOD=web
   TRAININGPEAKS_WEB_HEADLESS=true
   ```

3. **Install Playwright browsers** (for web authentication):
   ```bash
   npx playwright install chromium
   ```

## Running Integration Tests

```bash
# Run only integration tests
npm run test:integration

# Run all tests (unit + integration)
npm run test:all

# Run with coverage
npm run test:coverage:all

# Watch integration tests during development
npm run test:watch:integration
```

## Test Architecture

The integration tests follow the same Function-First principles as the main SDK:

- **Factory Functions**: Tests use `createTrainingPeaksClient()` instead of class constructors
- **Dependency Injection**: Test dependencies are injected via function parameters
- **Immutable Patterns**: Test data follows immutable patterns
- **Type Safety**: Full TypeScript coverage in test scenarios

## Sample Test Workflow

1. **Client Creation**: Factory function creates test client
2. **Authentication**: Real browser simulation or API authentication
3. **File Upload**: Test various workout file formats
4. **Validation**: Verify upload success and data integrity
5. **Cleanup**: Remove test data to avoid pollution

## Test Data Guidelines

- **Use anonymized data**: Remove personal information from workout files
- **Keep files small**: Use minimal data sets for faster test execution
- **Test variety**: Include different file formats and data scenarios
- **Edge cases**: Test boundary conditions and error scenarios

## Security

**⚠️ Important**:

- Never commit real credentials or sensitive workout data to version control
- Use dedicated test accounts for integration testing
- Ensure test data is anonymized and doesn't contain personal information
- Use headless browser mode in CI/CD environments

## Documentation References

- [Main README](../README.md) - Getting started and API reference
- [Migration Guide](../MIGRATION.md) - Upgrading from v1.x to v2.x
- [Logger Configuration](../docs/logger-configuration.md) - Logging setup
- [Release Process](../docs/RELEASE_PROCESS.md) - Development workflow
