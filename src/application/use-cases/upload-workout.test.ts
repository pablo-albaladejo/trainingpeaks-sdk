/**
 * Upload Workout Use Case Tests
 * Tests for the upload workout use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { workoutFileBuilder } from '../../__fixtures__/workout-file.fixture';
import {
  createUploadWorkoutResponse,
  uploadWorkoutResponseBuilder,
} from '../../__fixtures__/workout-response.fixture';
import type { WorkoutRepository } from '../ports/workout';
import type { UploadWorkoutUseCaseRequest } from './upload-workout';
import { createUploadWorkoutUseCase } from './upload-workout';

describe('Upload Workout Use Case', () => {
  let mockUploadWorkout: WorkoutRepository['uploadWorkout'];
  let uploadWorkoutUseCase: ReturnType<typeof createUploadWorkoutUseCase>;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockUploadWorkout = vi.fn();
    uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);
  });

  describe('execute', () => {
    it('should upload workout successfully', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build(),
        name: 'Morning Run',
        description: 'Easy morning jog',
      };

      const expectedResponse = uploadWorkoutResponseBuilder.build({
        workoutId: 'workout-123',
        success: true,
      });

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockUploadWorkout).toHaveBeenCalledTimes(1);
      expect(mockUploadWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle upload failure', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build(),
        name: 'Failed Upload',
      };

      const expectedResponse = uploadWorkoutResponseBuilder.build({
        success: false,
        message: 'Upload failed',
      });

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Upload failed');
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build(),
      };

      const expectedError = new Error('Service error');
      mockUploadWorkout = vi.fn().mockRejectedValue(expectedError);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act & Assert
      await expect(uploadWorkoutUseCase.execute(request)).rejects.toThrow(
        'Service error'
      );
      expect(mockUploadWorkout).toHaveBeenCalledWith(request);
    });

    it('should pass through all request parameters', async () => {
      // Arrange
      const plannedDate = new Date();
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build(),
        name: 'Complete Workout',
        description: 'Detailed workout with metadata',
        plannedDate,
        tags: ['running', 'morning'],
        notes: 'Coach notes',
        equipment: ['garmin-fenix'],
        location: 'Central Park',
        weatherConditions: 'sunny',
        personalBest: true,
        coachNotes: 'Great pace!',
        category: 'endurance',
        subcategory: 'base',
        customFields: { source: 'garmin' },
      };

      const expectedResponse = uploadWorkoutResponseBuilder.build();
      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockUploadWorkout).toHaveBeenCalledWith(request);
    });

    it('should work with minimal request data', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build(),
      };

      const expectedResponse = uploadWorkoutResponseBuilder.build();
      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockUploadWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle different file types', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build({
          fileFormat: 'gpx',
        }),
        name: 'GPX Workout',
      };

      const expectedResponse = createUploadWorkoutResponse({
        fileType: 'gpx',
      });

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.fileInfo?.type).toBe('application/gpx+xml');
    });

    it('should handle validation warnings', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build(),
        name: 'Workout with Warnings',
      };

      const expectedResponse = createUploadWorkoutResponse({
        includeWarnings: true,
        warningCount: 2,
        success: true,
      });

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.validationWarnings).toHaveLength(2);
      expect(result.success).toBe(true);
    });

    it('should preserve processed workout data', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build(),
        name: 'Data Preservation Test',
      };

      const expectedResponse = uploadWorkoutResponseBuilder.build({
        processedData: {
          name: 'Processed Workout',
          duration: 3600,
          distance: 10000,
          type: 'run',
        },
      });

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.processedData?.name).toBe('Processed Workout');
      expect(result.processedData?.duration).toBe(3600);
      expect(result.processedData?.distance).toBe(10000);
    });

    it('should handle metadata in response', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build(),
        customFields: { source: 'garmin' },
      };

      const expectedResponse = uploadWorkoutResponseBuilder.build({
        metadata: {
          source: 'garmin',
          version: '1.0.0',
          processingTime: 250,
        },
      });

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.metadata?.source).toBe('garmin');
      expect(result.metadata?.version).toBe('1.0.0');
    });

    it('should handle large files', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: workoutFileBuilder.build({
          fileFormat: 'fit',
        }),
        name: 'Long Ride',
      };

      const expectedResponse = createUploadWorkoutResponse({
        fileType: 'fit',
        fileSize: 5 * 1024 * 1024, // 5MB
        processingTime: 5000,
      });

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.fileInfo?.size).toBe(5 * 1024 * 1024);
      expect(result.processingTime).toBe(5000);
    });
  });
});
