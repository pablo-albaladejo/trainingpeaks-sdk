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

### 2. Use Case Exposure

Each use case is exposed as a public function in the SDK:

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
2. Create an entrypoint in `src/entrypoints/` ([sample entrypoint file](../src/entrypoints/login/entrypoint.ts))
3. Add the function to the SDK in `src/sdk/training-peaks-sdk.ts`
4. Export from `src/index.ts` using tree-shakeable named exports (no default exports):
   ```typescript
   // ✅ Good: Tree-shakeable named exports
   export { createTrainingPeaksSdk } from './sdk/training-peaks-sdk';
   export type { LoginResult, WorkoutFilters } from './types';
   export type { TrainingPeaksSdk } from './sdk/training-peaks-sdk';
   
   // ❌ Avoid: Default exports reduce tree-shaking effectiveness
   export default { createTrainingPeaksSdk };
   ```

5. Add comprehensive tests with specific coverage expectations:
   - **Unit tests** (use-case level): Cover all branches and error paths including negative-path tests
   - **Integration tests** (entrypoint and SDK layers): Test complete workflows with mocked external adapters/services
   - **Mock strategy**: Replace external adapters/services to verify orchestration only at the SDK layer
   - **Coverage policy**: 
     - Unit tests: ≥95% statement, branch, and function coverage for all new use cases
     - Integration tests: 100% coverage of all public API methods and error scenarios
     - Critical path testing: 100% coverage for authentication, core workflows, and error handling paths
     - Regression protection: All bug fixes must include tests that would have caught the original issue
   - **Coverage measurement**: 
     - **Tooling**: Vitest with c8 coverage reporter configured in `vite.config.ts`
     - **Per-file thresholds**: 95% statements, 90% branches, 95% functions
     - **Exclusions**: `src/__fixtures__/`, `**/*.test.ts`, `**/*.integ-test.ts`, generated code
     - **Waiver process**: Coverage exceptions require PR review with documented justification
     - **CI enforcement**: Coverage gates in GitHub Actions with automatic threshold updates
     - **Example configuration**:
       ```typescript
       // vite.config.ts coverage settings
       coverage: {
         thresholds: {
           statements: 95,
           branches: 90,
           functions: 95,
           lines: 95
         },
         exclude: ['src/__fixtures__/**', '**/*.test.ts', '**/*.integ-test.ts']
       }
       ```

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

- [ ] **Add more use cases**: Implement additional use cases such as workout management
  - Add use cases in [`../src/application/use-cases/`](../src/application/use-cases/)
  - Create corresponding entrypoints in [`../src/entrypoints/`](../src/entrypoints/)

- [ ] **Improve error handling**: Implement more specific error types
  - Enhance error definitions in [`../src/domain/errors/`](../src/domain/errors/)
  - Add structured error codes and recovery strategies

- [ ] **Add validation**: Implement input validation with Zod at boundaries
  - Apply validation at entrypoints and adapters to keep domain/use cases framework-agnostic
  - Update schemas in [`../src/domain/schemas/`](../src/domain/schemas/)

- [ ] **Improve testing**: Add integration tests for the SDK
  - Expand test coverage in SDK and entrypoint layers
  - Focus on complete workflow testing with external service mocks

- [ ] **Update API documentation**: Ensure documentation reflects renamed SDK methods
  - Update method references from legacy client names to current SDK interface
  - Synchronize documentation with actual SDK exports

- [ ] **Documentation**: Expand the API documentation
  - Add comprehensive API reference with examples
  - Document all public SDK methods and their return types
