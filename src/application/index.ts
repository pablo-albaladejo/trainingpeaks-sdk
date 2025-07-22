/**
 * Application Layer Exports
 * Central export point for all application-layer contracts and types
 */

// Authentication Services
export {
  type GetCurrentToken,
  type GetCurrentUser,
  type GetUserId,
  type IsAuthenticated,
  type Login,
  type Logout,
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
  type LogInfo,
  type LogLevel,
  type LogWarn,
  type LogWithLevel,
  type LoggerConfig,
} from './services/logger';

// Error Handler Services
export {
  type ApiResponse,
  type ClassifyErrorSeverity,
  type CreateError,
  type EnrichErrorContext,
  type ErrorContext,
  type ErrorHandlerConfig,
  type ErrorResponse,
  type ErrorSeverity,
  type GetErrorCodeFromError,
  type GetStatusCodeFromError,
  type HandleError,
  type HandleSuccess,
  type RetryOperation,
  type SuccessResponse,
  type ValidateResult,
  type WrapAsyncOperation,
} from './services/error-handler';

// Workout Creation Services
export {
  type CreateStructuredWorkout,
  type CreateStructuredWorkoutRequest,
  type CreateStructuredWorkoutResponse,
  type UploadWorkout,
  type UploadWorkoutRequest,
  type UploadWorkoutResponse,
} from './services/workout-creation';

// Workout Management Services
export { type DeleteWorkout } from './services/workout-management';

// Workout Query Services
export {
  type GetWorkout,
  type ListWorkouts,
  type ListWorkoutsParams,
  type ListWorkoutsResponse,
} from './services/workout-query';

// Workout Utility Services
export {
  type BuildStructureFromSimpleElements,
  type GenerateWorkoutId,
  type GetMimeTypeFromFileName,
  type MapWorkoutTypeToActivityType,
} from './services/workout-utility';

// Workout Validation Services
export {
  type ValidateListWorkoutsFilters,
  type ValidateWorkoutFile,
  type ValidateWorkoutId,
} from './services/workout-validation';

// Workout Constants
export {
  DEFAULT_WORKOUT_TYPE,
  WORKOUT_DEFAULTS,
  WORKOUT_FILE_CONFIG,
  WORKOUT_LIMITS,
  WORKOUT_TYPE_MAPPING,
} from './services/workout-constants';

// Ports
export { type AuthRepository } from './ports/auth';

export { type AuthenticationPort } from './ports/authentication';

export { type StoragePort } from './ports/storage';

export { type WorkoutRepository } from './ports/workout';
