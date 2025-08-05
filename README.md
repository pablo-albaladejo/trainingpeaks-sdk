# TrainingPeaks SDK

[![npm version](https://badge.fury.io/js/trainingpeaks-sdk.svg)](https://badge.fury.io/js/trainingpeaks-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/pablo-albaladejo/trainingpeaks-sdk/workflows/Node.js%20CI/badge.svg)](https://github.com/pablo-albaladejo/trainingpeaks-sdk/actions)

A comprehensive TypeScript SDK for TrainingPeaks API integration, built with Clean Architecture principles and designed for modern JavaScript/TypeScript applications.

## Features

- 🏗️ **Clean Architecture**: Follows hexagonal architecture (ports & adapters) for maintainability
- 🔒 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 📦 **Dual Package**: Supports both ESM and CommonJS module systems
- 🧪 **Well Tested**: Comprehensive unit, integration, and E2E test coverage
- 🔐 **Authentication**: Secure session management with cookie support
- 📊 **Workout Management**: Complete workout CRUD operations
- 🏃 **User Management**: User profile and settings management
- 📁 **File Upload**: Support for TCX, GPX, and FIT file formats
- 🚀 **Modern Stack**: Built with Axios, Zod validation, and Playwright

## Installation

```bash
npm install trainingpeaks-sdk
```

## Quick Start

### Authentication & Basic Usage

```typescript
import { TrainingPeaksSDK } from 'trainingpeaks-sdk';

// Initialize the SDK
const sdk = new TrainingPeaksSDK();

// Login with credentials
await sdk.login({
  username: 'your-username',
  password: 'your-password'
});

// Check authentication status
const isAuthenticated = await sdk.isAuthenticated();
console.log('Authenticated:', isAuthenticated);

// Get current user
const user = await sdk.getCurrentUser();
console.log('User:', user);
```

### Workout Management

```typescript
// Get user's workouts
const workouts = await sdk.getWorkouts({
  startDate: '2024-01-01',
  endDate: '2024-12-31'
});

// Get specific workout
const workout = await sdk.getWorkoutById('workout-id');

// Upload a workout file
const newWorkout = await sdk.createWorkout({
  file: workoutFileBuffer,
  filename: 'my-workout.tcx',
  workoutType: 'cycling'
});

// Update workout details
await sdk.updateWorkout('workout-id', {
  title: 'Updated Workout Title',
  description: 'New description'
});

// Delete a workout
await sdk.deleteWorkout('workout-id');
```

### Advanced Usage

```typescript
// Get workout statistics
const stats = await sdk.getWorkoutStats('workout-id');

// Get user ID
const userId = await sdk.getUserId();

// Logout
await sdk.logout();
```

## API Reference

### Authentication Methods

- `login(credentials)` - Authenticate with username/password
- `logout()` - End the current session
- `isAuthenticated()` - Check authentication status

### User Methods

- `getCurrentUser()` - Get current user profile
- `getUserId()` - Get current user ID

### Workout Methods

- `getWorkouts(filters?)` - Get user's workouts with optional filters
- `getWorkoutById(id)` - Get specific workout details
- `createWorkout(data)` - Upload and create a new workout
- `updateWorkout(id, data)` - Update workout details
- `deleteWorkout(id)` - Delete a workout
- `getWorkoutStats(id)` - Get workout statistics

## Supported File Formats

The SDK supports uploading the following workout file formats:

- **TCX** (Training Center XML)
- **GPX** (GPS Exchange Format)
- **FIT** (Flexible and Interoperable Data Transfer)

## Configuration

### Environment Variables

You can configure the SDK behavior using environment variables:

```bash
# API Base URL (optional)
TRAININGPEAKS_API_URL=https://api.trainingpeaks.com

# Request timeout in milliseconds (optional)
TRAININGPEAKS_TIMEOUT=30000

# Enable debug logging (optional)
TRAININGPEAKS_DEBUG=true
```

### Programmatic Configuration

```typescript
import { TrainingPeaksSDK } from 'trainingpeaks-sdk';

const sdk = new TrainingPeaksSDK({
  apiUrl: 'https://api.trainingpeaks.com',
  timeout: 30000,
  debug: false
});
```

## Error Handling

The SDK provides structured error handling with specific error types:

```typescript
import { TrainingPeaksSDK, TrainingPeaksError } from 'trainingpeaks-sdk';

try {
  await sdk.login({ username: 'user', password: 'pass' });
} catch (error) {
  if (error instanceof TrainingPeaksError) {
    console.error('SDK Error:', error.message);
    console.error('Error Code:', error.code);
  } else {
    console.error('Unexpected Error:', error);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  User, 
  Workout, 
  WorkoutFilters,
  CreateWorkoutRequest,
  UpdateWorkoutRequest 
} from 'trainingpeaks-sdk';

// All types are available for import
const filters: WorkoutFilters = {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  workoutType: 'cycling'
};
```

## Module Exports

The SDK supports multiple import patterns:

```typescript
// Main SDK class
import { TrainingPeaksSDK } from 'trainingpeaks-sdk';

// Specific modules
import { AuthService } from 'trainingpeaks-sdk/adapters';
import { User } from 'trainingpeaks-sdk/domain';
import { LoginUseCase } from 'trainingpeaks-sdk/application';
import type { WorkoutFilters } from 'trainingpeaks-sdk/types';
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0

### Building

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Build specific targets
npm run build:esm  # ES modules
npm run build:cjs  # CommonJS
```

### Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run type-check

# Validate imports
npm run check-imports
```

## Architecture

This SDK follows Clean Architecture principles with a hexagonal architecture approach:

- **Domain Layer**: Core business entities and rules
- **Application Layer**: Business logic orchestration and contracts
- **Adapters Layer**: External integrations (HTTP, storage, serialization)
- **Infrastructure Layer**: Concrete implementations

For detailed architecture documentation, see [docs/clean-architecture.md](docs/clean-architecture.md).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the existing code style
4. Add tests for your changes
5. Run the full test suite (`npm run pre-release`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](docs/)
- 🐛 [Bug Reports](https://github.com/pablo-albaladejo/trainingpeaks-sdk/issues)
- 💬 [Discussions](https://github.com/pablo-albaladejo/trainingpeaks-sdk/discussions)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

Made with ❤️ for the TrainingPeaks community
