/**
 * Infrastructure Layer Exports
 * External adapters and implementations
 */

// Services - Export infrastructure service implementations
export { createAuthApplicationService } from './services/auth-application';
export { createAuthValidationService } from './services/auth-validation';
export { createLoggerService } from './services/logger';
export { createWorkoutCreationService } from './services/workout-creation';
export { createWorkoutManagementService } from './services/workout-management';
export { createWorkoutManagerService } from './services/workout-manager';
export { createWorkoutQueryService } from './services/workout-query';
export { createWorkoutService } from './services/workout-service';
export { createWorkoutUtilityService } from './services/workout-utility';
export { createWorkoutValidationService } from './services/workout-validation';

// Storage adapters
export { InMemoryStorageAdapter } from './storage/in-memory-adapter';

// Filesystem adapters
export { FileSystemAdapter } from './filesystem/file-system-adapter';

// Repositories
export { createTrainingPeaksAuthRepository } from './repositories/training-peaks-auth';
export { createTrainingPeaksWorkoutRepository } from './repositories/training-peaks-workout';

// Workout adapters
export { TrainingPeaksWorkoutApiAdapter } from './workout/trainingpeaks-api-adapter';

// Auth adapters
export { ApiAuthAdapter } from './auth/api-adapter';

// Browser adapters
export { WebBrowserAuthAdapter } from './browser/web-auth-adapter';

// Logging utilities
export {
  BatchLogger,
  createStructuredLogger,
  LogContextBuilder,
  LogFormatter,
  PerformanceTracker,
  withTiming,
} from './services/logging-utilities';

// Error handling
export { createErrorHandlerService } from './services/error-handler';
