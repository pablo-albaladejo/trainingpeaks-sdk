/**
 * Infrastructure Layer Exports
 * Barrel file for infrastructure adapters
 */

// Authentication Adapters
export { ApiAuthAdapter } from './auth/api-adapter';
export { WebBrowserAuthAdapter } from './browser/web-auth-adapter';

// Storage Adapters
export { InMemoryStorageAdapter } from './storage/in-memory-adapter';
