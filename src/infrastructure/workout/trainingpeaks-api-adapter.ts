/**
 * TrainingPeaks API Workout Adapter
 * Implements workout operations using TrainingPeaks API
 */

import axios, { AxiosInstance } from 'axios';
import {
  WorkoutServiceConfig,
  WorkoutServicePort,
} from '@/application/ports/workout';
import { getSDKConfig } from '@/config';
import { Workout } from '@/domain/entities/workout';
import { WorkoutFile } from '@/domain/value-objects/workout-file';

export class TrainingPeaksWorkoutApiAdapter implements WorkoutServicePort {
  private readonly sdkConfig = getSDKConfig();
  private readonly httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      baseURL: this.sdkConfig.urls.apiBaseUrl,
      timeout: this.sdkConfig.timeouts.default,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.sdkConfig.requests.defaultHeaders,
      },
    });
  }

  public canHandle(config: WorkoutServiceConfig): boolean {
    // This adapter handles TrainingPeaks API operations
    return config.baseUrl.includes('trainingpeaks.com');
  }

  public async uploadWorkout(
    workout: Workout,
    config: Required<WorkoutServiceConfig>
  ): Promise<{
    success: boolean;
    workoutId?: string;
    message: string;
    errors?: string[];
  }> {
    try {
      if (config.debug) {
        console.log('Uploading workout via TrainingPeaks API:', workout.name);
      }

      // In a real implementation, this would make actual API calls
      // For now, simulate the upload
      await this.simulateApiCall('upload', workout, config);

      return {
        success: true,
        workoutId: workout.id,
        message: 'Workout uploaded successfully via TrainingPeaks API',
      };
    } catch (error) {
      return {
        success: false,
        message: 'API upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  public async uploadWorkoutFile(
    workoutFile: WorkoutFile,
    metadata: {
      name?: string;
      description?: string;
      activityType?: string;
      tags?: string[];
    },
    config: Required<WorkoutServiceConfig>
  ): Promise<{
    success: boolean;
    workoutId?: string;
    message: string;
    errors?: string[];
  }> {
    try {
      if (config.debug) {
        console.log(
          'Uploading workout file via TrainingPeaks API:',
          workoutFile.fileName
        );
      }

      // In a real implementation, this would make actual API calls with FormData
      await this.simulateApiCall(
        'uploadFile',
        { workoutFile, metadata },
        config
      );

      const workoutId = `workout_${Date.now()}`;
      return {
        success: true,
        workoutId,
        message: 'Workout file uploaded successfully via TrainingPeaks API',
      };
    } catch (error) {
      return {
        success: false,
        message: 'API file upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  public async getWorkout(
    workoutId: string,
    config: Required<WorkoutServiceConfig>
  ): Promise<Workout | null> {
    try {
      if (config.debug) {
        console.log('Getting workout via TrainingPeaks API:', workoutId);
      }

      // In a real implementation, this would make actual API calls
      await this.simulateApiCall('get', workoutId, config);

      // Return mock workout
      return Workout.create(
        workoutId,
        'Sample Workout from API',
        'A workout retrieved from TrainingPeaks API',
        new Date(),
        3600, // 1 hour
        10000, // 10km
        'Running',
        ['api', 'sample']
      );
    } catch (error) {
      if (config.debug) {
        console.error('Failed to get workout:', error);
      }
      return null;
    }
  }

  public async listWorkouts(
    filters: {
      startDate?: Date;
      endDate?: Date;
      activityType?: string;
      tags?: string[];
      limit?: number;
      offset?: number;
    },
    config: Required<WorkoutServiceConfig>
  ): Promise<Workout[]> {
    try {
      if (config.debug) {
        console.log(
          'Listing workouts via TrainingPeaks API with filters:',
          filters
        );
      }

      // In a real implementation, this would make actual API calls with query parameters
      await this.simulateApiCall('list', filters, config);

      // Return mock workouts
      return [
        Workout.create(
          'workout_1',
          'Morning Run',
          'Morning training session',
          new Date(),
          2700, // 45 minutes
          5000, // 5km
          'Running',
          ['morning', 'training']
        ),
        Workout.create(
          'workout_2',
          'Evening Bike',
          'Evening cycling session',
          new Date(Date.now() - 86400000), // Yesterday
          3600, // 1 hour
          20000, // 20km
          'Cycling',
          ['evening', 'cycling']
        ),
      ];
    } catch (error) {
      if (config.debug) {
        console.error('Failed to list workouts:', error);
      }
      return [];
    }
  }

  public async deleteWorkout(
    workoutId: string,
    config: Required<WorkoutServiceConfig>
  ): Promise<boolean> {
    try {
      if (config.debug) {
        console.log('Deleting workout via TrainingPeaks API:', workoutId);
      }

      // In a real implementation, this would make actual DELETE API calls
      await this.simulateApiCall('delete', workoutId, config);

      return true;
    } catch (error) {
      if (config.debug) {
        console.error('Failed to delete workout:', error);
      }
      return false;
    }
  }

  private async simulateApiCall(
    operation: string,
    data: unknown,
    config: Required<WorkoutServiceConfig>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (config.debug) {
        console.log(`Simulating TrainingPeaks API call: ${operation}`, data);
      }

      // Simulate network delay
      setTimeout(() => {
        // Simulate occasional failures for testing
        if (Math.random() < 0.05) {
          // 5% failure rate
          reject(new Error(`Simulated API failure for ${operation}`));
        } else {
          resolve();
        }
      }, 100); // 100ms delay
    });
  }
}
