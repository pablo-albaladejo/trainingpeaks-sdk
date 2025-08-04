/**
 * Domain Schemas Index
 * Centralized exports for all domain schemas and types
 */

// Entity schemas and types
export {
  type AuthToken,
  AuthTokenSchema,
  type User,
  UserSchema,
  type Workout,
  WorkoutSchema,
} from './entities.schema';

// Value object schemas and types
export {
  type Credentials,
  CredentialsSchema,
  type UserPreferences,
  UserPreferencesSchema,
  type WorkoutData,
  WorkoutDataSchema,
  type WorkoutFile,
  type WorkoutFileData,
  WorkoutFileDataSchema,
  WorkoutFileSchema,
  type WorkoutMetadata,
  WorkoutMetadataSchema,
} from './value-objects.schema';

// Repository schemas and types
export {
  type CreateWorkoutRequest,
  CreateWorkoutRequestSchema,
  type UpdateWorkoutRequest,
  UpdateWorkoutRequestSchema,
  type WorkoutFilters,
  WorkoutFiltersSchema,
  type WorkoutResponse,
  WorkoutResponseSchema,
  type WorkoutsListResponse,
  WorkoutsListResponseSchema,
  type WorkoutStats,
  WorkoutStatsSchema,
} from './repository.schema';

// API response schemas and types
export {
  type AuthTokenStorageData,
  AuthTokenStorageDataSchema,
  type ErrorResponse,
  ErrorResponseSchema,
  type LoginPageResponse,
  LoginPageResponseSchema,
  type LoginResponse,
  LoginResponseSchema,
  type TokenResponse,
  TokenResponseSchema,
  type TokenResponseWithoutExpiration,
  TokenResponseWithoutExpirationSchema,
  type TokenResponseWithZeroExpiration,
  TokenResponseWithZeroExpirationSchema,
  type UserApiResponse,
  UserApiResponseSchema,
  type UserInfoResponse,
  UserInfoResponseSchema,
  type UserResponse,
  UserResponseSchema,
  type UserStorageData,
  UserStorageDataSchema,
} from './api-responses.schema';

// API request schemas and types
export {
  type ApiConfig,
  ApiConfigSchema,
  type LoginRequest,
  LoginRequestSchema,
  type RefreshTokenRequest,
  RefreshTokenRequestSchema,
} from './api-requests.schema';

// Workout structure schemas and types
export {
  type WorkoutElementType,
  WorkoutElementTypeSchema,
  type WorkoutIntensityClass,
  WorkoutIntensityClassSchema,
  type WorkoutIntensityMetric,
  WorkoutIntensityMetricSchema,
  type WorkoutIntensityTargetType,
  WorkoutIntensityTargetTypeSchema,
  type WorkoutLength,
  type WorkoutLengthMetric,
  WorkoutLengthMetricSchema,
  WorkoutLengthSchema,
  type WorkoutLengthUnit,
  WorkoutLengthUnitSchema,
  type WorkoutStep,
  WorkoutStepSchema,
  type WorkoutStructure,
  type WorkoutStructureElement,
  WorkoutStructureElementSchema,
  WorkoutStructureSchema,
  type WorkoutTarget,
  WorkoutTargetSchema,
} from './workout-structure.schema';
