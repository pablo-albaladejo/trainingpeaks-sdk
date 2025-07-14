/**
 * Workout Validation Service Contract
 * Defines the interface for workout validation rules
 */

import { Workout } from '@/domain/entities/workout';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';

/**
 * Workout validation parameters for different validation scenarios
 */
export type WorkoutValidationParams = {
  workoutId?: string;
  fileContent?: string;
  fileName?: string;
  athleteId?: number;
  title?: string;
  workoutTypeValueId?: number;
  workoutDay?: string;
  structure?: WorkoutStructure;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  };
  metadata?: {
    code?: string;
    description?: string;
    userTags?: string;
    coachComments?: string;
    publicSettingValue?: number;
  };
};

/**
 * Contract for workout validation operations
 * Defines what validation capabilities the system needs
 */

/**
 * Validates all business rules for structured workout creation
 * @param athleteId - The athlete ID associated with the workout
 * @param title - The workout title
 * @param workoutTypeValueId - The workout type ID
 * @param workoutDay - The workout day
 * @param structure - The workout structure
 * @throws Various domain errors if validation fails
 */
export type validateStructuredWorkoutBusinessRules = (
  athleteId: number,
  title: string,
  workoutTypeValueId: number,
  workoutDay: string,
  structure: WorkoutStructure
) => void;

/**
 * Validates workout file content and format
 * @param fileContent - The file content to validate
 * @param fileName - The file name to validate
 * @throws InvalidWorkoutFileError if validation fails
 */
export type validateWorkoutFile = (
  fileContent: string,
  fileName: string
) => void;

/**
 * Validates that a workout ID meets business rules
 * @param workoutId - The workout ID to validate
 * @throws InvalidWorkoutIdError if validation fails
 */
export type validateWorkoutId = (workoutId: string) => void;

/**
 * Validates filters for listing workouts
 * @param filters - The filters to validate
 * @throws InvalidWorkoutFiltersError if validation fails
 */
export type validateListWorkoutsFilters = (filters: {
  startDate?: Date;
  endDate?: Date;
  activityType?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}) => void;

/**
 * Validates that a workout can be safely deleted
 * @param workout - The workout to validate for deletion
 * @throws InvalidWorkoutFiltersError if deletion is not allowed
 */
export type validateWorkoutCanBeDeleted = (workout: Workout) => void;

/**
 * Factory function signature for creating workout validation service
 * This defines the contract for how the service should be instantiated
 */
export type WorkoutValidationServiceFactory = () => {
  validateStructuredWorkoutBusinessRules: validateStructuredWorkoutBusinessRules;
  validateWorkoutFile: validateWorkoutFile;
  validateWorkoutId: validateWorkoutId;
  validateListWorkoutsFilters: validateListWorkoutsFilters;
  validateWorkoutCanBeDeleted: validateWorkoutCanBeDeleted;
};
