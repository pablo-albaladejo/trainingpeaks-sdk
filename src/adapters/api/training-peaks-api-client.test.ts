/**
 * @vitest-environment node
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UsersApiClient } from './modules/users-api-client';
import { WorkoutsApiClient } from './modules/workouts-api-client';
import { TrainingPeaksApiClient } from './training-peaks-api-client';

// Mock the modules
vi.mock('./modules/users-api-client');
vi.mock('./modules/workouts-api-client');

// Mock the infrastructure services
vi.mock('@/infrastructure/services/user-service', () => ({
  authenticateUser: vi.fn(() => vi.fn()),
  getCurrentUser: vi.fn(() => vi.fn()),
  refreshUserToken: vi.fn(() => vi.fn()),
  updateUserPreferences: vi.fn(() => vi.fn()),
  getUserSettings: vi.fn(() => vi.fn()),
}));

vi.mock('@/infrastructure/services/get-workouts', () => ({
  getWorkouts: vi.fn(() => vi.fn()),
}));
vi.mock('@/infrastructure/services/get-workout-by-id', () => ({
  getWorkoutById: vi.fn(() => vi.fn()),
}));
vi.mock('@/infrastructure/services/create-workout', () => ({
  createWorkout: vi.fn(() => vi.fn()),
}));
vi.mock('@/infrastructure/services/update-workout', () => ({
  updateWorkout: vi.fn(() => vi.fn()),
}));
vi.mock('@/infrastructure/services/delete-workout', () => ({
  deleteWorkout: vi.fn(() => vi.fn()),
}));
vi.mock('@/infrastructure/services/get-workout-stats', () => ({
  getWorkoutStats: vi.fn(() => vi.fn()),
}));

describe('TrainingPeaksApiClient', () => {
  const mockConfig = {
    baseURL: 'https://api.trainingpeaks.com',
    timeout: 5000,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create entity-specific API clients', () => {
      const client = new TrainingPeaksApiClient(mockConfig);

      expect(client.users).toBeInstanceOf(UsersApiClient);
      expect(client.workouts).toBeInstanceOf(WorkoutsApiClient);
    });

    it('should configure clients with correct parameters', () => {
      const client = new TrainingPeaksApiClient(mockConfig);

      // Verify UsersApiClient was constructed with correct config
      expect(UsersApiClient).toHaveBeenCalledWith({
        baseURL: mockConfig.baseURL,
        timeout: mockConfig.timeout,
        version: 'v3',
      });

      // Verify WorkoutsApiClient was constructed with correct config
      expect(WorkoutsApiClient).toHaveBeenCalledWith({
        baseURL: mockConfig.baseURL,
        timeout: mockConfig.timeout,
        version: 'v1',
      });
    });
  });

  describe('Public Interface', () => {
    it('should have authenticateUser method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.authenticateUser).toBe('function');
    });

    it('should have getCurrentUser method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.getCurrentUser).toBe('function');
    });

    it('should have refreshToken method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.refreshToken).toBe('function');
    });

    it('should have updateUserPreferences method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.updateUserPreferences).toBe('function');
    });

    it('should have getUserSettings method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.getUserSettings).toBe('function');
    });

    it('should have getWorkouts method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.getWorkouts).toBe('function');
    });

    it('should have getWorkoutById method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.getWorkoutById).toBe('function');
    });

    it('should have createWorkout method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.createWorkout).toBe('function');
    });

    it('should have updateWorkout method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.updateWorkout).toBe('function');
    });

    it('should have deleteWorkout method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.deleteWorkout).toBe('function');
    });

    it('should have getWorkoutStats method', () => {
      const client = new TrainingPeaksApiClient(mockConfig);
      expect(typeof client.getWorkoutStats).toBe('function');
    });
  });

  describe('Direct Access to Entity Clients', () => {
    it('should provide access to users API client', () => {
      const client = new TrainingPeaksApiClient(mockConfig);

      expect(client.users).toBeInstanceOf(UsersApiClient);
    });

    it('should provide access to workouts API client', () => {
      const client = new TrainingPeaksApiClient(mockConfig);

      expect(client.workouts).toBeInstanceOf(WorkoutsApiClient);
    });

    it('should allow direct access to repository methods', () => {
      const client = new TrainingPeaksApiClient(mockConfig);

      // Verify that we can access repository methods directly
      expect(typeof client.users.authenticate).toBe('function');
      expect(typeof client.users.getUserInfo).toBe('function');
      expect(typeof client.users.refreshToken).toBe('function');
      expect(typeof client.users.updatePreferences).toBe('function');
      expect(typeof client.users.getUserSettings).toBe('function');

      expect(typeof client.workouts.getWorkouts).toBe('function');
      expect(typeof client.workouts.getWorkoutById).toBe('function');
      expect(typeof client.workouts.createWorkout).toBe('function');
      expect(typeof client.workouts.updateWorkout).toBe('function');
      expect(typeof client.workouts.deleteWorkout).toBe('function');
      expect(typeof client.workouts.getWorkoutStats).toBe('function');
    });
  });

  describe('Architecture Compliance', () => {
    it('should implement repository interfaces', () => {
      const client = new TrainingPeaksApiClient(mockConfig);

      // Verify that the API clients implement the repository interfaces
      expect(client.users).toHaveProperty('authenticate');
      expect(client.users).toHaveProperty('getUserInfo');
      expect(client.users).toHaveProperty('refreshToken');
      expect(client.users).toHaveProperty('updatePreferences');
      expect(client.users).toHaveProperty('getUserSettings');

      expect(client.workouts).toHaveProperty('getWorkouts');
      expect(client.workouts).toHaveProperty('getWorkoutById');
      expect(client.workouts).toHaveProperty('createWorkout');
      expect(client.workouts).toHaveProperty('updateWorkout');
      expect(client.workouts).toHaveProperty('deleteWorkout');
      expect(client.workouts).toHaveProperty('getWorkoutStats');
    });

    it('should provide service layer abstraction', () => {
      const client = new TrainingPeaksApiClient(mockConfig);

      // Verify that the main client provides service methods
      expect(typeof client.authenticateUser).toBe('function');
      expect(typeof client.getCurrentUser).toBe('function');
      expect(typeof client.refreshToken).toBe('function');
      expect(typeof client.updateUserPreferences).toBe('function');
      expect(typeof client.getUserSettings).toBe('function');

      expect(typeof client.getWorkouts).toBe('function');
      expect(typeof client.getWorkoutById).toBe('function');
      expect(typeof client.createWorkout).toBe('function');
      expect(typeof client.updateWorkout).toBe('function');
      expect(typeof client.deleteWorkout).toBe('function');
      expect(typeof client.getWorkoutStats).toBe('function');
    });
  });
});
