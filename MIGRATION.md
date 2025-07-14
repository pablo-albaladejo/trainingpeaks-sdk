# Migration Guide: Function-First Architecture

This guide helps you migrate from the class-based API to the new **Function-First Architecture** introduced in version 2.0.0.

## 🔄 Overview

The TrainingPeaks SDK has been refactored to follow a **Function-First Architecture** approach, which provides better testability, composability, and aligns with modern TypeScript patterns.

### Key Changes

- **Main Client**: Changed from class constructor to factory function
- **Architecture**: Implemented hexagonal architecture with clean separation of concerns
- **Dependency Injection**: Function-based instead of class-based
- **Immutability**: Promotes immutable data patterns
- **Performance**: Reduced overhead by eliminating class instantiation

## 📋 Breaking Changes

### 1. Client Creation

#### Before (Class-based)

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

const client = new TrainingPeaksClient({
  authMethod: 'web',
  debug: true,
});
```

#### After (Function-First)

```typescript
import { createTrainingPeaksClient } from 'trainingpeaks-sdk';

const client = createTrainingPeaksClient({
  authMethod: 'web',
  debug: true,
});
```

### 2. Type Imports

#### Before

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

let client: TrainingPeaksClient;
```

#### After

```typescript
import {
  createTrainingPeaksClient,
  TrainingPeaksClient,
} from 'trainingpeaks-sdk';

let client: TrainingPeaksClient; // Now a type, not a class
```

### 3. Advanced Usage Patterns

#### Before

```typescript
import {
  TrainingPeaksClient,
  LoginUseCase,
  UploadWorkoutUseCase,
} from 'trainingpeaks-sdk';

const client = new TrainingPeaksClient(config);
const loginUseCase = new LoginUseCase(dependencies);
const uploadUseCase = new UploadWorkoutUseCase(dependencies);
```

#### After

```typescript
import {
  createTrainingPeaksClient,
  createLoginUseCase,
  createUploadWorkoutUseCase,
  TrainingPeaksClient, // Type import
} from 'trainingpeaks-sdk';

const client = createTrainingPeaksClient(config);
const loginUseCase = createLoginUseCase(dependencies);
const uploadUseCase = createUploadWorkoutUseCase(dependencies);
```

## 🚀 Migration Steps

### Step 1: Update Imports

Replace all class imports with factory function imports:

```bash
# Find and replace in your codebase
# From: import { TrainingPeaksClient } from 'trainingpeaks-sdk';
# To:   import { createTrainingPeaksClient } from 'trainingpeaks-sdk';
```

### Step 2: Update Client Creation

Replace constructor calls with factory function calls:

```bash
# Find and replace in your codebase
# From: new TrainingPeaksClient(
# To:   createTrainingPeaksClient(
```

### Step 3: Update Type Annotations

If you're using TypeScript, update type annotations:

```typescript
// Before
let client: TrainingPeaksClient;

// After
import { TrainingPeaksClient } from 'trainingpeaks-sdk';
let client: TrainingPeaksClient; // Now it's a type, not a class
```

### Step 4: Test Your Changes

Run your tests to ensure everything works correctly:

```bash
npm test
```

## 📚 Common Migration Patterns

### Authentication Pattern

#### Before

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

class MyApp {
  private client: TrainingPeaksClient;

  constructor() {
    this.client = new TrainingPeaksClient({
      authMethod: 'web',
      debug: true,
    });
  }

  async authenticate() {
    await this.client.login({
      username: 'user',
      password: 'pass',
    });
  }
}
```

#### After

```typescript
import {
  createTrainingPeaksClient,
  TrainingPeaksClient,
} from 'trainingpeaks-sdk';

class MyApp {
  private client: TrainingPeaksClient;

  constructor() {
    this.client = createTrainingPeaksClient({
      authMethod: 'web',
      debug: true,
    });
  }

  async authenticate() {
    await this.client.login({
      username: 'user',
      password: 'pass',
    });
  }
}
```

### Dependency Injection Pattern

#### Before

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

const createAuthenticatedClient = (config: Config) => {
  const client = new TrainingPeaksClient(config);
  return client;
};
```

#### After

```typescript
import {
  createTrainingPeaksClient,
  TrainingPeaksClient,
} from 'trainingpeaks-sdk';

const createAuthenticatedClient = (config: Config): TrainingPeaksClient => {
  const client = createTrainingPeaksClient(config);
  return client;
};
```

### Testing Pattern

#### Before

```typescript
import { TrainingPeaksClient } from 'trainingpeaks-sdk';

describe('MyApp', () => {
  let client: TrainingPeaksClient;

  beforeEach(() => {
    client = new TrainingPeaksClient({
      authMethod: 'api',
      debug: false,
    });
  });

  it('should authenticate', async () => {
    await client.login(credentials);
    expect(client.isReady()).toBe(true);
  });
});
```

#### After

```typescript
import {
  createTrainingPeaksClient,
  TrainingPeaksClient,
} from 'trainingpeaks-sdk';

describe('MyApp', () => {
  let client: TrainingPeaksClient;

  beforeEach(() => {
    client = createTrainingPeaksClient({
      authMethod: 'api',
      debug: false,
    });
  });

  it('should authenticate', async () => {
    await client.login(credentials);
    expect(client.isReady()).toBe(true);
  });
});
```

## 🔧 Advanced Migration Scenarios

### Custom Repository Implementation

If you were extending classes before, you'll now work with factory functions:

#### Before

```typescript
class CustomAuthRepository extends TrainingPeaksAuthRepository {
  async authenticate(credentials: Credentials) {
    // Custom logic
    return super.authenticate(credentials);
  }
}
```

#### After

```typescript
import { createTrainingPeaksAuthRepository } from 'trainingpeaks-sdk';

const createCustomAuthRepository = (dependencies: Dependencies) => {
  const baseRepository = createTrainingPeaksAuthRepository(dependencies);

  return {
    ...baseRepository,
    authenticate: async (credentials: Credentials) => {
      // Custom logic
      return await baseRepository.authenticate(credentials);
    },
  };
};
```

### Use Case Extension

#### Before

```typescript
class CustomUploadUseCase extends UploadWorkoutUseCase {
  async execute(data: WorkoutData) {
    // Pre-processing
    const result = await super.execute(data);
    // Post-processing
    return result;
  }
}
```

#### After

```typescript
import { createUploadWorkoutUseCase } from 'trainingpeaks-sdk';

const createCustomUploadUseCase = (dependencies: Dependencies) => {
  const baseUseCase = createUploadWorkoutUseCase(dependencies);

  return async (data: WorkoutData) => {
    // Pre-processing
    const result = await baseUseCase(data);
    // Post-processing
    return result;
  };
};
```

## 🎯 Benefits of Function-First Architecture

After migration, you'll enjoy these benefits:

1. **Better Testability**: Easy to mock dependencies with function parameters
2. **Improved Performance**: No class instantiation overhead
3. **Enhanced Composability**: Functions can be easily composed and combined
4. **Cleaner Code**: Less boilerplate, more focus on business logic
5. **Better Type Safety**: Full TypeScript support without class complexity

## 📝 Automated Migration Script

You can use this script to help with the migration:

```bash
#!/bin/bash
# migration-script.sh

echo "Migrating TrainingPeaks SDK to Function-First Architecture..."

# Replace imports
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i '' \
  's/import { TrainingPeaksClient }/import { createTrainingPeaksClient, TrainingPeaksClient }/g'

# Replace constructor calls
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs sed -i '' \
  's/new TrainingPeaksClient(/createTrainingPeaksClient(/g'

echo "Basic migration complete. Please review changes and run tests."
```

## 🆘 Troubleshooting

### Common Issues

1. **TypeScript Errors**: Make sure to import types separately from factory functions
2. **Runtime Errors**: Check that all `new` calls have been replaced with factory functions
3. **Test Failures**: Update test mocks to use factory functions

### Getting Help

If you encounter issues during migration:

1. Check the [README.md](README.md) for updated usage examples
2. Review the [Issues](https://github.com/pablo-albaladejo/trainingpeaks-sdk/issues) for common problems
3. Create a new issue if you need help

## 📋 Migration Checklist

- [ ] Update all imports to use factory functions
- [ ] Replace all `new TrainingPeaksClient()` calls
- [ ] Update TypeScript type annotations
- [ ] Update test files
- [ ] Run tests to verify everything works
- [ ] Update documentation/comments in your code
- [ ] Consider refactoring to take advantage of new patterns

## 🔄 Version Compatibility

| Version | API Pattern    | Status        |
| ------- | -------------- | ------------- |
| 1.x     | Class-based    | ⚠️ Deprecated |
| 2.x     | Function-First | ✅ Current    |

## 📚 Further Reading

- [Function-First Architecture Guide](docs/logger-configuration.md#function-first-architecture-logger-integration)
- [Release Process](docs/RELEASE_PROCESS.md#function-first-architecture-guidelines)
- [Logger Configuration](docs/logger-configuration.md)

---

**Need help with migration?** Open an issue in the [GitHub repository](https://github.com/pablo-albaladejo/trainingpeaks-sdk/issues) and we'll help you migrate your code.
