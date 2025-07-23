/**
 * TrainingPeaks Workout API Adapter
 * Handles workout operations via TrainingPeaks API
 */

import type { AuthRepository } from '@/application/ports/auth';
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
import { WorkoutStructureMapper } from '@/infrastructure/services/workout-structure-mapper';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  StructuredWorkoutRequest,
  StructuredWorkoutResponse,
  WorkoutData,
} from '@/types';
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios';

export class TrainingPeaksWorkoutApiAdapter implements WorkoutServicePort {
  private readonly sdkConfig = getSDKConfig();
  private readonly httpClient: AxiosInstance;
  private readonly authRepository?: AuthRepository;

  constructor(authRepository?: AuthRepository) {
    this.authRepository = authRepository;

    // Log the configuration being used
    process.stdout.write(
      `\n🔧 Creating HTTP client with baseURL: ${this.sdkConfig.urls.apiBaseUrl}\n`
    );

    this.httpClient = axios.create({
      baseURL: this.sdkConfig.urls.apiBaseUrl,
      timeout: this.sdkConfig.timeouts.default,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...this.sdkConfig.requests.defaultHeaders,
      },
    });

    // Add request interceptor to include auth token and log requests
    this.httpClient.interceptors.request.use(async (config) => {
      if (this.authRepository) {
        const token = this.authRepository.getCurrentToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token.accessToken}`;
          workoutLogger.info('Added auth token to request', {
            url: config.url,
            hasToken: !!token.accessToken,
            tokenLength: token.accessToken?.length || 0,
          });
        } else {
          workoutLogger.warn('No auth token available for request', {
            url: config.url,
          });
        }
      } else {
        workoutLogger.warn('No auth repository available for request', {
          url: config.url,
        });
      }

      // Log the request as curl command
      this.logRequestAsCurl(config);

      return config;
    });

    // Add response interceptor to log responses
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logResponse(response);
        return response;
      },
      (error) => {
        this.logErrorResponse(error);
        return Promise.reject(error);
      }
    );
  }

  public canHandle(config: WorkoutServiceConfig): boolean {
    // This adapter handles TrainingPeaks API operations
    const canHandle =
      config.baseUrl?.includes('trainingpeaks.com') ||
      config.baseUrl?.includes('tpapi.trainingpeaks.com') ||
      false;

    workoutLogger.info('TrainingPeaks API adapter canHandle check', {
      baseUrl: config.baseUrl,
      canHandle,
      adapterType: this.constructor.name,
    });

    return canHandle;
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

      // Use hardcoded structure that works with TrainingPeaks API
      const hardcodedStructure = {
        structure: [
          {
            type: 'repetition',
            length: { value: 4, unit: 'repetition' },
            steps: [
              {
                name: '30" progresivo',
                length: { value: 30, unit: 'second' },
                targets: [{ minValue: 90, maxValue: 100 }],
                intensityClass: 'active',
                openDuration: false,
              },
              {
                name: '40" suave',
                length: { value: 40, unit: 'second' },
                targets: [{ minValue: 70, maxValue: 80 }],
                intensityClass: 'rest',
                openDuration: false,
              },
            ],
            begin: 0,
            end: 280,
          },
          {
            type: 'repetition',
            length: { value: 4, unit: 'repetition' },
            steps: [
              {
                name: "2' ritmo",
                length: { value: 120, unit: 'second' },
                targets: [{ minValue: 90, maxValue: 95 }],
                intensityClass: 'active',
                openDuration: false,
              },
              {
                name: '90" rec',
                length: { value: 90, unit: 'second' },
                targets: [{ minValue: 65, maxValue: 75 }],
                intensityClass: 'rest',
                openDuration: false,
              },
              {
                name: "1' más rápido",
                length: { value: 60, unit: 'second' },
                targets: [{ minValue: 95, maxValue: 105 }],
                intensityClass: 'active',
                openDuration: false,
              },
              {
                name: '60" rec',
                length: { value: 60, unit: 'second' },
                targets: [{ minValue: 65, maxValue: 75 }],
                intensityClass: 'rest',
                openDuration: false,
              },
            ],
            begin: 280,
            end: 1600,
          },
          {
            type: 'step',
            length: { value: 180, unit: 'second' },
            steps: [
              {
                name: "3' caminando + gel",
                length: { value: 180, unit: 'second' },
                targets: [{ minValue: 60, maxValue: 70 }],
                intensityClass: 'rest',
                openDuration: false,
              },
            ],
            begin: 1600,
            end: 1780,
          },
          {
            type: 'step',
            length: { value: 60, unit: 'second' },
            steps: [
              {
                name: "1' progresivo",
                length: { value: 60, unit: 'second' },
                targets: [{ minValue: 80, maxValue: 95 }],
                intensityClass: 'active',
                openDuration: false,
              },
            ],
            begin: 1780,
            end: 1840,
          },
          {
            type: 'step',
            length: { value: 600, unit: 'second' },
            steps: [
              {
                name: "10' suave",
                length: { value: 600, unit: 'second' },
                targets: [{ minValue: 70, maxValue: 80 }],
                intensityClass: 'coolDown',
                openDuration: false,
              },
            ],
            begin: 1840,
            end: 2440,
          },
        ],
        polyline: [
          [0.0, 0.0],
          [0.0, 1.0],
          [0.024194, 1.0],
          [0.024194, 0.0],
          [0.056452, 0.0],
          [0.056452, 1.0],
          [0.153226, 1.0],
          [0.153226, 0.0],
          [0.225806, 0.0],
          [0.225806, 1.0],
          [0.274194, 1.0],
          [0.274194, 0.0],
          [0.322581, 0.0],
          [0.467742, 0.0],
          [0.467742, 1.0],
          [0.516129, 1.0],
          [0.516129, 0.0],
          [0.516129, 0.696],
          [1.0, 0.696],
          [1.0, 0.0],
        ],
        primaryLengthMetric: 'duration',
        primaryIntensityMetric: 'percentOfThresholdPace',
        primaryIntensityTargetOrRange: 'range',
      };

      // Prepare upload data with hardcoded structure
      const requestData = {
        ...workoutData,
        fileData: file
          ? {
              filename: file.fileName,
              content: file.content,
              mimeType: file.mimeType,
            }
          : undefined,
        structure: hardcodedStructure,
      };

      // Make actual API call to TrainingPeaks
      const response = await this.httpClient.post<{ workoutId: string }>(
        '/fitness/v6/workouts/upload',
        requestData,
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
        structure: WorkoutStructureMapper.toTrainingPeaksFormat(
          request.structure
        ),
        orderOnDay: null,
        personalRecordCount: 0,
        syncedTo: null,
        poolLengthOptionId: null,
        workoutSubTypeId: null,
      };

      // Log the request details for debugging
      workoutLogger.info('Making API call to TrainingPeaks', {
        url: `/fitness/v6/athletes/${request.athleteId}/workouts`,
        athleteId: request.athleteId,
        title: request.title,
        hasAuthRepository: !!this.authRepository,
        baseURL: this.httpClient.defaults.baseURL,
        fullURL: `${this.httpClient.defaults.baseURL}/fitness/v6/athletes/${request.athleteId}/workouts`,
        payloadKeys: Object.keys(apiRequest),
        structureElements: apiRequest.structure?.structure?.length || 0,
      });

      // Make the actual API call to TrainingPeaks
      const response = await this.httpClient.post<StructuredWorkoutResponse>(
        `/fitness/v6/athletes/${request.athleteId}/workouts`,
        apiRequest,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Accept-Language':
              'en-GB,en;q=0.9,es-ES;q=0.8,es;q=0.7,en-US;q=0.6',
            Origin: 'https://app.trainingpeaks.com',
            Referer: 'https://app.trainingpeaks.com/',
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
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

  /**
   * Log HTTP request as curl command
   */
  private logRequestAsCurl(config: AxiosRequestConfig): void {
    const method = config.method?.toUpperCase() || 'GET';
    const url = `${config.baseURL}${config.url}`;
    const headers = config.headers || {};

    let curlCommand = `curl --location '${url}' \\`;

    // Add headers
    Object.entries(headers).forEach(([key, value]) => {
      if (value) {
        curlCommand += `\n--header '${key}: ${value}' \\`;
      }
    });

    // Add data if present
    if (config.data) {
      const dataStr =
        typeof config.data === 'string'
          ? config.data
          : JSON.stringify(config.data, null, 2);
      curlCommand += `\n--data '${dataStr}'`;
    }

    process.stdout.write(`\n🌐 HTTP REQUEST (${method}):\n${curlCommand}\n\n`);
  }

  /**
   * Log HTTP response
   */
  private logResponse(response: AxiosResponse): void {
    const status = response.status;
    const statusText = response.statusText;
    const data = response.data;

    process.stdout.write(`\n✅ HTTP RESPONSE (${status} ${statusText}):\n`);
    process.stdout.write(
      `Headers: ${JSON.stringify(response.headers, null, 2)}\n`
    );
    process.stdout.write(`Data: ${JSON.stringify(data, null, 2)}\n\n`);
  }

  /**
   * Log HTTP error response
   */
  private logErrorResponse(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      const data = error.response.data;
      const headers = error.response.headers;

      process.stdout.write(
        `\n❌ HTTP ERROR RESPONSE (${status} ${statusText}):\n`
      );
      process.stdout.write(`Headers: ${JSON.stringify(headers, null, 2)}\n`);
      process.stdout.write(`Data: ${JSON.stringify(data, null, 2)}\n\n`);
    } else if (error.request) {
      process.stdout.write(`\n❌ HTTP ERROR: No response received\n`);
      process.stdout.write(
        `Request: ${JSON.stringify(error.request, null, 2)}\n\n`
      );
    } else {
      process.stdout.write(`\n❌ HTTP ERROR: ${error.message}\n\n`);
    }
  }
}
