/**
 * @vitest-environment node
 */

import { authTokenBuilder } from '@/__fixtures__/auth.fixture';
import type { WorkoutRepository } from '@/application/repositories';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteWorkout } from './delete-workout';

describe('deleteWorkout', () => {
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

  it('should delete workout successfully', async () => {
    const mockToken = authTokenBuilder.build();

    vi.mocked(mockWorkoutRepository.deleteWorkout).mockResolvedValue();

    const service = deleteWorkout(mockWorkoutRepository);
    await service('1', mockToken);

    expect(mockWorkoutRepository.deleteWorkout).toHaveBeenCalledWith(
      '1',
      mockToken
    );
  });

  it('should handle repository errors', async () => {
    const mockToken = authTokenBuilder.build();

    const error = new Error('Failed to delete workout');
    vi.mocked(mockWorkoutRepository.deleteWorkout).mockRejectedValue(error);

    const service = deleteWorkout(mockWorkoutRepository);

    await expect(service('1', mockToken)).rejects.toThrow(
      'Failed to delete workout'
    );
  });
});
