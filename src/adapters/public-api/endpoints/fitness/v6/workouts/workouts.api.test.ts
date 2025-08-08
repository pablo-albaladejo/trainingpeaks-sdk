/**
 * Workouts API Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { HttpClient } from '@/application/ports/http-client';

import { getWorkoutsList } from './workouts.api';

const mockGet = vi.fn();
const mockHttpClient: HttpClient = {
  get: mockGet,
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  patch: vi.fn(),
};

describe('getWorkoutsList', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('should call the correct endpoint with proper parameters', async () => {
    const mockWorkoutsData = [
      {
        workoutId: 3095965562,
        athleteId: 3120341,
        title: 'Strength',
        workoutTypeValueId: 9,
        code: null,
        workoutDay: '2025-04-07T00:00:00Z',
        startTime: '2025-04-07T19:43:44Z',
        startTimePlanned: null,
        isItAnOr: false,
      },
    ];

    const mockResponse = {
      data: mockWorkoutsData,
      success: true,
      cookies: [],
    };

    mockGet.mockResolvedValueOnce(mockResponse);

    const params = {
      athleteId: '3120341',
      startDate: '2025-04-07',
      endDate: '2025-04-08',
    };

    const result = await getWorkoutsList(mockHttpClient, params);

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(expect.any(String));

    // Validate URL using URL constructor for more robust checking
    const [calledUrl] = mockGet.mock.calls[0];
    const url = new URL(calledUrl, 'http://example.com');
    expect(url.pathname).toBe(
      '/fitness/v6/athletes/3120341/workouts/2025-04-07/2025-04-08'
    );
    expect(result).toEqual(mockWorkoutsData);
  });

  it('should validate response schema', async () => {
    const invalidWorkoutsData = [
      {
        workoutId: 'invalid', // should be number
        athleteId: 3120341,
        title: 'Strength',
        workoutTypeValueId: 9,
        code: null,
        workoutDay: '2025-04-07T00:00:00Z',
        startTime: '2025-04-07T19:43:44Z',
        startTimePlanned: null,
        isItAnOr: false,
      },
    ];

    const invalidResponse = {
      data: invalidWorkoutsData,
      success: true,
      cookies: [],
    };

    mockGet.mockResolvedValueOnce(invalidResponse);

    const params = {
      athleteId: '3120341',
      startDate: '2025-04-07',
      endDate: '2025-04-08',
    };

    await expect(getWorkoutsList(mockHttpClient, params)).rejects.toThrow();
  });
});
