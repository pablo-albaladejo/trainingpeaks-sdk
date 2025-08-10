# TrainingPeaks SDK New Architecture

## Overview

The SDK architecture has been reorganized to follow Clean Architecture and Hexagonal Architecture (Ports & Adapters) principles. The main SDK implementation is located in `src/sdk/training-peaks-sdk.ts` and serves as the main external contact point for the library.

## Structure

```
src/
├── adapters/
│   ├── http/                     # HTTP adapters
│   ├── storage/                  # Storage adapters
│   ├── services/                 # Service implementations
│   └── public-api/               # Repository implementations
├── application/
│   ├── use-cases/               # Application use cases
│   └── services/                # Service contracts
├── domain/                      # Domain logic
├── entrypoints/                 # Feature entrypoints
└── sdk/
    └── training-peaks-sdk.ts    # 🎯 MAIN SDK IMPLEMENTATION
```

## Design Principles

### 1. Dependency Injection

The client handles all dependency injection internally:

```typescript
// The SDK creates and configures all dependencies
const sdk = createTrainingPeaksSdk(config);

// Use cases receive their dependencies injected
const loginUseCase = executeLoginUseCase(
  loginServiceWrapper,
  authService.getCurrentUser
);
```

### 2. Exposición de Use Cases

Cada use case se expone como una función pública en el cliente:

```typescript
export interface TrainingPeaksSdk {
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<LogoutResult>;
  getWorkoutsList: (filters: WorkoutFilters) => Promise<WorkoutsListResult>;
  logger: Logger;
}
```

### 3. Separation of Responsibilities

- **SDK**: Main contact point, dependency injection, and public interface
- **Application/Use Cases**: Application logic, orchestration
- **Domain**: Pure business logic
- **Adapters**: Concrete implementations that interface with external systems

## Using the New SDK

### SDK Creation

```typescript
import { createTrainingPeaksSdk } from '@trainingpeaks/sdk';

const client = createTrainingPeaksSdk({
  apiKey: process.env.TRAINING_PEAKS_API_KEY,
  baseUrl: process.env.TRAINING_PEAKS_BASE_URL,
});
```

### Using Use Cases

```typescript
// Login
const loginResult = await client.login('username', 'password');
if (loginResult.success) {
  console.log('Login successful:', loginResult.user);
}

// Get user
const userResult = await client.getUser();
if (userResult.success) {
  console.log('User info:', userResult.user);
}

// Check authentication
const isAuth = client.isAuthenticated();
const userId = client.getUserId();
```

## Advantages of the New Architecture

### 1. Better Testability

```typescript
// Use cases are pure functions that receive dependencies
const mockAuthService = { login: vi.fn(), getCurrentUser: vi.fn() };
const loginUseCase = executeLoginUseCase(
  mockAuthService.login,
  mockAuthService.getCurrentUser
);
```

### 2. Explicit Dependency Injection

```typescript
// All dependencies are explicitly injected
const authService = createAuthService({
  authAdapters: [...],
  storage: {...},
});
```

### 3. Clear Layer Separation

- **SDK**: Orchestrates dependency injection and provides public interface
- **Use Cases**: Contains application logic
- **Services**: Orchestrates and integrates with repositories and adapters
- **Repositories**: Handle data access

### 4. Easy to Add New Use Cases

To add a new use case:

1. Create the use case in `src/application/use-cases/`
2. Create an entrypoint in `src/entrypoints/` ([sample entrypoint file](src/entrypoints/login/entrypoint.ts))
3. Add the function to the SDK in `src/sdk/training-peaks-sdk.ts`
4. Export from `src/index.ts` using tree-shakeable named exports to maintain public API consistency
5. Add comprehensive tests:
   - Unit tests at the use-case level
   - Integration tests covering the entrypoint and SDK layers
   - Ensure proper coverage and functionality across all architectural layers

## Migration from Previous Version

### Before (Class)

```typescript
import { TrainingPeaksSdk } from '@trainingpeaks/sdk';

const client = new TrainingPeaksSdk(config);
await client.login('username', 'password');
```

### Now (Function)

```typescript
import { createTrainingPeaksSdk } from '@trainingpeaks/sdk';

const client = createTrainingPeaksSdk(config);
await client.login('username', 'password');
```

## Backward Compatibility

The original `TrainingPeaksSdk` class remains available as `TrainingPeaksSdkClass` for compatibility:

```typescript
import { TrainingPeaksSdkClass } from '@trainingpeaks/sdk';

const client = new TrainingPeaksSdkClass(config);
```

**Note**: It's recommended to migrate to the new functional SDK to benefit from architectural improvements.

## Next Steps

1. **Add more use cases**: Implement additional use cases such as workout management
2. **Improve error handling**: Implement more specific error types
3. **Add validation**: Implement input validation with Zod
4. **Improve testing**: Add integration tests for the SDK
5. **Documentation**: Expand the API documentation
