/**
 * Domain Layer Exports
 * Pure business logic and types
 */

// Entities
export * from './entities/auth-token';
export * from './entities/user';
export * from './entities/workout';
export * from './entities/workout-aggregate';

// Value Objects
export * from './value-objects/credentials';
export * from './value-objects/workout-file';

// Contexts
export * from './contexts/auth-context';

// Errors
export * from './errors/domain-errors';

// Schemas (only unique types, not re-exporting entities/value objects)
export {
  type ApiConfig,
  type LoginRequest,
  type RefreshTokenRequest,
  WorkoutElementType,
  WorkoutIntensityClass,
  WorkoutIntensityMetric,
  WorkoutIntensityTargetType,
  WorkoutLength,
  WorkoutLengthMetric,
  WorkoutLengthUnit,
  WorkoutStep,
  WorkoutStructure,
  WorkoutStructureElement,
  WorkoutTarget,
} from './schemas';

// Builders
export * from './builders';

// Templates
export * from './templates';

// Repositories
export * from './repositories';
