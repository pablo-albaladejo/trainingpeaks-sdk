/**
 * Get Workout Use Case Tests
 * Tests for the get workout use case following @unit-test-rule.mdc
 */

import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import { createGetWorkoutUseCase, GetWorkoutRequest } from './get-workout';

describe('Get Workout Use Case', () => {
  let mockWorkoutService: any;
  let getWorkoutUseCase: ReturnType<typeof createGetWorkoutUseCase>;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockWorkoutService = {
      uploadWorkout: vi.fn(),
      getWorkout: vi.fn(),
      listWorkouts: vi.fn(),
      deleteWorkout: vi.fn(),
      createStructuredWorkout: vi.fn(),
    };

    getWorkoutUseCase = createGetWorkoutUseCase(mockWorkoutService);
  });

  describe('execute', () => {
    it('should get workout successfully', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = {
        id: workoutId,
        name: faker.lorem.words(),
        description: faker.lorem.sentence(),
      };

      mockWorkoutService.getWorkout.mockResolvedValue(expectedWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedWorkout);
      expect(mockWorkoutService.getWorkout).toHaveBeenCalledTimes(1);
      expect(mockWorkoutService.getWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle workout not found', async () => {
      // Arrange
      const workoutId = faker.string.uuid();
      const request: GetWorkoutRequest = { workoutId };

      mockWorkoutService.getWorkout.mockResolvedValue(null);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBeNull();
      expect(mockWorkoutService.getWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedError = new Error('Service error');

      mockWorkoutService.getWorkout.mockRejectedValue(expectedError);

      // Act & Assert
      await expect(getWorkoutUseCase.execute(request)).rejects.toThrow(
        'Service error'
      );
      expect(mockWorkoutService.getWorkout).toHaveBeenCalledTimes(1);
    });

    it('should work with string workout IDs', async () => {
      // Arrange
      const workoutId = faker.string.alphanumeric(10);
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = {
        id: workoutId,
        name: faker.lorem.words(),
      };

      mockWorkoutService.getWorkout.mockResolvedValue(expectedWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedWorkout);
      expect(mockWorkoutService.getWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should preserve workout data structure', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = {
        id: workoutId,
        name: faker.lorem.words(),
        description: faker.lorem.sentence(),
        duration: randomNumber(300, 7200),
        distance: randomNumber(1, 100),
        activityType: faker.lorem.word(),
        tags: [faker.lorem.word(), faker.lorem.word()],
        createdAt: faker.date.recent().toISOString(),
      };

      mockWorkoutService.getWorkout.mockResolvedValue(expectedWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedWorkout);
      expect(result.id).toBe(workoutId);
      expect(result.name).toBe(expectedWorkout.name);
      expect(result.description).toBe(expectedWorkout.description);
      expect(result.duration).toBe(expectedWorkout.duration);
      expect(result.distance).toBe(expectedWorkout.distance);
    });

    it('should handle empty workout ID', async () => {
      // Arrange
      const workoutId = '';
      const request: GetWorkoutRequest = { workoutId };

      mockWorkoutService.getWorkout.mockResolvedValue(null);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBeNull();
      expect(mockWorkoutService.getWorkout).toHaveBeenCalledWith('');
    });

    it('should work with random workout IDs', async () => {
      // Arrange
      const workoutId = randomString(randomNumber(5, 20));
      const request: GetWorkoutRequest = { workoutId };
      const expectedWorkout = {
        id: workoutId,
        name: randomString(10),
        description: randomString(50),
      };

      mockWorkoutService.getWorkout.mockResolvedValue(expectedWorkout);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedWorkout);
      expect(typeof result.id).toBe('string');
      expect(result.id).toBe(workoutId);
    });

    it('should handle undefined workout', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: GetWorkoutRequest = { workoutId };

      mockWorkoutService.getWorkout.mockResolvedValue(undefined);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBeUndefined();
      expect(mockWorkoutService.getWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should pass through workout service response', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const request: GetWorkoutRequest = { workoutId };
      const serviceResponse = { id: workoutId, special: 'data' };

      mockWorkoutService.getWorkout.mockResolvedValue(serviceResponse);

      // Act
      const result = await getWorkoutUseCase.execute(request);

      // Assert
      expect(result).toBe(serviceResponse); // Same reference
      expect(mockWorkoutService.getWorkout).toHaveBeenCalledWith(workoutId);
    });
  });
});
