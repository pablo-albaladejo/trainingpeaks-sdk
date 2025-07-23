/**
 * Adapters Layer
 * Contains all external integrations and implementations
 */

// Client Adapter - Main point of contact with external world
export * from './client/training-peaks-client';

// HTTP Adapters
export {
  authenticateUser as apiAuthenticateUser,
  canHandleAuthConfig as apiCanHandleAuthConfig,
  refreshAuthToken as apiRefreshAuthToken,
} from './http/auth-adapter';
export {
  authenticateUser as webAuthenticateUser,
  canHandleAuthConfig as webCanHandleAuthConfig,
  refreshAuthToken as webRefreshAuthToken,
} from './http/browser-auth-adapter';

// Storage Adapters
export * from './storage/memory-storage-adapter';

// Service Adapters
export * from './services/auth-service';

// Repository Adapters
export * from './repositories/auth-repository';
export * from './repositories/workout-repository';

// Logging Adapters
export * from './logging/logger';
