/**
 * TrainingPeaks Client Integration Tests
 * Tests the full integration between client and infrastructure
 */

import { describe, expect, it } from 'vitest';
import { TrainingPeaksClient } from './training-peaks-client';

describe('TrainingPeaks Client Integration Tests', () => {
  describe('Environment Setup', () => {
    it('should have required environment variables for integration tests', () => {
      expect(process.env.TRAININGPEAKS_TEST_USERNAME).toBeDefined();
      expect(process.env.TRAININGPEAKS_TEST_USERNAME).not.toBe('');
      expect(process.env.TRAININGPEAKS_TEST_USERNAME).not.toBeUndefined();
      expect(process.env.TRAININGPEAKS_TEST_PASSWORD).toBeDefined();
      expect(process.env.TRAININGPEAKS_TEST_PASSWORD).not.toBe('');
      expect(process.env.TRAININGPEAKS_TEST_PASSWORD).not.toBeUndefined();
    });
  });

  describe('Client Integration', () => {
    it('should initialize client with all required methods', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient();

      // Assert
      expect(client).toBeDefined();
      expect(typeof client.login).toBe('function');
      expect(typeof client.logout).toBe('function');
      expect(typeof client.isAuthenticated).toBe('function');
      expect(typeof client.getCurrentUser).toBe('function');
      expect(typeof client.getWorkoutManager).toBe('function');
      expect(typeof client.getConfig).toBe('function');

      // Check workout manager methods
      const workoutManager = client.getWorkoutManager();
      expect(typeof workoutManager.uploadWorkout).toBe('function');
      expect(typeof workoutManager.listWorkouts).toBe('function');
      expect(typeof workoutManager.getWorkout).toBe('function');
      expect(typeof workoutManager.deleteWorkout).toBe('function');
      expect(typeof workoutManager.createStructuredWorkout).toBe('function');
      expect(typeof workoutManager.searchWorkouts).toBe('function');
    });

    it('should have proper initial authentication state', () => {
      // Arrange & Act
      const client = new TrainingPeaksClient();

      // Assert
      expect(client.isAuthenticated()).toBe(false);
    });
  });
});
