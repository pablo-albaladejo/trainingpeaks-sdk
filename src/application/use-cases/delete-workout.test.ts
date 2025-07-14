/**
 * Delete Workout Use Case Tests
 * Tests for the delete workout use case following @unit-test-rule.mdc
 */

import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import { WorkoutService } from '../services/workout-service';
import {
  createDeleteWorkoutUseCase,
  DeleteWorkoutRequest,
} from './delete-workout';

describe('Delete Workout Use Case', () => {
  let mockWorkoutService: WorkoutService;
  let deleteWorkoutUseCase: ReturnType<typeof createDeleteWorkoutUseCase>;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockWorkoutService = {
      uploadWorkout: vi.fn(),
      getWorkout: vi.fn(),
      listWorkouts: vi.fn(),
      deleteWorkout: vi.fn(),
      createStructuredWorkout: vi.fn(),
    };

    deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockWorkoutService);
  });

  describe('execute', () => {
    it('should delete workout successfully', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedResult = true;

      mockWorkoutService.deleteWorkout = vi
        .fn()
        .mockResolvedValue(expectedResult);

      // Act
      const result = await deleteWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockWorkoutService.deleteWorkout).toHaveBeenCalledTimes(1);
      expect(mockWorkoutService.deleteWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle delete workout with string ID', async () => {
      // Arrange
      const workoutId = faker.string.uuid();
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedResult = true;

      mockWorkoutService.deleteWorkout = vi
        .fn()
        .mockResolvedValue(expectedResult);

      // Act
      const result = await deleteWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(true);
      expect(mockWorkoutService.deleteWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle delete workout failure', async () => {
      // Arrange
      const workoutId = randomString(10);
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedResult = false;

      mockWorkoutService.deleteWorkout = vi
        .fn()
        .mockResolvedValue(expectedResult);

      // Act
      const result = await deleteWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(false);
      expect(mockWorkoutService.deleteWorkout).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedError = new Error('Delete operation failed');

      mockWorkoutService.deleteWorkout = vi
        .fn()
        .mockRejectedValue(expectedError);

      // Act & Assert
      await expect(deleteWorkoutUseCase.execute(request)).rejects.toThrow(
        'Delete operation failed'
      );
      expect(mockWorkoutService.deleteWorkout).toHaveBeenCalledTimes(1);
    });

    it('should work with empty workout ID', async () => {
      // Arrange
      const workoutId = '';
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedResult = false;

      mockWorkoutService.deleteWorkout = vi
        .fn()
        .mockResolvedValue(expectedResult);

      // Act
      const result = await deleteWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(false);
      expect(mockWorkoutService.deleteWorkout).toHaveBeenCalledWith('');
    });

    it('should handle multiple delete requests', async () => {
      // Arrange
      const workoutId1 = randomNumber(1, 100).toString();
      const workoutId2 = randomNumber(101, 200).toString();
      const request1: DeleteWorkoutRequest = { workoutId: workoutId1 };
      const request2: DeleteWorkoutRequest = { workoutId: workoutId2 };

      mockWorkoutService.deleteWorkout = vi
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      // Act
      const result1 = await deleteWorkoutUseCase.execute(request1);
      const result2 = await deleteWorkoutUseCase.execute(request2);

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(mockWorkoutService.deleteWorkout).toHaveBeenCalledTimes(2);
      expect(mockWorkoutService.deleteWorkout).toHaveBeenNthCalledWith(
        1,
        workoutId1
      );
      expect(mockWorkoutService.deleteWorkout).toHaveBeenNthCalledWith(
        2,
        workoutId2
      );
    });

    it('should preserve workout ID type', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: DeleteWorkoutRequest = { workoutId };

      mockWorkoutService.deleteWorkout = vi.fn().mockResolvedValue(true);

      // Act
      await deleteWorkoutUseCase.execute(request);

      // Assert
      const calledWorkoutId = mockWorkoutService.deleteWorkout.mock.calls[0][0];
      expect(typeof calledWorkoutId).toBe('string');
      expect(calledWorkoutId).toBe(workoutId);
    });
  });
});
