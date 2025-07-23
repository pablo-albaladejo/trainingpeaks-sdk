# Integration Tests

This directory contains topic-specific integration tests for the TrainingPeaks SDK. The tests are organized by functionality to make them easier to maintain and run independently.

## Test Structure

### 📁 `auth.integ-test.ts`
**Authentication Integration Tests**
- Environment setup validation
- Authentication flow (login/logout)
- Authentication state management
- Multiple login/logout cycles
- Error handling for invalid credentials

### 📁 `workout.integ-test.ts`
**Workout Operations Integration Tests**
- Workout upload with files (GPX, TCX)
- Workout upload without files (manual entry)
- Workout management (list, get, delete)
- Structured workout creation
- Workout search and filtering
- Pagination handling

### 📁 `client.integ-test.ts`
**Client Configuration Integration Tests**
- Configuration management and overrides
- Client initialization
- Configuration validation
- Configuration immutability
- Environment variable integration

## Running Tests

### Run All Integration Tests
```bash
npm run test:integration
```

### Run Topic-Specific Tests

#### Authentication Tests Only
```bash
npm run test:integration:auth
```

#### Workout Tests Only
```bash
npm run test:integration:workout
```

#### Client Configuration Tests Only
```bash
npm run test:integration:client
```

### Run with Watch Mode
```bash
# Watch all integration tests
npm run test:watch:integration

# Watch specific topic (example: auth)
vitest --config vitest.integration.config.ts src/integration/auth.integ-test.ts --watch
```

## Environment Setup

Before running integration tests, ensure you have:

1. **Environment variables set**:
   ```bash
   export TRAININGPEAKS_TEST_USERNAME="your-test-username"
   export TRAININGPEAKS_TEST_PASSWORD="your-test-password"
   export TRAININGPEAKS_AUTH_METHOD="web"
   export TRAININGPEAKS_WEB_HEADLESS="true"
   ```

2. **Playwright browsers installed** (for web authentication):
   ```bash
   npx playwright install chromium
   ```

## Test Characteristics

### Authentication Tests (`auth.integ-test.ts`)
- **Requires**: Valid TrainingPeaks credentials
- **Duration**: 60-120 seconds per test
- **Dependencies**: Web browser for authentication
- **Cleanup**: Automatic logout after each test

### Workout Tests (`workout.integ-test.ts`)
- **Requires**: Valid TrainingPeaks credentials
- **Duration**: 60 seconds per test
- **Dependencies**: Authentication, API access
- **Cleanup**: Automatic logout and workout cleanup
- **Skip Logic**: Tests skip gracefully if not authenticated

### Client Tests (`client.integ-test.ts`)
- **Requires**: No external dependencies
- **Duration**: < 1 second per test
- **Dependencies**: None
- **Cleanup**: None required

## Test Patterns

### Authentication Pattern
```typescript
describe('Authentication Integration Tests', () => {
  it('should authenticate with valid credentials', async () => {
    const client = new TrainingPeaksClient({
      debug: { enabled: false },
      browser: { headless: true },
      timeouts: { webAuth: 30000, apiAuth: 10000, default: 10000 },
    });

    const result = await client.login(username, password);
    expect(result.success).toBe(true);
    expect(client.isAuthenticated()).toBe(true);
  }, 60000);
});
```

### Workout Pattern
```typescript
describe('Workout Integration Tests', () => {
  let client: TrainingPeaksClient;
  let isAuthenticated = false;

  beforeEach(async () => {
    client = new TrainingPeaksClient({ /* config */ });
    
    if (!isAuthenticated) {
      await client.login(username, password);
      isAuthenticated = true;
    }
  });

  afterEach(async () => {
    if (client.isAuthenticated()) {
      await client.logout();
      isAuthenticated = false;
    }
  });

  it('should upload workout successfully', async () => {
    if (!client.isAuthenticated()) {
      console.log('Skipping test: not authenticated');
      return;
    }
    // Test implementation
  }, 60000);
});
```

### Configuration Pattern
```typescript
describe('Client Configuration Integration Tests', () => {
  it('should allow configuration overrides', () => {
    const customConfig = {
      debug: { enabled: true },
      timeouts: { default: 15000 },
    };

    const client = new TrainingPeaksClient(customConfig);
    const config = client.getConfig();

    expect(config.debug.enabled).toBe(true);
    expect(config.timeouts.default).toBe(15000);
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Graceful Skipping**: Tests that require authentication should skip gracefully if not authenticated
3. **Proper Cleanup**: Always clean up resources (logout, delete test data)
4. **Timeout Management**: Use appropriate timeouts for different test types
5. **Error Handling**: Test both success and failure scenarios
6. **Configuration**: Use minimal configuration for faster test execution

## Troubleshooting

### Common Issues

1. **Authentication Failures**:
   - Verify environment variables are set correctly
   - Check if TrainingPeaks credentials are valid
   - Ensure network connectivity

2. **Browser Issues**:
   - Install Playwright browsers: `npx playwright install chromium`
   - Check if running in headless environment

3. **Timeout Issues**:
   - Increase timeout values in test configuration
   - Check network connectivity and API response times

4. **Test Skipping**:
   - Verify authentication state before running workout tests
   - Check console output for skip messages

### Debug Mode

Enable debug mode for troubleshooting:
```typescript
const client = new TrainingPeaksClient({
  debug: {
    enabled: true,
    logAuth: true,
    logNetwork: true,
    logBrowser: true,
  },
});
```

## Contributing

When adding new integration tests:

1. **Choose the right file**: Add tests to the appropriate topic-specific file
2. **Follow patterns**: Use the established patterns for authentication, workout, or configuration tests
3. **Add documentation**: Update this README if adding new test categories
4. **Update scripts**: Add new npm scripts if creating new test categories
5. **Test locally**: Ensure tests pass before committing 