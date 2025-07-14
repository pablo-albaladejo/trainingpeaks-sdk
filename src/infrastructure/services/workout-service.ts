/**
 * Workout Service Implementation
 * Implements the WorkoutService contract by coordinating all workout-related services
 * Enhanced with Error Handler Service for robust error management
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type { LoggerService } from '@/application/services/logger';
import type {
  SimpleWorkoutElementForCreation,
  WorkoutCreationMetadata,
  WorkoutUploadMetadata,
  WorkoutUploadResponse,
} from '@/application/services/workout-creation';
import type { WorkoutListFilters } from '@/application/services/workout-query';
import type { WorkoutService } from '@/application/services/workout-service';
import { Workout } from '@/domain/entities/workout';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import {
  createErrorHandlerService,
  type ErrorHandlerService,
} from '@/infrastructure/services/error-handler';
import { createLoggerService } from '@/infrastructure/services/logger';
import { createWorkoutCreationService } from '@/infrastructure/services/workout-creation';
import { createWorkoutManagementService } from '@/infrastructure/services/workout-management';
import { createWorkoutQueryService } from '@/infrastructure/services/workout-query';
import { createWorkoutUtilityService } from '@/infrastructure/services/workout-utility';
import { createWorkoutValidationService } from '@/infrastructure/services/workout-validation';
import { CreateStructuredWorkoutResponse } from '@/types';

/**
 * IMPLEMENTATION of WorkoutService
 * This is an ADAPTER - implements the port defined in application layer
 * Enhanced with comprehensive error handling and context enrichment
 */
export const createWorkoutService = (
  workoutRepository: WorkoutRepository,
  logger?: LoggerService
): WorkoutService => {
  // Setup logger and error handler
  const serviceLogger =
    logger ||
    createLoggerService({
      level: 'info',
      prefix: 'WorkoutService',
    });

  const errorHandler: ErrorHandlerService = createErrorHandlerService(
    serviceLogger,
    {
      enableStackTrace: false,
      enableContextEnrichment: true,
      logLevel: 'error',
      maxRetryAttempts: 3,
      retryDelay: 1000,
    }
  );

  // Create all sub-services with enhanced error handling
  const validationService = createWorkoutValidationService();
  const utilityService = createWorkoutUtilityService();
  const creationService = createWorkoutCreationService(
    workoutRepository,
    validationService,
    utilityService
  );
  const queryService = createWorkoutQueryService(
    workoutRepository,
    validationService
  );
  const managementService = createWorkoutManagementService(
    workoutRepository,
    validationService
  );

  serviceLogger.info('Workout service initialized with error handling');

  // Return the unified service interface with error handling
  return {
    // Creation operations with error handling
    createStructuredWorkout: async (
      athleteId: number,
      title: string,
      workoutTypeValueId: number,
      workoutDay: string,
      structure: WorkoutStructure,
      metadata?: WorkoutCreationMetadata
    ): Promise<CreateStructuredWorkoutResponse> => {
      const operation = () =>
        creationService.createStructuredWorkout(
          athleteId,
          title,
          workoutTypeValueId,
          workoutDay,
          structure,
          metadata
        );

      try {
        serviceLogger.debug('Creating structured workout', {
          athleteId,
          title,
          workoutTypeValueId,
          workoutDay,
        });

        const result = await errorHandler.retryOperation(operation, {
          operation: 'createStructuredWorkout',
          userId: athleteId,
          metadata: { title, workoutTypeValueId, workoutDay },
        });

        serviceLogger.info('Structured workout created successfully', {
          athleteId,
          success: (result as CreateStructuredWorkoutResponse).success,
        });

        return result as CreateStructuredWorkoutResponse;
      } catch (error) {
        const errorResponse = errorHandler.handleError(error as Error, {
          operation: 'createStructuredWorkout',
          userId: athleteId,
          metadata: { title, workoutTypeValueId, workoutDay },
        });

        return {
          success: false,
          message: errorResponse.error.message,
          errors: errorResponse.error.details || [errorResponse.error.message],
        };
      }
    },

    createStructuredWorkoutFromSimpleStructure: async (
      athleteId: number,
      title: string,
      workoutTypeValueId: number,
      workoutDay: string,
      elements: SimpleWorkoutElementForCreation[]
    ): Promise<CreateStructuredWorkoutResponse> => {
      const operation = () =>
        creationService.createStructuredWorkoutFromSimpleStructure(
          athleteId,
          title,
          workoutTypeValueId,
          workoutDay,
          elements
        );

      try {
        serviceLogger.debug(
          'Creating structured workout from simple structure',
          {
            athleteId,
            title,
            elementsCount: elements.length,
          }
        );

        const result = await errorHandler.retryOperation(operation, {
          operation: 'createStructuredWorkoutFromSimpleStructure',
          userId: athleteId,
          metadata: {
            title,
            workoutTypeValueId,
            elementsCount: elements.length,
          },
        });

        serviceLogger.info('Structured workout created from simple structure', {
          athleteId,
          success: (result as CreateStructuredWorkoutResponse).success,
        });

        return result as CreateStructuredWorkoutResponse;
      } catch (error) {
        const errorResponse = errorHandler.handleError(error as Error, {
          operation: 'createStructuredWorkoutFromSimpleStructure',
          userId: athleteId,
          metadata: { title, elementsCount: elements.length },
        });

        return {
          success: false,
          message: errorResponse.error.message,
          errors: errorResponse.error.details || [errorResponse.error.message],
        };
      }
    },

    uploadWorkout: async (
      fileContent: string,
      fileName: string,
      metadata?: WorkoutUploadMetadata
    ): Promise<WorkoutUploadResponse> => {
      const operation = () =>
        creationService.uploadWorkout(fileContent, fileName, metadata);

      try {
        serviceLogger.debug('Uploading workout', {
          fileName,
          contentLength: fileContent.length,
          metadata: metadata?.name || 'No name provided',
        });

        const result = await errorHandler.retryOperation(operation, {
          operation: 'uploadWorkout',
          metadata: { fileName, contentLength: fileContent.length },
        });

        serviceLogger.info('Workout uploaded successfully', {
          fileName,
          success: (result as WorkoutUploadResponse).success,
        });

        return result as WorkoutUploadResponse;
      } catch (error) {
        const errorResponse = errorHandler.handleError(error as Error, {
          operation: 'uploadWorkout',
          metadata: { fileName, contentLength: fileContent.length },
        });

        return {
          success: false,
          message: errorResponse.error.message,
          errors: errorResponse.error.details || [errorResponse.error.message],
        };
      }
    },

    // Query operations with error handling
    getWorkout: async (workoutId: string): Promise<Workout> => {
      const operation = () => queryService.getWorkout(workoutId);

      try {
        serviceLogger.debug('Getting workout', { workoutId });

        const result = await errorHandler.retryOperation(operation, {
          operation: 'getWorkout',
          workoutId,
        });

        serviceLogger.info('Workout retrieved successfully', { workoutId });

        return result as Workout;
      } catch (error) {
        serviceLogger.warn('Failed to get workout', {
          workoutId,
          error: (error as Error).message,
        });
        throw error; // Re-throw for use cases to handle
      }
    },

    listWorkouts: async (filters?: WorkoutListFilters): Promise<Workout[]> => {
      const operation = () => queryService.listWorkouts(filters);

      try {
        serviceLogger.debug('Listing workouts', { filters });

        const result = await errorHandler.retryOperation(operation, {
          operation: 'listWorkouts',
          metadata: { filters },
        });

        serviceLogger.info('Workouts listed successfully', {
          count: (result as Workout[]).length,
          filters,
        });

        return result as Workout[];
      } catch (error) {
        serviceLogger.warn('Failed to list workouts', {
          filters,
          error: (error as Error).message,
        });
        throw error; // Re-throw for use cases to handle
      }
    },

    // Management operations with error handling
    deleteWorkout: async (workoutId: string): Promise<boolean> => {
      const operation = () => managementService.deleteWorkout(workoutId);

      try {
        serviceLogger.debug('Deleting workout', { workoutId });

        const result = await errorHandler.retryOperation(
          operation,
          {
            operation: 'deleteWorkout',
            workoutId,
          },
          1
        ); // No retry for delete operations

        serviceLogger.info('Workout deleted successfully', {
          workoutId,
          success: result,
        });

        return result as boolean;
      } catch (error) {
        serviceLogger.warn('Failed to delete workout', {
          workoutId,
          error: (error as Error).message,
        });
        throw error; // Re-throw for use cases to handle
      }
    },
  };
};
