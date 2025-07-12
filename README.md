# TrainingPeaks SDK

A TypeScript SDK for interacting with the TrainingPeaks API. This SDK provides a simple and intuitive interface for authentication, workout uploads, and other TrainingPeaks functionality.

## Features

- **Authentication**: Login with username/password, token management, and automatic token refresh
- **Workout Upload**: Upload workout files with metadata to TrainingPeaks
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Structured error handling with custom error types
- **Configurable**: Flexible configuration options for different environments
- **Well Tested**: Comprehensive test suite with high code coverage

## Installation

```bash
npm install trainingpeaks-sdk
```

## Quick Start

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

// Create a client instance
const client = new TrainingPeaksClient({
  baseUrl: 'https://www.trainingpeaks.com',
  timeout: 10000,
  debug: true,
});

// Login
const auth = client.getAuth();
const token = await auth.login({
  username: 'your-email@example.com',
  password: 'your-password',
});

// Upload a workout
const uploader = client.getWorkoutUploader();
const result = await uploader.uploadWorkout({
  name: 'Morning Run',
  date: '2024-01-15',
  duration: 1800, // 30 minutes in seconds
  distance: 5000, // 5km in meters
  type: 'run',
  description: 'Easy morning run',
  fileData: {
    filename: 'workout.gpx',
    content: fileBuffer,
    mimeType: 'application/gpx+xml',
  },
});
```

## API Reference

### TrainingPeaksClient

The main client class that provides access to all SDK functionality.

#### Constructor

```typescript
new TrainingPeaksClient(config?: TrainingPeaksConfig)
```

#### Methods

- `getAuth()`: Returns the authentication module
- `getWorkoutUploader()`: Returns the workout uploader module
- `getConfig()`: Returns the current configuration
- `updateConfig(config)`: Updates the configuration
- `isReady()`: Checks if the client is authenticated and ready

### Authentication

```typescript
const auth = client.getAuth();

// Login
const token = await auth.login({
  username: 'email@example.com',
  password: 'password',
});

// Check authentication status
if (auth.isAuthenticated()) {
  console.log('User is authenticated');
}

// Get user profile
const profile = await auth.getUserProfile();

// Logout
await auth.logout();
```

### Workout Upload

```typescript
const uploader = client.getWorkoutUploader();

// Upload workout with file
const result = await uploader.uploadWorkout({
  name: 'Training Session',
  date: '2024-01-15',
  duration: 3600,
  distance: 10000,
  type: 'bike',
  fileData: {
    filename: 'ride.fit',
    content: fileBuffer,
    mimeType: 'application/octet-stream',
  },
});

// Check upload status
const status = await uploader.getUploadStatus(result.id);

// Create workout from file
const workout = uploader.createWorkoutFromFile(
  'workout.tcx',
  fileBuffer,
  'application/tcx+xml',
  {
    name: 'Custom Workout',
    description: 'My training session',
  }
);
```

## Configuration

The SDK accepts the following configuration options:

```typescript
interface TrainingPeaksConfig {
  baseUrl?: string; // API base URL (default: https://www.trainingpeaks.com)
  timeout?: number; // Request timeout in milliseconds (default: 10000)
  headers?: Record<string, string>; // Custom headers
  debug?: boolean; // Enable debug logging (default: false)
}
```

## Error Handling

The SDK provides custom error types for different scenarios:

```typescript
import {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  ValidationError,
  UploadError,
  RateLimitError,
} from 'trainingpeaks-sdk';

try {
  await auth.login(credentials);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid credentials');
  } else if (error instanceof NetworkError) {
    console.error('Network connection failed');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  }
}
```

## Development

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/your-org/trainingpeaks-sdk.git
cd trainingpeaks-sdk

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run linting
npm run lint

# Format code
npm run format
```

### Git Hooks & Commit Guidelines

This project uses Husky for git hooks and follows conventional commit standards:

#### Automatic Checks

- **Pre-commit**: Runs linting and formatting on staged files, then executes tests
- **Commit message**: Validates commit message format

#### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes
- `revert`: Revert previous commit

**Examples:**

```bash
feat: add user authentication
fix: resolve memory leak in workout uploader
docs: update api documentation for auth module
```

#### Making Commits

```bash
# Option 1: Use interactive commitizen (recommended)
npm run commit

# Option 2: Regular git commit (must follow format)
git commit -m "feat: add new feature"

# Validate last commit message
npm run lint:commit
```

### Scripts

#### Build & Development

- `npm run build` - Build the TypeScript code
- `npm run build:watch` - Build in watch mode
- `npm run dev` - Run development server
- `npm run clean` - Clean build artifacts

#### Testing

- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

#### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

#### Git & Commits

- `npm run commit` - Interactive commit using Commitizen
- `npm run lint:commit` - Validate last commit message
- `npm run prepare` - Setup Husky hooks (runs automatically)

#### Documentation

- `npm run docs:build` - Generate documentation
- `npm run docs:serve` - Generate and serve documentation

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This SDK is not officially affiliated with TrainingPeaks. It's a third-party library created to simplify integration with TrainingPeaks services. Please ensure you comply with TrainingPeaks' terms of service when using this SDK.

## Support

For support, please open an issue on the GitHub repository or contact the maintainers.
