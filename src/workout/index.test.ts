/**
 * Workout Manager Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutManager } from './index';

describe('WorkoutManager', () => {
  let workoutManager: WorkoutManager;

  beforeEach(() => {
    vi.clearAllMocks();
    workoutManager = new WorkoutManager();
  });

  describe('constructor', () => {
    it('should create workout manager with default config', () => {
      // Arrange & Act
      const manager = new WorkoutManager();

      // Assert
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(WorkoutManager);
      expect(manager.getWorkoutRepository()).toBeDefined();
    });

    it('should create workout manager with custom config', () => {
      // Arrange
      const customConfig = {
        baseUrl: 'https://custom.trainingpeaks.com',
        timeout: 60000,
        debug: true,
      };

      // Act
      const manager = new WorkoutManager(customConfig);

      // Assert
      expect(manager).toBeDefined();
      expect(manager).toBeInstanceOf(WorkoutManager);
    });
  });

  describe('uploadWorkout', () => {
    it('should successfully upload workout data', async () => {
      // Arrange
      const workoutData = {
        fileContent: '<tcx>sample workout data</tcx>',
        fileName: 'test-workout.tcx',
        metadata: {
          title: 'Test Workout',
          description: 'A test workout',
          tags: ['running', 'test'],
          activityType: 'Running',
        },
      };

      // Act
      const result = await workoutManager.uploadWorkout(workoutData);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.workoutId).toBeDefined();
      expect(result.message).toContain('uploaded successfully');
    });

    it('should handle invalid workout files', async () => {
      // Arrange
      const workoutData = {
        fileContent: 'invalid content',
        fileName: 'test.txt', // Invalid extension
      };

      // Act
      const result = await workoutManager.uploadWorkout(workoutData);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('uploadWorkoutFromFile', () => {
    it('should handle file not found error', async () => {
      // Arrange
      const nonExistentFile = '/non/existent/file.tcx';

      // Act
      const result =
        await workoutManager.uploadWorkoutFromFile(nonExistentFile);

      // Assert
      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to read workout file');
      expect(result.errors).toBeDefined();
    });
  });

  describe('getWorkout', () => {
    it('should get workout by ID', async () => {
      // Arrange
      const workoutId = 'test-workout-123';

      // Act
      const workout = await workoutManager.getWorkout(workoutId);

      // Assert
      expect(workout).toBeDefined();
      expect(workout.id).toBe(workoutId);
      expect(workout.name).toBeDefined();
    });
  });

  describe('listWorkouts', () => {
    it('should list user workouts', async () => {
      // Act
      const workouts = await workoutManager.listWorkouts();

      // Assert
      expect(workouts).toBeDefined();
      expect(Array.isArray(workouts)).toBe(true);
      expect(workouts.length).toBeGreaterThan(0);
      expect(workouts[0]).toHaveProperty('id');
      expect(workouts[0]).toHaveProperty('name');
    });

    it('should list workouts with filters', async () => {
      // Arrange
      const filters = {
        activityType: 'Running',
        limit: 10,
        offset: 0,
      };

      // Act
      const workouts = await workoutManager.listWorkouts(filters);

      // Assert
      expect(workouts).toBeDefined();
      expect(Array.isArray(workouts)).toBe(true);
    });
  });

  describe('deleteWorkout', () => {
    it('should delete workout by ID', async () => {
      // Arrange - First upload a workout
      const workoutData = {
        fileContent: '<tcx>sample workout data</tcx>',
        fileName: 'test-workout.tcx',
        metadata: {
          title: 'Test Workout for Deletion',
          description: 'A test workout to be deleted',
        },
      };

      const uploadResult = await workoutManager.uploadWorkout(workoutData);
      expect(uploadResult.success).toBe(true);
      const workoutId = uploadResult.workoutId!;

      // Act - Delete the workout
      const result = await workoutManager.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('searchWorkouts', () => {
    it('should search workouts by criteria', async () => {
      // Arrange
      const query = {
        text: 'running',
        activityType: 'Running',
      };

      // Act
      const workouts = await workoutManager.searchWorkouts(query);

      // Assert
      expect(workouts).toBeDefined();
      expect(Array.isArray(workouts)).toBe(true);
    });
  });

  describe('getWorkoutStats', () => {
    it('should get workout statistics', async () => {
      // Arrange
      const filters = {
        activityType: 'Running',
      };

      // Act
      const stats = await workoutManager.getWorkoutStats(filters);

      // Assert
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalWorkouts');
      expect(stats).toHaveProperty('totalDuration');
      expect(stats).toHaveProperty('totalDistance');
      expect(stats).toHaveProperty('averageDuration');
      expect(stats).toHaveProperty('averageDistance');
      expect(typeof stats.totalWorkouts).toBe('number');
    });
  });

  describe('getWorkoutRepository', () => {
    it('should return the repository instance', () => {
      // Act
      const repository = workoutManager.getWorkoutRepository();

      // Assert
      expect(repository).toBeDefined();
    });
  });
});
