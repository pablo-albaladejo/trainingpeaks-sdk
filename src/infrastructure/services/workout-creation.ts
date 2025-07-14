/**
 * Workout Creation Service Implementation
 * Implements the WorkoutCreationService contract with business logic for workout creation
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type {
  SimpleWorkoutElementForCreation,
  WorkoutCreationMetadata,
  WorkoutCreationService,
  WorkoutUploadMetadata,
  WorkoutUploadResponse,
} from '@/application/services/workout-creation';
import type { WorkoutUtilityService } from '@/application/services/workout-utility';
import type { WorkoutValidationService } from '@/application/services/workout-validation';
import { Workout } from '@/domain/entities/workout';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
} from '@/types';

/**
 * IMPLEMENTATION of WorkoutCreationService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutCreationService = (
  workoutRepository: WorkoutRepository,
  validationService: WorkoutValidationService,
  utilityService: WorkoutUtilityService
): WorkoutCreationService => ({
  createStructuredWorkout: async (
    athleteId: number,
    title: string,
    workoutTypeValueId: number,
    workoutDay: string,
    structure: WorkoutStructure,
    metadata?: WorkoutCreationMetadata
  ): Promise<CreateStructuredWorkoutResponse> => {
    // Additional null safety checks for metadata
    if (metadata !== undefined && metadata !== null) {
      if (typeof metadata !== 'object') {
        return {
          success: false,
          message: 'Metadata must be an object',
          errors: ['Metadata must be an object'],
        };
      }

      // Validate optional string fields
      if (metadata.code !== undefined && metadata.code !== null) {
        if (typeof metadata.code !== 'string') {
          return {
            success: false,
            message: 'Metadata code must be a string',
            errors: ['Metadata code must be a string'],
          };
        }
      }

      if (metadata.description !== undefined && metadata.description !== null) {
        if (typeof metadata.description !== 'string') {
          return {
            success: false,
            message: 'Metadata description must be a string',
            errors: ['Metadata description must be a string'],
          };
        }
      }

      if (metadata.userTags !== undefined && metadata.userTags !== null) {
        if (typeof metadata.userTags !== 'string') {
          return {
            success: false,
            message: 'Metadata userTags must be a string',
            errors: ['Metadata userTags must be a string'],
          };
        }
      }

      if (
        metadata.coachComments !== undefined &&
        metadata.coachComments !== null
      ) {
        if (typeof metadata.coachComments !== 'string') {
          return {
            success: false,
            message: 'Metadata coachComments must be a string',
            errors: ['Metadata coachComments must be a string'],
          };
        }
      }

      // Validate optional number fields
      if (
        metadata.publicSettingValue !== undefined &&
        metadata.publicSettingValue !== null
      ) {
        if (
          typeof metadata.publicSettingValue !== 'number' ||
          !Number.isInteger(metadata.publicSettingValue)
        ) {
          return {
            success: false,
            message: 'Metadata publicSettingValue must be an integer',
            errors: ['Metadata publicSettingValue must be an integer'],
          };
        }
      }

      // Validate planned metrics if provided
      if (
        metadata.plannedMetrics !== undefined &&
        metadata.plannedMetrics !== null
      ) {
        if (typeof metadata.plannedMetrics !== 'object') {
          return {
            success: false,
            message: 'Metadata plannedMetrics must be an object',
            errors: ['Metadata plannedMetrics must be an object'],
          };
        }

        const numericFields = [
          'totalTimePlanned',
          'tssPlanned',
          'ifPlanned',
          'velocityPlanned',
          'caloriesPlanned',
          'distancePlanned',
          'elevationGainPlanned',
          'energyPlanned',
        ];

        for (const field of numericFields) {
          const value =
            metadata.plannedMetrics[
              field as keyof typeof metadata.plannedMetrics
            ];
          if (value !== undefined && value !== null) {
            if (typeof value !== 'number' || value < 0) {
              return {
                success: false,
                message: `Metadata plannedMetrics.${field} must be a positive number`,
                errors: [
                  `Metadata plannedMetrics.${field} must be a positive number`,
                ],
              };
            }
          }
        }
      }

      // Validate equipment if provided
      if (metadata.equipment !== undefined && metadata.equipment !== null) {
        if (typeof metadata.equipment !== 'object') {
          return {
            success: false,
            message: 'Metadata equipment must be an object',
            errors: ['Metadata equipment must be an object'],
          };
        }

        if (
          metadata.equipment.bikeId !== undefined &&
          metadata.equipment.bikeId !== null
        ) {
          if (
            typeof metadata.equipment.bikeId !== 'number' ||
            !Number.isInteger(metadata.equipment.bikeId)
          ) {
            return {
              success: false,
              message: 'Metadata equipment.bikeId must be an integer',
              errors: ['Metadata equipment.bikeId must be an integer'],
            };
          }
        }

        if (
          metadata.equipment.shoeId !== undefined &&
          metadata.equipment.shoeId !== null
        ) {
          if (
            typeof metadata.equipment.shoeId !== 'number' ||
            !Number.isInteger(metadata.equipment.shoeId)
          ) {
            return {
              success: false,
              message: 'Metadata equipment.shoeId must be an integer',
              errors: ['Metadata equipment.shoeId must be an integer'],
            };
          }
        }
      }
    }

    // Validate business rules
    validationService.validateStructuredWorkoutBusinessRules(
      athleteId,
      title,
      workoutTypeValueId,
      workoutDay,
      structure
    );

    // Parse the workout date
    const workoutDate = new Date(workoutDay);
    if (isNaN(workoutDate.getTime())) {
      return {
        success: false,
        message: 'Invalid workout date format',
        errors: ['Workout date must be a valid ISO date string'],
      };
    }

    // Generate unique ID for the workout
    const workoutId = utilityService.generateWorkoutId();

    // Create the structured workout entity
    const workout = Workout.createStructured(
      workoutId,
      title,
      metadata?.description || '',
      workoutDate,
      structure,
      utilityService.mapWorkoutTypeToActivityType(workoutTypeValueId),
      metadata?.userTags
        ? metadata.userTags.split(',').map((tag) => tag.trim())
        : undefined
    );

    // Create the full API request object
    const apiRequest: CreateStructuredWorkoutRequest = {
      athleteId,
      title,
      workoutTypeValueId,
      workoutDay,
      structure,
      metadata,
    };

    // Delegate to repository
    return await workoutRepository.createStructuredWorkout(apiRequest);
  },

  createStructuredWorkoutFromSimpleStructure: async (
    athleteId: number,
    title: string,
    workoutTypeValueId: number,
    workoutDay: string,
    elements: SimpleWorkoutElementForCreation[]
  ): Promise<CreateStructuredWorkoutResponse> => {
    // Additional null safety checks
    if (elements === null || elements === undefined) {
      return {
        success: false,
        message: 'Elements cannot be null or undefined',
        errors: ['Elements cannot be null or undefined'],
      };
    }

    // Build the structure from simple elements
    const structure = utilityService.buildStructureFromSimpleElements(elements);

    // Create the workout using the main method
    return await createWorkoutCreationService(
      workoutRepository,
      validationService,
      utilityService
    ).createStructuredWorkout(
      athleteId,
      title,
      workoutTypeValueId,
      workoutDay,
      structure
    );
  },

  uploadWorkout: async (
    fileContent: string,
    fileName: string,
    metadata?: WorkoutUploadMetadata
  ): Promise<WorkoutUploadResponse> => {
    // Additional null safety checks for metadata
    if (metadata !== undefined && metadata !== null) {
      if (typeof metadata !== 'object') {
        return {
          success: false,
          message: 'Metadata must be an object',
          errors: ['Metadata must be an object'],
        };
      }

      // Validate optional string fields
      if (metadata.name !== undefined && metadata.name !== null) {
        if (typeof metadata.name !== 'string') {
          return {
            success: false,
            message: 'Metadata name must be a string',
            errors: ['Metadata name must be a string'],
          };
        }
      }

      if (metadata.description !== undefined && metadata.description !== null) {
        if (typeof metadata.description !== 'string') {
          return {
            success: false,
            message: 'Metadata description must be a string',
            errors: ['Metadata description must be a string'],
          };
        }
      }

      if (
        metadata.activityType !== undefined &&
        metadata.activityType !== null
      ) {
        if (typeof metadata.activityType !== 'string') {
          return {
            success: false,
            message: 'Metadata activityType must be a string',
            errors: ['Metadata activityType must be a string'],
          };
        }
      }

      // Validate tags array
      if (metadata.tags !== undefined && metadata.tags !== null) {
        if (!Array.isArray(metadata.tags)) {
          return {
            success: false,
            message: 'Metadata tags must be an array',
            errors: ['Metadata tags must be an array'],
          };
        }

        for (let i = 0; i < metadata.tags.length; i++) {
          const tag = metadata.tags[i];
          if (tag === null || tag === undefined) {
            return {
              success: false,
              message: `Tag at index ${i} cannot be null or undefined`,
              errors: [`Tag at index ${i} cannot be null or undefined`],
            };
          }

          if (typeof tag !== 'string') {
            return {
              success: false,
              message: `Tag at index ${i} must be a string`,
              errors: [`Tag at index ${i} must be a string`],
            };
          }

          if (tag.trim().length === 0) {
            return {
              success: false,
              message: `Tag at index ${i} cannot be empty`,
              errors: [`Tag at index ${i} cannot be empty`],
            };
          }
        }
      }

      // Validate date
      if (metadata.date !== undefined && metadata.date !== null) {
        if (
          !(metadata.date instanceof Date) ||
          isNaN(metadata.date.getTime())
        ) {
          return {
            success: false,
            message: 'Metadata date must be a valid Date object',
            errors: ['Metadata date must be a valid Date object'],
          };
        }
      }

      // Validate duration
      if (metadata.duration !== undefined && metadata.duration !== null) {
        if (typeof metadata.duration !== 'number' || metadata.duration <= 0) {
          return {
            success: false,
            message: 'Metadata duration must be a positive number',
            errors: ['Metadata duration must be a positive number'],
          };
        }
      }

      // Validate distance
      if (metadata.distance !== undefined && metadata.distance !== null) {
        if (typeof metadata.distance !== 'number' || metadata.distance <= 0) {
          return {
            success: false,
            message: 'Metadata distance must be a positive number',
            errors: ['Metadata distance must be a positive number'],
          };
        }
      }
    }

    // Validate file content
    validationService.validateWorkoutFile(fileContent, fileName);

    // Create workout file value object
    const workoutFile = WorkoutFile.create(
      fileName,
      fileContent,
      utilityService.getMimeTypeFromFileName(fileName)
    );

    // Generate unique ID for the workout
    const workoutId = utilityService.generateWorkoutId();

    // Create workout entity
    const workout = Workout.fromFile(
      workoutId,
      fileName,
      fileContent,
      metadata
    );

    // Delegate to repository
    return await workoutRepository.uploadWorkout(workout);
  },
});
