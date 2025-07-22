/**
 * TrainingPeaks Workout API Adapter Tests
 * Tests for the TrainingPeaks API adapter implementation
 */

import { WorkoutServiceConfig } from '@/application/ports/workout';
import { getSDKConfig } from '@/config';
import { workoutLogger } from '@/infrastructure/logging/logger';
import {
  CreateStructuredWorkoutRequest,
  StructuredWorkoutResponse,
} from '@/types';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, MockedFunction, vi } from 'vitest';
import { StructuredWorkoutDataFixture } from '../../__fixtures__/structured-workout-data.fixture';
import { WorkoutDataFixture } from '../../__fixtures__/workout-data.fixture';
import { createWorkoutFile } from '../../infrastructure/services/domain-factories';
import { TrainingPeaksWorkoutApiAdapter } from './trainingpeaks-api-adapter';

// Mock external dependencies - must be at the top level
vi.mock('@/config', () => ({
  getSDKConfig: vi.fn(() => ({
    urls: {
      baseUrl: 'https://trainingpeaks.com',
      apiBaseUrl: 'https://api.trainingpeaks.com',
      loginUrl: 'https://trainingpeaks.com/login',
      appUrl: 'https://trainingpeaks.com/app',
    },
    timeouts: {
      default: 30000,
      webAuth: 60000,
      apiAuth: 15000,
      elementWait: 5000,
      pageLoad: 30000,
      errorDetection: 2000,
      testExecution: 120000,
    },
    debug: {
      enabled: false,
      logAuth: false,
      logNetwork: false,
      logBrowser: false,
    },
    requests: {
      defaultHeaders: {
        'User-Agent': 'TrainingPeaks SDK',
        'X-SDK-Version': '1.0.0',
      },
    },
  })),
}));

vi.mock('axios');
vi.mock('@/infrastructure/logging/logger', () => ({
  workoutLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
  networkLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('TrainingPeaks Workout API Adapter', () => {
  let adapter: TrainingPeaksWorkoutApiAdapter;
  let mockHttpClient: {
    get: MockedFunction<any>;
    post: MockedFunction<any>;
    delete: MockedFunction<any>;
  };
  let mockSDKConfig: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock SDK config (already defined in vi.mock above)
    mockSDKConfig = {
      urls: {
        baseUrl: 'https://trainingpeaks.com',
        apiBaseUrl: 'https://api.trainingpeaks.com',
        loginUrl: 'https://trainingpeaks.com/login',
        appUrl: 'https://trainingpeaks.com/app',
      },
      timeouts: {
        default: 30000,
        webAuth: 60000,
        apiAuth: 15000,
        elementWait: 5000,
        pageLoad: 30000,
        errorDetection: 2000,
        testExecution: 120000,
      },
      debug: {
        enabled: false,
        logAuth: false,
        logNetwork: false,
        logBrowser: false,
      },
      requests: {
        defaultHeaders: {
          'User-Agent': 'TrainingPeaks SDK',
          'X-SDK-Version': '1.0.0',
        },
      },
    };

    // Mock HTTP client
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    };

    vi.mocked(axios.create).mockReturnValue(mockHttpClient as any);

    adapter = new TrainingPeaksWorkoutApiAdapter();
  });

  describe('constructor', () => {
    it('should create axios client with correct configuration', () => {
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: mockSDKConfig.urls.apiBaseUrl,
        timeout: mockSDKConfig.timeouts.default,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'TrainingPeaks SDK',
          'X-SDK-Version': '1.0.0',
        },
      });
    });

    it('should get SDK config on construction', () => {
      expect(getSDKConfig).toHaveBeenCalled();
    });
  });

  describe('canHandle', () => {
    it('should return true for TrainingPeaks API URLs', () => {
      // Arrange
      const config: WorkoutServiceConfig = {
        baseUrl: 'https://api.trainingpeaks.com',
        timeout: 30000,
        retries: 3,
        headers: {},
      };

      // Act & Assert
      expect(adapter.canHandle(config)).toBe(true);
    });

    it('should return true for TrainingPeaks main URLs', () => {
      // Arrange
      const config: WorkoutServiceConfig = {
        baseUrl: 'https://trainingpeaks.com',
        timeout: 30000,
        retries: 3,
        headers: {},
      };

      // Act & Assert
      expect(adapter.canHandle(config)).toBe(true);
    });

    it('should return false for non-TrainingPeaks URLs', () => {
      // Arrange
      const config: WorkoutServiceConfig = {
        baseUrl: 'https://other-service.com',
        timeout: 30000,
        retries: 3,
        headers: {},
      };

      // Act & Assert
      expect(adapter.canHandle(config)).toBe(false);
    });

    it('should return false when baseUrl is undefined', () => {
      // Arrange
      const config: WorkoutServiceConfig = {
        baseUrl: undefined,
        timeout: 30000,
        retries: 3,
        headers: {},
      };

      // Act & Assert
      expect(adapter.canHandle(config)).toBe(false);
    });
  });

  describe('uploadWorkout', () => {
    it('should successfully upload workout without file', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const mockResponse: AxiosResponse = {
        data: { workoutId: 'workout-123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.uploadWorkout(workoutData);

      // Assert
      expect(result).toEqual({
        success: true,
        workoutId: 'workout-123',
        message: 'Workout uploaded successfully via TrainingPeaks API',
      });
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/fitness/v6/workouts/upload',
        expect.objectContaining({
          name: workoutData.name,
          description: workoutData.description,
          fileData: undefined,
        }),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          timeout: mockSDKConfig.timeouts.default,
        })
      );
      expect(workoutLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should successfully upload workout with file', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const file = createWorkoutFile(
        'test.tcx',
        '<tcx>...</tcx>',
        'application/tcx+xml'
      );
      const mockResponse: AxiosResponse = {
        data: { workoutId: 'workout-123' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.uploadWorkout(workoutData, file);

      // Assert
      expect(result).toEqual({
        success: true,
        workoutId: 'workout-123',
        message: 'Workout uploaded successfully via TrainingPeaks API',
      });
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/fitness/v6/workouts/upload',
        expect.objectContaining({
          name: workoutData.name,
          fileData: {
            filename: 'test.tcx',
            content: '<tcx>...</tcx>',
            mimeType: 'application/tcx+xml',
          },
        }),
        expect.any(Object)
      );
    });

    it('should throw error when no workout ID received', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const mockResponse: AxiosResponse = {
        data: {}, // No workoutId
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.uploadWorkout(workoutData);

      // Assert
      expect(result).toEqual({
        success: false,
        workoutId: '',
        message: 'API upload failed',
        errors: ['No workout ID received from API response'],
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to upload workout via TrainingPeaks API',
        expect.objectContaining({
          error: 'No workout ID received from API response',
          errorType: 'WorkoutUploadError',
        })
      );
    });

    it('should handle HTTP error responses', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const error = new Error('Network error');
      mockHttpClient.post.mockRejectedValue(error);

      // Act
      const result = await adapter.uploadWorkout(workoutData);

      // Assert
      expect(result).toEqual({
        success: false,
        workoutId: '',
        message: 'API upload failed',
        errors: ['Network error'],
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to upload workout via TrainingPeaks API',
        expect.objectContaining({
          error: 'Network error',
          errorType: 'Error',
        })
      );
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      mockHttpClient.post.mockRejectedValue('String error');

      // Act
      const result = await adapter.uploadWorkout(workoutData);

      // Assert
      expect(result).toEqual({
        success: false,
        workoutId: '',
        message: 'API upload failed',
        errors: ['Unknown error'],
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to upload workout via TrainingPeaks API',
        expect.objectContaining({
          error: 'Unknown error',
          errorType: 'Unknown',
        })
      );
    });
  });

  describe('getWorkout', () => {
    it('should successfully get workout', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const workoutData = WorkoutDataFixture.default();
      const mockResponse: AxiosResponse = {
        data: workoutData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.getWorkout(workoutId);

      // Assert
      expect(result).toEqual(workoutData);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/fitness/v6/workouts/${workoutId}`,
        expect.objectContaining({
          timeout: mockSDKConfig.timeouts.default,
        })
      );
      expect(workoutLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should return null when workout not found', async () => {
      // Arrange
      const workoutId = 'nonexistent-workout';
      const mockResponse: AxiosResponse = {
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.getWorkout(workoutId);

      // Assert
      expect(result).toBeNull();
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Workout not found via TrainingPeaks API',
        expect.objectContaining({
          workoutId,
        })
      );
    });

    it('should return null when response has no data', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const mockResponse: AxiosResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.getWorkout(workoutId);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle get workout error and return null', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const error = new Error('API error');
      mockHttpClient.get.mockRejectedValue(error);

      // Act
      const result = await adapter.getWorkout(workoutId);

      // Assert
      expect(result).toBeNull();
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to get workout via TrainingPeaks API',
        expect.objectContaining({
          workoutId,
          error: 'API error',
          errorType: 'Error',
        })
      );
    });

    it('should handle unknown error types in getWorkout', async () => {
      // Arrange
      const workoutId = 'workout-123';
      mockHttpClient.get.mockRejectedValue(42);

      // Act
      const result = await adapter.getWorkout(workoutId);

      // Assert
      expect(result).toBeNull();
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to get workout via TrainingPeaks API',
        expect.objectContaining({
          error: 'Unknown error',
          errorType: 'Unknown',
        })
      );
    });
  });

  describe('listWorkouts', () => {
    it('should successfully list workouts without options', async () => {
      // Arrange
      const workouts = [
        WorkoutDataFixture.default(),
        new WorkoutDataFixture().withName('Workout 2').build(),
      ];
      const mockResponse: AxiosResponse = {
        data: { workouts },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.listWorkouts();

      // Assert
      expect(result).toEqual(workouts);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/fitness/v6/workouts',
        expect.objectContaining({
          params: {},
          timeout: mockSDKConfig.timeouts.default,
        })
      );
      expect(workoutLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should successfully list workouts with all options', async () => {
      // Arrange
      const options = {
        limit: 10,
        offset: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };
      const workouts = [WorkoutDataFixture.default()];
      const mockResponse: AxiosResponse = {
        data: { workouts },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.listWorkouts(options);

      // Assert
      expect(result).toEqual(workouts);
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/fitness/v6/workouts',
        expect.objectContaining({
          params: {
            limit: 10,
            offset: 20,
            startDate: '2024-01-01T00:00:00.000Z',
            endDate: '2024-01-31T00:00:00.000Z',
          },
          timeout: mockSDKConfig.timeouts.default,
        })
      );
    });

    it('should handle partial options', async () => {
      // Arrange
      const options = {
        limit: 5,
        startDate: new Date('2024-01-01'),
        // No offset or endDate
      };
      const workouts = [WorkoutDataFixture.default()];
      const mockResponse: AxiosResponse = {
        data: { workouts },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.listWorkouts(options);

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/fitness/v6/workouts',
        expect.objectContaining({
          params: {
            limit: 5,
            startDate: '2024-01-01T00:00:00.000Z',
          },
        })
      );
    });

    it('should return empty array when no workouts in response', async () => {
      // Arrange
      const mockResponse: AxiosResponse = {
        data: { workouts: null },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.listWorkouts();

      // Assert
      expect(result).toEqual([]);
    });

    it('should return empty array when response has no data', async () => {
      // Arrange
      const mockResponse: AxiosResponse = {
        data: null,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.listWorkouts();

      // Assert
      expect(result).toEqual([]);
    });

    it('should handle list workouts error and return empty array', async () => {
      // Arrange
      const error = new Error('List error');
      mockHttpClient.get.mockRejectedValue(error);

      // Act
      const result = await adapter.listWorkouts();

      // Assert
      expect(result).toEqual([]);
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to list workouts via TrainingPeaks API',
        expect.objectContaining({
          error: 'List error',
          errorType: 'Error',
        })
      );
    });

    it('should ignore falsy option values', async () => {
      // Arrange
      const options = {
        limit: 0,
        offset: 0,
        startDate: undefined,
        endDate: undefined,
      };
      const workouts = [WorkoutDataFixture.default()];
      const mockResponse: AxiosResponse = {
        data: { workouts },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.listWorkouts(options);

      // Assert
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/fitness/v6/workouts',
        expect.objectContaining({
          params: {}, // Empty params since all values are falsy
        })
      );
    });
  });

  describe('deleteWorkout', () => {
    it('should successfully delete workout', async () => {
      // Arrange
      const workoutId = 'workout-123';
      mockHttpClient.delete.mockResolvedValue({ status: 200 });

      // Act
      const result = await adapter.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(true);
      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        `/fitness/v6/workouts/${workoutId}`,
        expect.objectContaining({
          timeout: mockSDKConfig.timeouts.default,
        })
      );
      expect(workoutLogger.info).toHaveBeenCalledTimes(2);
    });

    it('should handle delete workout error and return false', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const error = new Error('Delete error');
      mockHttpClient.delete.mockRejectedValue(error);

      // Act
      const result = await adapter.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(false);
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to delete workout via TrainingPeaks API',
        expect.objectContaining({
          workoutId,
          error: 'Delete error',
          errorType: 'Error',
        })
      );
    });

    it('should handle unknown error types in deleteWorkout', async () => {
      // Arrange
      const workoutId = 'workout-123';
      mockHttpClient.delete.mockRejectedValue('String error');

      // Act
      const result = await adapter.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(false);
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to delete workout via TrainingPeaks API',
        expect.objectContaining({
          error: 'Unknown error',
          errorType: 'Unknown',
        })
      );
    });
  });

  describe('createStructuredWorkout', () => {
    it('should successfully create structured workout with minimal metadata', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest = {
        athleteId: 12345,
        title: 'Test Structured Workout',
        workoutTypeValueId: 3,
        workoutDay: '2024-01-15T00:00:00.000Z',
        structure: StructuredWorkoutDataFixture.default().structure,
      };

      const mockResponseData: StructuredWorkoutResponse = {
        workoutId: 123,
        athleteId: 12345,
        title: 'Test Structured Workout',
        workoutTypeValueId: 3,
        workoutDay: '2024-01-15T00:00:00.000Z',
        structure: request.structure as any,
        isItAnOr: false,
      };

      const mockResponse: AxiosResponse = {
        data: mockResponseData,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.createStructuredWorkout(request);

      // Assert
      expect(result).toEqual({
        success: true,
        workoutId: 123,
        message: 'Structured workout created successfully',
        workout: mockResponseData,
      });
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/fitness/v6/athletes/${request.athleteId}/workouts`,
        expect.objectContaining({
          athleteId: request.athleteId,
          title: request.title,
          workoutTypeValueId: request.workoutTypeValueId,
          workoutDay: request.workoutDay,
          structure: request.structure,
        }),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          timeout: mockSDKConfig.timeouts.default,
        })
      );
    });

    it('should successfully create structured workout with full metadata', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest = {
        athleteId: 12345,
        title: 'Complex Structured Workout',
        workoutTypeValueId: 3,
        workoutDay: '2024-01-15T00:00:00.000Z',
        structure: StructuredWorkoutDataFixture.withIntervals().structure,
        metadata: {
          code: 'WKT001',
          description: 'High intensity interval training',
          userTags: 'intervals, high-intensity',
          coachComments: 'Focus on maintaining pace',
          publicSettingValue: 1,
          plannedMetrics: {
            totalTimePlanned: 3600,
            tssPlanned: 95.5,
            ifPlanned: 0.85,
            velocityPlanned: 15.5,
            caloriesPlanned: 800,
            distancePlanned: 25000,
            elevationGainPlanned: 500,
            energyPlanned: 2500,
          },
          equipment: {
            bikeId: 456,
            shoeId: 789,
          },
        },
      };

      const mockResponseData: StructuredWorkoutResponse = {
        workoutId: 123,
        athleteId: request.athleteId,
        title: request.title,
        workoutTypeValueId: request.workoutTypeValueId,
        workoutDay: request.workoutDay,
        structure: request.structure as any,
        isItAnOr: false,
        code: 'WKT001',
        description: 'High intensity interval training',
      };

      const mockResponse: AxiosResponse = {
        data: mockResponseData,
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.createStructuredWorkout(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.workoutId).toBe(123);
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/fitness/v6/athletes/${request.athleteId}/workouts`,
        expect.objectContaining({
          athleteId: request.athleteId,
          title: request.title,
          code: 'WKT001',
          description: 'High intensity interval training',
          userTags: 'intervals, high-intensity',
          coachComments: 'Focus on maintaining pace',
          publicSettingValue: 1,
          totalTimePlanned: 3600,
          tssPlanned: 95.5,
          ifPlanned: 0.85,
          velocityPlanned: 15.5,
          caloriesPlanned: 800,
          distancePlanned: 25000,
          elevationGainPlanned: 500,
          energyPlanned: 2500,
          equipmentBikeId: 456,
          equipmentShoeId: 789,
        }),
        expect.any(Object)
      );
    });

    it('should handle Axios error with response data', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest =
        StructuredWorkoutDataFixture.defaultCreateRequest();
      const axiosError = {
        isAxiosError: true,
        response: {
          data: {
            message: 'Validation failed',
            errors: ['Title is required', 'Invalid workout type'],
          },
        },
        message: 'Request failed',
      } as AxiosError;

      vi.mocked(axios.isAxiosError).mockReturnValue(true);
      mockHttpClient.post.mockRejectedValue(axiosError);

      // Act
      const result = await adapter.createStructuredWorkout(request);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Validation failed',
        errors: ['Title is required', 'Invalid workout type'],
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to create structured workout via TrainingPeaks API',
        expect.objectContaining({
          title: request.title,
          athleteId: request.athleteId,
          error: 'Unknown error',
          errorType: 'Unknown',
        })
      );
    });

    it('should handle Axios error without response data', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest =
        StructuredWorkoutDataFixture.defaultCreateRequest();
      const axiosError = {
        isAxiosError: true,
        message: 'Network error',
        response: undefined,
      } as AxiosError;

      vi.mocked(axios.isAxiosError).mockReturnValue(true);
      mockHttpClient.post.mockRejectedValue(axiosError);

      // Act
      const result = await adapter.createStructuredWorkout(request);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Network error',
        errors: ['Network error'],
      });
    });

    it('should handle regular Error', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest =
        StructuredWorkoutDataFixture.defaultCreateRequest();
      const error = new Error('Generic error');

      vi.mocked(axios.isAxiosError).mockReturnValue(false);
      mockHttpClient.post.mockRejectedValue(error);

      // Act
      const result = await adapter.createStructuredWorkout(request);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Generic error',
        errors: ['Generic error'],
      });
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest =
        StructuredWorkoutDataFixture.defaultCreateRequest();

      vi.mocked(axios.isAxiosError).mockReturnValue(false);
      mockHttpClient.post.mockRejectedValue('String error');

      // Act
      const result = await adapter.createStructuredWorkout(request);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Failed to create structured workout',
        errors: [],
      });
    });

    it('should set default values for optional metadata fields', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest = {
        athleteId: 12345,
        title: 'Test Workout',
        workoutTypeValueId: 3,
        workoutDay: '2024-01-15T00:00:00.000Z',
        structure: StructuredWorkoutDataFixture.default().structure,
        // No metadata provided
      };

      const mockResponse: AxiosResponse = {
        data: { workoutId: 123 },
        status: 201,
        statusText: 'Created',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      // Act
      await adapter.createStructuredWorkout(request);

      // Assert
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/fitness/v6/athletes/${request.athleteId}/workouts`,
        expect.objectContaining({
          code: null,
          description: null,
          userTags: '',
          coachComments: null,
          publicSettingValue: 2,
          totalTimePlanned: expect.any(Number),
          tssPlanned: expect.any(Number),
          equipmentBikeId: null,
          equipmentShoeId: null,
        }),
        expect.any(Object)
      );
    });
  });

  describe('API request configuration', () => {
    it('should use correct headers for all requests', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      mockHttpClient.post.mockResolvedValue({ data: { workoutId: '123' } });
      mockHttpClient.get.mockResolvedValue({ data: workoutData });
      mockHttpClient.delete.mockResolvedValue({ status: 200 });

      // Act
      await adapter.uploadWorkout(workoutData);
      await adapter.getWorkout('123');
      await adapter.deleteWorkout('123');

      // Assert - Check that timeout is set for all requests
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        expect.objectContaining({
          timeout: mockSDKConfig.timeouts.default,
        })
      );
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: mockSDKConfig.timeouts.default,
        })
      );
      expect(mockHttpClient.delete).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          timeout: mockSDKConfig.timeouts.default,
        })
      );
    });

    it('should log all operations consistently', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const workoutId = 'test-workout-123';
      const request = StructuredWorkoutDataFixture.defaultCreateRequest();

      mockHttpClient.post.mockResolvedValue({ data: { workoutId } });
      mockHttpClient.get.mockResolvedValue({ data: workoutData });
      mockHttpClient.delete.mockResolvedValue({ status: 200 });

      // Act
      await adapter.uploadWorkout(workoutData);
      await adapter.getWorkout(workoutId);
      await adapter.listWorkouts();
      await adapter.deleteWorkout(workoutId);
      await adapter.createStructuredWorkout(request);

      // Assert - Check that info logs are called for all successful operations
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Uploading workout via TrainingPeaks API',
        expect.any(Object)
      );
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Getting workout via TrainingPeaks API',
        expect.any(Object)
      );
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Listing workouts via TrainingPeaks API',
        expect.any(Object)
      );
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Deleting workout via TrainingPeaks API',
        expect.any(Object)
      );
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Creating structured workout via TrainingPeaks API',
        expect.any(Object)
      );
    });
  });

  describe('edge cases and error boundaries', () => {
    it('should handle malformed response data', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const mockResponse: AxiosResponse = {
        data: 'not an object',
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.post.mockResolvedValue(mockResponse);

      // Act
      const result = await adapter.uploadWorkout(workoutData);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain(
        'No workout ID received from API response'
      );
    });

    it('should handle empty responses gracefully', async () => {
      // Arrange
      const mockResponse: AxiosResponse = {
        data: undefined,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      // Act
      const workouts = await adapter.listWorkouts();
      const workout = await adapter.getWorkout('test');

      // Assert
      expect(workouts).toEqual([]);
      expect(workout).toBeNull();
    });

    it('should handle timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('timeout of 30000ms exceeded');
      timeoutError.name = 'TimeoutError';
      mockHttpClient.get.mockRejectedValue(timeoutError);

      // Act
      const result = await adapter.getWorkout('test');

      // Assert
      expect(result).toBeNull();
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to get workout via TrainingPeaks API',
        expect.objectContaining({
          error: 'timeout of 30000ms exceeded',
          errorType: 'Error',
        })
      );
    });
  });
});
