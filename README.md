# TrainingPeaks SDK

A lightweight TypeScript SDK for TrainingPeaks integration, optimized for essential functionality: **login**, **get user**, and **upload structured workouts**.

## Features

- ✅ **Authentication**: Web-based login to TrainingPeaks
- ✅ **User Management**: Get current user information
- ✅ **Workout Upload**: Upload structured workouts and files
- 🚫 **Simplified**: Removed unnecessary complexity

## Installation

```bash
npm install trainingpeaks-sdk
```

For web login, you also need to install a browser:

```bash
npx playwright install chromium
```

## Quick Start

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

const client = new TrainingPeaksClient({
  debug: true,
});

// Login
const loginResult = await client.login('your-username', 'your-password');
console.log('Logged in:', loginResult.success);

// Get user info
const userResult = await client.getUser();
console.log('User:', userResult.user);

// Upload structured workout
const workoutResult = await client.uploadWorkout({
  name: 'Interval Training',
  description: 'High intensity intervals',
  date: '2024-01-01',
  duration: 2400, // 40 minutes
  activityType: 'RUN',
  structure: {
    elements: [
      {
        type: 'step',
        duration: 300, // 5 minutes
        intensity: 70,
        description: 'Warm up',
      },
      {
        type: 'interval',
        duration: 600, // 10 minutes
        intensity: 90,
        description: 'High intensity',
      },
    ],
  },
});

console.log('Workout uploaded:', workoutResult.success);
```

## API Reference

### TrainingPeaksClient

#### Constructor

```typescript
new TrainingPeaksClient(config?: TrainingPeaksClientConfig)
```

#### Methods

- `login(username: string, password: string)` - Authenticate with TrainingPeaks
- `getUser()` - Get current user information
- `uploadWorkout(request: UploadWorkoutRequest)` - Upload a workout
- `isAuthenticated()` - Check if client is authenticated
- `getUserId()` - Get current user ID

### UploadWorkoutRequest

```typescript
interface UploadWorkoutRequest {
  name: string;
  description?: string;
  date: string | Date;
  duration: number; // seconds
  distance?: number; // meters
  activityType?: string;
  structure?: {
    elements: Array<{
      type: 'step' | 'interval' | 'recovery';
      duration: number; // seconds
      intensity?: number; // percentage
      description?: string;
    }>;
  };
  file?: {
    fileName: string;
    content: string;
    mimeType: string;
  };
}
```

## Architecture

This SDK follows **Clean Architecture** principles with a simplified structure:

```
src/
├── domain/           # Core business logic
│   ├── entities/     # User, Workout
│   ├── value-objects/ # Credentials, AuthToken, WorkoutFile
│   └── repositories/ # Contract interfaces
├── application/      # Use cases (only 3)
│   ├── services/     # Service contracts
│   └── use-cases/    # Login, GetUser, UploadWorkout
├── infrastructure/   # Implementations
│   ├── repositories/ # Concrete repositories
│   ├── services/     # Service implementations
│   └── auth/         # Authentication adapters
└── index.ts          # Public API
```

## Development

### Setup

```bash
git clone <repository>
cd trainingpeaks-sdk
npm install
```

### Commands

- `npm run build` - Build for production
- `npm run test` - Run unit tests
- `npm run test:integration` - Run integration tests
- `npm run lint` - Lint code

### Testing

The SDK includes comprehensive tests for all 3 use cases:

- **Login tests**: Authentication flow
- **Get user tests**: User retrieval
- **Upload workout tests**: Workout upload with validation

## License

MIT
