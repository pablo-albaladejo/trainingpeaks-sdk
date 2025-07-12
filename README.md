# TrainingPeaks SDK

A TypeScript SDK for TrainingPeaks API integration with authentication and workout upload capabilities.

![npm](https://img.shields.io/npm/v/trainingpeaks-sdk)
![Node Version](https://img.shields.io/node/v/trainingpeaks-sdk)
[![Build Status](https://github.com/pablo-albaladejo/trainingpeaks-sdk/workflows/CI/badge.svg)](https://github.com/pablo-albaladejo/trainingpeaks-sdk/actions)
[![codecov](https://codecov.io/gh/pablo-albaladejo/trainingpeaks-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/pablo-albaladejo/trainingpeaks-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 **Web-based Authentication** - Real browser simulation for TrainingPeaks login
- 📤 **Workout Upload** - Support for GPX, TCX, and FIT files
- 🎯 **TypeScript Support** - Full type safety and IntelliSense
- 🔄 **Auto Token Refresh** - Automatic token management
- 🌐 **Cross-platform** - Works in Node.js and browsers
- 📊 **Multiple Auth Patterns** - Simple and advanced authentication patterns
- ✅ **Comprehensive Tests** - Unit and integration test coverage
- 🛠️ **Developer-friendly** - Full ESLint/Prettier setup with commit hooks

## Installation

```bash
npm install trainingpeaks-sdk
```

For web authentication, Playwright browsers are also required:

```bash
npx playwright install chromium
```

## Quick Start

### Web Authentication (Recommended)

The SDK uses browser simulation to authenticate with TrainingPeaks, which is the most reliable method:

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

const client = new TrainingPeaksClient({
  authMethod: 'web', // Uses browser simulation
  webAuth: {
    headless: true, // Set to false to see the browser
    timeout: 30000, // 30 seconds timeout
  },
  debug: true, // Enable debug logging
});

// Simple authentication
await client.login({
  username: 'your-email@example.com',
  password: 'your-password',
});

console.log('Authenticated!', client.isReady());
console.log('User ID:', client.getUserId());

// Upload a workout
const workoutUploader = client.getWorkoutUploader();
const result = await workoutUploader.uploadWorkout({
  name: 'Morning Run',
  description: 'Great run in the park',
  date: '2024-01-01',
  duration: 1800, // 30 minutes
  distance: 5000, // 5km
  type: 'RUN',
  fileData: {
    filename: 'run.gpx',
    content: gpxFileContent, // Your GPX file content
    mimeType: 'application/gpx+xml',
  },
});

console.log('Upload result:', result);
```

### API Authentication (Fallback)

For testing or when browsers are not available:

```typescript
const client = new TrainingPeaksClient({
  authMethod: 'api', // Direct API calls
  baseUrl: 'https://api.trainingpeaks.com',
});
```

## Authentication Patterns

### Simple Authentication

Perfect for straightforward use cases:

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

const client = new TrainingPeaksClient({
  authMethod: 'web',
  debug: true,
});

// Login once, SDK handles everything
await client.login({
  username: 'your-email@example.com',
  password: 'your-password',
});

// All subsequent calls are automatically authenticated
const uploader = client.getWorkoutUploader();
await uploader.uploadWorkout(workoutData);
```

### Advanced Authentication

For more control over token management:

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

const client = new TrainingPeaksClient({
  authMethod: 'web',
  webAuth: { headless: false }, // Show browser for debugging
});

// Get token for manual management
const token = await client.loginAdvanced({
  username: 'your-email@example.com',
  password: 'your-password',
});

console.log('Access token:', token.accessToken);
console.log('Expires at:', new Date(token.expiresAt));

// Set up event listeners
client.onAuthLogin(token => {
  console.log(
    'Logged in with token:',
    token.accessToken.substring(0, 10) + '...'
  );
});

client.onAuthLogout(() => {
  console.log('Logged out');
});

client.onAuthError(error => {
  console.error('Auth error:', error.message);
});
```

### Token Sharing

Share tokens between multiple client instances:

```typescript
// Client 1 - performs authentication
const authClient = new TrainingPeaksClient({ authMethod: 'web' });
await authClient.login(credentials);
const token = authClient.getAuthToken();

// Client 2 - uses existing token
const uploadClient = new TrainingPeaksClient({ authMethod: 'api' });
uploadClient.setAuthToken(token);

// Both clients are now authenticated
console.log(authClient.isReady()); // true
console.log(uploadClient.isReady()); // true
```

## Workout Upload

### File Upload Examples

```typescript
const uploader = client.getWorkoutUploader();

// GPX file upload
await uploader.uploadWorkout({
  name: 'Cycling Workout',
  description: 'Weekend ride',
  date: '2024-01-01',
  duration: 3600, // 1 hour
  distance: 25000, // 25km
  type: 'BIKE',
  fileData: {
    filename: 'ride.gpx',
    content: gpxContent,
    mimeType: 'application/gpx+xml',
  },
});

// TCX file upload
await uploader.uploadWorkout({
  name: 'Swim Training',
  type: 'SWIM',
  fileData: {
    filename: 'swim.tcx',
    content: tcxContent,
    mimeType: 'application/tcx+xml',
  },
});

// FIT file upload
await uploader.uploadWorkout({
  name: 'Running Workout',
  type: 'RUN',
  fileData: {
    filename: 'run.fit',
    content: fitContent,
    mimeType: 'application/octet-stream',
  },
});
```

### Manual Workout Data

Upload workout data without files:

```typescript
await uploader.uploadWorkout({
  name: 'Manual Entry',
  description: 'Gym workout',
  date: '2024-01-01',
  duration: 2700, // 45 minutes
  type: 'OTHER',
  // No fileData - manual entry
});
```

## Configuration

### Environment Variables

For integration tests:

```bash
# Copy .env.example to .env and configure:
cp .env.example .env
```

```env
# Authentication method: 'web' or 'api'
TRAININGPEAKS_AUTH_METHOD=web

# Your TrainingPeaks credentials
TRAININGPEAKS_TEST_USERNAME=your-email@example.com
TRAININGPEAKS_TEST_PASSWORD=your-password

# Web authentication settings
TRAININGPEAKS_WEB_HEADLESS=true
TRAININGPEAKS_WEB_TIMEOUT=30000
```

### Client Configuration

```typescript
const client = new TrainingPeaksClient({
  // Authentication method
  authMethod: 'web', // 'web' | 'api'

  // Base configuration
  baseUrl: 'https://api.trainingpeaks.com',
  timeout: 30000,
  debug: true,

  // Web authentication specific
  webAuth: {
    headless: true, // Run browser in background
    timeout: 30000, // Browser timeout
    executablePath: '', // Custom browser path (optional)
  },

  // Custom headers
  headers: {
    'Custom-Header': 'value',
  },
});
```

## Development

### Setup

```bash
git clone <repository>
cd trainingpeaks-sdk
npm install
```

#### Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:watch` - Build in watch mode

#### Testing

- `npm run test` - Run unit tests only
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:all` - Run all tests (unit + integration)
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:watch:integration` - Run integration tests in watch mode
- `npm run test:coverage` - Run unit tests with coverage
- `npm run test:coverage:all` - Run all tests with coverage

#### Integration Tests

Integration tests validate the SDK against real TrainingPeaks API endpoints and require actual credentials.

**Setup:**

1. Copy `.env.example` to `.env`
2. Fill in your TrainingPeaks test credentials:
   ```bash
   TRAININGPEAKS_TEST_USERNAME=your-test-username@example.com
   TRAININGPEAKS_TEST_PASSWORD=your-test-password
   TRAININGPEAKS_AUTH_METHOD=web  # Use 'web' for real browser testing
   ```

**Web Authentication Tests:**

```bash
# Test with real browser simulation (requires credentials)
TRAININGPEAKS_AUTH_METHOD=web npm run test:integration

# Test with API endpoints (uses placeholders)
TRAININGPEAKS_AUTH_METHOD=api npm run test:integration
```

**Note:** Integration tests will skip automatically if credentials are not configured.

#### Code Quality

- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

#### Git Hooks

- Pre-commit: Runs linting and tests
- Commit-msg: Validates conventional commit format

```bash
npm run commit  # Use Commitizen for guided commits
```

### Release

```bash
npm run release:patch  # Patch version (1.0.0 -> 1.0.1)
npm run release:minor  # Minor version (1.0.0 -> 1.1.0)
npm run release:major  # Major version (1.0.0 -> 2.0.0)
```

## API Reference

### TrainingPeaksClient

Main client class for TrainingPeaks SDK.

#### Constructor

```typescript
new TrainingPeaksClient(config?: TrainingPeaksConfig)
```

#### Methods

- `login(credentials)` - Simple authentication
- `loginAdvanced(credentials)` - Advanced authentication with token return
- `logout()` - Logout and clear session
- `isReady()` - Check if client is authenticated
- `getAuthToken()` - Get current auth token
- `setAuthToken(token)` - Set auth token manually
- `getUserId()` - Get user ID (web auth only)
- `getWorkoutUploader()` - Get workout uploader instance

#### Event Listeners

- `onAuthLogin(callback)` - Token received
- `onAuthLogout(callback)` - Logged out
- `onAuthTokenRefresh(callback)` - Token refreshed
- `onAuthTokenExpired(callback)` - Token expired
- `onAuthError(callback)` - Authentication error

### WorkoutUploader

Handle workout uploads to TrainingPeaks.

#### Methods

- `uploadWorkout(data)` - Upload workout with optional file

### Error Types

- `AuthenticationError` - Authentication failed
- `NetworkError` - Network/HTTP errors
- `ValidationError` - Invalid data
- `UploadError` - Upload failed

## Architecture

### Web Authentication Flow

1. **Browser Launch**: Playwright launches Chromium browser
2. **Navigation**: Navigate to TrainingPeaks login page
3. **Form Interaction**: Fill credentials and submit
4. **Token Interception**: Listen for API calls and extract tokens
5. **Token Storage**: Store tokens for API calls

### Component Structure

```
src/
├── auth/              # Authentication modules
│   ├── index.ts       # TrainingPeaksAuth
│   ├── web-auth.ts    # WebAuthService (browser simulation)
│   ├── auth-manager.ts # AuthManager (advanced management)
│   └── simple-auth-manager.ts # SimpleAuthManager (wrapper)
├── client/            # Main client
├── workout/           # Workout upload
├── types/             # TypeScript definitions
├── errors/            # Custom error classes
└── __fixtures__/      # Test utilities
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `npm run commit`
4. Push branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## Support

- 📖 [Documentation](https://github.com/pablo-albaladejo/trainingpeaks-sdk#readme)
- 🐛 [Issue Tracker](https://github.com/pablo-albaladejo/trainingpeaks-sdk/issues)
- 💬 [Discussions](https://github.com/pablo-albaladejo/trainingpeaks-sdk/discussions)
