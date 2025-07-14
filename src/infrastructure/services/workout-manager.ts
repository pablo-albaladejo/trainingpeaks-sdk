/**
 * Workout Manager Service Implementation
 * Infrastructure Layer - ACTUAL IMPLEMENTATION
 *
 * This is an ADAPTER - implements the port defined in application layer
 */

import type { LoggerService } from '@/application/services/logger';
import type {
  StructuredWorkoutData,
  WorkoutData,
  WorkoutManagerConfig,
  WorkoutManagerService,
  WorkoutManagerServiceFactory,
  WorkoutSearchCriteria,
  WorkoutStatsFilters,
  WorkoutStatsResponse,
  WorkoutUploadResponse,
} from '@/application/services/workout-manager';
import type { ListWorkoutsRequest } from '@/application/use-cases/list-workouts';
import type { Workout } from '@/domain/entities/workout';
import { createLoggerService } from '@/infrastructure/services/logger';
import type { CreateStructuredWorkoutResponse } from '@/types';

// Import use case factories
import { createCreateStructuredWorkoutUseCase } from '@/application/use-cases/create-structured-workout';
import { createDeleteWorkoutUseCase } from '@/application/use-cases/delete-workout';
import { createGetWorkoutUseCase } from '@/application/use-cases/get-workout';
import { createListWorkoutsUseCase } from '@/application/use-cases/list-workouts';
import { createUploadWorkoutUseCase } from '@/application/use-cases/upload-workout';

// Import infrastructure implementations
import { getSDKConfig } from '@/config';
import { FileSystemAdapter } from '@/infrastructure/filesystem/file-system-adapter';
import { createTrainingPeaksWorkoutRepository } from '@/infrastructure/repositories/training-peaks-workout';
import { createWorkoutService } from '@/infrastructure/services/workout-service';
import { TrainingPeaksWorkoutApiAdapter } from '@/infrastructure/workout/trainingpeaks-api-adapter';

/**
 * Setup workout dependencies - Infrastructure boundary for dependency injection
 */
const setupWorkoutDependencies = (
  config: WorkoutManagerConfig,
  logger: LoggerService
) => {
  const sdkConfig = getSDKConfig();

  const workoutServiceConfig = {
    baseUrl: config.baseUrl || sdkConfig.urls.baseUrl,
    timeout: config.timeout || sdkConfig.timeouts.default,
    debug: config.debug ?? sdkConfig.debug.enabled,
    headers: config.headers || sdkConfig.requests.defaultHeaders,
  };

  logger.debug('Setting up workout dependencies', { workoutServiceConfig });

  // Infrastructure Layer - External adapters
  const fileSystemAdapter = new FileSystemAdapter();
  const workoutApiAdapter = new TrainingPeaksWorkoutApiAdapter();

  // Adapters Layer - Repository implementations
  const workoutRepositoryFactory = createTrainingPeaksWorkoutRepository(
    fileSystemAdapter,
    workoutServiceConfig
  );

  // Register adapters with the repository
  workoutRepositoryFactory.registerWorkoutService(workoutApiAdapter);

  // Infrastructure Layer - Service implementations
  const workoutRepository = workoutRepositoryFactory.repository;
  const workoutService = createWorkoutService(workoutRepository, logger);

  // Application Layer - Use Cases with proper dependency injection
  const uploadWorkoutUseCase = createUploadWorkoutUseCase(
    workoutService,
    logger
  );
  const getWorkoutUseCase = createGetWorkoutUseCase(workoutService);
  const listWorkoutsUseCase = createListWorkoutsUseCase(workoutService);
  const deleteWorkoutUseCase = createDeleteWorkoutUseCase(workoutService);
  const createStructuredWorkoutUseCase = createCreateStructuredWorkoutUseCase(
    workoutService,
    logger
  );

  logger.info('Workout dependencies setup completed');

  return {
    workoutRepository,
    workoutService,
    uploadWorkoutUseCase,
    getWorkoutUseCase,
    listWorkoutsUseCase,
    deleteWorkoutUseCase,
    createStructuredWorkoutUseCase,
    fileSystemAdapter,
  };
};

/**
 * IMPLEMENTATION of WorkoutManagerService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutManagerService: WorkoutManagerServiceFactory = (
  config: WorkoutManagerConfig = {},
  logger?: LoggerService
): WorkoutManagerService => {
  // Use provided logger or create default one
  const workoutLogger = logger || createLoggerService({ level: 'info' });

  workoutLogger.info('Creating workout manager service', { config });

  // Setup all dependencies using proper dependency injection
  const dependencies = setupWorkoutDependencies(config, workoutLogger);

  return {
    /**
     * Upload workout from data
     */
    uploadWorkout: async (
      workoutData: WorkoutData
    ): Promise<WorkoutUploadResponse> => {
      workoutLogger.info('Starting workout upload from data', {
        fileName: workoutData.fileName,
        hasMetadata: !!workoutData.metadata,
      });

      try {
        // Call the use case with the correct parameters
        const result = await dependencies.uploadWorkoutUseCase.execute(
          workoutData.fileContent,
          workoutData.fileName,
          workoutData.metadata
            ? {
                name: workoutData.metadata.title,
                description: workoutData.metadata.description,
                tags: workoutData.metadata.tags,
                activityType: workoutData.metadata.activityType,
              }
            : undefined
        );

        workoutLogger.info('Workout upload completed', {
          success: result.success,
          workoutId: result.workoutId,
        });

        return {
          success: result.success,
          workoutId: result.workoutId,
          message: result.message,
          errors: result.errors,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        workoutLogger.error('Workout upload failed', { error: errorMessage });
        throw error;
      }
    },

    /**
     * Upload workout from file
     */
    uploadWorkoutFromFile: async (
      filePath: string
    ): Promise<WorkoutUploadResponse> => {
      workoutLogger.info('Starting workout upload from file', { filePath });

      try {
        // Read the file content and call the upload use case
        const fileContent =
          await dependencies.fileSystemAdapter.readFile(filePath);
        const fileName = filePath.split('/').pop() || 'workout.tcx';

        const result = await dependencies.uploadWorkoutUseCase.execute(
          fileContent,
          fileName
        );

        workoutLogger.info('Workout file upload completed', {
          success: result.success,
          workoutId: result.workoutId,
        });

        return {
          success: result.success,
          workoutId: result.workoutId,
          message: result.message,
          errors: result.errors,
        };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        workoutLogger.error('Workout file upload failed', {
          error: errorMessage,
        });

        return {
          success: false,
          message: 'Failed to read workout file',
          errors: [errorMessage],
        };
      }
    },

    /**
     * Get workout by ID
     */
    getWorkout: async (workoutId: string): Promise<Workout> => {
      workoutLogger.info('Fetching workout', { workoutId });

      try {
        const request = { workoutId };
        const workout = await dependencies.getWorkoutUseCase.execute(request);

        workoutLogger.info('Workout fetched successfully', { workoutId });
        return workout;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        workoutLogger.error('Workout fetch failed', {
          error: errorMessage,
          workoutId,
        });
        throw error;
      }
    },

    /**
     * List workouts with optional filters
     */
    listWorkouts: async (
      filters: ListWorkoutsRequest = {}
    ): Promise<Workout[]> => {
      workoutLogger.info('Listing workouts', { filters });

      try {
        const workouts =
          await dependencies.listWorkoutsUseCase.execute(filters);

        workoutLogger.info('Workouts listed successfully', {
          count: workouts.length,
        });
        return workouts;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        workoutLogger.error('Workout listing failed', { error: errorMessage });
        throw error;
      }
    },

    /**
     * Delete workout by ID
     */
    deleteWorkout: async (
      workoutId: string
    ): Promise<{ success: boolean; message: string }> => {
      workoutLogger.info('Deleting workout', { workoutId });

      try {
        const request = { workoutId };
        const success =
          await dependencies.deleteWorkoutUseCase.execute(request);

        const result = {
          success,
          message: success
            ? 'Workout deleted successfully'
            : 'Failed to delete workout',
        };

        workoutLogger.info('Workout deletion completed', {
          workoutId,
          success,
        });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        workoutLogger.error('Workout deletion failed', {
          error: errorMessage,
          workoutId,
        });
        throw error;
      }
    },

    /**
     * Create structured workout
     */
    createStructuredWorkout: async (
      workoutData: StructuredWorkoutData
    ): Promise<CreateStructuredWorkoutResponse> => {
      workoutLogger.info('Creating structured workout', {
        athleteId: workoutData.athleteId,
        title: workoutData.title,
      });

      try {
        const request = {
          athleteId: workoutData.athleteId,
          title: workoutData.title,
          workoutTypeValueId: workoutData.workoutTypeValueId,
          workoutDay: workoutData.workoutDay,
          structure: workoutData.structure,
          metadata: workoutData.metadata,
        };

        const result =
          await dependencies.createStructuredWorkoutUseCase.execute(request);

        workoutLogger.info('Structured workout created successfully', {
          workoutId: result.workoutId,
        });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        workoutLogger.error('Structured workout creation failed', {
          error: errorMessage,
        });
        throw error;
      }
    },

    /**
     * Search workouts by criteria
     */
    searchWorkouts: async (
      criteria: WorkoutSearchCriteria
    ): Promise<Workout[]> => {
      workoutLogger.info('Searching workouts', { query: criteria });

      try {
        // Convert search criteria to list filters
        const filters: ListWorkoutsRequest = {
          ...(criteria.dateRange && {
            startDate: criteria.dateRange.startDate,
            endDate: criteria.dateRange.endDate,
          }),
          ...(criteria.activityType && { activityType: criteria.activityType }),
        };

        const workouts =
          await dependencies.listWorkoutsUseCase.execute(filters);

        // Filter by text if provided
        let filteredWorkouts = workouts;
        if (criteria.text) {
          filteredWorkouts = workouts.filter(
            (workout) =>
              workout.name
                ?.toLowerCase()
                .includes(criteria.text!.toLowerCase()) ||
              workout.description
                ?.toLowerCase()
                .includes(criteria.text!.toLowerCase())
          );
        }

        workoutLogger.info('Workout search completed', {
          count: filteredWorkouts.length,
        });
        return filteredWorkouts;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        workoutLogger.error('Workout search failed', { error: errorMessage });
        throw error;
      }
    },

    /**
     * Get workout statistics
     */
    getWorkoutStats: async (
      filters: WorkoutStatsFilters = {}
    ): Promise<WorkoutStatsResponse> => {
      workoutLogger.info('Getting workout statistics', { filters });

      try {
        // Convert filters to list request
        const listFilters: ListWorkoutsRequest = {
          ...(filters.dateRange && {
            startDate: filters.dateRange.startDate,
            endDate: filters.dateRange.endDate,
          }),
          ...(filters.activityType && { activityType: filters.activityType }),
        };

        const workouts =
          await dependencies.listWorkoutsUseCase.execute(listFilters);

        // Calculate statistics
        const totalWorkouts = workouts.length;
        const totalDuration = workouts.reduce(
          (sum, w) => sum + (w.duration || 0),
          0
        );
        const totalDistance = workouts.reduce(
          (sum, w) => sum + (w.distance || 0),
          0
        );

        const stats: WorkoutStatsResponse = {
          totalWorkouts,
          totalDuration,
          totalDistance,
          avgDuration: totalWorkouts > 0 ? totalDuration / totalWorkouts : 0,
          avgDistance: totalWorkouts > 0 ? totalDistance / totalWorkouts : 0,
        };

        workoutLogger.info('Workout statistics retrieved', { totalWorkouts });
        return stats;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        workoutLogger.error('Workout statistics failed', {
          error: errorMessage,
        });
        throw error;
      }
    },

    /**
     * Get workout repository (for advanced operations)
     */
    getWorkoutRepository: () => {
      return dependencies.workoutRepository;
    },
  };
};
