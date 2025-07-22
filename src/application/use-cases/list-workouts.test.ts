/**
 * List Workouts Use Case Tests
 * Tests for the list workouts use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber } from '../../__fixtures__/utils.fixture';
import { createWorkoutData } from '../../__fixtures__/workout-data.fixture';
import {
  createListWorkoutsResponse,
  listWorkoutsResponseBuilder,
} from '../../__fixtures__/workout-response.fixture';
import type { ListWorkouts } from '../services/workout-query';
import {
  createListWorkoutsUseCase,
  type ListWorkoutsRequest,
} from './list-workouts';

describe('List Workouts Use Case', () => {
  let mockListWorkouts: ListWorkouts;
  let listWorkoutsUseCase: ReturnType<typeof createListWorkoutsUseCase>;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockListWorkouts = vi.fn();
    listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);
  });

  describe('execute', () => {
    it('should list workouts successfully', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        athleteId: randomNumber(1000, 9999),
      };

      const expectedResponse = createListWorkoutsResponse({
        workoutCount: 3,
        total: 3,
        page: 1,
        limit: 10,
      });

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.workouts).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.hasMore).toBe(false);
    });

    it('should handle empty workout list', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        athleteId: randomNumber(1000, 9999),
      };

      const expectedResponse = createListWorkoutsResponse({
        workoutCount: 0,
        total: 0,
        page: 1,
        limit: 10,
      });

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.workouts).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should handle repository errors', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        athleteId: randomNumber(1000, 9999),
      };

      const error = new Error('Repository error');
      mockListWorkouts = vi.fn().mockRejectedValue(error);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act & Assert
      await expect(listWorkoutsUseCase.execute(request)).rejects.toThrow(
        'Repository error'
      );
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should work with pagination', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        athleteId: randomNumber(1000, 9999),
        page: 2,
        limit: 5,
      };

      const expectedResponse = createListWorkoutsResponse({
        workoutCount: 5,
        total: 15,
        page: 2,
        limit: 5,
      });

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.workouts).toHaveLength(5);
      expect(result.total).toBe(15);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.hasMore).toBe(true);
    });

    it('should work with filters', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        athleteId: randomNumber(1000, 9999),
        filters: {
          dateFrom: '2024-01-01',
          dateTo: '2024-01-31',
          type: 'run',
        },
      };

      const expectedResponse = createListWorkoutsResponse({
        workoutCount: 1,
        total: 1,
        page: 1,
        limit: 10,
      });

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should work with complex workout data', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        athleteId: randomNumber(1000, 9999),
      };

      const complexWorkout = createWorkoutData({
        name: 'Complex Workout',
        description: 'A complex workout with multiple phases',
        durationMinutes: 120, // 2 hours = 7200 seconds
        distanceKm: 20, // 20km = 20000 meters
        workoutType: 'bike',
      });

      const expectedResponse = listWorkoutsResponseBuilder.build({
        workouts: [complexWorkout],
        total: 1,
        page: 1,
        limit: 10,
        hasMore: false,
      });

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.workouts[0].name).toBe('Complex Workout');
      expect(result.workouts[0].description).toBe(
        'A complex workout with multiple phases'
      );
      expect(result.workouts[0].duration).toBe(7200);
      expect(result.workouts[0].distance).toBe(20000);
      expect(result.workouts[0].type).toBe('bike');
    });
  });
});
