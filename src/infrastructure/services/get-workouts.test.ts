/**
 * @vitest-environment node
 */

import {
  workoutFiltersBuilder,
  workoutsListResponseBuilder,
} from '@/__fixtures__/api-responses.fixture';
import { authTokenBuilder } from '@/__fixtures__/auth.fixture';
import type { WorkoutRepository } from '@/application/repositories';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWorkouts } from './get-workouts';

describe('getWorkouts', () => {
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

  it('should get workouts successfully', async () => {
    const mockToken = authTokenBuilder.build();
    const mockWorkouts = workoutsListResponseBuilder.build({
      totalCount: 2,
      workoutCount: 2,
    });

    vi.mocked(mockWorkoutRepository.getWorkouts).mockResolvedValue(
      mockWorkouts
    );

    const service = getWorkouts(mockWorkoutRepository);
    const result = await service(mockToken);

    expect(mockWorkoutRepository.getWorkouts).toHaveBeenCalledWith(
      mockToken,
      undefined
    );
    expect(result).toEqual(mockWorkouts);
  });

  it('should get workouts with filters', async () => {
    const mockToken = authTokenBuilder.build();
    const filters = workoutFiltersBuilder.build({
      dateFrom: '2024-01-01',
      dateTo: '2024-01-31',
      type: 'running',
      limit: 10,
    });
    const mockWorkouts = workoutsListResponseBuilder.build({
      totalCount: 1,
      workoutCount: 1,
    });

    vi.mocked(mockWorkoutRepository.getWorkouts).mockResolvedValue(
      mockWorkouts
    );

    const service = getWorkouts(mockWorkoutRepository);
    const result = await service(mockToken, filters);

    expect(mockWorkoutRepository.getWorkouts).toHaveBeenCalledWith(
      mockToken,
      filters
    );
    expect(result).toEqual(mockWorkouts);
  });

  it('should handle repository errors', async () => {
    const mockToken = authTokenBuilder.build();

    const error = new Error('Failed to get workouts');
    vi.mocked(mockWorkoutRepository.getWorkouts).mockRejectedValue(error);

    const service = getWorkouts(mockWorkoutRepository);

    await expect(service(mockToken)).rejects.toThrow('Failed to get workouts');
  });
});
