/**
 * Create Structured Workout Use Case
 * Handles structured workout creation
 * Enhanced with Error Handler Service for robust error management
 */

import type {
  createStructuredWorkout,
  createStructuredWorkoutFromSimpleStructure,
  logDebug,
  logError,
  logInfo,
  logWarn,
  logWithLevel,
} from '@/application';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import {
  createErrorHandlerService,
  type ErrorHandlerService,
} from '@/infrastructure/services/error-handler';
import { createLoggerService } from '@/infrastructure/services/logger';
import { CreateStructuredWorkoutResponse } from '@/types';

/**
 * Request interface for creating structured workouts
 */
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
  createStructuredWorkoutFn: createStructuredWorkout,
  createStructuredWorkoutFromSimpleStructureFn: createStructuredWorkoutFromSimpleStructure,
  logger?: {
    info: logInfo;
    error: logError;
    warn: logWarn;
    debug: logDebug;
    log: logWithLevel;
  }
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
    }
  );

  /**
   * Execute create structured workout process
   */
  const execute = async (
    request: CreateStructuredWorkoutUseCaseRequest
  ): Promise<CreateStructuredWorkoutResponse> => {
    const operation = () =>
      createStructuredWorkoutFn(
        request.athleteId,
        request.title,
        request.workoutTypeValueId,
        request.workoutDay,
        request.structure,
        request.metadata
      );

    try {
      const result = await errorHandler.wrapAsyncOperation(operation, {
        operation: 'createStructuredWorkout',
        userId: request.athleteId,
        metadata: {
          title: request.title,
          workoutTypeValueId: request.workoutTypeValueId,
          workoutDay: request.workoutDay,
        },
      });

      useCaseLogger.info('Structured workout created successfully', {
        athleteId: request.athleteId,
        title: request.title,
        workoutTypeValueId: request.workoutTypeValueId,
      });

      return {
        success: true,
        message: 'Structured workout created successfully',
      } as CreateStructuredWorkoutResponse;
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
        errors: [errorResponse.error.message],
      } as CreateStructuredWorkoutResponse;
    }
  };

  /**
   * Create structured workout from simple elements
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
      createStructuredWorkoutFromSimpleStructureFn(
        athleteId,
        title,
        workoutTypeValueId,
        workoutDay,
        elements
      );

    try {
      const result = await errorHandler.wrapAsyncOperation(operation, {
        operation: 'createStructuredWorkoutFromSimpleStructure',
        userId: athleteId,
        metadata: {
          title,
          workoutTypeValueId,
          workoutDay,
          elementsCount: elements.length,
        },
      });

      useCaseLogger.info('Structured workout created from simple structure', {
        athleteId,
        title,
        workoutTypeValueId,
        elementsCount: elements.length,
      });

      return {
        success: true,
        message:
          'Structured workout created successfully from simple structure',
      } as CreateStructuredWorkoutResponse;
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
        errors: [errorResponse.error.message],
      } as CreateStructuredWorkoutResponse;
    }
  };

  return {
    execute,
    createFromSimpleStructure,
  };
};

// Export the type for dependency injection
export type CreateStructuredWorkoutUseCase = ReturnType<
  typeof createCreateStructuredWorkoutUseCase
>;
