# Clean Architecture Implementation

## Overview

This document describes the Clean Architecture implementation in the TrainingPeaks SDK, which follows the principles of **Hexagonal Architecture** (Ports & Adapters) and **Dependency Inversion**.

## Architecture Layers

### 1. Domain Layer (`src/domain/`)

The **innermost layer** containing business logic, entities, and domain rules. This layer has **no dependencies** on external frameworks or libraries.

#### Key Components:

- **Entities** (`src/domain/entities/`): Core business objects (User, Workout, etc.)
- **Value Objects** (`src/domain/value-objects/`): Immutable objects representing domain concepts (AuthToken, Credentials, etc.)
- **Repositories** (`src/domain/repositories/`): **Interfaces** defining data access contracts
- **Schemas** (`src/domain/schemas/`): Type definitions and validation schemas
- **Errors** (`src/domain/errors/`): Domain-specific error types
- **Builders** (`src/domain/builders/`): Object construction patterns

#### Example Repository Interface:

```typescript
// src/domain/repositories/user-repository.ts
export interface UserRepository {
  authenticate(
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }>;
  getUserInfo(token: AuthToken): Promise<User>;
  refreshToken(refreshToken: string): Promise<AuthToken>;
  updatePreferences(
    token: AuthToken,
    preferences: Record<string, unknown>
  ): Promise<void>;
  getUserSettings(token: AuthToken): Promise<Record<string, unknown>>;
}
```

### 2. Application Layer (`src/application/`)

Contains **use cases** and **service contracts** (function types) that orchestrate business logic.

#### Key Components:

- **Use Cases** (`src/application/use-cases/`): Application-specific business rules
- **Services** (`src/application/services/`): **Function type contracts** for business operations

#### Example Service Contract:

```typescript
// src/application/services/user-service.ts
export type authenticateUser = (
  userRepository: UserRepository
) => (credentials: Credentials) => Promise<{ token: AuthToken; user: User }>;

export type getCurrentUser = (
  userRepository: UserRepository
) => (token: AuthToken) => Promise<User>;
```

### 3. Infrastructure Layer (`src/infrastructure/`)

Contains **implementations** of application service contracts, containing business logic and depending on domain interfaces.

#### Key Components:

- **Services** (`src/infrastructure/services/`): **Implementations** of application service contracts

#### Example Service Implementation:

```typescript
// src/infrastructure/services/user-service.ts
export const authenticateUser: authenticateUser =
  (userRepository: UserRepository) =>
  async (
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> => {
    const sdkConfig = getSDKConfig();

    // Get raw data from repository
    const rawData = await userRepository.authenticate(credentials);

    // Create domain objects with business logic
    const authToken = createAuthToken(
      rawData.token.access_token,
      rawData.token.token_type,
      new Date(Date.now() + sdkConfig.tokens.defaultExpiration),
      rawData.token.refresh_token
    );

    const user = createUser(
      String(rawData.user.userId),
      rawData.user.username,
      rawData.user.name,
      rawData.user.preferences
    );

    return { token: authToken, user };
  };
```

### 4. Adapters Layer (`src/adapters/`)

The **outermost layer** containing external integrations and implementations of domain interfaces.

#### Key Components:

- **API Clients** (`src/adapters/api/`): HTTP client implementations
- **HTTP Adapters** (`src/adapters/http/`): HTTP communication and authentication
- **Storage Adapters** (`src/adapters/storage/`): Data persistence implementations
- **Serialization** (`src/adapters/serialization/`): Data transformation utilities
- **Services** (`src/adapters/services/`): Legacy service implementations

#### Example API Client Implementation:

```typescript
// src/adapters/api/modules/users-api-client.ts
export class UsersApiClient extends BaseApiClient implements UserRepository {
  async authenticate(
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> {
    const response = await this.httpClient.post('/users/v3/token', credentials);
    return response.data; // Returns raw API data
  }

  async getUserInfo(token: AuthToken): Promise<User> {
    const response = await this.httpClient.get('/users/v3/me', {
      headers: { Authorization: `Bearer ${token.accessToken}` },
    });
    return response.data; // Returns raw API data
  }
}
```

## Dependency Flow

```
Domain Layer (no dependencies)
    ↓
Application Layer (depends on domain interfaces)
    ↓
Infrastructure Layer (implements domain interfaces)
    ↓
Adapters Layer (implements domain interfaces)
```

## Key Principles

### 1. Dependency Inversion

- **Domain layer** defines interfaces (repositories)
- **Adapters layer** implements those interfaces
- **Infrastructure layer** depends on interfaces, not implementations

### 2. Separation of Concerns

- **API Clients**: Only handle HTTP communication, return raw data
- **Infrastructure Services**: Contain business logic, create domain objects
- **Application Services**: Define contracts, orchestrate operations
- **Domain**: Pure business logic, no external dependencies

### 3. Testability

- Each layer can be tested independently
- Dependencies can be easily mocked
- Business logic is isolated from external concerns

## Usage Examples

### Creating a New Entity

1. **Define Domain Entity**:

```typescript
// src/domain/entities/activity.ts
export interface Activity {
  id: string;
  name: string;
  type: ActivityType;
  duration: number;
  date: Date;
}
```

2. **Define Repository Interface**:

```typescript
// src/domain/repositories/activity-repository.ts
export interface ActivityRepository {
  getActivities(
    token: AuthToken,
    filters?: ActivityFilters
  ): Promise<ActivityListResponse>;
  getActivityById(id: string, token: AuthToken): Promise<ActivityResponse>;
  createActivity(
    activity: CreateActivityRequest,
    token: AuthToken
  ): Promise<ActivityResponse>;
}
```

3. **Define Service Contract**:

```typescript
// src/application/services/activity-service.ts
export type getActivities = (
  activityRepository: ActivityRepository
) => (
  token: AuthToken,
  filters?: ActivityFilters
) => Promise<ActivityListResponse>;
```

4. **Implement Service**:

```typescript
// src/infrastructure/services/activity-service.ts
export const getActivities: getActivities =
  (activityRepository: ActivityRepository) =>
  async (
    token: AuthToken,
    filters?: ActivityFilters
  ): Promise<ActivityListResponse> => {
    return await activityRepository.getActivities(token, filters);
  };
```

5. **Create API Client**:

```typescript
// src/adapters/api/modules/activities-api-client.ts
export class ActivitiesApiClient
  extends BaseApiClient
  implements ActivityRepository
{
  async getActivities(
    token: AuthToken,
    filters?: ActivityFilters
  ): Promise<ActivityListResponse> {
    const response = await this.httpClient.get('/activities/v1', {
      params: filters,
    });
    return response.data;
  }
}
```

6. **Compose in Main Client**:

```typescript
// src/adapters/api/training-peaks-api-client.ts
export class TrainingPeaksApiClient {
  public readonly activities: ActivitiesApiClient;
  private readonly getActivitiesService: ReturnType<typeof getActivitiesImpl>;

  constructor(config: TrainingPeaksApiClientConfig) {
    this.activities = new ActivitiesApiClient({
      /* config */
    });
    this.getActivitiesService = getActivitiesImpl(
      this.activities as ActivityRepository
    );
  }

  async getActivities(
    token: AuthToken,
    filters?: ActivityFilters
  ): Promise<ActivityListResponse> {
    return this.getActivitiesService(token, filters);
  }
}
```

## Benefits

### 1. Maintainability

- Changes in one layer don't affect others
- Business logic is centralized and easy to find
- Clear separation of responsibilities

### 2. Testability

- Each layer can be tested in isolation
- Dependencies can be easily mocked
- Business logic tests are fast and reliable

### 3. Flexibility

- Easy to swap implementations (e.g., HTTP client, storage)
- Multiple implementations can coexist
- Easy to add new features without breaking existing code

### 4. Scalability

- New entities can be added following the same pattern
- Team members can work on different layers independently
- Code is organized and easy to navigate

## Migration Guide

If you're migrating from the old architecture:

1. **Update imports** to use new service layer
2. **Replace direct API client calls** with service method calls
3. **Update tests** to mock the appropriate layer
4. **Use repository interfaces** for type safety

### Before (Old Architecture):

```typescript
const client = new TrainingPeaksApiClient(config);
const result = await client.users.authenticate(credentials);
```

### After (New Architecture):

```typescript
const client = new TrainingPeaksApiClient(config);
const result = await client.authenticateUser(credentials);
// Or for direct repository access:
const result = await client.users.authenticate(credentials);
```

## Best Practices

1. **Always use interfaces** from the domain layer
2. **Keep business logic** in the infrastructure layer
3. **Return raw data** from API clients
4. **Create domain objects** in service implementations
5. **Test each layer independently**
6. **Follow the dependency flow** strictly
7. **Use function types** for service contracts
8. **Implement repository interfaces** in adapters

## Testing Strategy

### Unit Tests

- **Domain**: Test entities, value objects, and business rules
- **Infrastructure Services**: Test business logic with mocked repositories
- **Adapters**: Test HTTP communication and data transformation

### Integration Tests

- Test the complete flow from API client to domain objects
- Verify that all layers work together correctly

### Contract Tests

- Ensure that implementations satisfy their interfaces
- Verify that service contracts are properly implemented
