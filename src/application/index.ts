/**
 * Application Layer Exports
 * Central export point for all application-layer contracts and types
 */

// ============================================================================
// AUTHENTICATION SERVICES
// ============================================================================

// Authentication Service Contracts
export {
  type GetCurrentUserService,
  type IsAuthenticatedService,
  type LoginService,
  type LogoutService,
  type RefreshTokenService,
  type ValidateCredentialsService,
  type ValidateTokenService,
} from './services/auth-service';

// Authentication Adapter Ports
export {
  type AuthenticateUser,
  type AuthenticationConfig,
  type CanHandleAuthConfig,
  type RefreshAuthToken,
} from './services/auth-service';

// ============================================================================
// STORAGE SERVICES
// ============================================================================

// Storage Adapter Ports
export {
  type ClearStorage,
  type GetToken,
  type GetUser,
  type GetUserId,
  type HasValidAuth,
  type StoreToken,
  type StoreUser,
} from './services/storage-service';

// ============================================================================
// WORKOUT SERVICES
// ============================================================================

// Workout Service Contracts
export {
  type CreateStructuredWorkoutService,
  type ValidateWorkoutStructureService,
} from './services/workout-service';

// Workout Adapter Ports
export {
  type CanHandleWorkoutServiceConfig,
  type CreateStructuredWorkoutInService,
  type DeleteWorkoutFromService,
  type GetWorkoutFromService,
  type GetWorkoutStatsFromService,
  type ListWorkoutsFromService,
  type SearchWorkoutsInService,
  type UpdateWorkoutInService,
  type UploadResult,
  type UploadWorkoutFileToService,
  type UploadWorkoutToService,
  type WorkoutServiceConfig,
} from './services/workout-service';

// ============================================================================
// USE CASES
// ============================================================================

// Authentication Use Cases
export {
  executeLoginUseCase,
  type ExecuteLoginUseCase,
  type LoginRequest,
  type LoginResponse,
} from './use-cases/login';

// User Use Cases
export {
  executeGetUserUseCase,
  type ExecuteGetUserUseCase,
  type GetUserResponse,
} from './use-cases/get-user';
