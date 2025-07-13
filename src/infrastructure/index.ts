/**
 * Infrastructure Layer Exports
 * External adapters and implementations
 */

// Authentication Adapters
export { ApiAuthAdapter } from './auth/api-adapter';
export { WebBrowserAuthAdapter } from './browser/web-auth-adapter';

// Workout Adapters
export { FileSystemAdapter } from './filesystem/file-system-adapter';
export { TrainingPeaksWorkoutApiAdapter } from './workout/trainingpeaks-api-adapter';

// Storage Adapters
export { InMemoryStorageAdapter } from './storage/in-memory-adapter';
