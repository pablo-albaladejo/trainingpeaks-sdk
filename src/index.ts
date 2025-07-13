/**
 * TrainingPeaks SDK - Main Entry Point
 *
 * A comprehensive SDK for interacting with TrainingPeaks services,
 * built using hexagonal architecture principles.
 */

// Main Client (Facade)
export type { TrainingPeaksClientConfig } from '@/types';
export { TrainingPeaksClient } from './training-peaks-client';

// Configuration
export { DEFAULT_CONFIG, getSDKConfig } from '@/config';
export type { TrainingPeaksSDKConfig } from '@/config';

// Domain Entities (Public API)
export { AuthToken, Credentials, User, Workout, WorkoutFile } from '@/domain';

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
export type { AuthRepository, UploadResult, WorkoutRepository } from '@/domain';

// Services and Adapters (for advanced usage)
export {
  TrainingPeaksAuthRepository,
  TrainingPeaksWorkoutRepository,
} from '@/adapters';

// Workout Management
export { WorkoutManager } from '@/workout';
export type { WorkoutData, WorkoutUploadResponse } from '@/workout';

// Infrastructure Adapters (for custom implementations)
export {
  ApiAuthAdapter,
  FileSystemAdapter,
  InMemoryStorageAdapter,
  TrainingPeaksWorkoutApiAdapter,
  WebBrowserAuthAdapter,
} from '@/infrastructure';

// Error Types (if any are exported from types)
// export { ... } from './types';

// Re-export default as named export for consistency
export { TrainingPeaksClient as default } from './training-peaks-client';
