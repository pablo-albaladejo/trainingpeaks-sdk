/**
 * Workout Creation Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type {
  CreateStructuredWorkout,
  CreateStructuredWorkoutFromSimpleStructure,
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  SimpleWorkoutStructure,
  UploadWorkout,
  UploadWorkoutRequest,
  UploadWorkoutResponse,
} from '@/application/services/workout-creation';
import { workoutLogger } from '@/infrastructure/logging/logger';
import {
  validateWorkoutDescription,
  validateWorkoutFile,
  validateWorkoutMetadata,
  validateWorkoutName,
  validateWorkoutTags,
} from '@/infrastructure/services/workout-validation';

export const createStructuredWorkout =
  (workoutRepository: WorkoutRepository): CreateStructuredWorkout =>
  async (
    request: CreateStructuredWorkoutRequest
  ): Promise<CreateStructuredWorkoutResponse> => {
    try {
      workoutLogger.info('Creating structured workout', {
        name: request.name,
        activityType: request.activityType,
      });

      // Validate request components
      validateWorkoutName(request.name);
      if (request.description) {
        validateWorkoutDescription(request.description);
      }
      if (request.tags) {
        validateWorkoutTags(request.tags);
      }
      if (request.customFields) {
        validateWorkoutMetadata(request.customFields);
      }

      // Create workout via repository
      const workoutId = `workout_${Date.now()}`;

      // TODO: Implement actual repository call
      // const result = await workoutRepository.createStructuredWorkout(request);

      workoutLogger.info('Structured workout created successfully', {
        workoutId,
        name: request.name,
      });

      return {
        workoutId,
        success: true,
        message: 'Structured workout created successfully',
        createdAt: new Date(),
        estimatedDuration: request.estimatedDuration,
        estimatedDistance: request.estimatedDistance,
        estimatedCalories: request.estimatedCalories,
        structure: request.structure,
      };
    } catch (error) {
      workoutLogger.error('Failed to create structured workout', {
        name: request.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      throw error;
    }
  };

export const createStructuredWorkoutFromSimpleStructure =
  (
    workoutRepository: WorkoutRepository
  ): CreateStructuredWorkoutFromSimpleStructure =>
  async (
    name: string,
    structure: SimpleWorkoutStructure
  ): Promise<CreateStructuredWorkoutResponse> => {
    try {
      workoutLogger.info('Creating structured workout from simple structure', {
        name,
      });

      // Validate basic inputs
      validateWorkoutName(name);

      // Validate structure components
      if (!structure.main || structure.main.length === 0) {
        throw new Error(
          'Workout structure must have at least one main segment'
        );
      }

      // TODO: Convert simple structure to full structure and validate
      // const fullStructure = convertSimpleToFullStructure(structure);
      // validateWorkoutStructure(fullStructure);

      const workoutId = `workout_${Date.now()}`;

      workoutLogger.info(
        'Structured workout from simple structure created successfully',
        {
          workoutId,
          name,
        }
      );

      return {
        workoutId,
        success: true,
        message: 'Structured workout created from simple structure',
        createdAt: new Date(),
      };
    } catch (error) {
      workoutLogger.error(
        'Failed to create structured workout from simple structure',
        {
          name,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType:
            error instanceof Error ? error.constructor.name : 'Unknown',
        }
      );
      throw error;
    }
  };

export const uploadWorkout =
  (workoutRepository: WorkoutRepository): UploadWorkout =>
  async (request: UploadWorkoutRequest): Promise<UploadWorkoutResponse> => {
    try {
      workoutLogger.info('Uploading workout', {
        fileName: request.file.fileName,
        fileSize: request.file.content.length,
        mimeType: request.file.mimeType,
      });

      // Validate file
      validateWorkoutFile(request.file);

      // Validate individual components
      if (request.name) {
        validateWorkoutName(request.name);
      }
      if (request.description) {
        validateWorkoutDescription(request.description);
      }
      if (request.tags) {
        validateWorkoutTags(request.tags);
      }
      if (request.customFields) {
        validateWorkoutMetadata(request.customFields);
      }

      const workoutId = `workout_${Date.now()}`;

      // TODO: Implement actual repository call
      // const result = await workoutRepository.uploadWorkout(request);

      workoutLogger.info('Workout uploaded successfully', {
        workoutId,
        fileName: request.file.fileName,
      });

      return {
        workoutId,
        success: true,
        message: 'Workout uploaded successfully',
        fileInfo: {
          originalName: request.file.fileName,
          size: request.file.content.length,
          type: request.file.mimeType,
          uploadedAt: new Date(),
        },
      };
    } catch (error) {
      workoutLogger.error('Failed to upload workout', {
        fileName: request.file.fileName,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      throw error;
    }
  };
