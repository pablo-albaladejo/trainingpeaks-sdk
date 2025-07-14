/**
 * Create Structured Workout Use Case
 * Handles structured workout creation operations
 * Enhanced with Error Handler Service for robust error management
 */

import type { LoggerService } from '@/application/services/logger';
import { WorkoutService } from '@/application/services/workout-service';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import {
  createErrorHandlerService,
  type ErrorHandlerService,
} from '@/infrastructure/services/error-handler';
import { createLoggerService } from '@/infrastructure/services/logger';
import { CreateStructuredWorkoutResponse } from '@/types';

export interface CreateStructuredWorkoutUseCaseRequest {
  /** Athlete ID */
  athleteId: number;
  /** Workout title */
  title: string;
  /** Workout type ID */
  workoutTypeValueId: number;
  /** Workout date */
  workoutDay: string;
  /** Workout structure */
  structure: WorkoutStructure;
  /** Optional workout metadata */
  metadata?: {
    /** Workout code */
    code?: string;
    /** Workout description */
    description?: string;
    /** User tags */
    userTags?: string;
    /** Coach comments */
    coachComments?: string;
    /** Public setting value */
    publicSettingValue?: number;
    /** Planned metrics */
    plannedMetrics?: {
      totalTimePlanned?: number;
      tssPlanned?: number;
      ifPlanned?: number;
      velocityPlanned?: number;
      caloriesPlanned?: number;
      distancePlanned?: number;
      elevationGainPlanned?: number;
      energyPlanned?: number;
    };
    /** Equipment */
    equipment?: {
      bikeId?: number;
      shoeId?: number;
    };
  };
}

/**
 * Create Structured Workout Use Case Factory
 * Creates a create structured workout use case with dependency injection
 * Enhanced with comprehensive error handling and context enrichment
 */
export const createCreateStructuredWorkoutUseCase = (
  workoutService: WorkoutService,
  logger?: LoggerService
) => {
  // Setup logger and error handler
  const useCaseLogger =
    logger ||
    createLoggerService({
      level: 'info',
      prefix: 'CreateStructuredWorkoutUseCase',
    });

  const errorHandler: ErrorHandlerService = createErrorHandlerService(
    useCaseLogger,
    {
      enableStackTrace: false,
      enableContextEnrichment: true,
      logLevel: 'error',
      maxRetryAttempts: 1, // Use cases typically don't retry
      retryDelay: 1000,
    }
  );

  useCaseLogger.info(
    'Create Structured Workout use case initialized with error handling'
  );

  /**
   * Create a structured workout
   */
  const execute = async (
    request: CreateStructuredWorkoutUseCaseRequest
  ): Promise<CreateStructuredWorkoutResponse> => {
    const operation = () =>
      workoutService.createStructuredWorkout(
        request.athleteId,
        request.title,
        request.workoutTypeValueId,
        request.workoutDay,
        request.structure,
        request.metadata
      );

    try {
      useCaseLogger.debug('Executing create structured workout use case', {
        athleteId: request.athleteId,
        title: request.title,
        workoutTypeValueId: request.workoutTypeValueId,
        workoutDay: request.workoutDay,
        hasMetadata: !!request.metadata,
      });

      const result = await errorHandler.wrapAsyncOperation(operation, {
        operation: 'createStructuredWorkout',
        userId: request.athleteId,
        metadata: {
          title: request.title,
          workoutTypeValueId: request.workoutTypeValueId,
          workoutDay: request.workoutDay,
          hasMetadata: !!request.metadata,
        },
      })();

      if ('success' in result && result.success) {
        useCaseLogger.info('Structured workout created successfully', {
          athleteId: request.athleteId,
          title: request.title,
          workoutId: result.data?.workoutId,
        });

        return result.data as CreateStructuredWorkoutResponse;
      } else {
        useCaseLogger.warn('Service returned unsuccessful response', {
          athleteId: request.athleteId,
          title: request.title,
          error: result.error,
        });

        return {
          success: false,
          message: result.error?.message || 'Unknown error occurred',
          errors: result.error?.details || ['Unknown error'],
        };
      }
    } catch (error) {
      const errorResponse = errorHandler.handleError(error as Error, {
        operation: 'createStructuredWorkout',
        userId: request.athleteId,
        metadata: {
          title: request.title,
          workoutTypeValueId: request.workoutTypeValueId,
          workoutDay: request.workoutDay,
        },
      });

      return {
        success: false,
        message: errorResponse.error.message,
        errors: errorResponse.error.details || [errorResponse.error.message],
      };
    }
  };

  /**
   * Create a structured workout from a simplified structure
   */
  const createFromSimpleStructure = async (
    athleteId: number,
    title: string,
    workoutTypeValueId: number,
    workoutDay: string,
    elements: {
      type: 'step' | 'repetition';
      repetitions?: number;
      steps: {
        name: string;
        duration: number; // in seconds
        intensityMin: number;
        intensityMax: number;
        intensityClass: 'active' | 'rest' | 'warmUp' | 'coolDown';
      }[];
    }[]
  ): Promise<CreateStructuredWorkoutResponse> => {
    const operation = () =>
      workoutService.createStructuredWorkoutFromSimpleStructure(
        athleteId,
        title,
        workoutTypeValueId,
        workoutDay,
        elements
      );

    try {
      useCaseLogger.debug(
        'Executing create structured workout from simple structure',
        {
          athleteId,
          title,
          workoutTypeValueId,
          workoutDay,
          elementsCount: elements.length,
        }
      );

      const result = await errorHandler.wrapAsyncOperation(operation, {
        operation: 'createStructuredWorkoutFromSimpleStructure',
        userId: athleteId,
        metadata: {
          title,
          workoutTypeValueId,
          workoutDay,
          elementsCount: elements.length,
        },
      })();

      if ('success' in result && result.success) {
        useCaseLogger.info(
          'Structured workout created from simple structure successfully',
          {
            athleteId,
            title,
            elementsCount: elements.length,
            workoutId: result.data?.workoutId,
          }
        );

        return result.data as CreateStructuredWorkoutResponse;
      } else {
        useCaseLogger.warn(
          'Service returned unsuccessful response for simple structure',
          {
            athleteId,
            title,
            elementsCount: elements.length,
            error: result.error,
          }
        );

        return {
          success: false,
          message: result.error?.message || 'Unknown error occurred',
          errors: result.error?.details || ['Unknown error'],
        };
      }
    } catch (error) {
      const errorResponse = errorHandler.handleError(error as Error, {
        operation: 'createStructuredWorkoutFromSimpleStructure',
        userId: athleteId,
        metadata: {
          title,
          workoutTypeValueId,
          workoutDay,
          elementsCount: elements.length,
        },
      });

      return {
        success: false,
        message: errorResponse.error.message,
        errors: errorResponse.error.details || [errorResponse.error.message],
      };
    }
  };

  return { execute, createFromSimpleStructure };
};

// Export the type for dependency injection
export type CreateStructuredWorkoutUseCase = ReturnType<
  typeof createCreateStructuredWorkoutUseCase
>;
