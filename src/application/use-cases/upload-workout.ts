/**
 * Upload Workout Use Case
 * Handles workout upload operations
 * Enhanced with Error Handler Service for robust error management
 */

import type { LoggerService } from '@/application/services/logger';
import { WorkoutService } from '@/application/services/workout-service';
import {
  createErrorHandlerService,
  type ErrorHandlerService,
} from '@/infrastructure/services/error-handler';
import { createLoggerService } from '@/infrastructure/services/logger';

/**
 * Upload Workout Use Case Factory
 * Creates an upload workout use case with dependency injection
 * Enhanced with comprehensive error handling and context enrichment
 */
export const createUploadWorkoutUseCase = (
  workoutService: WorkoutService,
  logger?: LoggerService
) => {
  // Setup logger and error handler
  const useCaseLogger =
    logger ||
    createLoggerService({
      level: 'info',
      prefix: 'UploadWorkoutUseCase',
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

  useCaseLogger.info('Upload Workout use case initialized with error handling');

  /**
   * Upload a workout file
   */
  const execute = async (
    fileContent: string,
    fileName: string,
    metadata?: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
      date?: Date;
      duration?: number;
      distance?: number;
    }
  ) => {
    const operation = () =>
      workoutService.uploadWorkout(fileContent, fileName, metadata);

    try {
      useCaseLogger.debug('Executing upload workout use case', {
        fileName,
        contentLength: fileContent.length,
        hasMetadata: !!metadata,
        metadataKeys: metadata ? Object.keys(metadata) : [],
      });

      const result = await errorHandler.wrapAsyncOperation(operation, {
        operation: 'uploadWorkout',
        metadata: {
          fileName,
          contentLength: fileContent.length,
          hasMetadata: !!metadata,
          activityType: metadata?.activityType,
        },
      })();

      if ('success' in result && result.success) {
        useCaseLogger.info('Workout uploaded successfully', {
          fileName,
          workoutId: result.data?.workoutId,
          contentLength: fileContent.length,
        });

        return result.data;
      } else {
        useCaseLogger.warn(
          'Service returned unsuccessful response for upload',
          {
            fileName,
            contentLength: fileContent.length,
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
        operation: 'uploadWorkout',
        metadata: {
          fileName,
          contentLength: fileContent.length,
          activityType: metadata?.activityType,
        },
      });

      return {
        success: false,
        message: errorResponse.error.message,
        errors: errorResponse.error.details || [errorResponse.error.message],
      };
    }
  };

  return { execute };
};

// Export the type for dependency injection
export type UploadWorkoutUseCase = ReturnType<
  typeof createUploadWorkoutUseCase
>;
