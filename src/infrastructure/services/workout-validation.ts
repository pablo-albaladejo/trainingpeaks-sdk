/**
 * Workout Validation Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type {
  ValidateListWorkoutsFilters,
  ValidateStructuredWorkoutBusinessRules,
  ValidateWorkoutCanBeDeleted,
  ValidateWorkoutFile,
  ValidateWorkoutId,
  WorkoutValidationParams,
} from '@/application/services/workout-validation';
import { WorkoutNotFoundError } from '@/domain/errors/workout-errors';
import type { WorkoutFile } from '@/domain/value-objects/workout-file';
import type { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import type { WorkoutData } from '@/types';

export const validateWorkoutId: ValidateWorkoutId = (
  workoutId: string
): void => {
  if (!workoutId || typeof workoutId !== 'string') {
    throw new Error('Workout ID is required and must be a string');
  }
  if (workoutId.trim().length === 0) {
    throw new Error('Workout ID cannot be empty');
  }
};

export const validateWorkoutFile: ValidateWorkoutFile = (
  fileData: WorkoutFile
): void => {
  if (!fileData) {
    throw new Error('Workout file data is required');
  }
  // Add more validation as needed
};

export const validateListWorkoutsFilters: ValidateListWorkoutsFilters = (
  filters: WorkoutValidationParams['filters']
): void => {
  if (!filters) {
    return; // Filters are optional
  }

  if (filters.limit && filters.limit <= 0) {
    throw new Error('Limit must be positive');
  }

  if (filters.offset && filters.offset < 0) {
    throw new Error('Offset must be non-negative');
  }
};

export const validateStructuredWorkoutBusinessRules: ValidateStructuredWorkoutBusinessRules =
  (
    structure: WorkoutStructure,
    metadata?: WorkoutValidationParams['metadata']
  ): void => {
    if (!structure) {
      throw new Error('Workout structure is required');
    }
    // Add more business rule validation as needed
  };

export const validateWorkoutCanBeDeleted: ValidateWorkoutCanBeDeleted = (
  workout: WorkoutData
): void => {
  if (!workout) {
    throw new WorkoutNotFoundError('Workout not found');
  }
  // Add more deletion validation rules as needed
};
