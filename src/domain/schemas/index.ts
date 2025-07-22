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
  WorkoutFileSchema,
  type Credentials,
  type WorkoutFile,
} from './value-objects.schema';

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
