/**
 * Domain Layer Exports
 * Pure business logic and types
 */

// Entities
export * from './entities/auth-token';
export * from './entities/training-peaks-athlete';
export * from './entities/user';
export * from './entities/workout';
export * from './entities/workout-aggregate';

// Value Objects
export * from './value-objects/credentials';
export * from './value-objects/training-peaks-settings';
export * from './value-objects/workout-file';

// Errors
export * from './errors/domain-errors';

// Schemas (only pure domain types)
export type {
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
