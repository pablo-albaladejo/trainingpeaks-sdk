/**
 * @vitest-environment node
 */

import { workoutResponseBuilder } from '@/__fixtures__/api-responses.fixture';
import { authTokenBuilder } from '@/__fixtures__/auth.fixture';
import type { WorkoutRepository } from '@/application/repositories';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getWorkoutById } from './get-workout-by-id';

describe('getWorkoutById', () => {
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

  it('should get workout by ID successfully', async () => {
    const mockToken = authTokenBuilder.build();
    const mockWorkout = workoutResponseBuilder.build();

    vi.mocked(mockWorkoutRepository.getWorkoutById).mockResolvedValue(
      mockWorkout
    );

    const service = getWorkoutById(mockWorkoutRepository);
    const result = await service('1', mockToken);

    expect(mockWorkoutRepository.getWorkoutById).toHaveBeenCalledWith(
      '1',
      mockToken
    );
    expect(result).toEqual(mockWorkout);
  });

  it('should handle repository errors', async () => {
    const mockToken = authTokenBuilder.build();

    const error = new Error('Workout not found');
    vi.mocked(mockWorkoutRepository.getWorkoutById).mockRejectedValue(error);

    const service = getWorkoutById(mockWorkoutRepository);

    await expect(service('1', mockToken)).rejects.toThrow('Workout not found');
  });
});
