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
} from '@/types';

/**
 * TrainingPeaks Workout Repository Factory
 * Creates a TrainingPeaks workout repository with dependency injection
 */
export const createTrainingPeaksWorkoutRepository = (
  fileSystemAdapter: FileSystemPort,
  config: WorkoutServiceConfig
) => {
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

  const getFullConfig = (): Required<WorkoutServiceConfig> => {
    return {
      baseUrl: config.baseUrl || 'https://api.trainingpeaks.com',
      timeout: config.timeout || 30000,
      debug: config.debug || false,
      headers: config.headers || {},
    };
  };

  const uploadWorkout = async (workout: Workout): Promise<UploadResult> => {
    try {
      const workoutService = getWorkoutService();
      const fullConfig = getFullConfig();

      return await workoutService.uploadWorkout(workout, fullConfig);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload workout',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  const uploadWorkoutFromFile = async (
    workoutFile: WorkoutFile,
    metadata?: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
    }
  ): Promise<UploadResult> => {
    try {
      const workoutService = getWorkoutService();
      const fullConfig = getFullConfig();

      return await workoutService.uploadWorkoutFile(
        workoutFile,
        metadata || {},
        fullConfig
      );
    } catch (error) {
      return {
        success: false,
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
      const fullConfig = getFullConfig();

      return await workoutService.createStructuredWorkout(request, fullConfig);
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
      const fullConfig = getFullConfig();

      return await workoutService.getWorkout(workoutId, fullConfig);
    } catch (error) {
      console.error('Failed to get workout:', error);
      return null;
    }
  };

  const listWorkouts = async (filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Workout[]> => {
    try {
      const workoutService = getWorkoutService();
      const fullConfig = getFullConfig();

      return await workoutService.listWorkouts(filters || {}, fullConfig);
    } catch (error) {
      console.error('Failed to list workouts:', error);
      return [];
    }
  };

  const updateWorkout = async (
    workoutId: string,
    updates: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
    }
  ): Promise<Workout> => {
    try {
      // Get the existing workout
      const existingWorkout = await getWorkout(workoutId);
      if (!existingWorkout) {
        throw new Error(`Workout with ID ${workoutId} not found`);
      }

      // Update the workout with new metadata
      const updatedWorkout = existingWorkout.withUpdatedMetadata(updates);

      // In a real implementation, this would make an API call to update the workout
      // For now, we'll just return the updated workout
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
      const fullConfig = getFullConfig();

      return await workoutService.deleteWorkout(workoutId, fullConfig);
    } catch (error) {
      console.error('Failed to delete workout:', error);
      return false;
    }
  };

  const searchWorkouts = async (query: {
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
    try {
      // Get all workouts and filter them
      const allWorkouts = await listWorkouts();

      return allWorkouts.filter((workout) => {
        // Text search
        if (query.text) {
          const searchText = query.text.toLowerCase();
          const workoutText =
            `${workout.name} ${workout.description}`.toLowerCase();
          if (!workoutText.includes(searchText)) {
            return false;
          }
        }

        // Activity type filter
        if (query.activityType && workout.activityType !== query.activityType) {
          return false;
        }

        // Date range filter
        if (query.dateRange) {
          if (
            workout.date < query.dateRange.start ||
            workout.date > query.dateRange.end
          ) {
            return false;
          }
        }

        // Duration range filter
        if (query.durationRange) {
          if (
            workout.duration < query.durationRange.min ||
            workout.duration > query.durationRange.max
          ) {
            return false;
          }
        }

        // Distance range filter
        if (query.distanceRange && workout.distance) {
          if (
            workout.distance < query.distanceRange.min ||
            workout.distance > query.distanceRange.max
          ) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      console.error('Failed to search workouts:', error);
      return [];
    }
  };

  const getWorkoutStats = async (filters?: {
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
    try {
      const workouts = await listWorkouts(filters);

      const totalWorkouts = workouts.length;
      const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
      const totalDistance = workouts.reduce(
        (sum, w) => sum + (w.distance || 0),
        0
      );

      return {
        totalWorkouts,
        totalDuration,
        totalDistance,
        averageDuration: totalWorkouts > 0 ? totalDuration / totalWorkouts : 0,
        averageDistance: totalWorkouts > 0 ? totalDistance / totalWorkouts : 0,
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

  const readWorkoutFile = async (filePath: string): Promise<WorkoutFile> => {
    try {
      const exists = await fileSystemAdapter.fileExists(filePath);
      if (!exists) {
        throw new Error(`Workout file not found: ${filePath}`);
      }

      const content = await fileSystemAdapter.readFile(filePath);
      const fileName = filePath.split('/').pop() || 'workout.tcx';
      const mimeType = getMimeTypeFromFileName(fileName);

      return WorkoutFile.create(fileName, content, mimeType);
    } catch (error) {
      throw new Error(
        `Failed to read workout file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  };

  const getMimeTypeFromFileName = (fileName: string): string => {
    const extension = fileName.toLowerCase().split('.').pop();

    switch (extension) {
      case 'tcx':
        return 'application/vnd.garmin.tcx+xml';
      case 'gpx':
        return 'application/gpx+xml';
      case 'fit':
        return 'application/vnd.ant.fit';
      case 'xml':
        return 'application/xml';
      default:
        return 'application/octet-stream';
    }
  };

  // Return the repository interface and register function
  const repository: WorkoutRepository = {
    uploadWorkout,
    uploadWorkoutFromFile,
    createStructuredWorkout,
    getWorkout,
    listWorkouts,
    updateWorkout,
    deleteWorkout,
    searchWorkouts,
    getWorkoutStats,
  };

  return {
    repository,
    registerWorkoutService,
    readWorkoutFile,
  };
};

// Export the type for dependency injection
export type TrainingPeaksWorkoutRepository = ReturnType<
  typeof createTrainingPeaksWorkoutRepository
>;
