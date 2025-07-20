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
import { Workout } from '@/domain/entities/workout';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
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
      throw new Error(
        'No suitable workout service found for the current configuration'
      );
    }

    return service;
  };

  const uploadWorkout = async (
    workoutData: WorkoutData,
    file?: WorkoutFile
  ): Promise<UploadResult> => {
    try {
      const workoutService = getWorkoutService();

      return await workoutService.uploadWorkout(workoutData, file);
    } catch (error) {
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
      const workoutFile = WorkoutFile.create(
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
      const workoutService = getWorkoutService();

      return await workoutService.createStructuredWorkout(request);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create structured workout',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  const getWorkout = async (workoutId: string): Promise<Workout | null> => {
    try {
      const workoutService = getWorkoutService();
      const workoutData = await workoutService.getWorkout(workoutId);

      if (!workoutData) {
        return null;
      }

      // Convert WorkoutData to Workout entity
      return Workout.create(
        workoutId,
        workoutData.name,
        workoutData.description || '',
        new Date(workoutData.date || Date.now()),
        workoutData.duration || 0,
        workoutData.distance || 0,
        workoutData.type || 'OTHER',
        []
      );
    } catch (error) {
      console.error('Failed to get workout:', error);
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
      const workoutService = getWorkoutService();
      const workoutDataList = await workoutService.listWorkouts(options);

      // Convert WorkoutData[] to Workout[]
      return workoutDataList.map((workoutData, index) =>
        Workout.create(
          `workout_${index}`,
          workoutData.name,
          workoutData.description || '',
          new Date(workoutData.date || Date.now()),
          workoutData.duration || 0,
          workoutData.distance || 0,
          workoutData.type || 'OTHER',
          []
        )
      );
    } catch (error) {
      console.error('Failed to list workouts:', error);
      return [];
    }
  };

  const updateWorkout = async (
    workoutId: string,
    data: Partial<WorkoutData>
  ): Promise<Workout> => {
    try {
      // Get the existing workout
      const existingWorkout = await getWorkout(workoutId);
      if (!existingWorkout) {
        throw new Error(`Workout with ID ${workoutId} not found`);
      }

      // Update the workout with new metadata
      const updatedWorkout = existingWorkout.withUpdatedMetadata({
        name: data.name,
        description: data.description,
        activityType: data.type,
        tags: [],
      });

      return updatedWorkout;
    } catch (error) {
      throw new Error(
        `Failed to update workout: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const deleteWorkout = async (workoutId: string): Promise<boolean> => {
    try {
      const workoutService = getWorkoutService();

      return await workoutService.deleteWorkout(workoutId);
    } catch (error) {
      console.error('Failed to delete workout:', error);
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
      // For now, use listWorkouts as a simple implementation
      return await listWorkouts({
        limit: query.limit,
        offset: query.offset,
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } catch (error) {
      console.error('Failed to search workouts:', error);
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
      console.error('Failed to get workout stats:', error);
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
