/**
 * Application Layer Exports
 * Central export point for all application-layer contracts and types
 */

// Authentication Services
export {
  type LoginRequest,
  type LoginResponse,
} from './services/auth-application';

export {
  type GetTimeUntilExpiration,
  type GetTimeUntilRefresh,
  type IsTokenExpired,
  type IsTokenValid,
  type ShouldRefreshToken,
  type TokenValidationConfig,
} from './services/auth-validation';

// Logger Services
export {
  type LogContext,
  type LogDebug,
  type LogError,
  type LoggerConfig,
  type LogInfo,
  type LogLevel,
  type LogWarn,
  type LogWithLevel,
} from './services/logger';

// Auth Application Services - Individual Functions
export {
  type LoginRequest as AuthLoginRequest,
  type LoginResponse as AuthLoginResponse,
  type GetCurrentToken,
  type GetCurrentUser,
  type GetUserId,
  type IsAuthenticated,
  type Login,
  type Logout,
} from './services/auth-application';

// Workout Creation Services
export {
  type CreateStructuredWorkout,
  type CreateStructuredWorkoutFromSimpleStructure,
  type CreateStructuredWorkoutRequest,
  type CreateStructuredWorkoutResponse,
  type SimpleWorkoutStructure,
  type UploadWorkout,
  type UploadWorkoutRequest,
  type UploadWorkoutResponse,
} from './services/workout-creation';

// Workout Management Services
export { type DeleteWorkout } from './services/workout-management';

// Workout Manager Services
export {
  type CreateStructuredWorkout as CreateStructuredWorkoutManager,
  type CreateStructuredWorkoutRequest as CreateStructuredWorkoutManagerRequest,
  type CreateStructuredWorkoutResponse as CreateStructuredWorkoutManagerResponse,
  type DeleteWorkout as DeleteWorkoutManager,
  type GetWorkout as GetWorkoutManager,
  type GetWorkoutRepository,
  type GetWorkoutStats,
  type ListWorkouts as ListWorkoutsManager,
  type ListWorkoutsParams as ListWorkoutsManagerParams,
  type ListWorkoutsResponse as ListWorkoutsManagerResponse,
  type SearchWorkouts,
  type SearchWorkoutsParams,
  type SearchWorkoutsResponse,
  type UploadWorkoutFromFile,
  type UploadWorkoutFromFileRequest,
  type UploadWorkoutFromFileResponse,
  type UploadWorkout as UploadWorkoutManager,
  type WorkoutStats,
} from './services/workout-manager';

// Workout Query Services
export {
  type GetWorkout as GetWorkoutQuery,
  type ListWorkoutsParams,
  type ListWorkouts as ListWorkoutsQuery,
  type ListWorkoutsResponse,
} from './services/workout-query';

// Workout Utility Services
export {
  type ActivityType,
  type BuildStructureFromSimpleElements,
  type GenerateWorkoutId,
  type GetMimeTypeFromFileName,
  type MapWorkoutTypeToActivityType,
  type SimpleWorkoutElement,
  type WorkoutType,
} from './services/workout-utility';

// Workout Validation Services
export {
  type ValidateListWorkoutsFilters,
  type ValidateStructuredWorkoutBusinessRules,
  type ValidateWorkoutCanBeDeleted,
  type ValidateWorkoutFile,
  type ValidateWorkoutId,
  type WorkoutValidationParams,
} from './services/workout-validation';

// Use Cases
export { createStructuredWorkoutUseCase } from './use-cases/create-structured-workout';
export { createDeleteWorkoutUseCase } from './use-cases/delete-workout';
export { createGetCurrentUserUseCase } from './use-cases/get-current-user';
export { createGetWorkoutUseCase } from './use-cases/get-workout';
export { createListWorkoutsUseCase } from './use-cases/list-workouts';
export { createLoginUseCase } from './use-cases/login';
export { createLogoutUseCase } from './use-cases/logout';
export { createUploadWorkoutUseCase } from './use-cases/upload-workout';

// Ports
export type { AuthRepository } from './ports/auth';
export type { AuthenticationPort } from './ports/authentication';
export type { StoragePort } from './ports/storage';
export type { WorkoutRepository } from './ports/workout';
