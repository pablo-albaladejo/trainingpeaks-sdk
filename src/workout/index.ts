/**
 * Workout Management (Function-First Architecture)
 * Handles all workout-related operations following hexagonal architecture principles
 */

import type { LoggerService } from '@/application/services/logger';
import {
  createCreateStructuredWorkoutUseCase,
  CreateStructuredWorkoutUseCaseRequest,
} from '@/application/use-cases/create-structured-workout';
import {
  createDeleteWorkoutUseCase,
  DeleteWorkoutRequest,
} from '@/application/use-cases/delete-workout';
import {
  createGetWorkoutUseCase,
  GetWorkoutRequest,
} from '@/application/use-cases/get-workout';
import {
  createListWorkoutsUseCase,
  ListWorkoutsRequest,
} from '@/application/use-cases/list-workouts';
import {
  createUploadWorkoutUseCase,
  UploadWorkoutFromFileRequest,
  UploadWorkoutRequest,
} from '@/application/use-cases/upload-workout';
import { getSDKConfig } from '@/config';
import { Workout } from '@/domain/entities/workout';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import { FileSystemAdapter } from '@/infrastructure/filesystem/file-system-adapter';
import { createTrainingPeaksWorkoutRepository } from '@/infrastructure/repositories/training-peaks-workout';
import { createLoggerService } from '@/infrastructure/services/logger';
import { createWorkoutService } from '@/infrastructure/services/workout-service';
import { TrainingPeaksWorkoutApiAdapter } from '@/infrastructure/workout/trainingpeaks-api-adapter';
import {
  CreateStructuredWorkoutResponse,
  TrainingPeaksClientConfig,
} from '@/types';

export interface WorkoutData {
  /** The workout file content (TCX, GPX, FIT, etc.) */
  fileContent: string;
  /** The workout file name */
  fileName: string;
  /** Optional workout metadata */
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    activityType?: string;
  };
}

export interface WorkoutUploadResponse {
  /** Success status */
  success: boolean;
  /** Workout ID assigned by TrainingPeaks */
  workoutId?: string;
  /** Upload status message */
  message: string;
  /** Any upload errors */
  errors?: string[];
}

export interface StructuredWorkoutData {
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
    code?: string;
    description?: string;
    userTags?: string;
    coachComments?: string;
    publicSettingValue?: number;
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
    equipment?: {
      bikeId?: number;
      shoeId?: number;
    };
  };
}

/**
 * Setup workout dependencies following hexagonal architecture
 */
const setupWorkoutDependencies = (
  config: TrainingPeaksClientConfig,
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
  const workoutService = createWorkoutService(workoutRepository);

  // Application Layer - Use Cases with proper dependency injection
  const uploadWorkoutUseCase = createUploadWorkoutUseCase(workoutService);
  const getWorkoutUseCase = createGetWorkoutUseCase(workoutService);
  const listWorkoutsUseCase = createListWorkoutsUseCase(workoutService);
  const deleteWorkoutUseCase = createDeleteWorkoutUseCase(workoutService);
  const createStructuredWorkoutUseCase =
    createCreateStructuredWorkoutUseCase(workoutService);

  logger.info('Workout dependencies setup completed');

  return {
    workoutRepository,
    workoutService,
    uploadWorkoutUseCase,
    getWorkoutUseCase,
    listWorkoutsUseCase,
    deleteWorkoutUseCase,
    createStructuredWorkoutUseCase,
  };
};

/**
 * Create Workout Manager following function-first architecture
 *
 * @param config - TrainingPeaks client configuration
 * @param logger - Optional logger implementation
 * @returns WorkoutManager instance with all workout operations
 */
export const createWorkoutManager = (
  config: TrainingPeaksClientConfig = {},
  logger: LoggerService = createLoggerService({ level: 'info' })
) => {
  logger.info('Creating workout manager', { config });

  // Setup all dependencies using proper dependency injection
  const dependencies = setupWorkoutDependencies(config, logger);

  return {
    /**
     * Upload workout from data
     */
    uploadWorkout: async (
      workoutData: WorkoutData
    ): Promise<WorkoutUploadResponse> => {
      logger.info('Starting workout upload', {
        fileName: workoutData.fileName,
      });

      try {
        const request: UploadWorkoutRequest = {
          fileContent: workoutData.fileContent,
          fileName: workoutData.fileName,
          metadata: workoutData.metadata
            ? {
                name: workoutData.metadata.title,
                description: workoutData.metadata.description,
                tags: workoutData.metadata.tags,
                activityType: workoutData.metadata.activityType,
              }
            : undefined,
        };

        const result = await dependencies.uploadWorkoutUseCase.execute(request);

        logger.info('Workout upload completed', {
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
        logger.error('Workout upload failed', { error: errorMessage });
        throw error;
      }
    },

    /**
     * Upload workout from file
     */
    uploadWorkoutFromFile: async (
      filePath: string
    ): Promise<WorkoutUploadResponse> => {
      logger.info('Starting workout upload from file', { filePath });

      try {
        const request: UploadWorkoutFromFileRequest = { filePath };
        const result =
          await dependencies.uploadWorkoutUseCase.executeFromFile(request);

        logger.info('Workout file upload completed', {
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
        logger.error('Workout file upload failed', { error: errorMessage });
        throw error;
      }
    },

    /**
     * Create structured workout
     */
    createStructuredWorkout: async (
      workoutData: StructuredWorkoutData
    ): Promise<CreateStructuredWorkoutResponse> => {
      logger.info('Starting structured workout creation', {
        athleteId: workoutData.athleteId,
        title: workoutData.title,
      });

      try {
        const request: CreateStructuredWorkoutUseCaseRequest = {
          athleteId: workoutData.athleteId,
          title: workoutData.title,
          workoutTypeValueId: workoutData.workoutTypeValueId,
          workoutDay: workoutData.workoutDay,
          structure: workoutData.structure,
          metadata: workoutData.metadata,
        };

        const result =
          await dependencies.createStructuredWorkoutUseCase.execute(request);

        logger.info('Structured workout created successfully', {
          success: result.success,
          workoutId: result.workoutId,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Structured workout creation failed', {
          error: errorMessage,
        });
        throw error;
      }
    },

    /**
     * Create structured workout from simple structure
     */
    createStructuredWorkoutFromSimpleStructure: async (
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
      logger.info('Creating structured workout from simple structure', {
        athleteId,
        title,
        elementsCount: elements.length,
      });

      try {
        const result =
          await dependencies.createStructuredWorkoutUseCase.createFromSimpleStructure(
            athleteId,
            title,
            workoutTypeValueId,
            workoutDay,
            elements
          );

        logger.info('Simple structured workout created successfully', {
          success: result.success,
          workoutId: result.workoutId,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Simple structured workout creation failed', {
          error: errorMessage,
        });
        throw error;
      }
    },

    /**
     * Get workout by ID
     */
    getWorkout: async (workoutId: string): Promise<Workout> => {
      logger.info('Fetching workout', { workoutId });

      try {
        const request: GetWorkoutRequest = { workoutId };
        const result = await dependencies.getWorkoutUseCase.execute(request);

        logger.info('Workout fetched successfully', { workoutId });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to fetch workout', {
          workoutId,
          error: errorMessage,
        });
        throw error;
      }
    },

    /**
     * List workouts with filters
     */
    listWorkouts: async (filters?: {
      startDate?: Date;
      endDate?: Date;
      activityType?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    }): Promise<Workout[]> => {
      logger.info('Listing workouts', { filters });

      try {
        const request: ListWorkoutsRequest = filters || {};
        const result = await dependencies.listWorkoutsUseCase.execute(request);

        logger.info('Workouts listed successfully', { count: result.length });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to list workouts', { error: errorMessage });
        throw error;
      }
    },

    /**
     * Delete workout by ID
     */
    deleteWorkout: async (workoutId: string): Promise<boolean> => {
      logger.info('Deleting workout', { workoutId });

      try {
        const request: DeleteWorkoutRequest = { workoutId };
        const result = await dependencies.deleteWorkoutUseCase.execute(request);

        logger.info('Workout deleted successfully', {
          workoutId,
          success: result,
        });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to delete workout', {
          workoutId,
          error: errorMessage,
        });
        throw error;
      }
    },

    /**
     * Search workouts by criteria
     */
    searchWorkouts: async (query: {
      text?: string;
      activityType?: string;
      dateRange?: {
        start: Date;
        end: Date;
      };
      durationRange?: {
        min: number;
        max: number;
      };
      distanceRange?: {
        min: number;
        max: number;
      };
    }): Promise<Workout[]> => {
      logger.info('Searching workouts', { query });

      try {
        const result =
          await dependencies.workoutRepository.searchWorkouts(query);

        logger.info('Workout search completed', { count: result.length });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Workout search failed', { error: errorMessage });
        throw error;
      }
    },

    /**
     * Get workout statistics
     */
    getWorkoutStats: async (filters?: {
      startDate?: Date;
      endDate?: Date;
      activityType?: string;
    }): Promise<{
      totalWorkouts: number;
      totalDuration: number;
      totalDistance: number;
      averageDuration: number;
      averageDistance: number;
    }> => {
      logger.info('Getting workout statistics', { filters });

      try {
        const result =
          await dependencies.workoutRepository.getWorkoutStats(filters);

        logger.info('Workout statistics retrieved', {
          totalWorkouts: result.totalWorkouts,
        });
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to get workout statistics', {
          error: errorMessage,
        });
        throw error;
      }
    },

    /**
     * Get workout repository for advanced operations
     */
    getWorkoutRepository: () => dependencies.workoutRepository,

    /**
     * Get workout service for advanced operations
     */
    getWorkoutService: () => dependencies.workoutService,

    /**
     * Get configuration
     */
    getConfig: () => config,
  };
};

/**
 * Type definition for the workout manager
 */
export type WorkoutManager = ReturnType<typeof createWorkoutManager>;
