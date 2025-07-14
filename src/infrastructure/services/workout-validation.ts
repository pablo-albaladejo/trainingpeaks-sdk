/**
 * Workout Validation Service Implementation
 * Implements the WorkoutValidationService contract with business logic for workout validation
 */

import {
  WORKOUT_FILE_CONFIG,
  WORKOUT_LIMITS,
} from '@/application/services/workout-constants';
import type { WorkoutValidationServiceFactory } from '@/application/services/workout-validation';
import { Workout } from '@/domain/entities/workout';
import {
  InvalidAthleteError,
  InvalidWorkoutDateError,
  InvalidWorkoutFileError,
  InvalidWorkoutFiltersError,
  InvalidWorkoutIdError,
  InvalidWorkoutStructureError,
  InvalidWorkoutTitleError,
  InvalidWorkoutTypeError,
} from '@/domain/errors/workout-errors';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';

/**
 * IMPLEMENTATION of WorkoutValidationService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutValidationService: WorkoutValidationServiceFactory =
  () => {
    return {
      validateStructuredWorkoutBusinessRules: (
        athleteId: number,
        title: string,
        workoutTypeValueId: number,
        workoutDay: string,
        structure: WorkoutStructure
      ): void => {
        // Additional null safety checks
        if (athleteId === null || athleteId === undefined) {
          throw new InvalidAthleteError(
            'Athlete ID cannot be null or undefined'
          );
        }

        if (title === null || title === undefined) {
          throw new InvalidWorkoutTitleError(
            'Workout title cannot be null or undefined'
          );
        }

        if (workoutTypeValueId === null || workoutTypeValueId === undefined) {
          throw new InvalidWorkoutTypeError(
            'Workout type ID cannot be null or undefined'
          );
        }

        if (workoutDay === null || workoutDay === undefined) {
          throw new InvalidWorkoutDateError(
            'Workout day cannot be null or undefined'
          );
        }

        if (structure === null || structure === undefined) {
          throw new InvalidWorkoutStructureError(
            'Workout structure cannot be null or undefined'
          );
        }

        // Existing validations
        if (!athleteId || athleteId <= 0) {
          throw new InvalidAthleteError();
        }

        if (!title || title.trim().length === 0) {
          throw new InvalidWorkoutTitleError('Workout title is required');
        }

        if (title.length > WORKOUT_LIMITS.TITLE_MAX_LENGTH) {
          throw new InvalidWorkoutTitleError(
            `Workout title cannot exceed ${WORKOUT_LIMITS.TITLE_MAX_LENGTH} characters`
          );
        }

        if (!workoutTypeValueId || workoutTypeValueId <= 0) {
          throw new InvalidWorkoutTypeError();
        }

        if (!workoutDay) {
          throw new InvalidWorkoutDateError();
        }

        if (!structure) {
          throw new InvalidWorkoutStructureError(
            'Workout structure is required'
          );
        }

        // Additional structure validation with null safety
        if (!structure.structure || !Array.isArray(structure.structure)) {
          throw new InvalidWorkoutStructureError(
            'Workout structure must contain a valid structure array'
          );
        }

        // Validate structure has at least one element
        if (structure.structure.length === 0) {
          throw new InvalidWorkoutStructureError(
            'Workout structure must have at least one element'
          );
        }

        // Validate each structure element
        structure.structure.forEach((element, index) => {
          if (!element) {
            throw new InvalidWorkoutStructureError(
              `Structure element at index ${index} cannot be null or undefined`
            );
          }

          if (!element.steps || !Array.isArray(element.steps)) {
            throw new InvalidWorkoutStructureError(
              `Structure element at index ${index} must contain a valid steps array`
            );
          }

          if (element.steps.length === 0) {
            throw new InvalidWorkoutStructureError(
              `Structure element at index ${index} must have at least one step`
            );
          }

          // Validate each step in the element
          element.steps.forEach((step, stepIndex) => {
            if (!step) {
              throw new InvalidWorkoutStructureError(
                `Step at index ${stepIndex} in element ${index} cannot be null or undefined`
              );
            }

            if (!step.name || typeof step.name !== 'string') {
              throw new InvalidWorkoutStructureError(
                `Step at index ${stepIndex} in element ${index} must have a valid name`
              );
            }

            if (!step.length || typeof step.length !== 'object') {
              throw new InvalidWorkoutStructureError(
                `Step at index ${stepIndex} in element ${index} must have a valid length`
              );
            }
          });
        });

        // Validate total duration is reasonable
        const totalDuration = structure.getTotalDuration();
        if (totalDuration <= 0) {
          throw new InvalidWorkoutStructureError(
            'Workout structure must have positive duration'
          );
        }

        if (totalDuration > WORKOUT_LIMITS.MAX_DURATION_SECONDS) {
          throw new InvalidWorkoutStructureError(
            `Workout structure cannot exceed ${WORKOUT_LIMITS.MAX_DURATION_SECONDS / 3600} hours`
          );
        }
      },

      validateWorkoutFile: (fileContent: string, fileName: string): void => {
        // Additional null safety checks
        if (fileContent === null || fileContent === undefined) {
          throw new InvalidWorkoutFileError(
            'File content cannot be null or undefined'
          );
        }

        if (fileName === null || fileName === undefined) {
          throw new InvalidWorkoutFileError(
            'File name cannot be null or undefined'
          );
        }

        if (typeof fileContent !== 'string') {
          throw new InvalidWorkoutFileError('File content must be a string');
        }

        if (typeof fileName !== 'string') {
          throw new InvalidWorkoutFileError('File name must be a string');
        }

        // Existing validations
        if (!fileContent || fileContent.trim().length === 0) {
          throw new InvalidWorkoutFileError('File content is required');
        }

        if (!fileName || fileName.trim().length === 0) {
          throw new InvalidWorkoutFileError('File name is required');
        }

        // Check file size (business rule)
        if (fileContent.length > WORKOUT_LIMITS.MAX_FILE_SIZE_BYTES) {
          const maxSizeMB = WORKOUT_LIMITS.MAX_FILE_SIZE_BYTES / (1024 * 1024);
          throw new InvalidWorkoutFileError(
            `File size cannot exceed ${maxSizeMB}MB`
          );
        }

        // Validate file extension
        const extension = fileName.toLowerCase().split('.').pop();
        if (
          !extension ||
          !WORKOUT_FILE_CONFIG.ALLOWED_EXTENSIONS.includes(
            extension as (typeof WORKOUT_FILE_CONFIG.ALLOWED_EXTENSIONS)[number]
          )
        ) {
          throw new InvalidWorkoutFileError(
            `Invalid file extension. Allowed: ${WORKOUT_FILE_CONFIG.ALLOWED_EXTENSIONS.join(', ')}`
          );
        }
      },

      validateWorkoutId: (workoutId: string): void => {
        // Additional null safety checks
        if (workoutId === null || workoutId === undefined) {
          throw new InvalidWorkoutIdError(
            'Workout ID cannot be null or undefined'
          );
        }

        if (typeof workoutId !== 'string') {
          throw new InvalidWorkoutIdError('Workout ID must be a string');
        }

        // Existing validations
        if (!workoutId || workoutId.trim().length === 0) {
          throw new InvalidWorkoutIdError('Workout ID is required');
        }

        // Additional business rules for workout ID format
        if (workoutId.length > WORKOUT_LIMITS.ID_MAX_LENGTH) {
          throw new InvalidWorkoutIdError(
            `Workout ID cannot exceed ${WORKOUT_LIMITS.ID_MAX_LENGTH} characters`
          );
        }
      },

      validateListWorkoutsFilters: (filters: {
        startDate?: Date;
        endDate?: Date;
        activityType?: string;
        tags?: string[];
        limit?: number;
        offset?: number;
      }): void => {
        // Additional null safety checks
        if (filters === null || filters === undefined) {
          throw new InvalidWorkoutFiltersError(
            'Filters cannot be null or undefined'
          );
        }

        if (typeof filters !== 'object') {
          throw new InvalidWorkoutFiltersError('Filters must be an object');
        }

        // Validate dates if provided
        if (filters.startDate !== undefined && filters.startDate !== null) {
          if (
            !(filters.startDate instanceof Date) ||
            isNaN(filters.startDate.getTime())
          ) {
            throw new InvalidWorkoutFiltersError(
              'Start date must be a valid Date object'
            );
          }
        }

        if (filters.endDate !== undefined && filters.endDate !== null) {
          if (
            !(filters.endDate instanceof Date) ||
            isNaN(filters.endDate.getTime())
          ) {
            throw new InvalidWorkoutFiltersError(
              'End date must be a valid Date object'
            );
          }
        }

        // Validate activity type if provided
        if (
          filters.activityType !== undefined &&
          filters.activityType !== null
        ) {
          if (typeof filters.activityType !== 'string') {
            throw new InvalidWorkoutFiltersError(
              'Activity type must be a string'
            );
          }
        }

        // Validate tags if provided
        if (filters.tags !== undefined && filters.tags !== null) {
          if (!Array.isArray(filters.tags)) {
            throw new InvalidWorkoutFiltersError('Tags must be an array');
          }

          filters.tags.forEach((tag, index) => {
            if (tag === null || tag === undefined) {
              throw new InvalidWorkoutFiltersError(
                `Tag at index ${index} cannot be null or undefined`
              );
            }

            if (typeof tag !== 'string') {
              throw new InvalidWorkoutFiltersError(
                `Tag at index ${index} must be a string`
              );
            }

            if (tag.trim().length === 0) {
              throw new InvalidWorkoutFiltersError(
                `Tag at index ${index} cannot be empty`
              );
            }
          });
        }

        // Validate limit if provided
        if (filters.limit !== undefined && filters.limit !== null) {
          if (
            typeof filters.limit !== 'number' ||
            !Number.isInteger(filters.limit)
          ) {
            throw new InvalidWorkoutFiltersError('Limit must be an integer');
          }
        }

        // Validate offset if provided
        if (filters.offset !== undefined && filters.offset !== null) {
          if (
            typeof filters.offset !== 'number' ||
            !Number.isInteger(filters.offset)
          ) {
            throw new InvalidWorkoutFiltersError('Offset must be an integer');
          }
        }

        // Existing validations
        // Validate date range
        if (
          filters.startDate &&
          filters.endDate &&
          filters.startDate > filters.endDate
        ) {
          throw new InvalidWorkoutFiltersError(
            'Start date must be before end date'
          );
        }

        // Validate pagination
        if (
          filters.limit &&
          filters.limit > WORKOUT_LIMITS.MAX_WORKOUTS_PER_REQUEST
        ) {
          throw new InvalidWorkoutFiltersError(
            `Limit cannot exceed ${WORKOUT_LIMITS.MAX_WORKOUTS_PER_REQUEST} workouts`
          );
        }

        if (filters.offset && filters.offset < 0) {
          throw new InvalidWorkoutFiltersError('Offset cannot be negative');
        }

        // Validate activity type
        if (
          filters.activityType &&
          filters.activityType.length > WORKOUT_LIMITS.ACTIVITY_TYPE_MAX_LENGTH
        ) {
          throw new InvalidWorkoutFiltersError(
            `Activity type cannot exceed ${WORKOUT_LIMITS.ACTIVITY_TYPE_MAX_LENGTH} characters`
          );
        }

        // Validate tags
        if (
          filters.tags &&
          filters.tags.length > WORKOUT_LIMITS.TAGS_MAX_COUNT
        ) {
          throw new InvalidWorkoutFiltersError(
            `Cannot filter by more than ${WORKOUT_LIMITS.TAGS_MAX_COUNT} tags`
          );
        }
      },

      validateWorkoutCanBeDeleted: (workout: Workout): void => {
        // Additional null safety checks
        if (workout === null || workout === undefined) {
          throw new InvalidWorkoutFiltersError(
            'Workout cannot be null or undefined'
          );
        }

        if (typeof workout !== 'object') {
          throw new InvalidWorkoutFiltersError('Workout must be an object');
        }

        // Validate workout has required properties
        if (!workout.id || typeof workout.id !== 'string') {
          throw new InvalidWorkoutFiltersError('Workout must have a valid ID');
        }

        // Business rules for deletion
        // For example, don't allow deletion of workouts that are part of a plan
        // or have been completed more than X days ago, etc.
        // For now, we'll allow all deletions
        // In a real implementation, this would contain actual business rules
      },
    };
  };
