# TrainingPeaks SDK - E2E Tests

This directory contains comprehensive end-to-end tests for the TrainingPeaks SDK npm package, based on integration test patterns and best practices.

## 🎯 Purpose

These E2E tests verify that the built SDK works correctly in real-world scenarios, ensuring:

- ✅ **Import/Export functionality** works in both ES Modules and CommonJS
- ✅ **API surface** is complete and accessible
- ✅ **Configuration management** works with various patterns
- ✅ **Authentication flow** works as expected
- ✅ **Workout management** functions properly
- ✅ **Error handling** is robust
- ✅ **Type safety** is maintained
- ✅ **State management** is consistent
- ✅ **Compatibility** across different usage patterns

## 🔧 Environment Setup

### Automatic .env Loading

The E2E tests automatically load environment variables from the `.env` file in the project root. This is the same pattern used by integration tests.

### Required Environment Variables

The E2E tests use the same configuration pattern as integration tests. You must set these environment variables in your `.env` file in the project root:

```bash
# Required: TrainingPeaks credentials
TRAININGPEAKS_TEST_USERNAME=your-test-username
TRAININGPEAKS_TEST_PASSWORD=your-test-password

# Optional: Configuration overrides
TRAININGPEAKS_WEB_HEADLESS=true                    # Default: true
TRAININGPEAKS_WEB_TIMEOUT=30000                    # Default: 30000ms
TRAININGPEAKS_AUTH_METHOD=web                      # Default: web
TRAININGPEAKS_BASE_URL=https://www.trainingpeaks.com
```

### Setup Instructions

1. **Create or edit `.env` file** in the project root:

   ```env
   TRAININGPEAKS_TEST_USERNAME=your-test-username
   TRAININGPEAKS_TEST_PASSWORD=your-test-password
   TRAININGPEAKS_WEB_HEADLESS=true
   TRAININGPEAKS_WEB_TIMEOUT=30000
   ```

2. **Install Playwright browsers** (for web authentication):
   ```bash
   npx playwright install chromium
   ```

### Running Without Credentials

If you don't have TrainingPeaks credentials or the `.env` file is missing, the tests will skip gracefully:

```bash
# Tests will show this message and exit cleanly
⚠️  Skipping E2E tests - missing credentials
   Set TRAININGPEAKS_TEST_USERNAME and TRAININGPEAKS_TEST_PASSWORD in .env file
   Example:
     TRAININGPEAKS_TEST_USERNAME=your-username
     TRAININGPEAKS_TEST_PASSWORD=your-password
```

### Environment Variable Priority

The tests follow this priority order for configuration:

1. **Environment variables** (highest priority)
2. **`.env` file** (loaded automatically from project root)
3. **Default values** (lowest priority)

This means you can override `.env` settings with environment variables:

```bash
# Override .env settings
TRAININGPEAKS_WEB_HEADLESS=false npm run test:advanced
TRAININGPEAKS_WEB_TIMEOUT=60000 npm run test:advanced
```

## 📁 Test Structure

```
e2e-test/
├── test-built-library.mjs          # Basic functionality test (ESM)
├── test-built-library.cjs          # Basic functionality test (CommonJS)
├── advanced-workflow-test.mjs      # Complete workflow simulation
├── compatibility-test.mjs          # Compatibility and edge cases
├── run-e2e.sh                     # Main test runner script
├── package.json                   # Test configuration
└── README.md                      # This file
```

## 🚀 Running Tests

### Run All Tests

```bash
# From the e2e-test directory
npm test

# Or directly
bash run-e2e.sh
```

### Run Individual Tests

```bash
# Basic functionality tests
npm run test:esm        # ES Modules basic test
npm run test:cjs        # CommonJS basic test

# Advanced tests
npm run test:advanced   # Complete workflow simulation
npm run test:compatibility  # Compatibility and edge cases

# Run all individual tests
npm run test:all
```

### Run with Custom Configuration

```bash
# Run with specific timeout
TRAININGPEAKS_WEB_TIMEOUT=60000 npm run test:advanced

# Run with visible browser
TRAININGPEAKS_WEB_HEADLESS=false npm run test:advanced

# Run with custom credentials
TRAININGPEAKS_TEST_USERNAME=myuser TRAININGPEAKS_TEST_PASSWORD=mypass npm run test:advanced
```

## 📋 Test Categories

### 1. Basic E2E Tests

**Files:** `test-built-library.mjs`, `test-built-library.cjs`

Tests fundamental SDK functionality based on integration test patterns:

- ✅ SDK import and instantiation with configuration
- ✅ Configuration validation and structure verification
- ✅ Authentication state management
- ✅ API surface verification (all required methods)
- ✅ Workout manager interface validation
- ✅ Type safety validation
- ✅ Configuration override functionality

### 2. Advanced Workflow Test

**File:** `advanced-workflow-test.mjs`

Simulates a complete user workflow based on integration test patterns:

- 📦 SDK setup and configuration
- 🔐 Authentication flow (login/logout with state verification)
- 💪 Workout management setup and validation
- 📤 Workout upload simulation with realistic data
- 📋 Workout retrieval and listing operations
- 👤 User information retrieval
- 🗑️ Cleanup operations (workout deletion)
- 🚪 Proper logout and state cleanup

### 3. Compatibility Test

**File:** `compatibility-test.mjs`

Tests SDK compatibility and edge cases based on integration test patterns:

- 📦 Different import patterns and configurations
- ⚙️ Configuration validation with various combinations
- 🔐 Authentication state management
- 💪 Workout manager interface verification
- 📋 Error handling scenarios
- 🔄 Method chaining and state persistence
- 🎯 Type safety and return values
- 🔧 Configuration override validation

## 🔧 Test Environment

### Prerequisites

- Node.js >= 18.0.0
- npm installed
- Parent project built (`npm run build`)

### Test Execution Flow

1. **Build Verification**: Ensures the SDK is properly built with all entry points
2. **Basic Tests**: Verify fundamental functionality for both ESM and CommonJS
3. **Advanced Tests**: Test complete workflows with realistic data
4. **Compatibility Tests**: Verify edge cases and different usage patterns
5. **Summary Report**: Provides comprehensive test results

## 📊 Test Results

Successful test execution shows:

```
🎉 All E2E tests passed!
========================
✅ ES Modules (Basic): Working
✅ CommonJS (Basic): Working
✅ Advanced Workflow: Working
✅ Compatibility: Working
✅ Build: Successful
✅ Library: Ready for npm distribution

📊 Test Summary:
================
• Basic functionality tests: 2/2 passed
• Advanced workflow tests: 1/1 passed
• Compatibility tests: 1/1 passed
• Build verification: ✅
• Import/export tests: ✅
• Configuration validation: ✅
• Authentication flow: ✅
• Workout management: ✅
• Error handling: ✅
• Type safety: ✅
• State management: ✅
• Configuration overrides: ✅

🚀 SDK is ready for npm publication!
=====================================

📋 Test Coverage:
================
• Package import/export compatibility
• Configuration management and overrides
• Authentication state management
• API surface verification
• Workout manager interface
• Type safety validation
• Error handling scenarios
• Method chaining and state persistence
• Real usage workflow simulation
```

## 🛠️ Development

### Adding New Tests

1. Create a new `.mjs` file in the `e2e-test/` directory
2. Follow the naming convention: `descriptive-name-test.mjs`
3. Base your test on integration test patterns from `src/training-peaks-client.integ-test.ts`
4. Add the test to `run-e2e.sh` if it should run automatically
5. Update `package.json` scripts if needed
6. Update this README with test description

### Test Best Practices (Based on Integration Tests)

- ✅ Use descriptive console output with emojis
- ✅ Test both success and error scenarios
- ✅ Verify return types and data structures
- ✅ Clean up resources after tests
- ✅ Handle mock implementations gracefully
- ✅ Provide clear error messages
- ✅ Test edge cases and boundary conditions
- ✅ Use configuration patterns from integration tests
- ✅ Validate API surface comprehensively
- ✅ Test state management and persistence

### Integration Test Patterns Used

The E2E tests are based on patterns from the integration tests:

**Configuration Pattern:**

```javascript
const client = new TrainingPeaksClient({
  debug: {
    enabled: true,
    logAuth: true,
    logNetwork: true,
    logBrowser: true,
  },
  browser: {
    headless: true,
    launchTimeout: 30000,
    pageWaitTimeout: 2000,
  },
  timeouts: {
    webAuth: 30000,
    apiAuth: 10000,
    default: 10000,
  },
});
```

**Authentication Pattern:**

```javascript
// Test initial state
const initialAuth = client.isAuthenticated();
const initialUserId = client.getUserId();

// Test login
const loginResult = await client.login('test_user', 'test_password');
if (loginResult.success) {
  // Verify post-login state
  const postLoginAuth = client.isAuthenticated();
  const postLoginUserId = client.getUserId();
}
```

**Error Handling Pattern:**

```javascript
try {
  await client.login('', '');
  throw new Error('Should have failed with empty credentials');
} catch (error) {
  if (error.message.includes('Invalid credentials')) {
    console.log('✅ Invalid credentials error handled correctly');
  } else {
    console.log('⚠️  Invalid credentials test skipped');
  }
}
```

### Mock Implementation Notes

Some tests may be skipped when using mock implementations. This is expected behavior and tests are designed to handle this gracefully with appropriate warnings, following the same pattern as integration tests.

## 🔍 Troubleshooting

### Common Issues

**Build fails:**

```bash
# Ensure the parent project is built
cd ..
npm run build
cd e2e-test
npm test
```

**Import errors:**

```bash
# Check that dist files exist
ls ../dist/
# Should show: index.js, index.cjs, index.d.ts
```

**Permission errors:**

```bash
# Make script executable
chmod +x run-e2e.sh
```

**Configuration errors:**

```bash
# Check that the configuration structure matches integration tests
# Verify urls, timeouts, debug, and browser settings
```

### Debug Mode

To run tests with more verbose output, modify the client configuration:

```javascript
const client = new TrainingPeaksClient({
  debug: {
    enabled: true, // Enable debug logging
    logAuth: true,
    logNetwork: true,
    logBrowser: true,
  },
  timeouts: {
    default: 10000,
  },
});
```

## 📚 Related Documentation

- [Main SDK README](../README.md)
- [Integration Tests](../src/training-peaks-client.integ-test.ts)
- [Test Setup](../src/test.setup.ts)
- [Test Environment](../src/__fixtures__/test-environment.ts)
- [E2E Testing Guidelines](../../.cursor/rules/e2e-tests.mdc)
- [Package Configuration](../package.json)
- [Build Configuration](../tsconfig.build.json)

---

**Note:** These tests are designed to run against the built SDK (`dist/` directory) and verify that the npm package works correctly when consumed by end users. They follow the same patterns and best practices as the integration tests to ensure consistency and reliability.
