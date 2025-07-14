/**
 * Get Workout Use Case Tests
 * Tests for the get workout use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import { WorkoutDataFixture } from '../../__fixtures__/workout-data.fixture';
import type { getWorkout } from '../services/workout-query';
import { createGetWorkoutUseCase, GetWorkoutRequest } from './get-workout';

describe('Get Workout Use Case', () => {
  let mockGetWorkout: getWorkout;
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
      const expectedWorkout = new WorkoutDataFixture()
        .withName('Test Workout')
        .build();

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

    it('should handle service errors correctly', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: GetWorkoutRequest = { workoutId };
      const errorMessage = 'Service error';

      mockGetWorkout = vi.fn().mockRejectedValue(new Error(errorMessage));
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act & Assert
      await expect(getWorkoutUseCase.execute(request)).rejects.toThrow(
        errorMessage
      );
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should work with string workout IDs', async () => {
      // Arrange
      const workoutId = randomString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = new WorkoutDataFixture().build();

      mockGetWorkout = vi.fn().mockResolvedValue(expectedWorkout);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedWorkout);
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should preserve workout data structure', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = new WorkoutDataFixture()
        .withName('Complex Workout')
        .withDescription('A complex workout with multiple phases')
        .withDuration(3600)
        .withDistance(10000)
        .build();

      mockGetWorkout = vi.fn().mockResolvedValue(expectedWorkout);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedWorkout);
      expect(result.name).toBe('Complex Workout');
      expect(result.description).toBe('A complex workout with multiple phases');
      expect(result.duration).toBe(3600);
      expect(result.distance).toBe(10000);
    });

    it('should handle empty workout ID', async () => {
      // Arrange
      const workoutId = '';
      const request: GetWorkoutRequest = { workoutId };

      mockGetWorkout = vi.fn().mockResolvedValue(null);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBeNull();
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should work with random workout IDs', async () => {
      // Arrange
      const workoutId = randomString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = new WorkoutDataFixture().build();

      mockGetWorkout = vi.fn().mockResolvedValue(expectedWorkout);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedWorkout);
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle undefined workout', async () => {
      // Arrange
      const workoutId = randomString();
      const request: GetWorkoutRequest = { workoutId };

      mockGetWorkout = vi.fn().mockResolvedValue(undefined);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBeUndefined();
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should pass through workout service response', async () => {
      // Arrange
      const workoutId = randomString();
      const request: GetWorkoutRequest = { workoutId };
      const serviceResponse = new WorkoutDataFixture().build();

      mockGetWorkout = vi.fn().mockResolvedValue(serviceResponse);
      getWorkoutUseCase = createGetWorkoutUseCase(mockGetWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(serviceResponse); // Should be exact same reference
      expect(mockGetWorkout).toHaveBeenCalledWith(workoutId);
    });
  });
});
