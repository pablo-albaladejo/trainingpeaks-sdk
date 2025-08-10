# TrainingPeaks Client New Architecture

## Overview

The client architecture has been reorganized to follow Clean Architecture and Hexagonal Architecture (Ports & Adapters) principles. The new client is located in `src/adapters/client` and serves as the main external contact point for the library.

## Structure

```
src/
├── adapters/
│   ├── client/                    # 🎯 MAIN CONTACT POINT
│   │   ├── index.ts              # Client exports
│   │   └── training-peaks-client.ts # Client implementation
│   ├── http/                     # HTTP adapters
│   ├── storage/                  # Storage adapters
│   ├── services/                 # Service implementations
│   └── repositories/             # Repository implementations
├── application/
│   ├── use-cases/               # Application use cases
│   └── services/                # Service contracts
├── domain/                      # Domain logic
└── training-peaks-client.ts     # Re-export for compatibility
```

## Design Principles

### 1. Dependency Injection

The client handles all dependency injection internally:

```typescript
// El cliente crea y configura todas las dependencias
const client = createTrainingPeaksClient(config);

// Los use cases reciben sus dependencias inyectadas
const loginUseCase = executeLoginUseCase(
  loginServiceWrapper,
  authService.getCurrentUser
);
```

### 2. Exposición de Use Cases

Cada use case se expone como una función pública en el cliente:

```typescript
export interface TrainingPeaksClient {
  login: (username: string, password: string) => Promise<LoginResult>;
  getUser: () => Promise<GetUserResult>;
  isAuthenticated: () => boolean;
  getUserId: () => string | null;
}
```

### 3. Separation of Responsibilities

- **Adapters/Client**: Contact point, dependency injection
- **Application/Use Cases**: Application logic, orchestration
- **Domain**: Pure business logic
- **Infrastructure**: Concrete implementations

## Using the New Client

### Client Creation

```typescript
import { createTrainingPeaksClient } from '@trainingpeaks/sdk';

const client = createTrainingPeaksClient({
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

- **Client**: Orchestrates dependency injection
- **Use Cases**: Contains application logic
- **Services**: Implements business logic
- **Repositories**: Handle data access

### 4. Easy to Add New Use Cases

To add a new use case:

1. Create the use case in `src/application/use-cases/`
2. Add the function to the client in `src/adapters/client/training-peaks-client.ts`
3. Export from `src/adapters/client/index.ts`

## Migration from Previous Version

### Before (Class)

```typescript
import { TrainingPeaksClient } from '@trainingpeaks/sdk';

const client = new TrainingPeaksClient(config);
await client.login('username', 'password');
```

### Now (Function)

```typescript
import { createTrainingPeaksClient } from '@trainingpeaks/sdk';

const client = createTrainingPeaksClient(config);
await client.login('username', 'password');
```

## Backward Compatibility

The original `TrainingPeaksClient` class remains available as `TrainingPeaksClientClass` for compatibility:

```typescript
import { TrainingPeaksClientClass } from '@trainingpeaks/sdk';

const client = new TrainingPeaksClientClass(config);
```

**Nota**: Se recomienda migrar al nuevo cliente funcional para aprovechar las mejoras en la arquitectura.

## Próximos Pasos

1. **Agregar más use cases**: Implementar casos de uso adicionales como gestión de workouts
2. **Mejorar manejo de errores**: Implementar tipos de error más específicos
3. **Agregar validación**: Implementar validación de entrada con Zod
4. **Mejorar testing**: Agregar tests de integración para el cliente
5. **Documentación**: Expandir la documentación de la API
