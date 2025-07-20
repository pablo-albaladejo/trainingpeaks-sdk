/**
 * Create Structured Workout Use Case Tests
 * Tests for the create structured workout use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import { StructuredWorkoutDataFixture } from '../../__fixtures__/structured-workout-data.fixture';
import { CreateStructuredWorkoutResponseFixture } from '../../__fixtures__/workout-response.fixture';
import type {
  CreateStructuredWorkout,
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
} from '../services/workout-creation';
import {
  createStructuredWorkoutUseCase,
  CreateStructuredWorkoutUseCaseRequest,
} from './create-structured-workout';

describe('Create Structured Workout Use Case', () => {
  let mockCreateStructuredWorkout: CreateStructuredWorkout;
  let createStructuredWorkoutUseCaseInstance: ReturnType<
    typeof createStructuredWorkoutUseCase
  >;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockCreateStructuredWorkout = vi.fn();
    createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
      mockCreateStructuredWorkout
    );
  });

  describe('execute', () => {
    it('should create structured workout successfully', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Test Workout',
        description: 'A test workout',
        structure: StructuredWorkoutDataFixture.default().structure,
      };

      const expectedResponse = CreateStructuredWorkoutResponseFixture.success();

      mockCreateStructuredWorkout = vi
        .fn()
        .mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledTimes(1);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle creation failure', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Failed Workout',
        structure: StructuredWorkoutDataFixture.default().structure,
      };

      const expectedResponse = CreateStructuredWorkoutResponseFixture.failure();

      mockCreateStructuredWorkout = vi
        .fn()
        .mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.success).toBe(false);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Error Workout',
        structure: StructuredWorkoutDataFixture.default().structure,
      };

      const errorMessage = 'Service error occurred';
      mockCreateStructuredWorkout = vi
        .fn()
        .mockRejectedValue(new Error(errorMessage));
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act & Assert
      await expect(
        createStructuredWorkoutUseCaseInstance.execute(request)
      ).rejects.toThrow(errorMessage);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should pass through all request parameters', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Complete Workout',
        description: 'Full featured workout',
        structure: StructuredWorkoutDataFixture.default().structure,
        tags: ['interval', 'running'],
        notes: 'Coach notes',
        targetDate: new Date(),
        estimatedDuration: 3600,
        estimatedDistance: 10000,
        estimatedCalories: 500,
        difficulty: 'moderate',
        activityType: 'run',
        equipment: ['treadmill'],
        location: 'gym',
        weatherConditions: 'indoor',
        personalBest: false,
        coachNotes: 'Focus on pacing',
        publiclyVisible: true,
        allowComments: true,
        category: 'endurance',
        subcategory: 'base',
        season: 'winter',
        trainingPhase: 'build',
        intensityZone: 3,
        rpeScale: 7,
        heartRateZones: [150, 170],
        powerZones: [200, 250],
        paceZones: [420, 380],
        customFields: { coach: 'John Doe' },
      };

      const expectedResponse = new CreateStructuredWorkoutResponseFixture()
        .withSuccess(true)
        .withEstimatedDuration(3600)
        .withEstimatedDistance(10000)
        .withEstimatedCalories(500)
        .withStructure(request.structure)
        .build();

      mockCreateStructuredWorkout = vi
        .fn()
        .mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should work with minimal request data', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Minimal Workout',
        structure: StructuredWorkoutDataFixture.default().structure,
      };

      const expectedResponse = CreateStructuredWorkoutResponseFixture.success();

      mockCreateStructuredWorkout = vi
        .fn()
        .mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle workout with intervals structure', async () => {
      // Arrange
      const intervalWorkout = StructuredWorkoutDataFixture.withIntervals();
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Interval Workout',
        description: 'High intensity intervals',
        structure: intervalWorkout.structure,
      };

      const expectedResponse = new CreateStructuredWorkoutResponseFixture()
        .withSuccess(true)
        .withStructure(intervalWorkout.structure)
        .withValidationWarnings(['High intensity detected'])
        .build();

      mockCreateStructuredWorkout = vi
        .fn()
        .mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.structure).toEqual(intervalWorkout.structure);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle random workout data', async () => {
      // Arrange
      const randomWorkout = StructuredWorkoutDataFixture.random();
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: randomString(),
        description: randomString(),
        structure: randomWorkout.structure,
        estimatedDuration: randomNumber(600, 7200),
        estimatedDistance: randomNumber(1000, 50000),
        estimatedCalories: randomNumber(100, 1000),
      };

      const expectedResponse = new CreateStructuredWorkoutResponseFixture()
        .withSuccess(true)
        .withUploadStatus('completed')
        .withRandomProcessingTime()
        .build();

      mockCreateStructuredWorkout = vi
        .fn()
        .mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should preserve response metadata', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Metadata Workout',
        structure: StructuredWorkoutDataFixture.default().structure,
      };

      const expectedResponse = new CreateStructuredWorkoutResponseFixture()
        .withWorkoutId('workout-123')
        .withSuccess(true)
        .withMessage('Created successfully')
        .withUrl('https://trainingpeaks.com/workout/123')
        .withCreatedAt(new Date())
        .withProcessingTime(250)
        .withMetadata({
          version: '1.0',
          creator: 'sdk',
        })
        .build();

      mockCreateStructuredWorkout = vi
        .fn()
        .mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(result.workoutId).toBe('workout-123');
      expect(result.url).toBe('https://trainingpeaks.com/workout/123');
      expect(result.metadata).toEqual({ version: '1.0', creator: 'sdk' });
    });
  });
});