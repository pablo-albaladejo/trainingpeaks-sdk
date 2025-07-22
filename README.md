# TrainingPeaks SDK

A simple TypeScript library to connect with TrainingPeaks. It helps you log in and upload workouts.

![npm](https://img.shields.io/npm/v/trainingpeaks-sdk)
![Node Version](https://img.shields.io/node/v/trainingpeaks-sdk)
[![Build Status](https://github.com/pablo-albaladejo/trainingpeaks-sdk/workflows/CI/badge.svg)](https://github.com/pablo-albaladejo/trainingpeaks-sdk/actions)
[![codecov](https://codecov.io/gh/pablo-albaladejo/trainingpeaks-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/pablo-albaladejo/trainingpeaks-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![CodeRabbit Pull Request Reviews](https://img.shields.io/coderabbit/prs/github/pablo-albaladejo/trainingpeaks-sdk?utm_source=oss&utm_medium=github&utm_campaign=pablo-albaladejo%2Ftrainingpeaks-sdk&labelColor=171717&color=FF570A&link=https%3A%2F%2Fcoderabbit.ai&label=CodeRabbit+Reviews)

## 🚨 Important Changes

**Version 2.0.0 has breaking changes.**

If you're upgrading from version 1.x, check the [Migration Guide](MIGRATION.md) for how to update your code.

**Quick changes:**

- Change `new TrainingPeaksClient()` to `createTrainingPeaksClient()`
- Update imports: `import { createTrainingPeaksClient } from 'trainingpeaks-sdk'`
- See [MIGRATION.md](MIGRATION.md) for all the changes

## What it can do

- 🔐 **Login** - Uses a real browser to log in to TrainingPeaks
- 📤 **Upload workouts** - Works with GPX, TCX, and FIT files
- 🎯 **TypeScript** - Full type checking and auto-complete
- 🔄 **Automatic tokens** - Handles login tokens for you
- 🌐 **Works everywhere** - Node.js and web browsers
- 📊 **Easy or advanced** - Simple or complex login options
- ✅ **Well tested** - Has lots of tests to make sure it works
- 🛠️ **Developer friendly** - Good code formatting and hooks
- 🏗️ **Clean code** - Well organized and easy to understand

## How to install

```bash
npm install trainingpeaks-sdk
```

For web login, you also need to install a browser:

```bash
npx playwright install chromium
```

## How to use it

### Web login (Best option)

This library uses a real browser to log in to TrainingPeaks. This works best:

```typescript
import { createTrainingPeaksClient } from 'trainingpeaks-sdk';

const client = createTrainingPeaksClient({
  authMethod: 'web', // Use browser to log in
  webAuth: {
    headless: true, // Set to false to see the browser window
    timeout: 30000, // Wait up to 30 seconds
  },
  debug: true, // Show what's happening
});

// Log in
await client.login({
  username: 'your-username',
  password: 'your-password',
});

console.log('Logged in!', client.isReady());
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

### API login (Backup option)

For testing or when you can't use a browser:

```typescript
const client = createTrainingPeaksClient({
  authMethod: 'api', // Direct API calls
  baseUrl: 'https://api.trainingpeaks.com',
});
```

## Different ways to log in

### Simple login

Easy way for most users:

```typescript
import { createTrainingPeaksClient } from 'trainingpeaks-sdk';

const client = createTrainingPeaksClient({
  authMethod: 'web',
  debug: true,
});

// Log in once, library handles the rest
await client.login({
  username: 'your-username',
  password: 'your-password',
});

// Now you can upload workouts without logging in again
const uploader = client.getWorkoutUploader();
await uploader.uploadWorkout(workoutData);
```

### Advanced login

For more control over login tokens:

```typescript
import { createTrainingPeaksClient } from 'trainingpeaks-sdk';

const client = createTrainingPeaksClient({
  authMethod: 'web',
  webAuth: { headless: false }, // Show browser for debugging
});

// Get login token to manage yourself
const token = await client.loginAdvanced({
  username: 'your-username',
  password: 'your-password',
});

console.log('Access token:', token.accessToken);
console.log('Expires at:', new Date(token.expiresAt));

// Listen for login events
client.onAuthLogin((token) => {
  console.log(
    'Logged in with token:',
    token.accessToken.substring(0, 10) + '...'
  );
});

client.onAuthLogout(() => {
  console.log('Logged out');
});

client.onAuthError((error) => {
  console.error('Login error:', error.message);
});
```

### Sharing login tokens

Share login tokens between multiple clients:

```typescript
// Client 1 - logs in
const authClient = createTrainingPeaksClient({ authMethod: 'web' });
await authClient.login(credentials);
const token = authClient.getAuthToken();

// Client 2 - uses the same token
const uploadClient = createTrainingPeaksClient({ authMethod: 'api' });
uploadClient.setAuthToken(token);

// Both clients can now work
console.log(authClient.isReady()); // true
console.log(uploadClient.isReady()); // true
```

## How to upload workouts

### Upload workout files

```typescript
const uploader = client.getWorkoutUploader();

// Upload a GPX file
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

// Upload a TCX file
await uploader.uploadWorkout({
  name: 'Swim Training',
  type: 'SWIM',
  fileData: {
    filename: 'swim.tcx',
    content: tcxContent,
    mimeType: 'application/tcx+xml',
  },
});

// Upload a FIT file
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

### Upload without files

Add workout data without a file:

```typescript
await uploader.uploadWorkout({
  name: 'Manual Entry',
  description: 'Gym workout',
  date: '2024-01-01',
  duration: 2700, // 45 minutes
  type: 'OTHER',
  // No fileData - just the workout info
});
```

## Setup

### Environment variables

For testing:

```bash
# Copy the example file and edit it:
cp .env.example .env
```

```env
# How to log in: 'web' or 'api'
TRAININGPEAKS_AUTH_METHOD=web

# Your TrainingPeaks username and password
TRAININGPEAKS_TEST_USERNAME=your-username
TRAININGPEAKS_TEST_PASSWORD=your-password

# Browser settings
TRAININGPEAKS_WEB_HEADLESS=true
TRAININGPEAKS_WEB_TIMEOUT=30000
```

### Client setup

```typescript
const client = createTrainingPeaksClient({
  // How to log in
  authMethod: 'web', // 'web' | 'api'

  // Basic settings
  baseUrl: 'https://api.trainingpeaks.com',
  timeout: 30000,
  debug: true,

  // Browser settings
  webAuth: {
    headless: true, // Hide browser window
    timeout: 30000, // How long to wait
    executablePath: '', // Custom browser location (optional)
  },

  // Extra headers
  headers: {
    'Custom-Header': 'value',
  },
});
```

## For developers

### Setup

```bash
git clone <repository>
cd trainingpeaks-sdk
npm install
```

#### Commands for development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:watch` - Build in watch mode

#### Running tests

- `npm run test` - Run unit tests only
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:all` - Run all tests (unit + integration)
- `npm run test:watch` - Run unit tests in watch mode
- `npm run test:watch:integration` - Run integration tests in watch mode
- `npm run test:coverage` - Run unit tests with coverage
- `npm run test:coverage:all` - Run all tests with coverage

#### Integration tests

These tests check the library against real TrainingPeaks. You need real login details.

**How to set up:**

1. Copy `.env.example` to `.env`
2. Add your TrainingPeaks test login details:
   ```bash
   TRAININGPEAKS_TEST_USERNAME=your-test-username
   TRAININGPEAKS_TEST_PASSWORD=your-test-password
   TRAININGPEAKS_AUTH_METHOD=web  # Use 'web' for real browser testing
   ```

**Web login tests:**

```bash
# Test with real browser (needs login details)
TRAININGPEAKS_AUTH_METHOD=web npm run test:integration

# Test with API only (uses fake data)
TRAININGPEAKS_AUTH_METHOD=api npm run test:integration
```

**Note:** Tests will skip if you don't have login details set up.

#### Code quality

- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

#### Git hooks

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

## How to use the code

### createTrainingPeaksClient

This function creates a new TrainingPeaks client for you to use.

#### How to use it

```typescript
import { createTrainingPeaksClient } from 'trainingpeaks-sdk';

const client = createTrainingPeaksClient(config?: TrainingPeaksConfig);
```

#### What it gives you

Returns a client object with these methods:

- `login(credentials)` - Simple login
- `loginAdvanced(credentials)` - Advanced login with token return
- `logout()` - Log out and clear session
- `isReady()` - Check if logged in
- `getAuthToken()` - Get current login token
- `setAuthToken(token)` - Set login token manually
- `getUserId()` - Get user ID (web login only)
- `getWorkoutUploader()` - Get workout uploader

#### Event listeners

- `onAuthLogin(callback)` - When login succeeds
- `onAuthLogout(callback)` - When logged out
- `onAuthTokenRefresh(callback)` - When token refreshes
- `onAuthTokenExpired(callback)` - When token expires
- `onAuthError(callback)` - When login fails

### WorkoutUploader

Handles uploading workouts to TrainingPeaks.

#### Methods

- `uploadWorkout(data)` - Upload a workout (with or without file)

### Types of errors

- `AuthenticationError` - Login failed
- `NetworkError` - Network or internet problems
- `ValidationError` - Bad or missing data
- `UploadError` - Upload failed

## How it's built

### Clean code structure

This library is built with clean, organized code:

#### Main ideas

- **Function-First**: Uses functions instead of classes (easier to test)
- **Dependency Injection**: Parts of the code don't depend on each other directly
- **Immutability**: Data doesn't change once created (safer)
- **Type Safety**: Full TypeScript support (catches errors early)

#### Code organization

```
src/
├── domain/                 # Core business rules
│   ├── entities/          # Main objects (User, Workout)
│   ├── value-objects/     # Small data pieces
│   ├── events/            # Things that happen
│   └── errors/            # Error types
├── application/           # What the app does
│   ├── use-cases/         # Main actions (login, upload)
│   ├── services/          # Helper functions
│   └── ports/             # Interfaces
├── infrastructure/        # External connections
│   ├── repositories/      # Data storage
│   ├── auth/              # Login handling
│   ├── workout/           # Workout handling
│   └── storage/           # File storage
└── interfaces/            # Entry points
```

#### Why this helps

1. **Easy testing**: Simple to test individual parts
2. **Flexible**: Can change parts without breaking others
3. **Easy to maintain**: Clear separation of different concerns
4. **Fast**: Functions are faster than classes
5. **Composable**: Functions work well together

### Test Analytics with Codecov

This project uses Codecov Test Analytics to provide insights into test health and performance:

#### Features

- **Test Performance Tracking**: Monitor test run times and failure rates across branches
- **PR Test Feedback**: Get detailed information about failed tests in PR comments
- **Flaky Test Detection**: Identify tests that fail intermittently on main branch
- **Test History**: Track test performance over time

#### How it works

1. **JUnit XML Generation**: Tests generate JUnit XML reports using Vitest
2. **CI Integration**: GitHub Actions uploads test results to Codecov
3. **Analytics Dashboard**: View test metrics in the Codecov UI
4. **PR Comments**: Automatic feedback on test failures in pull requests

#### Configuration

The setup includes:

- **Vitest Configuration**: JUnit reporter configured in `vitest.config.ts`
- **CI Workflow**: Test results upload in `.github/workflows/ci.yml`
- **Package Scripts**: `npm run test:junit` generates coverage + JUnit XML

#### Benefits

- **Faster Debugging**: Quick identification of test failures with stack traces
- **Quality Assurance**: Track test reliability and performance trends
- **Team Collaboration**: Shared visibility into test health across the project
- **Continuous Improvement**: Data-driven decisions about test optimization

### How web login works

1. **Open browser**: Start a browser window
2. **Go to TrainingPeaks**: Navigate to the login page
3. **Fill form**: Enter username and password
4. **Get tokens**: Capture login tokens from the page
5. **Save tokens**: Store tokens to use for API calls

### Function examples

```typescript
// ✅ Example: Create a user service function
export const createUserService = (userRepository: UserRepository) => ({
  getUser: async (id: string) => {
    return await userRepository.findById(id);
  },
  createUser: async (userData: CreateUserData) => {
    return await userRepository.create(userData);
  },
});

// ✅ Example: Create a login function
export const createLoginUseCase =
  (authRepository: AuthRepository) => async (credentials: LoginCredentials) => {
    return await authRepository.authenticate(credentials);
  };
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
- 🔄 [Migration Guide](MIGRATION.md) - Upgrade from v1.x to v2.x
- 🐛 [Issue Tracker](https://github.com/pablo-albaladejo/trainingpeaks-sdk/issues)
- 💬 [Discussions](https://github.com/pablo-albaladejo/trainingpeaks-sdk/discussions)
