/**
 * Infrastructure Layer Exports
 * External adapters and implementations
 */

// Authentication Adapters
export { ApiAuthAdapter } from './auth/api-adapter';
export { WebBrowserAuthAdapter } from './browser/web-auth-adapter';

// Logging System
export {
  authLogger,
  browserLogger,
  CategoryLogger,
  configureLogger,
  createCategoryLogger,
  generalLogger,
  getLogger,
  LogCategory,
  Logger,
  LogLevel,
  networkLogger,
  workoutLogger,
} from './logging/logger';
export type { ExternalLogger, LogEntry, LoggerConfig } from './logging/logger';

// Workout Adapters
export { FileSystemAdapter } from './filesystem/file-system-adapter';
export { TrainingPeaksWorkoutApiAdapter } from './workout/trainingpeaks-api-adapter';

// Storage Adapters
export { InMemoryStorageAdapter } from './storage/in-memory-adapter';

// Repositories
export { TrainingPeaksAuthRepository } from './repositories/training-peaks-auth';
export { TrainingPeaksWorkoutRepository } from './repositories/training-peaks-workout';
