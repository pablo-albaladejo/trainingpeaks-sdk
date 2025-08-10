# Error Handling Guide

The TrainingPeaks SDK provides comprehensive error handling with structured errors, automatic retry mechanisms, and consistent error transformation across all architectural layers.

## Quick Start

```typescript
import { TrainingPeaksSDK } from 'trainingpeaks-sdk';
import { AuthenticationError, ValidationError, NetworkError } from 'trainingpeaks-sdk/errors';

const sdk = new TrainingPeaksSDK({
  // Retry configuration
  retryAttempts: 3,
  retryDelay: 1000,
  retryBackoff: 2,
});

try {
  const user = await sdk.users.getUser(userId);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle authentication errors
    console.log('Authentication failed:', error.message);
    console.log('Error code:', error.code);
  } else if (error instanceof ValidationError) {
    // Handle validation errors
    console.log('Validation failed for field:', error.field);
  } else if (error instanceof NetworkError) {
    // Handle network errors
    console.log('Network error occurred:', error.message);
  }
}
```

## Error Types Hierarchy

All SDK errors extend from `SDKError`, providing consistent structure and context:

```typescript
// Base error class
class SDKError extends Error {
  code: string;           // Structured error code
  context?: object;       // Additional error context
}

// Domain-specific errors
class AuthenticationError extends SDKError {
  // AUTH_1001, AUTH_1002, etc.
}

class ValidationError extends SDKError {
  get field(): string | undefined;  // Invalid field name
}

class WorkoutError extends SDKError {
  // WORKOUT_2001, WORKOUT_2002, etc.
}

class NetworkError extends SDKError {
  // NETWORK_4001, NETWORK_4002, etc.
}

class UserError extends SDKError {
  // USER_3001, USER_3002, etc.
}
```

## Error Codes

The SDK uses structured error codes for consistent error handling:

```typescript
import { ERROR_CODES } from 'trainingpeaks-sdk/errors';

// Authentication (1000-1999)
ERROR_CODES.AUTH_INVALID_CREDENTIALS     // 'AUTH_1001'
ERROR_CODES.AUTH_TOKEN_EXPIRED          // 'AUTH_1002'
ERROR_CODES.AUTH_TOKEN_INVALID          // 'AUTH_1003'

// Workouts (2000-2999)
ERROR_CODES.WORKOUT_NOT_FOUND           // 'WORKOUT_2004'
ERROR_CODES.WORKOUT_VALIDATION_FAILED   // 'WORKOUT_2005'

// Users (3000-3999)
ERROR_CODES.USER_FETCH_FAILED           // 'USER_3001'
ERROR_CODES.USER_NOT_FOUND              // 'USER_3002'

// Network (4000-4999)
ERROR_CODES.NETWORK_TIMEOUT             // 'NETWORK_4001'
ERROR_CODES.NETWORK_SERVICE_UNAVAILABLE // 'NETWORK_4006' (HTTP 503 Service Unavailable - retryable only for idempotent methods, Retry-After header takes precedence over backoff strategy when present, supports both HTTP-date and delay-seconds formats, retry delay capped by retryMaxDelay)

// Validation (5000-5999)
ERROR_CODES.VALIDATION_FAILED           // 'VALIDATION_5001'
```

## Retry Configuration

The SDK automatically retries failed requests based on error type and HTTP status:

```typescript
const sdk = new TrainingPeaksSDK({
  retryAttempts: 3,        // Number of retry attempts (default: 3)
  retryDelay: 1000,        // Initial delay in ms (default: 1000)
  retryBackoff: 2,         // Backoff multiplier (default: 2)
  retryMaxDelay: 10000,    // Maximum delay in ms (default: 10000)
  retryJitter: true,       // Add jitter to prevent thundering herd (default: true)
  retryOn504: false,       // Enable retries for 504 Gateway Timeout (default: false)
});
```

### Retryable Errors

The SDK automatically retries these error conditions:
- **Server errors (5xx)**: 500, 502, 503
- **Timeout errors**: 408
- **Rate limiting**: 429

**Note**: Automatic retries are applied only to idempotent or safe operations. Idempotent HTTP methods include: GET, PUT, DELETE, HEAD, OPTIONS. The SDK treats POST requests with an `Idempotency-Key` header as retryable and automatically de-duplicates retries to prevent duplicate side effects. See [Idempotency Keys](#idempotency-keys) section for details.

### Non-retryable Errors

These errors are **not** retried:
- **Client errors (4xx)**: 400, 401, 403, 404, 422
- **Gateway timeout (504)**: Gateway timeout errors are non-retryable by default to prevent retry storms when upstream services are overloaded. Safe opt-in retry patterns include: a single retry with exponential backoff for idempotent requests, or when a Retry-After header is present. This behavior can be configured via constructor options: `new TrainingPeaksSDK({ retryOn504: true, retryAttempts: 1 })`. Default handling: log the error and alert users.
- **Authentication failures**: Invalid credentials (Note: 401 due to token expiration may trigger automatic token refresh and retry)
- **Validation errors**: Malformed requests, missing required fields

**Special Case - 401 Unauthorized**:
- **Token expiration**: SDK automatically refreshes tokens and retries the request
- **Invalid credentials**: Request fails immediately without retry

## Error Context and Debugging

All SDK errors include rich context for debugging:

```typescript
try {
  await sdk.workouts.createWorkout(workoutData);
} catch (error) {
  if (error instanceof SDKError) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    console.log('Error context:', error.context);
    
    // Context might include:
    // - HTTP details (status, URL, method)
    // - Request/response data
    // - Field-specific validation info
    // - Boundary layer information
  }
}
```


## Common Error Handling Patterns

### Authentication Flow

```typescript
async function authenticateUser(credentials) {
  try {
    return await sdk.auth.login(credentials);
  } catch (error) {
    if (error instanceof AuthenticationError) {
      switch (error.code) {
        case ERROR_CODES.AUTH_INVALID_CREDENTIALS:
          throw new Error('Invalid username or password');
        case ERROR_CODES.AUTH_TOKEN_EXPIRED:
          // Attempt to refresh token
          return await refreshAndRetry();
        default:
          throw new Error('Authentication failed');
      }
    }
    throw error; // Re-throw unexpected errors
  }
}
```

### Validation Handling

```typescript
async function createWorkout(workoutData) {
  try {
    return await sdk.workouts.create(workoutData);
  } catch (error) {
    if (error instanceof ValidationError) {
      const fieldErrors = {};
      if (error.field) {
        fieldErrors[error.field] = error.message;
      }
      return { success: false, fieldErrors };
    }
    throw error;
  }
}
```

### Network Error Recovery

```typescript
async function fetchWithFallback(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof NetworkError) {
      switch (error.code) {
        case ERROR_CODES.NETWORK_TIMEOUT:
          // Try with longer timeout
          return await retryWithTimeout(operation, 30000);
        case ERROR_CODES.NETWORK_SERVICE_UNAVAILABLE:
          // Use cached data if available
          return await getCachedData();
        default:
          throw new Error('Network request failed');
      }
    }
    throw error;
  }
}
```

## Error Monitoring and Logging

For production applications, implement structured error logging:

```typescript
function logError(error: SDKError, context: string = '') {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      name: error.name,
      code: error.code,
      message: error.message,
      stack: error.stack,
      context: error.context,
    },
  };
  
  // Send to your logging service
  console.error('SDK Error:', logData);
  
  // Optional: Send to error tracking service
  // errorTracker.captureException(error, { extra: logData });
}

// Usage
try {
  await sdk.users.getUser(userId);
} catch (error) {
  if (error instanceof SDKError) {
    logError(error, 'user-fetch-operation');
  }
  throw error;
}
```

## TypeScript Support

The SDK provides full TypeScript support for error handling:

```typescript
import type { SDKError, AuthenticationError } from 'trainingpeaks-sdk/errors';

function handleError(error: unknown): string {
  if (error instanceof AuthenticationError) {
    // TypeScript knows this is AuthenticationError
    return `Auth error: ${error.code}`;
  }
  
  if (error instanceof SDKError) {
    // TypeScript knows this has code and context properties
    return `SDK error: ${error.code}`;
  }
  
  return 'Unknown error occurred';
}
```

## Best Practices

1. **Always handle specific error types** rather than catching all errors
2. **Use error codes** for programmatic error handling
3. **Provide user-friendly messages** by mapping error codes to display text
4. **Log structured error context** for debugging in production
5. **Configure appropriate retry settings** for your use case
6. **Handle authentication errors** by refreshing tokens when possible
7. **Validate data client-side** to reduce validation errors
8. **Implement fallback mechanisms** for network errors
9. **Monitor error rates** to identify API issues early
10. **Test error handling paths** in your application

## Migration from Generic Error Handling

If migrating from generic error handling:

```typescript
// Before (generic)
try {
  await apiCall();
} catch (error) {
  console.error('API call failed:', error.message);
}

// After (structured)
try {
  await sdk.users.getUser(userId);
} catch (error) {
  if (error instanceof AuthenticationError) {
    // Handle auth specifically
  } else if (error instanceof ValidationError) {
    // Handle validation specifically
  } else if (error instanceof SDKError) {
    // Handle other SDK errors
    console.error(`SDK Error [${error.code}]:`, error.message);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

This structured approach provides better error handling, improved debugging, and more resilient applications.

## Idempotency Keys

The SDK supports idempotency keys to make POST requests safely retryable. When an `Idempotency-Key` header is present, the SDK:

1. **Treats the request as retryable** - POST requests with idempotency keys are eligible for automatic retry
2. **Server-enforced idempotence** - Server enforces idempotence based on identical requests (method, path, and body) while SDK handles safe retries
3. **Preserves the key** - The same idempotency key is used across all retry attempts
4. **Server-side de-duplication** - TrainingPeaks API ensures requests with the same idempotency key within a 24-hour window return the same response

### Usage Example

```typescript
const response = await sdk.workouts.createWorkout(workoutData, {
  headers: {
    'Idempotency-Key': crypto.randomUUID()
  }
});
```

### Key Management and Lifecycle

- **Key TTL**: Idempotency keys are valid for 24 hours in server-side storage
- **Response caching**: Only successful responses are cached and returned for duplicate keys
- **Error handling**: Only transient errors can be safely retried with the same idempotency key
- **Collision handling**: Use cryptographically strong UUIDs to prevent key collisions

### Best Practices

- Generate unique keys per logical operation (not per retry)
- Use UUIDv4 or similar collision-resistant identifiers with at least 122 bits of entropy (e.g., `crypto.randomUUID()`)
- Keep keys opaque - store business context separately in your datastore or logs rather than encoding it into the key
- Store operation context alongside the key for debugging without embedding PII or business identifiers directly in the key
- Implement secure key persistence at rest for critical operations spanning multiple client sessions
- If human-readable keys are needed, ensure they contain no PII and maintain at least 122 bits of entropy