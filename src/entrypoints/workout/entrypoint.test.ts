/**
 * Workout Entrypoint Tests
 */

import {
  getWorkoutsListCommandBuilder,
  strengthWorkoutItemBuilder,
  workoutSessionBuilder,
} from '@fixtures';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getWorkoutsListEntrypoint } from './entrypoint';
import type { WorkoutEntrypointDependencies } from './types';

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

const mockTpRepository = {
  login: vi.fn(),
  logout: vi.fn(),
  getWorkoutsList: vi.fn(),
};

const mockSessionStorage = {
  get: vi.fn(),
  set: vi.fn(),
  clear: vi.fn(),
};

const mockDependencies: WorkoutEntrypointDependencies = {
  tpRepository: mockTpRepository,
  sessionStorage: mockSessionStorage,
  logger: mockLogger,
};

describe('getWorkoutsListEntrypoint', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('should return workout data directly when API call succeeds', async () => {
    const mockApiResponse = [
      strengthWorkoutItemBuilder.build({
        athleteId: 3_120_341,
        workoutType: 'strength',
      }),
    ];

    mockTpRepository.getWorkoutsList.mockResolvedValueOnce(mockApiResponse);

    const command = getWorkoutsListCommandBuilder.build({
      athleteId: '3120341',
      startDate: '2025-04-07',
      endDate: '2025-04-08',
    });

    const entrypoint = getWorkoutsListEntrypoint(mockDependencies);
    const result = await entrypoint(command);

    expect(result).toEqual(mockApiResponse);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Get workouts list entrypoint called',
      {
        athleteId: '3120341',
        startDate: '2025-04-07',
        endDate: '2025-04-08',
      }
    );
  });

  it('should throw error when API call fails', async () => {
    const mockError = new Error('API Error');
    mockTpRepository.getWorkoutsList.mockRejectedValueOnce(mockError);

    const command = getWorkoutsListCommandBuilder.build({
      athleteId: '3120341',
      startDate: '2025-04-07',
      endDate: '2025-04-08',
    });

    const entrypoint = getWorkoutsListEntrypoint(mockDependencies);

    await expect(entrypoint(command)).rejects.toThrow();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to get workouts list',
      { error: mockError }
    );
  });

  it('should use current user ID from session when athleteId is not provided', async () => {
    const mockSession = workoutSessionBuilder.build({
      userId: '3120341',
      userName: 'Test User',
    });

    const mockApiResponse = [
      strengthWorkoutItemBuilder.build({
        athleteId: 3_120_341,
        workoutType: 'strength',
      }),
    ];

    mockSessionStorage.get.mockResolvedValueOnce(mockSession);
    mockTpRepository.getWorkoutsList.mockResolvedValueOnce(mockApiResponse);

    const command = {
      startDate: '2025-04-07',
      endDate: '2025-04-08',
      // athleteId is intentionally omitted
    };

    const entrypoint = getWorkoutsListEntrypoint(mockDependencies);
    const result = await entrypoint(command);

    expect(result).toEqual(mockApiResponse);
    expect(mockSessionStorage.get).toHaveBeenCalled();
    expect(mockTpRepository.getWorkoutsList).toHaveBeenCalledWith({
      athleteId: '3120341',
      startDate: '2025-04-07',
      endDate: '2025-04-08',
    });
    expect(mockLogger.info).toHaveBeenCalledWith(
      'No athleteId provided, getting from current user session'
    );
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Using current user ID as athleteId',
      { athleteId: '3120341' }
    );
  });

  it('should throw error when no session is found and athleteId is not provided', async () => {
    mockSessionStorage.get.mockResolvedValueOnce(null);

    const command = {
      startDate: '2025-04-07',
      endDate: '2025-04-08',
      // athleteId is intentionally omitted
    };

    const entrypoint = getWorkoutsListEntrypoint(mockDependencies);

    await expect(entrypoint(command)).rejects.toThrow();
    expect(mockSessionStorage.get).toHaveBeenCalled();
    expect(mockTpRepository.getWorkoutsList).not.toHaveBeenCalled();
  });

  it('should use provided athleteId when available and not query session', async () => {
    const mockApiResponse = [
      strengthWorkoutItemBuilder.build({
        athleteId: 9_999_999,
        workoutType: 'strength',
      }),
    ];

    mockTpRepository.getWorkoutsList.mockResolvedValueOnce(mockApiResponse);

    const command = getWorkoutsListCommandBuilder.build({
      athleteId: '9999999',
      startDate: '2025-04-07',
      endDate: '2025-04-08',
    });

    const entrypoint = getWorkoutsListEntrypoint(mockDependencies);
    const result = await entrypoint(command);

    expect(result).toEqual(mockApiResponse);
    expect(mockSessionStorage.get).not.toHaveBeenCalled();
    expect(mockTpRepository.getWorkoutsList).toHaveBeenCalledWith({
      athleteId: '9999999',
      startDate: '2025-04-07',
      endDate: '2025-04-08',
    });
  });
});
