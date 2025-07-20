/**
 * Upload Workout Use Case Tests
 * Tests for the upload workout use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber } from '../../__fixtures__/utils.fixture';
import { WorkoutDataFixture } from '../../__fixtures__/workout-data.fixture';
import { 
  UploadWorkoutResponseFixture, 
  WorkoutFileFixture 
} from '../../__fixtures__/workout-response.fixture';
import type {
  UploadWorkout,
  UploadWorkoutRequest,
  UploadWorkoutResponse,
} from '../services/workout-creation';
import {
  createUploadWorkoutUseCase,
  UploadWorkoutUseCaseRequest,
} from './upload-workout';

describe('Upload Workout Use Case', () => {
  let mockUploadWorkout: UploadWorkout;
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
        file: WorkoutFileFixture.tcx(),
        name: 'Morning Run',
        description: 'Easy morning jog',
      };

      const expectedResponse = UploadWorkoutResponseFixture.success();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockUploadWorkout).toHaveBeenCalledTimes(1);
      expect(mockUploadWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle upload failure', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.tcx(),
        name: 'Failed Upload',
      };

      const expectedResponse = new UploadWorkoutResponseFixture()
        .withSuccess(false)
        .withMessage('Upload failed: Invalid file format')
        .withValidationErrors(['File format not supported'])
        .build();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.success).toBe(false);
      expect(result.validationErrors).toContain('File format not supported');
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.tcx(),
      };

      const errorMessage = 'Service unavailable';
      mockUploadWorkout = vi.fn().mockRejectedValue(new Error(errorMessage));
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act & Assert
      await expect(uploadWorkoutUseCase.execute(request)).rejects.toThrow(
        errorMessage
      );
      expect(mockUploadWorkout).toHaveBeenCalledWith(request);
    });

    it('should pass through all request parameters', async () => {
      // Arrange
      const plannedDate = new Date();
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.tcx(),
        name: 'Complete Workout',
        description: 'Detailed workout with metadata',
        tags: ['run', 'endurance'],
        activityType: 'running',
        plannedDate,
        notes: 'Great workout today',
        isPrivate: true,
        category: 'training',
        subcategory: 'base',
        equipment: ['garmin', 'heart-rate-monitor'],
        location: 'Central Park',
        weatherConditions: 'sunny, 72F',
        personalBest: true,
        coachNotes: 'Excellent pacing',
        customFields: {
          temperature: 72,
          humidity: 60,
          coach: 'Jane Smith',
        },
      };

      const expectedResponse = new UploadWorkoutResponseFixture()
        .withSuccess(true)
        .withProcessedData(new WorkoutDataFixture().withName('Complete Workout').build())
        .withRandomFileInfo()
        .withProcessingTime(150)
        .build();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockUploadWorkout).toHaveBeenCalledWith(request);
    });

    it('should work with minimal request data', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.tcx(),
      };

      const expectedResponse = new UploadWorkoutResponseFixture()
        .withSuccess(true)
        .withRandomFileInfo()
        .build();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockUploadWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle different file types', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.gpx(),
        name: 'GPX Workout',
      };

      const expectedResponse = new UploadWorkoutResponseFixture()
        .withSuccess(true)
        .withFileInfo({
          originalName: 'workout.gpx',
          size: 2048,
          type: 'application/gpx+xml',
          uploadedAt: new Date(),
        })
        .build();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.fileInfo?.type).toBe('application/gpx+xml');
    });

    it('should handle validation warnings', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.tcx(),
        name: 'Workout with Warnings',
      };

      const expectedResponse = new UploadWorkoutResponseFixture()
        .withSuccess(true)
        .withValidationWarnings([
          'Missing heart rate data for some intervals',
          'GPS signal weak in some sections',
        ])
        .withProcessingTime(300)
        .build();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.validationWarnings).toHaveLength(2);
      expect(result.validationWarnings).toContain(
        'Missing heart rate data for some intervals'
      );
    });

    it('should preserve processed workout data', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.tcx(),
        name: 'Data Preservation Test',
      };

      const processedData = new WorkoutDataFixture()
        .withName('Data Preservation Test')
        .withDescription('Processed from TCX file')
        .withDuration(3600)
        .withDistance(10000)
        .build();

      const expectedResponse = new UploadWorkoutResponseFixture()
        .withWorkoutId('workout-456')
        .withSuccess(true)
        .withProcessedData(processedData)
        .withRandomFileInfo()
        .build();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.processedData).toEqual(processedData);
      expect(result.processedData?.name).toBe('Data Preservation Test');
      expect(result.processedData?.duration).toBe(3600);
    });

    it('should handle metadata in response', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.tcx(),
        customFields: { source: 'garmin' },
      };

      const expectedResponse = new UploadWorkoutResponseFixture()
        .withSuccess(true)
        .withMetadata({
          uploadSource: 'sdk',
          fileFormat: 'tcx',
          processingVersion: '2.1',
          deviceInfo: {
            manufacturer: 'Garmin',
            model: 'Edge 530',
          },
        })
        .withProcessingTime(randomNumber(100, 500))
        .build();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.metadata).toBeDefined();
      expect(result.metadata?.uploadSource).toBe('sdk');
      expect(result.metadata?.deviceInfo).toEqual({
        manufacturer: 'Garmin',
        model: 'Edge 530',
      });
    });

    it('should handle large files', async () => {
      // Arrange
      const request: UploadWorkoutUseCaseRequest = {
        file: WorkoutFileFixture.fit(),
        name: 'Long Ride',
      };

      const expectedResponse = new UploadWorkoutResponseFixture()
        .withSuccess(true)
        .withProcessingTime(2500)
        .withFileInfo({
          originalName: 'large-workout.fit',
          size: 5 * 1024 * 1024,
          type: 'application/fit',
          uploadedAt: new Date(),
        })
        .build();

      mockUploadWorkout = vi.fn().mockResolvedValue(expectedResponse);
      uploadWorkoutUseCase = createUploadWorkoutUseCase(mockUploadWorkout);

      // Act
      const result = await uploadWorkoutUseCase.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.fileInfo?.size).toBe(5 * 1024 * 1024);
      expect(result.processingTime).toBe(2500);
    });
  });
});