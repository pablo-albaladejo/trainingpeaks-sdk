/**
 * Domain Schemas Index
 * Centralized exports for all domain schemas and types
 */

// Entity schemas and types
export {
  AuthTokenSchema,
  UserSchema,
  WorkoutSchema,
  type AuthToken,
  type User,
  type Workout,
} from './entities.schema';

// Value object schemas and types
export {
  CredentialsSchema,
  UserPreferencesSchema,
  WorkoutDataSchema,
  WorkoutFileDataSchema,
  WorkoutFileSchema,
  WorkoutMetadataSchema,
  type Credentials,
  type UserPreferences,
  type WorkoutData,
  type WorkoutFile,
  type WorkoutFileData,
  type WorkoutMetadata,
} from './value-objects.schema';

// Repository schemas and types
export {
  CreateWorkoutRequestSchema,
  UpdateWorkoutRequestSchema,
  WorkoutFiltersSchema,
  WorkoutResponseSchema,
  WorkoutStatsSchema,
  WorkoutsListResponseSchema,
  type CreateWorkoutRequest,
  type UpdateWorkoutRequest,
  type WorkoutFilters,
  type WorkoutResponse,
  type WorkoutStats,
  type WorkoutsListResponse,
} from './repository.schema';

// API response schemas and types
export {
  ErrorResponseSchema,
  LoginPageResponseSchema,
  LoginResponseSchema,
  TokenResponseSchema,
  TokenResponseWithZeroExpirationSchema,
  TokenResponseWithoutExpirationSchema,
  UserApiResponseSchema,
  UserInfoResponseSchema,
  UserResponseSchema,
  UserStorageDataSchema,
  type ErrorResponse,
  type LoginPageResponse,
  type LoginResponse,
  type TokenResponse,
  type TokenResponseWithZeroExpiration,
  type TokenResponseWithoutExpiration,
  type UserApiResponse,
  type UserInfoResponse,
  type UserResponse,
  type UserStorageData,
} from './api-responses.schema';

// Workout structure schemas and types
export {
  WorkoutElementTypeSchema,
  WorkoutIntensityClassSchema,
  WorkoutIntensityMetricSchema,
  WorkoutIntensityTargetTypeSchema,
  WorkoutLengthMetricSchema,
  WorkoutLengthSchema,
  WorkoutLengthUnitSchema,
  WorkoutStepSchema,
  WorkoutStructureElementSchema,
  WorkoutStructureSchema,
  WorkoutTargetSchema,
  type WorkoutElementType,
  type WorkoutIntensityClass,
  type WorkoutIntensityMetric,
  type WorkoutIntensityTargetType,
  type WorkoutLength,
  type WorkoutLengthMetric,
  type WorkoutLengthUnit,
  type WorkoutStep,
  type WorkoutStructure,
  type WorkoutStructureElement,
  type WorkoutTarget,
} from './workout-structure.schema';
