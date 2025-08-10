# API Client Usage Guide

## Overview

The TrainingPeaks API Client has been refactored to follow Clean Architecture principles, providing both **high-level service methods** and **direct repository access**. This guide explains how to use the new client effectively.

## Client Structure

The `TrainingPeaksApiClient` is composed of:

1. **Entity-specific API clients** (repositories)
2. **Service implementations** (business logic)
3. **Public interface methods** (convenience methods)

```typescript
import { TrainingPeaksApiClient } from '@/adapters/api/training-peaks-api-client';

const client = new TrainingPeaksApiClient({
  baseURL: 'https://api.trainingpeaks.com',
  timeout: 5000,
});
```

## Usage Patterns

### 1. High-Level Service Methods (Recommended)

Use the public interface methods for most operations. These methods provide business logic and return domain objects.

#### Authentication

```typescript
// Authenticate user and get token + user data
const credentials = { username: 'user@example.com', password: 'password123' };
const { token, user } = await client.authenticateUser(credentials);

console.log('User authenticated:', user.name);
console.log('Token expires at:', token.expiresAt);
```

#### User Operations

```typescript
// Get current user information
const currentUser = await client.getCurrentUser(token);
console.log('Current user:', currentUser.name);

// Refresh authentication token
const newToken = await client.refreshToken(token.refreshToken);

// Update user preferences
await client.updateUserPreferences(token, {
  theme: 'dark',
  language: 'en',
  notifications: true,
});

// Get user settings
const settings = await client.getUserSettings(token);
console.log('User settings:', settings);
```

#### Workout Operations

```typescript
// Get workouts with optional filters
const workouts = await client.getWorkouts(token, {
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
  type: 'running',
  limit: 10,
});

console.log(`Found ${workouts.total} workouts`);
workouts.workouts.forEach((workout) => {
  console.log(`- ${workout.name} (${workout.duration}s)`);
});

// Get specific workout
const workout = await client.getWorkoutById('123', token);
console.log('Workout details:', workout.workout);

// Create new workout
const newWorkout = await client.createWorkout(
  {
    name: 'Morning Run',
    date: '2024-01-15',
    duration: 3600,
    type: 'running',
    description: 'A great morning run',
  },
  token
);

console.log('Created workout:', newWorkout.workout.id);

// Update workout
const updatedWorkout = await client.updateWorkout(
  {
    id: '123',
    name: 'Updated Morning Run',
    duration: 4500,
  },
  token
);

// Delete workout
await client.deleteWorkout('123', token);

// Get workout statistics
const stats = await client.getWorkoutStats(token, {
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
});

console.log(`Total workouts: ${stats.totalWorkouts}`);
console.log(`Total duration: ${stats.totalDuration}s`);
console.log(`Average duration: ${stats.averageDuration}s`);
```

### 2. Direct Repository Access

For advanced use cases or when you need raw API data, you can access the repository implementations directly.

#### User Repository

```typescript
// Direct access to user repository
const userRepo = client.users;

// Authenticate (returns raw API data)
const rawAuthData = await userRepo.authenticate(credentials);
console.log('Raw auth data:', rawAuthData);

// Get user info (returns raw API data)
const rawUserData = await userRepo.getUserInfo(token);
console.log('Raw user data:', rawUserData);

// Refresh token (returns raw API data)
const rawTokenData = await userRepo.refreshToken(refreshToken);
console.log('Raw token data:', rawTokenData);
```

#### Workout Repository

```typescript
// Direct access to workout repository
const workoutRepo = client.workouts;

// Get workouts (returns raw API data)
const rawWorkouts = await workoutRepo.getWorkouts(token, filters);
console.log('Raw workouts data:', rawWorkouts);

// Get workout by ID (returns raw API data)
const rawWorkout = await workoutRepo.getWorkoutById('123', token);
console.log('Raw workout data:', rawWorkout);
```

## Error Handling

The client throws domain-specific errors that you can catch and handle appropriately.

```typescript
import {
  AuthenticationError,
  ValidationError,
  NetworkError,
} from '@/domain/errors';

try {
  const { token, user } = await client.authenticateUser(credentials);
  console.log('Authentication successful');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
    // Handle authentication failure
  } else if (error instanceof ValidationError) {
    console.error('Invalid input:', error.message);
    // Handle validation errors
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
    // Handle network issues
  } else {
    console.error('Unexpected error:', error);
    // Handle other errors
  }
}
```

## Configuration

### Basic Configuration

```typescript
const client = new TrainingPeaksApiClient({
  baseURL: 'https://api.trainingpeaks.com',
  timeout: 5000,
});
```

### Advanced Configuration

```typescript
const client = new TrainingPeaksApiClient({
  baseURL: 'https://api.trainingpeaks.com',
  timeout: 10000,
  version: 'v3', // API version
  retries: 3, // Retry attempts
  retryDelay: 1000, // Delay between retries
});
```

### Environment-Specific Configuration

```typescript
const client = new TrainingPeaksApiClient({
  baseURL:
    process.env.TRAINING_PEAKS_API_URL || 'https://api.trainingpeaks.com',
  timeout: parseInt(process.env.API_TIMEOUT || '5000'),
});
```

## Best Practices

### 1. Use High-Level Methods for Business Logic

```typescript
// ✅ Good: Use service methods for business operations
const { token, user } = await client.authenticateUser(credentials);
const workouts = await client.getWorkouts(token, filters);

// ❌ Avoid: Direct repository access unless you need raw data
const rawData = await client.users.authenticate(credentials);
```

### 2. Handle Errors Appropriately

```typescript
// ✅ Good: Catch specific error types
try {
  const result = await client.authenticateUser(credentials);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle authentication errors
  }
}

// ❌ Avoid: Generic error handling
try {
  const result = await client.authenticateUser(credentials);
} catch (error) {
  console.error('Something went wrong'); // Too generic
}
```

### 3. Use TypeScript for Type Safety

```typescript
// ✅ Good: Use proper types
import type { AuthToken, Credentials, User } from '@/domain';

const credentials: Credentials = {
  username: 'user@example.com',
  password: 'password123',
};

const { token, user }: { token: AuthToken; user: User } =
  await client.authenticateUser(credentials);

// ❌ Avoid: Using any types
const result: any = await client.authenticateUser(credentials);
```

### 4. Reuse Client Instances

```typescript
// ✅ Good: Create client once and reuse
const client = new TrainingPeaksApiClient(config);

// Use throughout your application
const user1 = await client.getCurrentUser(token1);
const user2 = await client.getCurrentUser(token2);

// ❌ Avoid: Creating new clients for each operation
const client1 = new TrainingPeaksApiClient(config);
const user1 = await client1.getCurrentUser(token1);

const client2 = new TrainingPeaksApiClient(config);
const user2 = await client2.getCurrentUser(token2);
```

## Migration from Old Architecture

If you're migrating from the previous version:

### Before (Old Architecture)

```typescript
// Direct API client usage
const client = new TrainingPeaksApiClient(config);
const result = await client.users.authenticate(credentials);
const user = await client.users.getUserInfo(token);
```

### After (New Architecture)

```typescript
// High-level service methods (recommended)
const client = new TrainingPeaksApiClient(config);
const { token, user } = await client.authenticateUser(credentials);
const currentUser = await client.getCurrentUser(token);

// Or direct repository access (if needed)
const rawData = await client.users.authenticate(credentials);
```

## Testing

### Mocking the Client

```typescript
import { vi } from 'vitest';
import { TrainingPeaksApiClient } from '@/adapters/api/training-peaks-api-client';

// Mock the client
vi.mock('@/adapters/api/training-peaks-api-client');

describe('My Service', () => {
  it('should authenticate user', async () => {
    const mockClient = {
      authenticateUser: vi.fn().mockResolvedValue({
        token: { accessToken: 'mock-token' },
        user: { id: '1', name: 'Test User' },
      }),
    };

    // Use the mocked client
    const result = await mockClient.authenticateUser(credentials);
    expect(result.user.name).toBe('Test User');
  });
});
```

### Testing with Real Client

```typescript
import { TrainingPeaksApiClient } from '@/adapters/api/training-peaks-api-client';

describe('TrainingPeaksApiClient Integration', () => {
  let client: TrainingPeaksApiClient;

  beforeEach(() => {
    client = new TrainingPeaksApiClient({
      baseURL: 'https://api.trainingpeaks.com',
      timeout: 5000,
    });
  });

  it('should authenticate user successfully', async () => {
    const credentials = { username: 'test', password: 'test' };
    const result = await client.authenticateUser(credentials);

    expect(result.token).toBeDefined();
    expect(result.user).toBeDefined();
  });
});
```

## Performance Considerations

### 1. Connection Pooling

The client automatically manages HTTP connections for optimal performance.

### 2. Caching

Consider implementing caching for frequently accessed data:

```typescript
// Simple in-memory cache
const userCache = new Map<string, User>();

async function getCachedUser(token: AuthToken): Promise<User> {
  const cacheKey = token.accessToken;

  if (userCache.has(cacheKey)) {
    return userCache.get(cacheKey)!;
  }

  const user = await client.getCurrentUser(token);
  userCache.set(cacheKey, user);

  return user;
}
```

### 3. Batch Operations

For multiple operations, consider batching where possible:

```typescript
// Batch multiple workout retrievals
const workoutIds = ['1', '2', '3', '4', '5'];
const workoutPromises = workoutIds.map((id) =>
  client.getWorkoutById(id, token)
);

const workouts = await Promise.all(workoutPromises);
```

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure credentials are correct and tokens are valid
2. **Network Errors**: Check connectivity and API endpoint availability
3. **Timeout Errors**: Increase timeout for slow operations
4. **Validation Errors**: Verify input data format and required fields

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
const client = new TrainingPeaksApiClient({
  baseURL: 'https://api.trainingpeaks.com',
  timeout: 5000,
  debug: true, // Enable debug logging
});
```

### Getting Help

- Check the [Clean Architecture documentation](./clean-architecture.md)
- Review the [API reference documentation](./api-reference.md)
- Open an issue on GitHub for bugs or feature requests
