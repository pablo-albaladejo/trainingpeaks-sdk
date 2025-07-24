/**
 * Domain Layer Exports
 * Pure business logic and types
 */

// Entities
export * from './entities/user';
export * from './entities/workout';

// Value Objects
export * from './value-objects/auth-token';
export * from './value-objects/credentials';
export * from './value-objects/workout-file';

// Errors
export * from './errors/domain-errors';

// Schemas (only unique types, not re-exporting entities/value objects)
export {
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
