/**
 * TrainingPeaks Workout API Adapter
 * Handles workout operations via TrainingPeaks API
 */

import {
  WorkoutServiceConfig,
  WorkoutServicePort,
} from '@/application/ports/workout';
import { getSDKConfig } from '@/config';
import { Workout } from '@/domain/entities/workout';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import { networkLogger, workoutLogger } from '@/infrastructure/logging/logger';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  StructuredWorkoutRequest,
  StructuredWorkoutResponse,
  WorkoutStructure,
} from '@/types';
import axios, { AxiosInstance } from 'axios';

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
    return config.baseUrl?.includes('trainingpeaks.com') || false;
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
      workoutLogger.info('Uploading workout via TrainingPeaks API', {
        name: workout.name,
      });

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
      workoutLogger.info('Uploading workout file via TrainingPeaks API', {
        fileName: workoutFile.fileName,
      });

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

  public async createStructuredWorkout(
    request: CreateStructuredWorkoutRequest,
    config: Required<WorkoutServiceConfig>
  ): Promise<CreateStructuredWorkoutResponse> {
    try {
      workoutLogger.info('Creating structured workout via TrainingPeaks API', {
        title: request.title,
        athleteId: request.athleteId,
      });

      // Build the full API request payload
      const apiRequest: StructuredWorkoutRequest = {
        athleteId: request.athleteId,
        title: request.title,
        workoutTypeValueId: request.workoutTypeValueId,
        code: request.metadata?.code || null,
        workoutDay: request.workoutDay,
        startTime: null,
        startTimePlanned: null,
        isItAnOr: false,
        isHidden: null,
        completed: null,
        description: request.metadata?.description || null,
        userTags: request.metadata?.userTags || '',
        coachComments: request.metadata?.coachComments || null,
        workoutComments: [],
        newComment: null,
        hasPrivateWorkoutCommentForCaller: false,
        hasPrivateWorkoutNoteForCaller: false,
        publicSettingValue: request.metadata?.publicSettingValue || 2,
        distance: null,
        distancePlanned:
          request.metadata?.plannedMetrics?.distancePlanned || null,
        distanceCustomized: null,
        distanceUnitsCustomized: null,
        totalTime: null,
        totalTimePlanned:
          request.metadata?.plannedMetrics?.totalTimePlanned || null,
        heartRateMinimum: null,
        heartRateMaximum: null,
        heartRateAverage: null,
        calories: null,
        caloriesPlanned:
          request.metadata?.plannedMetrics?.caloriesPlanned || null,
        tssActual: null,
        tssPlanned: request.metadata?.plannedMetrics?.tssPlanned || null,
        tssSource: 0,
        if: null,
        ifPlanned: request.metadata?.plannedMetrics?.ifPlanned || null,
        velocityAverage: null,
        velocityPlanned:
          request.metadata?.plannedMetrics?.velocityPlanned || null,
        velocityMaximum: null,
        normalizedSpeedActual: null,
        normalizedPowerActual: null,
        powerAverage: null,
        powerMaximum: null,
        energy: null,
        energyPlanned: request.metadata?.plannedMetrics?.energyPlanned || null,
        elevationGain: null,
        elevationGainPlanned:
          request.metadata?.plannedMetrics?.elevationGainPlanned || null,
        elevationLoss: null,
        elevationMinimum: null,
        elevationAverage: null,
        elevationMaximum: null,
        torqueAverage: null,
        torqueMaximum: null,
        tempMin: null,
        tempAvg: null,
        tempMax: null,
        cadenceAverage: null,
        cadenceMaximum: null,
        lastModifiedDate: new Date().toISOString(),
        equipmentBikeId: request.metadata?.equipment?.bikeId || null,
        equipmentShoeId: request.metadata?.equipment?.shoeId || null,
        isLocked: null,
        complianceDurationPercent: null,
        complianceDistancePercent: null,
        complianceTssPercent: null,
        rpe: null,
        feeling: null,
        structure: request.structure.toApiFormat() as WorkoutStructure,
        orderOnDay: null,
        personalRecordCount: 0,
        syncedTo: null,
        poolLengthOptionId: null,
        workoutSubTypeId: null,
      };

      // Make the actual API call
      const response = await this.httpClient.post<StructuredWorkoutResponse>(
        `/fitness/v6/athletes/${request.athleteId}/workouts`,
        apiRequest,
        {
          headers: {
            ...config.headers,
            'Content-Type': 'application/json',
          },
          timeout: config.timeout,
        }
      );

      workoutLogger.info('Structured workout created successfully', {
        workoutId: response.data.workoutId,
      });

      return {
        success: true,
        workoutId: response.data.workoutId,
        message: 'Structured workout created successfully',
        workout: response.data,
      };
    } catch (error) {
      if (config.debug) {
        console.error('Failed to create structured workout:', error);
      }

      let errorMessage = 'Failed to create structured workout';
      let errors: string[] = [];

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message;
        errors = error.response?.data?.errors || [error.message];
      } else if (error instanceof Error) {
        errorMessage = error.message;
        errors = [error.message];
      }

      return {
        success: false,
        message: errorMessage,
        errors,
      };
    }
  }

  public async getWorkout(
    workoutId: string,
    config: Required<WorkoutServiceConfig>
  ): Promise<Workout | null> {
    try {
      workoutLogger.info('Getting workout via TrainingPeaks API', {
        workoutId,
      });

      // In a real implementation, this would make actual GET API calls
      await this.simulateApiCall('get', workoutId, config);

      // Return mock workout
      return Workout.create(
        workoutId,
        'API Retrieved Workout',
        'Retrieved from TrainingPeaks API',
        new Date(),
        3600, // 1 hour
        5000, // 5km
        'Running',
        ['api', 'retrieved']
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
      workoutLogger.info('Listing workouts via TrainingPeaks API', { filters });

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
      workoutLogger.info('Deleting workout via TrainingPeaks API', {
        workoutId,
      });

      // In a real implementation, this would make actual DELETE API calls
      await this.simulateApiCall('delete', workoutId, config);

      return true;
    } catch (error) {
      workoutLogger.error('Failed to delete workout', { workoutId, error });
      return false;
    }
  }

  private async simulateApiCall(
    operation: string,
    data: unknown,
    config: Required<WorkoutServiceConfig>
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      networkLogger.debug(`Simulating TrainingPeaks API call: ${operation}`, {
        data,
      });

      // Simulate network delay
      setTimeout(() => {
        resolve();
      }, 100); // 100ms delay
    });
  }
}
