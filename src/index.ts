/**
 * TrainingPeaks SDK - Main Entry Point
 *
 * A comprehensive SDK for interacting with TrainingPeaks services,
 * built using hexagonal architecture principles.
 */

// Main Client (Facade)
export type { TrainingPeaksClientConfig } from '@/types';
export { createTrainingPeaksClient } from './training-peaks-client';
export type { TrainingPeaksClient } from './training-peaks-client';

// Configuration
export { DEFAULT_CONFIG, getSDKConfig } from '@/config';
export type { TrainingPeaksSDKConfig } from '@/config';

// Domain Entities (Public API)
export { AuthToken, Credentials, User, Workout, WorkoutFile } from '@/domain';

// Domain Errors (Public API)
export {
  AuthenticationError,
  AuthorizationError,
  NetworkError,
  RateLimitError,
  TrainingPeaksError,
  UploadError,
  ValidationError,
} from '@/domain';

// Value Objects and Types
export type { ApiResponse, LoginCredentials, UserProfile } from '@/types';

// Use Cases (for advanced usage)
export {
  DeleteWorkoutUseCase,
  GetCurrentUserUseCase,
  GetWorkoutUseCase,
  ListWorkoutsUseCase,
  LoginUseCase,
  LogoutUseCase,
  UploadWorkoutUseCase,
} from '@/application';

// Repository Interfaces (for advanced usage)
export type {
  AuthRepository,
  UploadResult,
  WorkoutRepository,
} from '@/application';

// Services and Adapters (for advanced usage)
export {
  createTrainingPeaksAuthRepository,
  createTrainingPeaksWorkoutRepository,
} from '@/infrastructure';

// Workout Management
export { createWorkoutManager, WorkoutManager } from './workout-manager';
export type {
  StructuredWorkoutData,
  WorkoutData,
  WorkoutUploadResponse,
} from './workout-manager';

// Infrastructure Adapters (for custom implementations)
export {
  ApiAuthAdapter,
  FileSystemAdapter,
  InMemoryStorageAdapter,
  TrainingPeaksWorkoutApiAdapter,
  WebBrowserAuthAdapter,
} from '@/infrastructure';

// Logging System (new structured approach)
export {
  BatchLogger,
  createErrorHandlerService,
  createLoggerService,
  createStructuredLogger,
  LogContextBuilder,
  LogFormatter,
  PerformanceTracker,
  withTiming,
} from '@/infrastructure';
// Logger types are now internal - use createLoggerService for logger configuration

// Error Types (if any are exported from types)
// export { ... } from './types';

// For backward compatibility, export the factory function as the main export
export { createTrainingPeaksClient as default } from './training-peaks-client';
