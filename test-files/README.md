# Test Files Directory

This directory has sample workout files for testing with the TrainingPeaks SDK.

## Types of files

- **GPX**: GPS Exchange Format files for GPS-based workouts
- **TCX**: Training Center XML files from Garmin devices
- **FIT**: Flexible and Interoperable Data Transfer files

## Usage

These files are used by the integration tests to check that file upload works using the SDK's function patterns. The integration tests create test files automatically, but you can also put real workout files here for more complete testing.

### Integration testing with function-first architecture

The integration tests use the new `createTrainingPeaksClient()` factory function:

```typescript
import { createTrainingPeaksClient } from '../src';

// Tests use the factory function pattern
const client = createTrainingPeaksClient({
  authMethod: 'web',
  debug: false,
});
```

## Environment setup

Before running integration tests, make sure you have:

1. **Environment setup**:

   ```bash
   cp .env.example .env
   ```

2. **Add your TrainingPeaks login details** in `.env`:

   ```env
   TRAININGPEAKS_TEST_USERNAME=your-test-username
   TRAININGPEAKS_TEST_PASSWORD=your-test-password
   TRAININGPEAKS_AUTH_METHOD=web
   TRAININGPEAKS_WEB_HEADLESS=true
   ```

3. **Install Playwright browsers** (for web login):
   ```bash
   npx playwright install chromium
   ```

## Running integration tests

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

## Test architecture

The integration tests follow the same function-first principles as the main SDK:

- **Factory functions**: Tests use `createTrainingPeaksClient()` instead of class constructors
- **Dependency injection**: Test dependencies are passed via function parameters
- **Immutable patterns**: Test data follows immutable patterns
- **Type safety**: Full TypeScript coverage in test scenarios

## Sample test workflow

1. **Client creation**: Factory function creates test client
2. **Login**: Real browser simulation or API login
3. **File upload**: Test various workout file formats
4. **Check results**: Make sure upload worked and data is correct
5. **Cleanup**: Remove test data to keep things clean

## Test data guidelines

- **Use anonymous data**: Remove personal information from workout files
- **Keep files small**: Use minimal data sets for faster test execution
- **Test variety**: Include different file formats and data scenarios
- **Edge cases**: Test boundary conditions and error scenarios

## Security

**⚠️ Important**:

- Never commit real login details or sensitive workout data to version control
- Use dedicated test accounts for integration testing
- Make sure test data is anonymous and doesn't have personal information
- Use headless browser mode in CI/CD environments

## Documentation References

- [Main README](../README.md) - Getting started and API reference
- [Migration Guide](../MIGRATION.md) - Upgrading from v1.x to v2.x
- [Logger Configuration](../docs/logger-configuration.md) - Logging setup
- [Release Process](../docs/RELEASE_PROCESS.md) - Development workflow
