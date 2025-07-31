/**
 * @vitest-environment node
 */

import {
  updateWorkoutRequestBuilder,
  workoutResponseBuilder,
} from '@/__fixtures__/api-responses.fixture';
import { authTokenBuilder } from '@/__fixtures__/auth.fixture';
import type { WorkoutRepository } from '@/application/repositories';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateWorkout } from './update-workout';

describe('updateWorkout', () => {
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

  it('should update workout successfully', async () => {
    const mockToken = authTokenBuilder.build();
    const workoutData = updateWorkoutRequestBuilder.build();
    const mockUpdatedWorkout = workoutResponseBuilder.build();

    vi.mocked(mockWorkoutRepository.updateWorkout).mockResolvedValue(
      mockUpdatedWorkout
    );

    const service = updateWorkout(mockWorkoutRepository);
    const result = await service(workoutData, mockToken);

    expect(mockWorkoutRepository.updateWorkout).toHaveBeenCalledWith(
      workoutData,
      mockToken
    );
    expect(result).toEqual(mockUpdatedWorkout);
  });

  it('should handle repository errors', async () => {
    const mockToken = authTokenBuilder.build();
    const workoutData = updateWorkoutRequestBuilder.build();

    const error = new Error('Failed to update workout');
    vi.mocked(mockWorkoutRepository.updateWorkout).mockRejectedValue(error);

    const service = updateWorkout(mockWorkoutRepository);

    await expect(service(workoutData, mockToken)).rejects.toThrow(
      'Failed to update workout'
    );
  });
});
