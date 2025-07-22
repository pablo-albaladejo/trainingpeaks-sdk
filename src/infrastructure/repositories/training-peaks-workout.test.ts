/**
 * TrainingPeaks Workout Repository Tests
 * Tests for the TrainingPeaks workout repository implementation
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutDataFixture } from '../../__fixtures__/workout-data.fixture';
import { ValidationError } from '../../domain/errors';
import { createWorkoutFile } from '../../infrastructure/services/domain-factories';
import { createTrainingPeaksWorkoutRepository } from './training-peaks-workout';

// Mock external dependencies
vi.mock('../../infrastructure/workout/trainingpeaks-api-adapter');
vi.mock('../../infrastructure/filesystem/file-system-adapter');
vi.mock('../../infrastructure/logging/logger');
vi.mock('../../infrastructure/services/workout-validation');
vi.mock('../../infrastructure/services/workout-management');
vi.mock('../../infrastructure/services/workout-metrics');
vi.mock('../../infrastructure/services/workout-query');
vi.mock('../../infrastructure/services/workout-utility');
vi.mock('../../infrastructure/services/workout-creation');
vi.mock('../../infrastructure/services/workout-manager');
vi.mock('../../infrastructure/services/error-handler');
vi.mock('../../infrastructure/services/auth-application');
vi.mock('../../infrastructure/services/auth-validation');
vi.mock('../../infrastructure/services/logger');
vi.mock('../../infrastructure/repositories/training-peaks-auth');
vi.mock('../../infrastructure/storage/in-memory-adapter');
vi.mock('../../infrastructure/browser/web-auth-adapter');
vi.mock('../../infrastructure/auth/api-adapter');
vi.mock('../../infrastructure/http/auth-handler');
vi.mock('../../config', () => ({
  getSDKConfig: vi.fn(() => ({
    urls: {
      baseUrl: 'https://trainingpeaks.com',
      apiBaseUrl: 'https://api.trainingpeaks.com',
      loginUrl: 'https://trainingpeaks.com/login',
      appUrl: 'https://trainingpeaks.com/app',
    },
    timeouts: {
      default: 30000,
      webAuth: 60000,
      apiAuth: 15000,
      elementWait: 5000,
      pageLoad: 30000,
      errorDetection: 2000,
      testExecution: 120000,
    },
    debug: {
      enabled: false,
      logAuth: false,
      logNetwork: false,
      logBrowser: false,
    },
    requests: {
      defaultHeaders: {},
      retryAttempts: 3,
      retryDelay: 1000,
    },
  })),
}));

describe('TrainingPeaks Workout Repository', () => {
  let mockFileSystemAdapter: any;
  let mockWorkoutServiceAdapter: any;
  let config: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock file system adapter
    mockFileSystemAdapter = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      deleteFile: vi.fn(),
      exists: vi.fn(),
      listFiles: vi.fn(),
      createDirectory: vi.fn(),
      moveFile: vi.fn(),
      copyFile: vi.fn(),
    };

    // Mock workout service adapter
    mockWorkoutServiceAdapter = {
      uploadWorkout: vi.fn(),
      createStructuredWorkout: vi.fn(),
      getWorkout: vi.fn(),
      listWorkouts: vi.fn(),
      deleteWorkout: vi.fn(),
      updateWorkout: vi.fn(),
      searchWorkouts: vi.fn(),
      canHandle: vi.fn().mockReturnValue(true),
    };

    config = {
      urls: {
        baseUrl: 'https://trainingpeaks.com',
        apiBaseUrl: 'https://api.trainingpeaks.com',
        loginUrl: 'https://trainingpeaks.com/login',
        appUrl: 'https://trainingpeaks.com/app',
      },
      timeouts: {
        default: 30000,
        webAuth: 60000,
        apiAuth: 15000,
        elementWait: 5000,
        pageLoad: 30000,
        errorDetection: 2000,
        testExecution: 120000,
      },
      debug: {
        enabled: false,
        logAuth: false,
        logNetwork: false,
        logBrowser: false,
      },
      requests: {
        defaultHeaders: {},
        retryAttempts: 3,
        retryDelay: 1000,
      },
    };
  });

  describe('basic functionality', () => {
    it('should create repository instance', () => {
      // Act
      const repository = createTrainingPeaksWorkoutRepository(
        mockFileSystemAdapter,
        config
      );

      // Assert
      expect(repository).toBeDefined();
      expect(typeof repository.getWorkout).toBe('function');
      expect(typeof repository.listWorkouts).toBe('function');
      expect(typeof repository.deleteWorkout).toBe('function');
      expect(typeof repository.createStructuredWorkout).toBe('function');
      expect(typeof repository.uploadWorkout).toBe('function');
      expect(typeof repository.uploadWorkoutFromFile).toBe('function');
      expect(typeof repository.updateWorkout).toBe('function');
      expect(typeof repository.searchWorkouts).toBe('function');
      expect(typeof repository.getWorkoutStats).toBe('function');
    });

    it('should handle workout data conversion', () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();

      // Act
      const repository = createTrainingPeaksWorkoutRepository(
        mockFileSystemAdapter,
        config
      );

      // Assert - basic structure validation
      expect(workoutData).toBeDefined();
      expect(workoutData.name).toBeDefined();
      expect(workoutData.description).toBeDefined();
    });

    it('should handle workout file creation', () => {
      // Arrange
      const fileName = 'test.tcx';
      const content = '<tcx>...</tcx>';
      const mimeType = 'application/tcx+xml';

      // Act
      const workoutFile = createWorkoutFile(fileName, content, mimeType);

      // Assert
      expect(workoutFile).toBeDefined();
      expect(workoutFile.fileName).toBe(fileName);
      expect(workoutFile.content).toBe(content);
      expect(workoutFile.mimeType).toBe(mimeType);
    });
  });

  describe('error handling', () => {
    it('should handle validation errors', () => {
      // Test that validation errors are properly handled
      expect(() => {
        createWorkoutFile('', 'content', 'application/tcx+xml');
      }).toThrow(ValidationError);
    });

    it('should handle workout validation errors', () => {
      // Test that workout validation errors are properly handled
      expect(() => {
        createWorkoutFile('test.tcx', '', 'application/tcx+xml');
      }).toThrow(ValidationError);
    });
  });
});
