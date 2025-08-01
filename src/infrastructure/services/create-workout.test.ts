/**
 * @vitest-environment node
 */

import {
  createWorkoutRequestBuilder,
  workoutResponseBuilder,
} from '@/__fixtures__/api-responses.fixture';
import { authTokenBuilder } from '@/__fixtures__/auth.fixture';
import type { WorkoutRepository } from '@/application/repositories';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createWorkout } from './create-workout';

describe('createWorkout', () => {
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

  it('should create workout successfully', async () => {
    const mockToken = authTokenBuilder.build();
    const workoutData = createWorkoutRequestBuilder.build();
    const mockCreatedWorkout = workoutResponseBuilder.build();

    vi.mocked(mockWorkoutRepository.createWorkout).mockResolvedValue(
      mockCreatedWorkout
    );

    const service = createWorkout(mockWorkoutRepository);
    const result = await service(mockToken, workoutData);

    expect(mockWorkoutRepository.createWorkout).toHaveBeenCalledWith(
      mockToken,
      workoutData
    );
    expect(result).toEqual(mockCreatedWorkout);
  });

  it('should handle repository errors', async () => {
    const mockToken = authTokenBuilder.build();
    const workoutData = createWorkoutRequestBuilder.build();

    const error = new Error('Failed to create workout');
    vi.mocked(mockWorkoutRepository.createWorkout).mockRejectedValue(error);

    const service = createWorkout(mockWorkoutRepository);

    await expect(service(mockToken, workoutData)).rejects.toThrow(
      'Failed to create workout'
    );
  });
});
