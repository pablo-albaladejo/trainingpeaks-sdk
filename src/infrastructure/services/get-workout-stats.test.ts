/**
 * @vitest-environment node
 */

import {
  workoutFiltersBuilder,
  workoutStatsBuilder,
} from '@/__fixtures__/api-responses.fixture';
import { authTokenBuilder } from '@/__fixtures__/auth.fixture';
import type { WorkoutRepository } from '@/application/repositories';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWorkoutStats } from './get-workout-stats';

describe('getWorkoutStats', () => {
  let mockWorkoutRepository: WorkoutRepository;

  beforeEach(() => {
    mockWorkoutRepository = {
      getWorkouts: vi.fn(),
      getWorkoutById: vi.fn(),
      createWorkout: vi.fn(),
      updateWorkout: vi.fn(),
      deleteWorkout: vi.fn(),
      getWorkoutStats: vi.fn(),
    };
  });

  it('should get workout stats successfully', async () => {
    const mockToken = authTokenBuilder.build();
    const mockStats = workoutStatsBuilder.build();

    vi.mocked(mockWorkoutRepository.getWorkoutStats).mockResolvedValue(
      mockStats
    );

    const service = getWorkoutStats(mockWorkoutRepository);
    const result = await service(mockToken);

    expect(mockWorkoutRepository.getWorkoutStats).toHaveBeenCalledWith(
      mockToken,
      undefined
    );
    expect(result).toEqual(mockStats);
  });

  it('should get workout stats with filters', async () => {
    const mockToken = authTokenBuilder.build();
    const filters = workoutFiltersBuilder.build({
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      type: 'running',
    });
    const mockStats = workoutStatsBuilder.build();

    vi.mocked(mockWorkoutRepository.getWorkoutStats).mockResolvedValue(
      mockStats
    );

    const service = getWorkoutStats(mockWorkoutRepository);
    const result = await service(mockToken, filters);

    expect(mockWorkoutRepository.getWorkoutStats).toHaveBeenCalledWith(
      mockToken,
      filters
    );
    expect(result).toEqual(mockStats);
  });

  it('should handle repository errors', async () => {
    const mockToken = authTokenBuilder.build();

    const error = new Error('Failed to get workout stats');
    vi.mocked(mockWorkoutRepository.getWorkoutStats).mockRejectedValue(error);

    const service = getWorkoutStats(mockWorkoutRepository);

    await expect(service(mockToken)).rejects.toThrow(
      'Failed to get workout stats'
    );
  });
});
