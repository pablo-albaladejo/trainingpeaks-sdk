/**
 * Workout Repository Tests
 */

import { describe, expect, it, vi } from 'vitest';

import { createHttpError } from '@/adapters/errors/http-errors';
import type { HttpClient } from '@/adapters/http';

import { createWorkoutRepository } from './workout-repository';

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();
const mockPatch = vi.fn();

const mockHttpClient: HttpClient = {
  get: mockGet,
  post: mockPost,
  put: mockPut,
  delete: mockDelete,
  patch: mockPatch,
};

describe('createWorkoutRepository', () => {
  it('should create workout repository with getWorkoutsList method', () => {
    const workoutRepository = createWorkoutRepository({
      httpClient: mockHttpClient,
      logger: mockLogger,
    });

    expect(workoutRepository.getWorkoutsList).toBeDefined();
    expect(typeof workoutRepository.getWorkoutsList).toBe('function');
  });

  describe('getWorkoutsList', () => {
    it('should call getWorkoutsList API and return workout data', async () => {
      const mockWorkouts = [
        {
          workoutId: 3095965562,
          athleteId: 3120341,
          title: 'Strength',
          workoutTypeValueId: 9,
          code: null,
          workoutDay: '2025-04-07T00:00:00',
          startTime: '2025-04-07T19:43:44',
          startTimePlanned: null,
          isItAnOr: false,
        },
      ];

      // Mock successful API response
      mockGet.mockResolvedValueOnce({
        data: mockWorkouts,
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      const workoutRepository = createWorkoutRepository({
        httpClient: mockHttpClient,
        logger: mockLogger,
      });

      const params = {
        athleteId: '3120341',
        startDate: '2025-04-07',
        endDate: '2025-04-08',
      };

      const result = await workoutRepository.getWorkoutsList(params);

      expect(result).toEqual(mockWorkouts);
      expect(mockLogger.info).toHaveBeenCalledWith('Getting workouts list', { params });
      expect(mockLogger.info).toHaveBeenCalledWith('Workouts list retrieved successfully', {
        count: 1,
      });
    });

    it('should handle HTTP errors and re-throw them', async () => {
      const httpError = createHttpError(
        {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'Authentication required' },
        },
        {
          url: '/fitness/v6/athletes/123/workouts/2025-01-01/2025-01-02',
          method: 'GET',
        }
      );

      mockGet.mockRejectedValueOnce(httpError);

      const workoutRepository = createWorkoutRepository({
        httpClient: mockHttpClient,
        logger: mockLogger,
      });

      const params = {
        athleteId: '123',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
      };

      await expect(workoutRepository.getWorkoutsList(params)).rejects.toThrow(httpError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get workouts list',
        { error: httpError, params }
      );
    });

    it('should handle non-HTTP errors and create structured HttpError', async () => {
      const networkError = new Error('Network timeout');
      mockGet.mockRejectedValueOnce(networkError);

      const workoutRepository = createWorkoutRepository({
        httpClient: mockHttpClient,
        logger: mockLogger,
      });

      const params = {
        athleteId: '123',
        startDate: '2025-01-01',
        endDate: '2025-01-02',
      };

      await expect(workoutRepository.getWorkoutsList(params)).rejects.toThrow(
        'Network timeout'
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to get workouts list',
        { error: networkError, params }
      );
    });
  });
});