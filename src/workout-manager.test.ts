/**
 * WorkoutManager Tests
 * Tests for the new hexagonal architecture implementation
 */

import { describe, expect, it } from 'vitest';
import type { TrainingPeaksClientConfig } from './config';
import { createWorkoutManager } from './workout-manager';

describe('WorkoutManager', () => {
  it('should create workout manager with default config', () => {
    // Act
    const workoutManager = createWorkoutManager();

    // Assert
    expect(workoutManager).toBeDefined();
    expect(workoutManager.uploadWorkout).toBeDefined();
    expect(workoutManager.uploadWorkoutFromFile).toBeDefined();
    expect(workoutManager.getWorkout).toBeDefined();
    expect(workoutManager.listWorkouts).toBeDefined();
    expect(workoutManager.deleteWorkout).toBeDefined();
    expect(workoutManager.createStructuredWorkout).toBeDefined();
    expect(workoutManager.searchWorkouts).toBeDefined();
    expect(workoutManager.getWorkoutStats).toBeDefined();
    expect(workoutManager.getWorkoutRepository).toBeDefined();
  });

  it('should create workout manager with custom config', () => {
    // Arrange
    const config: TrainingPeaksClientConfig = {
      urls: {
        apiBaseUrl: 'https://custom-api.trainingpeaks.com',
      },
      timeouts: {
        default: 5000,
      },
      debug: {
        enabled: true,
      },
      requests: {
        defaultHeaders: { 'Custom-Header': 'test' },
      },
    };

    // Act
    const workoutManager = createWorkoutManager(config);

    // Assert
    expect(workoutManager).toBeDefined();
    expect(workoutManager.uploadWorkout).toBeDefined();
  });

  it('should have correct method signatures', () => {
    // Arrange
    const workoutManager = createWorkoutManager();

    // Assert - check that methods exist and are functions
    expect(typeof workoutManager.uploadWorkout).toBe('function');
    expect(typeof workoutManager.uploadWorkoutFromFile).toBe('function');
    expect(typeof workoutManager.getWorkout).toBe('function');
    expect(typeof workoutManager.listWorkouts).toBe('function');
    expect(typeof workoutManager.deleteWorkout).toBe('function');
    expect(typeof workoutManager.createStructuredWorkout).toBe('function');
    expect(typeof workoutManager.searchWorkouts).toBe('function');
    expect(typeof workoutManager.getWorkoutStats).toBe('function');
    expect(typeof workoutManager.getWorkoutRepository).toBe('function');
  });

  it('should provide access to workout repository', () => {
    // Arrange
    const workoutManager = createWorkoutManager();

    // Act
    const repository = workoutManager.getWorkoutRepository();

    // Assert
    expect(repository).toBeDefined();
  });
});
