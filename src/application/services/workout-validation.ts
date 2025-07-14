/**
 * Workout Validation Service Contract
 * Defines the interface for workout validation operations
 */

import type { WorkoutFile } from '@/domain/value-objects/workout-file';
import type { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import type { WorkoutData } from '@/types';

/**
 * Parameters for validating list workouts filters
 */
export type WorkoutValidationParams = {
  workoutId?: string;
  fileData?: WorkoutFile;
  structure?: WorkoutStructure;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  metadata?: {
    name?: string;
    description?: string;
    plannedDate?: Date;
    estimatedDuration?: number;
    estimatedDistance?: number;
    difficulty?: string;
    activityType?: string;
    tags?: string[];
  };
};

/**
 * Contract for workout validation operations
 * Defines what validation capabilities the system needs
 */

/**
 * Validate workout ID meets business rules
 * @param workoutId - The workout ID to validate
 * @throws InvalidWorkoutIdError if validation fails
 */
export type ValidateWorkoutId = (workoutId: string) => void;

/**
 * Validate workout file format and content
 * @param fileData - The workout file to validate
 * @throws InvalidWorkoutFileError if validation fails
 */
export type ValidateWorkoutFile = (fileData: WorkoutFile) => void;

/**
 * Validate filters for listing workouts
 * @param filters - The filters to validate
 * @throws InvalidWorkoutFiltersError if validation fails
 */
export type ValidateListWorkoutsFilters = (
  filters: WorkoutValidationParams['filters']
) => void;

/**
 * Validate business rules for structured workout creation
 * @param structure - The workout structure to validate
 * @param metadata - Optional metadata to validate
 * @throws Various domain errors if validation fails
 */
export type ValidateStructuredWorkoutBusinessRules = (
  structure: WorkoutStructure,
  metadata?: WorkoutValidationParams['metadata']
) => void;

/**
 * Validate that a workout can be safely deleted
 * @param workout - The workout to validate for deletion
 * @throws InvalidWorkoutDeletionError if deletion is not allowed
 */
export type ValidateWorkoutCanBeDeleted = (workout: WorkoutData) => void;
