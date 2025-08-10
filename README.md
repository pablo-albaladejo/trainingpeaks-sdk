# TrainingPeaks SDK

[![npm version](https://badge.fury.io/js/trainingpeaks-sdk.svg)](https://badge.fury.io/js/trainingpeaks-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/pablo-albaladejo/trainingpeaks-sdk/workflows/Node.js%20CI/badge.svg)](https://github.com/pablo-albaladejo/trainingpeaks-sdk/actions)

A comprehensive TypeScript SDK for TrainingPeaks API integration, built with Clean Architecture principles and designed for modern JavaScript/TypeScript applications.

> **📋 Product Context**: For comprehensive business objectives, target market analysis, and feature roadmap, see [PRODUCT.md](PRODUCT.md).

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
import { createTrainingPeaksSdk } from 'trainingpeaks-sdk';

// Initialize the SDK
const sdk = createTrainingPeaksSdk({
  debug: false, // Optional: enable debug logging
  timeout: 30000, // Optional: request timeout in ms
});

// Login with credentials
const loginResult = await sdk.login({
  username: 'your-username',
  password: 'your-password',
});

console.log('Login successful:', loginResult);
// Returns: { token: {...}, user: {...} }
```

### Workout Management

```typescript
// Get user's workouts list
const workouts = await sdk.getWorkoutsList({
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  // athleteId is optional - uses current user if not provided
});

console.log('Workouts:', workouts);
// Returns: WorkoutListItem[] with id, name, date, etc.
```

> **⚠️ Current Limitations**: This SDK currently supports authentication and workout list retrieval. Additional features like workout creation, updates, and individual workout details are planned for future releases.

### Logout

```typescript
// Clear authentication and logout
await sdk.logout();
console.log('Logged out successfully');
```

### Error Handling

```typescript
try {
  const result = await sdk.login({
    username: 'invalid-user',
    password: 'wrong-password',
  });
} catch (error) {
  console.error('Login failed:', error.message);
  // Handle authentication errors
}
```

## API Reference

### SDK Creation

```typescript
const sdk = createTrainingPeaksSdk(config?: TrainingPeaksClientConfig)
```

**Config Options:**

- `debug?: boolean` - Enable debug logging
- `timeout?: number` - Request timeout in milliseconds
- `baseUrl?: string` - Custom API base URL

### Authentication Methods

#### `login(credentials: LoginCredentials)`

Authenticate with username and password.

```typescript
type LoginCredentials = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: {
    accessToken: string;
    tokenType: string;
    expiresAt: string;
    refreshToken?: string;
  };
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
};
```

#### `logout()`

Clear authentication and end the current session.

### Workout Methods

#### `getWorkoutsList(command: GetWorkoutsListCommand)`

Get user's workouts list with date filtering.

```typescript
type GetWorkoutsListCommand = {
  athleteId?: string; // Optional - uses current user if not provided
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
};

type WorkoutListItem = {
  id: string;
  name: string;
  date: string;
  duration: number;
  distance?: number;
  activityType?: string;
  // Additional workout metadata...
};
```

## Current Features

✅ **Available Now:**

- User authentication (login/logout)
- Workout list retrieval with date filtering
- Session management with automatic cookie handling
- TypeScript support with full type definitions
- Clean Architecture implementation

🚧 **Planned Features:**

- Individual workout details retrieval
- Workout file upload (TCX, GPX, FIT formats)
- Workout creation and updates
- User profile management
- Workout statistics and analytics

## Configuration

### SDK Configuration

```typescript
import {
  createTrainingPeaksSdk,
  type TrainingPeaksClientConfig,
} from 'trainingpeaks-sdk';

const config: TrainingPeaksClientConfig = {
  baseUrl: 'https://tpapi.trainingpeaks.com', // Optional
  timeout: 30000, // Optional: request timeout in ms
  debug: true, // Optional: enable debug logging
  headers: {
    // Optional: custom headers
    'User-Agent': 'MyApp/1.0.0',
  },
};

const sdk = createTrainingPeaksSdk(config);
```

### Environment Variables

You can also configure the SDK using environment variables:

```bash
# API Base URL (optional)
TRAININGPEAKS_API_BASE_URL=https://tpapi.trainingpeaks.com

# Request timeout in milliseconds (optional)
TRAININGPEAKS_TIMEOUT=30000

# Enable debug logging (optional)
TRAININGPEAKS_DEBUG=true
```

## Error Handling

The SDK provides structured error handling with HTTP-specific error information:

```typescript
import { createTrainingPeaksSdk } from 'trainingpeaks-sdk';

const sdk = createTrainingPeaksSdk();

try {
  await sdk.login({ username: 'user', password: 'pass' });
} catch (error) {
  // HTTP errors include status, statusText, and response data
  if (error.status) {
    console.error(`HTTP ${error.status}: ${error.statusText}`);
    console.error('Response:', error.data);
  } else {
    console.error('Network or other error:', error.message);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides comprehensive type definitions:

```typescript
import { createTrainingPeaksSdk } from 'trainingpeaks-sdk';
import type {
  TrainingPeaksClientConfig,
  LoginCredentials,
  GetWorkoutsListCommand,
  WorkoutListItem,
} from 'trainingpeaks-sdk';

// All types are fully typed
const config: TrainingPeaksClientConfig = {
  debug: true,
  timeout: 30000,
};

const credentials: LoginCredentials = {
  username: 'myuser',
  password: 'mypass',
};

const workoutsQuery: GetWorkoutsListCommand = {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
};
```

## Module Exports

The SDK supports multiple import patterns for different use cases:

```typescript
// Main SDK factory function
import { createTrainingPeaksSdk } from 'trainingpeaks-sdk';

// Type imports
import type {
  TrainingPeaksClientConfig,
  LoginCredentials,
  GetWorkoutsListCommand,
  WorkoutListItem,
} from 'trainingpeaks-sdk';

// ⚠️ UNSTABLE: Internal modules - No SemVer guarantees
// These imports may introduce breaking changes in any version
// Use at your own risk - prefer [public API documentation](./docs/clean-architecture.md#public-api) when possible
import { User } from 'trainingpeaks-sdk/domain';
import { Logger } from 'trainingpeaks-sdk/adapters';
import type { WorkoutType } from 'trainingpeaks-sdk/types';
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- GitHub CLI (gh) - for project setup automation

**GitHub CLI Authentication:**
```bash
# Authenticate with GitHub using web browser (recommended for security)
gh auth login --web

# For GitHub Enterprise Server users, specify your hostname
# gh auth login --web --hostname your-enterprise-hostname.com
# Or set GH_HOST environment variable: 
# Linux/macOS: export GH_HOST=your-enterprise-hostname.com
# Windows CMD: set GH_HOST=your-enterprise-hostname.com
# Windows PowerShell: $env:GH_HOST="your-enterprise-hostname.com"

# Verify authentication
gh auth status
```

### Project Setup

This repository includes automated setup scripts for GitHub project management:

```bash
# Run the automated GitHub project setup
./scripts/github/setup/setup-github-project.sh

# Test the setup script functionality
./scripts/github/setup/test-setup.sh

# Get help and options
./scripts/github/setup/setup-github-project.sh --help
```

The setup script automatically creates:

- 🎯 GitHub project board with views and columns
- 🏷️ Comprehensive label system for issue categorization
- 📋 Issue templates for different types of requests
- 🔧 Initial project setup issues and epics
- ⚡ Dependabot and security automation

For detailed setup instructions, see [scripts/github/setup/README.md](scripts/github/setup/README.md).

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
- **Adapters Layer**: External integrations and concrete implementations (formerly Infrastructure) - see [migration guide](docs/technical-changelogs/adapters.md) for infrastructure → adapters transition details

**Key Benefits:**

- 🧪 **Highly Testable**: Each layer can be tested independently
- 🔄 **Maintainable**: Clear separation of concerns and dependencies
- 🔧 **Extensible**: Easy to add new features or swap implementations
- 📦 **Modular**: Use individual components or the complete SDK

**Documentation:**

- [Clean Architecture Guide](docs/clean-architecture.md) - Detailed implementation patterns
- [PRODUCT.md](PRODUCT.md) - Product vision and business context

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
