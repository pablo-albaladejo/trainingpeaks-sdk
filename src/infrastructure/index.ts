/**
 * Infrastructure Layer Exports
 * Barrel file for infrastructure adapters
 */

// Authentication Adapters
export { ApiAuthAdapter } from './auth/ApiAuthAdapter.js';
export { WebBrowserAuthAdapter } from './browser/WebBrowserAuthAdapter.js';

// Storage Adapters
export { InMemoryStorageAdapter } from './storage/InMemoryStorageAdapter.js';
