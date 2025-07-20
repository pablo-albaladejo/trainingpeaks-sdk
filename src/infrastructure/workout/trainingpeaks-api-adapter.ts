/**
 * TrainingPeaks Workout API Adapter
 * Handles workout operations via TrainingPeaks API
 */

import {
  UploadResult,
  WorkoutServiceConfig,
  WorkoutServicePort,
} from '@/application/ports/workout';
import { getSDKConfig } from '@/config';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import { networkLogger, workoutLogger } from '@/infrastructure/logging/logger';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  StructuredWorkoutRequest,
  StructuredWorkoutResponse,
  WorkoutData,
  WorkoutStructure,
  WorkoutType,
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
    workoutData: WorkoutData,
    file?: WorkoutFile
  ): Promise<UploadResult> {
    try {
      workoutLogger.info('Uploading workout via TrainingPeaks API', {
        name: workoutData.name,
      });

      // In a real implementation, this would make actual API calls
      // For now, simulate the upload
      await this.simulateApiCall('upload', workoutData);

      return {
        success: true,
        workoutId: `workout_${Date.now()}`,
        message: 'Workout uploaded successfully via TrainingPeaks API',
      };
    } catch (error) {
      return {
        success: false,
        workoutId: '',
        message: 'API upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  public async getWorkout(id: string): Promise<WorkoutData | null> {
    try {
      workoutLogger.info('Getting workout via TrainingPeaks API', {
        workoutId: id,
      });

      // In a real implementation, this would make actual GET API calls
      await this.simulateApiCall('get', id);

      // Return mock workout data
      return {
        name: 'API Retrieved Workout',
        description: 'Retrieved from TrainingPeaks API',
        date: new Date().toISOString(),
        duration: 3600, // 1 hour
        distance: 5000, // 5km
        type: WorkoutType.RUN,
      };
    } catch (error) {
      if (this.sdkConfig.debug.enabled) {
        console.error('Failed to get workout:', error);
      }
      return null;
    }
  }

  public async listWorkouts(options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<WorkoutData[]> {
    try {
      workoutLogger.info('Listing workouts via TrainingPeaks API', { options });

      // In a real implementation, this would make actual API calls with query parameters
      await this.simulateApiCall('list', options);

      // Return mock workouts
      return [
        {
          name: 'Morning Run',
          description: 'Morning training session',
          date: new Date().toISOString(),
          duration: 2700, // 45 minutes
          distance: 5000, // 5km
          type: WorkoutType.RUN,
        },
        {
          name: 'Evening Bike',
          description: 'Evening cycling session',
          date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          duration: 3600, // 1 hour
          distance: 20000, // 20km
          type: WorkoutType.BIKE,
        },
      ];
    } catch (error) {
      if (this.sdkConfig.debug.enabled) {
        console.error('Failed to list workouts:', error);
      }
      return [];
    }
  }

  public async deleteWorkout(id: string): Promise<boolean> {
    try {
      workoutLogger.info('Deleting workout via TrainingPeaks API', {
        workoutId: id,
      });

      // In a real implementation, this would make actual DELETE API calls
      await this.simulateApiCall('delete', id);

      return true;
    } catch (error) {
      workoutLogger.error('Failed to delete workout', { workoutId: id, error });
      return false;
    }
  }

  public async createStructuredWorkout(
    request: CreateStructuredWorkoutRequest
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
            'Content-Type': 'application/json',
          },
          timeout: this.sdkConfig.timeouts.default,
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
      if (this.sdkConfig.debug.enabled) {
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

  private async simulateApiCall(
    operation: string,
    data: unknown
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
