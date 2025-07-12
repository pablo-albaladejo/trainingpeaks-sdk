/**
 * WorkoutUploader Tests
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WorkoutUploader } from '.';
import { TrainingPeaksConfigFixture } from '../__fixtures__/training-peaks-config.fixture';
import { WorkoutDataFixture } from '../__fixtures__/workout-data.fixture';
import { TrainingPeaksAuth } from '../auth';
import { AuthenticationError, ValidationError } from '../errors';
import { WorkoutType } from '../types';

// Mock axios
vi.mock('axios');
vi.mock('form-data');

// Mock the auth module
vi.mock('../auth', () => ({
  TrainingPeaksAuth: vi.fn().mockImplementation(() => ({
    isAuthenticated: vi.fn().mockReturnValue(true),
    getToken: vi.fn().mockReturnValue({
      accessToken: 'mock-token',
      tokenType: 'Bearer',
      expiresAt: Date.now() + 3600000,
    }),
    getUserId: vi.fn().mockReturnValue('123'),
  })),
}));

describe('WorkoutUploader', () => {
  let workoutUploader: WorkoutUploader;
  let mockAuth: TrainingPeaksAuth;
  let config: any;

  beforeEach(() => {
    // Arrange
    config = TrainingPeaksConfigFixture.default();
    mockAuth = new TrainingPeaksAuth(config);
    workoutUploader = new WorkoutUploader(mockAuth, config);
  });

  describe('constructor', () => {
    it('should create workout uploader with auth and config', () => {
      // Arrange
      const testConfig = TrainingPeaksConfigFixture.random();
      const testAuth = new TrainingPeaksAuth(testConfig);

      // Act
      const uploader = new WorkoutUploader(testAuth, testConfig);

      // Assert
      expect(uploader).toBeDefined();
      expect(uploader.uploadWorkout).toBeDefined();
      expect(uploader.getUploadStatus).toBeDefined();
    });
  });

  describe('uploadWorkout', () => {
    it('should throw authentication error when not authenticated', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      vi.spyOn(mockAuth, 'isAuthenticated').mockReturnValue(false);

      // Act & Assert
      await expect(workoutUploader.uploadWorkout(workoutData)).rejects.toThrow(
        AuthenticationError
      );
    });

    it('should throw validation error for invalid workout data', async () => {
      // Arrange
      const invalidWorkoutData = WorkoutDataFixture.default();
      invalidWorkoutData.name = ''; // Invalid name
      vi.spyOn(mockAuth, 'isAuthenticated').mockReturnValue(true);
      vi.spyOn(mockAuth, 'getToken').mockReturnValue({
        accessToken: 'mock-token',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 3600000,
      });

      // Act & Assert
      await expect(
        workoutUploader.uploadWorkout(invalidWorkoutData)
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('getUploadStatus', () => {
    it('should throw authentication error when not authenticated', async () => {
      // Arrange
      const uploadId = 'test-upload-id';
      vi.spyOn(mockAuth, 'isAuthenticated').mockReturnValue(false);

      // Act & Assert
      await expect(workoutUploader.getUploadStatus(uploadId)).rejects.toThrow(
        AuthenticationError
      );
    });
  });

  describe('createWorkoutFromFile', () => {
    it('should create workout data from file with default values', () => {
      // Arrange
      const filename = 'test.gpx';
      const content = 'test content';
      const mimeType = 'application/gpx+xml';
      const metadata = {};

      // Act
      const workoutData = workoutUploader.createWorkoutFromFile(
        filename,
        content,
        mimeType,
        metadata
      );

      // Assert
      expect(workoutData.name).toStrictEqual('test'); // Extension removed by design
      expect(workoutData.type).toStrictEqual(WorkoutType.OTHER);
      expect(workoutData.duration).toStrictEqual(0);
      expect(workoutData.fileData?.filename).toStrictEqual(filename);
      expect(workoutData.fileData?.content).toStrictEqual(content);
      expect(workoutData.fileData?.mimeType).toStrictEqual(mimeType);
    });

    it('should create workout data from file with custom metadata', () => {
      // Arrange
      const filename = 'workout.tcx';
      const content = 'workout content';
      const mimeType = 'application/tcx+xml';
      const metadata = WorkoutDataFixture.random();

      // Act
      const workoutData = workoutUploader.createWorkoutFromFile(
        filename,
        content,
        mimeType,
        metadata
      );

      // Assert
      expect(workoutData.name).toStrictEqual(metadata.name);
      expect(workoutData.description).toStrictEqual(metadata.description);
      expect(workoutData.type).toStrictEqual(metadata.type);
      expect(workoutData.duration).toStrictEqual(metadata.duration);
      expect(workoutData.distance).toStrictEqual(metadata.distance);
      expect(workoutData.fileData?.filename).toStrictEqual(filename);
      expect(workoutData.fileData?.content).toStrictEqual(content);
      expect(workoutData.fileData?.mimeType).toStrictEqual(mimeType);
    });
  });

  describe('validateWorkoutData', () => {
    it('should throw validation error for empty workout name', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      workoutData.name = '';
      vi.spyOn(mockAuth, 'isAuthenticated').mockReturnValue(true);
      vi.spyOn(mockAuth, 'getToken').mockReturnValue({
        accessToken: 'mock-token',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 3600000,
      });

      // Act & Assert
      await expect(workoutUploader.uploadWorkout(workoutData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw validation error for invalid date format', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      workoutData.date = 'invalid-date';
      vi.spyOn(mockAuth, 'isAuthenticated').mockReturnValue(true);
      vi.spyOn(mockAuth, 'getToken').mockReturnValue({
        accessToken: 'mock-token',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 3600000,
      });

      // Act & Assert
      await expect(workoutUploader.uploadWorkout(workoutData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw validation error for negative duration', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      workoutData.duration = -100;
      vi.spyOn(mockAuth, 'isAuthenticated').mockReturnValue(true);
      vi.spyOn(mockAuth, 'getToken').mockReturnValue({
        accessToken: 'mock-token',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 3600000,
      });

      // Act & Assert
      await expect(workoutUploader.uploadWorkout(workoutData)).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw validation error for negative distance', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      workoutData.distance = -500;
      vi.spyOn(mockAuth, 'isAuthenticated').mockReturnValue(true);
      vi.spyOn(mockAuth, 'getToken').mockReturnValue({
        accessToken: 'mock-token',
        tokenType: 'Bearer',
        expiresAt: Date.now() + 3600000,
      });

      // Act & Assert
      await expect(workoutUploader.uploadWorkout(workoutData)).rejects.toThrow(
        ValidationError
      );
    });
  });
});
