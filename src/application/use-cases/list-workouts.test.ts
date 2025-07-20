/**
 * List Workouts Use Case Tests
 * Tests for the list workouts use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber } from '../../__fixtures__/utils.fixture';
import { WorkoutDataFixture } from '../../__fixtures__/workout-data.fixture';
import { ListWorkoutsResponseFixture } from '../../__fixtures__/workout-response.fixture';
import type {
  ListWorkouts,
  ListWorkoutsParams,
  ListWorkoutsResponse,
} from '../services/workout-query';
import {
  createListWorkoutsUseCase,
  ListWorkoutsRequest,
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
    it('should list workouts successfully with default parameters', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {};
      const expectedWorkouts = [
        new WorkoutDataFixture().withName('Workout 1').build(),
        new WorkoutDataFixture().withName('Workout 2').build(),
      ];
      const expectedResponse = ListWorkoutsResponseFixture.withWorkouts(expectedWorkouts);

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockListWorkouts).toHaveBeenCalledTimes(1);
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should handle empty results', async () => {
      // Arrange
      const request: ListWorkoutsRequest = { limit: 10 };
      const expectedResponse = ListWorkoutsResponseFixture.empty();

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.workouts).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should handle pagination parameters', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        limit: 5,
        offset: 10,
      };
      const expectedWorkouts = Array.from({ length: 5 }, (_, i) =>
        new WorkoutDataFixture().withName(`Workout ${i + 11}`).build()
      );
      const expectedResponse = new ListWorkoutsResponseFixture()
        .withWorkouts(expectedWorkouts)
        .withTotal(50)
        .withPage(3)
        .withLimit(5)
        .withHasMore(true)
        .build();

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.workouts).toHaveLength(5);
      expect(result.hasMore).toBe(true);
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should handle date range filters', async () => {
      // Arrange
      const dateFrom = new Date('2024-01-01');
      const dateTo = new Date('2024-12-31');
      const request: ListWorkoutsRequest = {
        dateFrom,
        dateTo,
        limit: 20,
      };
      const expectedWorkouts = [
        new WorkoutDataFixture().withName('January Workout').build(),
        new WorkoutDataFixture().withName('December Workout').build(),
      ];
      const expectedResponse = new ListWorkoutsResponseFixture()
        .withWorkouts(expectedWorkouts)
        .withTotal(2)
        .withPage(1)
        .withLimit(20)
        .withHasMore(false)
        .build();

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should handle activity type and difficulty filters', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        activityType: 'run',
        difficulty: 'moderate',
        tags: ['interval', 'endurance'],
      };
      const expectedWorkouts = [
        new WorkoutDataFixture()
          .withName('Moderate Running Workout')
          .withDescription('Interval training')
          .build(),
      ];
      const expectedResponse = ListWorkoutsResponseFixture.withWorkouts(expectedWorkouts);

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should handle sorting parameters', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        sortBy: 'duration',
        sortOrder: 'desc',
      };
      const expectedWorkouts = [
        new WorkoutDataFixture()
          .withName('Long Workout')
          .withDuration(7200)
          .build(),
        new WorkoutDataFixture()
          .withName('Short Workout')
          .withDuration(1800)
          .build(),
      ];
      const expectedResponse = ListWorkoutsResponseFixture.withWorkouts(expectedWorkouts);

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const request: ListWorkoutsRequest = { limit: 10 };
      const errorMessage = 'Service unavailable';

      mockListWorkouts = vi.fn().mockRejectedValue(new Error(errorMessage));
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act & Assert
      await expect(listWorkoutsUseCase.execute(request)).rejects.toThrow(
        errorMessage
      );
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should pass through all request parameters', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        limit: 25,
        offset: 50,
        dateFrom: new Date('2024-06-01'),
        dateTo: new Date('2024-06-30'),
        tags: ['strength', 'upper-body'],
        activityType: 'strength',
        difficulty: 'hard',
        sortBy: 'name',
        sortOrder: 'asc',
      };
      const expectedResponse = new ListWorkoutsResponseFixture()
        .withWorkouts([])
        .withTotal(0)
        .withPage(3)
        .withLimit(25)
        .withHasMore(false)
        .build();

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });

    it('should handle large dataset with pagination', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {
        limit: 100,
        offset: 500,
      };
      const expectedWorkouts = Array.from({ length: 100 }, (_, i) =>
        new WorkoutDataFixture()
          .withName(`Workout ${i + 501}`)
          .withDuration(randomNumber(1800, 7200))
          .build()
      );
      const expectedResponse = new ListWorkoutsResponseFixture()
        .withWorkouts(expectedWorkouts)
        .withTotal(1500)
        .withPage(6)
        .withLimit(100)
        .withHasMore(true)
        .build();

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.workouts).toHaveLength(100);
      expect(result.total).toBe(1500);
      expect(result.hasMore).toBe(true);
    });

    it('should preserve workout data structure', async () => {
      // Arrange
      const request: ListWorkoutsRequest = {};
      const complexWorkout = new WorkoutDataFixture()
        .withName('Complex Workout')
        .withDescription('Multi-phase workout')
        .withDuration(5400)
        .withDistance(15000)
        .build();
      const expectedResponse = ListWorkoutsResponseFixture.withWorkouts([complexWorkout]);

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.workouts[0]).toEqual(complexWorkout);
      expect(result.workouts[0].name).toBe('Complex Workout');
      expect(result.workouts[0].duration).toBe(5400);
      expect(result.workouts[0].distance).toBe(15000);
    });

    it('should handle random query parameters', async () => {
      // Arrange
      const randomLimit = randomNumber(1, 100);
      const randomOffset = randomNumber(0, 1000);
      const request: ListWorkoutsRequest = {
        limit: randomLimit,
        offset: randomOffset,
      };
      const expectedResponse = new ListWorkoutsResponseFixture()
        .withWorkouts([])
        .withTotal(randomNumber(0, 2000))
        .withPage(Math.floor(randomOffset / randomLimit) + 1)
        .withLimit(randomLimit)
        .withHasMore(Math.random() > 0.5)
        .build();

      mockListWorkouts = vi.fn().mockResolvedValue(expectedResponse);
      listWorkoutsUseCase = createListWorkoutsUseCase(mockListWorkouts);

      // Act
      const result = await listWorkoutsUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockListWorkouts).toHaveBeenCalledWith(request);
    });
  });
});