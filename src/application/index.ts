/**
 * Application Layer Exports
 * Use cases and ports
 */

// Authentication Use Cases
export { GetCurrentUserUseCase } from './use-cases/get-current-user';
export { LoginUseCase } from './use-cases/login';
export { LogoutUseCase } from './use-cases/logout';

// Workout Use Cases
export {
  DeleteWorkoutUseCase,
  type DeleteWorkoutRequest,
} from './use-cases/delete-workout';
export {
  GetWorkoutUseCase,
  type GetWorkoutRequest,
} from './use-cases/get-workout';
export {
  ListWorkoutsUseCase,
  type ListWorkoutsRequest,
} from './use-cases/list-workouts';
export { UploadWorkoutUseCase } from './use-cases/upload-workout';

// Ports
export type {
  AuthenticationConfig,
  AuthenticationPort,
} from './ports/authentication';
export type { StoragePort } from './ports/storage';
export type {
  FileSystemPort,
  WorkoutServiceConfig,
  WorkoutServicePort,
} from './ports/workout';

// Repository Interfaces
export type { AuthRepository } from './ports/auth';
export type { UploadResult, WorkoutRepository } from './ports/workout';

// Services - Export only TYPES/CONTRACTS from application layer
export type {
  AuthApplicationServiceFactory,
  getCurrentToken,
  getCurrentUser,
  getUserId,
  isAuthenticated,
  login,
  logout,
} from './services/auth-application';
export type {
  AuthValidationServiceFactory,
  getTimeUntilExpiration,
  getTimeUntilRefresh,
  isTokenExpired,
  isTokenValid,
  shouldRefreshToken,
} from './services/auth-validation';
export type {
  LogContext,
  logDebug,
  logError,
  LoggerServiceFactory,
  logInfo,
  LogLevel,
  logWarn,
  logWithLevel,
} from './services/logger';
// Note: WorkoutDomainService has been deprecated and removed.
// Use individual workout function types instead for all new code.

// New modular workout services
export type {
  createStructuredWorkout,
  createStructuredWorkoutFromSimpleStructure,
  SimpleWorkoutElementForCreation,
  uploadWorkout,
  WorkoutCreationMetadata,
  WorkoutCreationServiceFactory,
  WorkoutUploadMetadata,
  WorkoutUploadResponse,
} from './services/workout-creation';
export type {
  deleteWorkout,
  WorkoutManagementServiceFactory,
} from './services/workout-management';
export type {
  createStructuredWorkout as createStructuredWorkoutManager,
  deleteWorkout as deleteWorkoutManager,
  getWorkout,
  getWorkoutRepository,
  getWorkoutStats,
  listWorkouts,
  searchWorkouts,
  uploadWorkoutFromFile,
  uploadWorkout as uploadWorkoutManager,
  WorkoutManagerConfig,
  WorkoutManagerServiceFactory,
  WorkoutSearchCriteria,
  WorkoutStatsFilters,
  WorkoutStatsResponse,
} from './services/workout-manager';
export type {
  getWorkout as getWorkoutQuery,
  listWorkouts as listWorkoutsQuery,
  WorkoutListFilters,
  WorkoutQueryServiceFactory,
} from './services/workout-query';
export type {
  buildStructureFromSimpleElements,
  generateWorkoutId,
  getMimeTypeFromFileName,
  mapWorkoutTypeToActivityType,
  SimpleWorkoutElement,
  WorkoutUtilityServiceFactory,
} from './services/workout-utility';
export type {
  validateListWorkoutsFilters,
  validateStructuredWorkoutBusinessRules,
  validateWorkoutCanBeDeleted,
  validateWorkoutFile,
  validateWorkoutId,
  WorkoutValidationParams,
  WorkoutValidationServiceFactory,
} from './services/workout-validation';
