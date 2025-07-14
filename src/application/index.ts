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
export {
  UploadWorkoutUseCase,
  type UploadWorkoutFromFileRequest,
  type UploadWorkoutRequest,
} from './use-cases/upload-workout';

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
  AuthApplicationService,
  AuthApplicationServiceFactory,
} from './services/auth-application';
export type {
  AuthValidationService,
  AuthValidationServiceFactory,
} from './services/auth-validation';
export type {
  LogContext,
  LoggerService,
  LoggerServiceFactory,
  LogLevel,
} from './services/logger';
// Note: WorkoutDomainService has been deprecated and removed.
// Use WorkoutService instead for all new code.

// New modular workout services
export type {
  SimpleWorkoutElementForCreation,
  WorkoutCreationMetadata,
  WorkoutCreationService,
  WorkoutCreationServiceFactory,
  WorkoutUploadMetadata,
  WorkoutUploadResponse,
} from './services/workout-creation';
export type {
  WorkoutManagementService,
  WorkoutManagementServiceFactory,
} from './services/workout-management';
export type {
  WorkoutListFilters,
  WorkoutQueryService,
  WorkoutQueryServiceFactory,
} from './services/workout-query';
export type {
  WorkoutService,
  WorkoutServiceFactory,
} from './services/workout-service';
export type {
  SimpleWorkoutElement,
  WorkoutUtilityService,
  WorkoutUtilityServiceFactory,
} from './services/workout-utility';
export type {
  WorkoutValidationParams,
  WorkoutValidationService,
  WorkoutValidationServiceFactory,
} from './services/workout-validation';
