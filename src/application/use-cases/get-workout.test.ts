/**
 * Get Workout Use Case Tests
 * Tests for the get workout use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import { workoutDataBuilder } from '../../__fixtures__/workout-data.fixture';
import type { GetWorkout } from '../services/workout-query';
import { createGetWorkoutUseCase, GetWorkoutRequest } from './get-workout';

describe('Get Workout Use Case', () => {
  let mockGetWorkout: GetWorkout;
  let getWorkoutUseCase: ReturnType<typeof createGetWorkoutUseCase>;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockGetWorkout = vi.fn();
    getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);
  });

  describe('execute', () => {
    it('should get workout successfully', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = workoutDataBuilder.build({
        name: 'Test Workout',
      });

      mockGetWorkout = vi.fn().mockResolvedValue(expectedWorkout);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedWorkout);
      expect(mockGetWorkout).toHaveBeenCalledTimes(1);
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle workout not found', async () => {
      // Arrange
      const workoutId = randomString();
      const request: GetWorkoutRequest = { workoutId };

      mockGetWorkout = vi.fn().mockResolvedValue(null);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBeNull();
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const workoutId = randomString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedError = new Error('Repository error');

      mockGetWorkout = vi.fn().mockRejectedValue(expectedError);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act & Assert
      await expect(getWorkoutUseCase.execute(request)).rejects.toThrow(
        'Repository error'
      );
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should work with random workout data', async () => {
      // Arrange
      const workoutId = randomString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = workoutDataBuilder.build();

      mockGetWorkout = vi.fn().mockResolvedValue(expectedWorkout);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedWorkout);
      expect(result?.name).toBeDefined();
      expect(result?.description).toBeDefined();
      expect(result?.date).toBeDefined();
      expect(result?.duration).toBeDefined();
      expect(result?.distance).toBeDefined();
      expect(result?.type).toBeDefined();
    });
  });
});
