/**
 * Delete Workout Use Case Tests
 * Tests for the delete workout use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import type { deleteWorkout } from '../services/workout-management';
import {
  createDeleteWorkoutUseCase,
  DeleteWorkoutRequest,
} from './delete-workout';

describe('Delete Workout Use Case', () => {
  let mockDeleteWorkout: deleteWorkout;
  let deleteWorkoutUseCase: ReturnType<typeof createDeleteWorkoutUseCase>;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockDeleteWorkout = vi.fn();
    deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockDeleteWorkout);
  });

  describe('execute', () => {
    it('should delete workout successfully', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedResult = true;

      mockDeleteWorkout = vi.fn().mockResolvedValue(expectedResult);
      deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockDeleteWorkout);

      // Act
      const result = await deleteWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockDeleteWorkout).toHaveBeenCalledTimes(1);
      expect(mockDeleteWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle delete workout with string ID', async () => {
      // Arrange
      const workoutId = randomString();
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedResult = true;

      mockDeleteWorkout = vi.fn().mockResolvedValue(expectedResult);
      deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockDeleteWorkout);

      // Act
      const result = await deleteWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockDeleteWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle delete workout failure', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedResult = false;

      mockDeleteWorkout = vi.fn().mockResolvedValue(expectedResult);
      deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockDeleteWorkout);

      // Act
      const result = await deleteWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockDeleteWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: DeleteWorkoutRequest = { workoutId };
      const errorMessage = 'Delete operation failed';

      mockDeleteWorkout = vi.fn().mockRejectedValue(new Error(errorMessage));
      deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockDeleteWorkout);

      // Act & Assert
      await expect(deleteWorkoutUseCase.execute(request)).rejects.toThrow(
        errorMessage
      );
      expect(mockDeleteWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should work with empty workout ID', async () => {
      // Arrange
      const workoutId = '';
      const request: DeleteWorkoutRequest = { workoutId };
      const expectedResult = false;

      mockDeleteWorkout = vi.fn().mockResolvedValue(expectedResult);
      deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockDeleteWorkout);

      // Act
      const result = await deleteWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(expectedResult);
      expect(mockDeleteWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle multiple delete requests', async () => {
      // Arrange
      const workoutId1 = randomString();
      const workoutId2 = randomString();
      const request1: DeleteWorkoutRequest = { workoutId: workoutId1 };
      const request2: DeleteWorkoutRequest = { workoutId: workoutId2 };

      mockDeleteWorkout = vi
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockDeleteWorkout);

      // Act
      const result1 = await deleteWorkoutUseCase.execute(request1);
      const result2 = await deleteWorkoutUseCase.execute(request2);

      // Assert
      expect(result1).toBe(true);
      expect(result2).toBe(false);
      expect(mockDeleteWorkout).toHaveBeenCalledTimes(2);
      expect(mockDeleteWorkout).toHaveBeenNthCalledWith(1, workoutId1);
      expect(mockDeleteWorkout).toHaveBeenNthCalledWith(2, workoutId2);
    });

    it('should preserve workout ID type', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: DeleteWorkoutRequest = { workoutId };

      mockDeleteWorkout = vi.fn().mockImplementation((id: string) => {
        expect(typeof id).toBe('string');
        return Promise.resolve(true);
      });
      deleteWorkoutUseCase = createDeleteWorkoutUseCase(mockDeleteWorkout);

      // Act & Assert
      await deleteWorkoutUseCase.execute(request);
      expect(mockDeleteWorkout).toHaveBeenCalledWith(workoutId);
    });
  });
});
