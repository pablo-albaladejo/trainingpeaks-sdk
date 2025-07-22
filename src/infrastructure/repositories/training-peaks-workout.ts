/**
 * TrainingPeaks Workout Repository Implementation
 * Connects domain workout operations to infrastructure adapters
 */

import {
  FileSystemPort,
  UploadResult,
  WorkoutRepository,
  WorkoutServiceConfig,
  WorkoutServicePort,
} from '@/application/ports/workout';
import type { Workout, WorkoutFile } from '@/domain';
import {
  WorkoutNotFoundError,
  WorkoutServiceUnavailableError,
  WorkoutValidationError,
} from '@/domain/errors/workout-errors';
import { workoutLogger } from '@/infrastructure/logging/logger';
import {
  createWorkout,
  createWorkoutFile,
} from '@/infrastructure/services/domain-factories';
import { TrainingPeaksWorkoutApiAdapter } from '@/infrastructure/workout/trainingpeaks-api-adapter';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  WorkoutData,
} from '@/types';

/**
 * TrainingPeaks Workout Repository Factory
 * Creates a TrainingPeaks workout repository with dependency injection
 */
export const createTrainingPeaksWorkoutRepository = (
  fileSystemAdapter: FileSystemPort,
  config: WorkoutServiceConfig
): WorkoutRepository => {
  const workoutServices: WorkoutServicePort[] = [];

  /**
   * Register a workout service adapter
   */
  const registerWorkoutService = (workoutService: WorkoutServicePort): void => {
    workoutServices.push(workoutService);
  };

  /**
   * Get the appropriate workout service for the current configuration
   */
  const getWorkoutService = (): WorkoutServicePort => {
    const service = workoutServices.find((s) => s.canHandle(config));

    if (!service) {
      throw new WorkoutServiceUnavailableError(
        'TrainingPeaks',
        'No suitable workout service found for the current configuration'
      );
    }

    return service;
  };

  // Register the TrainingPeaks API adapter
  const apiAdapter = new TrainingPeaksWorkoutApiAdapter();
  registerWorkoutService(apiAdapter);

  workoutLogger.info(
    'TrainingPeaks workout repository created with API adapter',
    {
      baseUrl: config.baseUrl,
      timeout: config.timeout,
    }
  );

  const uploadWorkout = async (
    workoutData: WorkoutData,
    file?: WorkoutFile
  ): Promise<UploadResult> => {
    try {
      workoutLogger.info('Uploading workout via repository', {
        workoutName: workoutData.name,
        hasFile: !!file,
      });

      const workoutService = getWorkoutService();

      return await workoutService.uploadWorkout(workoutData, file);
    } catch (error) {
      workoutLogger.error('Failed to upload workout via repository', {
        workoutName: workoutData.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });

      return {
        success: false,
        workoutId: '',
        message: 'Failed to upload workout',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  const uploadWorkoutFromFile = async (
    filename: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult> => {
    try {
      workoutLogger.info('Uploading workout from file via repository', {
        filename,
        fileSize: buffer.length,
        mimeType,
      });

      const workoutFile = createWorkoutFile(
        filename,
        buffer.toString(),
        mimeType
      );
      const workoutData: WorkoutData = {
        name: filename,
        description: `Uploaded from file: ${filename}`,
        date: new Date().toISOString(),
        fileData: {
          filename,
          content: buffer,
          mimeType,
        },
      };

      return await uploadWorkout(workoutData, workoutFile);
    } catch (error) {
      workoutLogger.error('Failed to upload workout from file via repository', {
        filename,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });

      return {
        success: false,
        workoutId: '',
        message: 'Failed to upload workout from file',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  const createStructuredWorkout = async (
    request: CreateStructuredWorkoutRequest
  ): Promise<CreateStructuredWorkoutResponse> => {
    try {
      workoutLogger.info('Creating structured workout via repository', {
        title: request.title,
        athleteId: request.athleteId,
      });

      const workoutService = getWorkoutService();

      return await workoutService.createStructuredWorkout(request);
    } catch (error) {
      workoutLogger.error(
        'Failed to create structured workout via repository',
        {
          title: request.title,
          athleteId: request.athleteId,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType:
            error instanceof Error ? error.constructor.name : 'Unknown',
        }
      );

      return {
        success: false,
        message: 'Failed to create structured workout',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  const getWorkout = async (workoutId: string): Promise<Workout | null> => {
    try {
      workoutLogger.info('Getting workout via repository', {
        workoutId,
      });

      const workoutService = getWorkoutService();
      const workoutData = await workoutService.getWorkout(workoutId);

      if (!workoutData) {
        workoutLogger.info('Workout not found via repository', {
          workoutId,
        });
        return null;
      }

      // Convert WorkoutData to Workout entity
      return createWorkout(
        workoutId,
        workoutData.name,
        workoutData.description || '',
        new Date(workoutData.date || Date.now()),
        workoutData.duration || 0,
        workoutData.distance,
        workoutData.type || 'OTHER',
        undefined, // tags not in WorkoutData
        undefined, // fileContent not in WorkoutData
        undefined, // fileName not in WorkoutData
        undefined, // createdAt not in WorkoutData
        undefined, // updatedAt not in WorkoutData
        undefined // structure not in WorkoutData
      );
    } catch (error) {
      workoutLogger.error('Failed to get workout via repository', {
        workoutId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      return null;
    }
  };

  const listWorkouts = async (options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Workout[]> => {
    try {
      workoutLogger.info('Listing workouts via repository', { options });

      const workoutService = getWorkoutService();
      const workoutDataList = await workoutService.listWorkouts(options);

      // Convert WorkoutData[] to Workout[]
      return workoutDataList.map((workoutData, index) =>
        createWorkout(
          `workout_${index}`,
          workoutData.name,
          workoutData.description || '',
          new Date(workoutData.date || Date.now()),
          workoutData.duration || 0,
          workoutData.distance,
          workoutData.type || 'OTHER',
          undefined, // tags not in WorkoutData
          undefined, // fileContent not in WorkoutData
          undefined, // fileName not in WorkoutData
          undefined, // createdAt not in WorkoutData
          undefined, // updatedAt not in WorkoutData
          undefined // structure not in WorkoutData
        )
      );
    } catch (error) {
      workoutLogger.error('Failed to list workouts via repository', {
        options,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      return [];
    }
  };

  const updateWorkout = async (
    workoutId: string,
    data: Partial<WorkoutData>
  ): Promise<Workout> => {
    try {
      workoutLogger.info('Updating workout via repository', {
        workoutId,
        updateFields: Object.keys(data),
      });

      // Get the existing workout
      const existingWorkout = await getWorkout(workoutId);
      if (!existingWorkout) {
        throw new WorkoutNotFoundError(workoutId);
      }

      // Update the workout with new metadata
      const updatedWorkout = createWorkout(
        existingWorkout.id,
        data.name || existingWorkout.name,
        data.description || existingWorkout.description,
        existingWorkout.date,
        existingWorkout.duration,
        existingWorkout.distance,
        data.type || existingWorkout.activityType,
        undefined, // tags
        existingWorkout.fileContent,
        existingWorkout.fileName,
        existingWorkout.createdAt,
        new Date(), // updatedAt
        existingWorkout.structure
      );

      return updatedWorkout;
    } catch (error) {
      workoutLogger.error('Failed to update workout via repository', {
        workoutId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });

      throw new WorkoutValidationError(
        `Failed to update workout: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const deleteWorkout = async (workoutId: string): Promise<boolean> => {
    try {
      workoutLogger.info('Deleting workout via repository', {
        workoutId,
      });

      const workoutService = getWorkoutService();

      return await workoutService.deleteWorkout(workoutId);
    } catch (error) {
      workoutLogger.error('Failed to delete workout via repository', {
        workoutId,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      return false;
    }
  };

  const searchWorkouts = async (query: {
    name?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Workout[]> => {
    try {
      workoutLogger.info('Searching workouts via repository', { query });

      // For now, use listWorkouts as a simple implementation
      return await listWorkouts({
        limit: query.limit,
        offset: query.offset,
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } catch (error) {
      workoutLogger.error('Failed to search workouts via repository', {
        query,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      return [];
    }
  };

  const getWorkoutStats = async (filters?: {
    startDate?: Date;
    endDate?: Date;
    workoutType?: string;
  }): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    totalDistance: number;
    averageDuration: number;
    averageDistance: number;
  }> => {
    try {
      workoutLogger.info('Getting workout stats via repository', { filters });

      const workouts = await listWorkouts({
        startDate: filters?.startDate,
        endDate: filters?.endDate,
      });

      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
      const totalDistance = workouts.reduce(
        (sum, w) => sum + (w.distance || 0),
        0
      );
      const averageDuration =
        totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
      const averageDistance =
        totalWorkouts > 0 ? totalDistance / totalWorkouts : 0;

      return {
        totalWorkouts,
        totalDuration,
        totalDistance,
        averageDuration,
        averageDistance,
      };
    } catch (error) {
      workoutLogger.error('Failed to get workout stats via repository', {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalDistance: 0,
        averageDuration: 0,
        averageDistance: 0,
      };
    }
  };

  return {
    getWorkout,
    listWorkouts,
    deleteWorkout,
    createStructuredWorkout,
    uploadWorkout,
    uploadWorkoutFromFile,
    updateWorkout,
    searchWorkouts,
    getWorkoutStats,
  };
};
