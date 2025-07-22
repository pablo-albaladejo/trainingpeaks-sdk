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
import type { WorkoutFile } from '@/domain';
import { WorkoutUploadError } from '@/domain/errors/workout-errors';
import { networkLogger, workoutLogger } from '@/infrastructure/logging/logger';
import { calculatePlannedMetrics } from '@/infrastructure/services/workout-metrics';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  StructuredWorkoutRequest,
  StructuredWorkoutResponse,
  WorkoutData,
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
        hasFile: !!file,
      });

      // Prepare upload data
      const uploadData = {
        ...workoutData,
        fileData: file
          ? {
              filename: file.fileName,
              content: file.content,
              mimeType: file.mimeType,
            }
          : undefined,
      };

      // Make actual API call to TrainingPeaks
      const response = await this.httpClient.post<{ workoutId: string }>(
        '/fitness/v6/workouts/upload',
        uploadData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: this.sdkConfig.timeouts.default,
        }
      );

      const workoutId = response.data?.workoutId;

      if (!workoutId) {
        throw new WorkoutUploadError(
          'No workout ID received from API response'
        );
      }

      workoutLogger.info(
        'Successfully uploaded workout via TrainingPeaks API',
        {
          workoutId,
          name: workoutData.name,
        }
      );

      return {
        success: true,
        workoutId,
        message: 'Workout uploaded successfully via TrainingPeaks API',
      };
    } catch (error) {
      workoutLogger.error('Failed to upload workout via TrainingPeaks API', {
        name: workoutData.name,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });

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

      // Make actual API call to TrainingPeaks
      const response = await this.httpClient.get<WorkoutData>(
        `/fitness/v6/workouts/${id}`,
        {
          timeout: this.sdkConfig.timeouts.default,
        }
      );

      if (!response.data) {
        workoutLogger.info('Workout not found via TrainingPeaks API', {
          workoutId: id,
        });
        return null;
      }

      workoutLogger.info(
        'Successfully retrieved workout via TrainingPeaks API',
        {
          workoutId: id,
          workoutName: response.data.name,
        }
      );

      return response.data;
    } catch (error) {
      workoutLogger.error('Failed to get workout via TrainingPeaks API', {
        workoutId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
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

      // Build query parameters
      const params: Record<string, string | number> = {};

      if (options?.limit) {
        params.limit = options.limit;
      }

      if (options?.offset) {
        params.offset = options.offset;
      }

      if (options?.startDate) {
        params.startDate = options.startDate.toISOString();
      }

      if (options?.endDate) {
        params.endDate = options.endDate.toISOString();
      }

      // Make actual API call to TrainingPeaks
      const response = await this.httpClient.get<{ workouts: WorkoutData[] }>(
        '/fitness/v6/workouts',
        {
          params,
          timeout: this.sdkConfig.timeouts.default,
        }
      );

      const workouts = response.data?.workouts || [];

      workoutLogger.info('Successfully listed workouts via TrainingPeaks API', {
        count: workouts.length,
        options,
      });

      return workouts;
    } catch (error) {
      workoutLogger.error('Failed to list workouts via TrainingPeaks API', {
        options,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
      return [];
    }
  }

  public async deleteWorkout(id: string): Promise<boolean> {
    try {
      workoutLogger.info('Deleting workout via TrainingPeaks API', {
        workoutId: id,
      });

      // Make actual DELETE API call to TrainingPeaks
      await this.httpClient.delete(`/fitness/v6/workouts/${id}`, {
        timeout: this.sdkConfig.timeouts.default,
      });

      workoutLogger.info('Successfully deleted workout via TrainingPeaks API', {
        workoutId: id,
      });

      return true;
    } catch (error) {
      workoutLogger.error('Failed to delete workout via TrainingPeaks API', {
        workoutId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        errorType: error instanceof Error ? error.constructor.name : 'Unknown',
      });
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

      // Calculate planned metrics automatically if not provided
      const providedMetrics = request.metadata?.plannedMetrics;
      const calculatedMetrics = calculatePlannedMetrics(
        request.structure,
        request.metadata?.athleteWeight || 70,
        request.metadata?.activityType || 'RUN'
      );

      // Use provided metrics if available, otherwise use calculated ones
      const plannedMetrics = {
        totalTimePlanned:
          providedMetrics?.totalTimePlanned ??
          calculatedMetrics.totalTimePlanned,
        tssPlanned: providedMetrics?.tssPlanned ?? calculatedMetrics.tssPlanned,
        ifPlanned: providedMetrics?.ifPlanned ?? calculatedMetrics.ifPlanned,
        velocityPlanned:
          providedMetrics?.velocityPlanned ?? calculatedMetrics.velocityPlanned,
        caloriesPlanned:
          providedMetrics?.caloriesPlanned ?? calculatedMetrics.caloriesPlanned,
        distancePlanned:
          providedMetrics?.distancePlanned ?? calculatedMetrics.distancePlanned,
        elevationGainPlanned:
          providedMetrics?.elevationGainPlanned ??
          calculatedMetrics.elevationGainPlanned,
        energyPlanned:
          providedMetrics?.energyPlanned ?? calculatedMetrics.energyPlanned,
      };

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
        distancePlanned: plannedMetrics.distancePlanned,
        distanceCustomized: null,
        distanceUnitsCustomized: null,
        totalTime: null,
        totalTimePlanned: plannedMetrics.totalTimePlanned,
        heartRateMinimum: null,
        heartRateMaximum: null,
        heartRateAverage: null,
        calories: null,
        caloriesPlanned: plannedMetrics.caloriesPlanned,
        tssActual: null,
        tssPlanned: plannedMetrics.tssPlanned,
        tssSource: 0,
        if: null,
        ifPlanned: plannedMetrics.ifPlanned,
        velocityAverage: null,
        velocityPlanned: plannedMetrics.velocityPlanned,
        velocityMaximum: null,
        normalizedSpeedActual: null,
        normalizedPowerActual: null,
        powerAverage: null,
        powerMaximum: null,
        energy: null,
        energyPlanned: plannedMetrics.energyPlanned,
        elevationGain: null,
        elevationGainPlanned: plannedMetrics.elevationGainPlanned,
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
        structure: request.structure,
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
      workoutLogger.error(
        'Failed to create structured workout via TrainingPeaks API',
        {
          title: request.title,
          athleteId: request.athleteId,
          error: error instanceof Error ? error.message : 'Unknown error',
          errorType:
            error instanceof Error ? error.constructor.name : 'Unknown',
        }
      );

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
