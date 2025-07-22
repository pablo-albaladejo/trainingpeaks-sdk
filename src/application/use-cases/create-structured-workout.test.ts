/**
 * Create Structured Workout Use Case Tests
 * Tests for the create structured workout use case following @unit-test-rule.mdc
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { structuredWorkoutRequestBuilder } from '../../__fixtures__/structured-workout-data.fixture';
import { randomString } from '../../__fixtures__/utils.fixture';
import { createStructuredWorkoutResponseBuilder } from '../../__fixtures__/workout-response.fixture';
import type {
  CreateStructuredWorkout,
  CreateStructuredWorkoutRequest as CreateStructuredWorkoutUseCaseRequest,
} from '../services/workout-creation';
import { createStructuredWorkoutUseCase } from './create-structured-workout';

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
        structure: structuredWorkoutRequestBuilder.build().structure,
      };

      const expectedResponse = createStructuredWorkoutResponseBuilder.build({
        workoutId: 'workout-123',
        success: true,
      });

      mockCreateStructuredWorkout = vi.fn().mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledTimes(1);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle creation failure', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Failed Workout',
        structure: structuredWorkoutRequestBuilder.build().structure,
      };

      const expectedResponse = createStructuredWorkoutResponseBuilder.build({
        success: false,
        message: 'Creation failed',
      });

      mockCreateStructuredWorkout = vi.fn().mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Creation failed');
    });

    it('should handle service errors correctly', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Error Workout',
        structure: structuredWorkoutRequestBuilder.build().structure,
      };

      const expectedError = new Error('Service error');
      mockCreateStructuredWorkout = vi.fn().mockRejectedValue(expectedError);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act & Assert
      await expect(
        createStructuredWorkoutUseCaseInstance.execute(request)
      ).rejects.toThrow('Service error');
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should pass through all request parameters', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Complete Workout',
        description: 'Full featured workout',
        structure: structuredWorkoutRequestBuilder.build().structure,
        tags: ['interval', 'running'],
        notes: 'Coach notes',
        equipment: ['bike-123', 'shoe-456'],
      };

      const expectedResponse = createStructuredWorkoutResponseBuilder.build();
      mockCreateStructuredWorkout = vi.fn().mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should work with minimal request data', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Minimal Workout',
        structure: structuredWorkoutRequestBuilder.build().structure,
      };

      const expectedResponse = createStructuredWorkoutResponseBuilder.build();
      mockCreateStructuredWorkout = vi.fn().mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should handle workout with intervals structure', async () => {
      // Arrange
      const intervalWorkout = structuredWorkoutRequestBuilder.build();
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Interval Workout',
        description: 'High-intensity interval training',
        structure: intervalWorkout.structure,
        tags: ['interval', 'hiit'],
      };

      const expectedResponse = createStructuredWorkoutResponseBuilder.build({
        workoutId: 'interval-123',
        estimatedCalories: 800,
      });

      mockCreateStructuredWorkout = vi.fn().mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.workoutId).toBe('interval-123');
      expect(result.estimatedCalories).toBe(800);
    });

    it('should handle random workout data', async () => {
      // Arrange
      const randomWorkout = structuredWorkoutRequestBuilder.build();
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: randomString(),
        description: randomString(50),
        structure: randomWorkout.structure,
        tags: [randomString(), randomString()],
      };

      const expectedResponse = createStructuredWorkoutResponseBuilder.build();
      mockCreateStructuredWorkout = vi.fn().mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(mockCreateStructuredWorkout).toHaveBeenCalledWith(request);
    });

    it('should preserve response metadata', async () => {
      // Arrange
      const request: CreateStructuredWorkoutUseCaseRequest = {
        name: 'Metadata Workout',
        structure: structuredWorkoutRequestBuilder.build().structure,
      };

      const expectedResponse = createStructuredWorkoutResponseBuilder.build({
        workoutId: 'meta-123',
        url: 'https://app.trainingpeaks.com/workout/meta-123',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        estimatedDuration: 3600,
        estimatedDistance: 10000,
        estimatedCalories: 600,
        uploadStatus: 'completed',
        processingTime: 250,
        metadata: {
          source: 'sdk',
          version: '1.0.0',
        },
      });

      mockCreateStructuredWorkout = vi.fn().mockResolvedValue(expectedResponse);
      createStructuredWorkoutUseCaseInstance = createStructuredWorkoutUseCase(
        mockCreateStructuredWorkout
      );

      // Act
      const result =
        await createStructuredWorkoutUseCaseInstance.execute(request);

      // Assert
      expect(result).toStrictEqual(expectedResponse);
      expect(result.workoutId).toBe('meta-123');
      expect(result.url).toBe('https://app.trainingpeaks.com/workout/meta-123');
      expect(result.estimatedDuration).toBe(3600);
      expect(result.estimatedDistance).toBe(10000);
      expect(result.estimatedCalories).toBe(600);
      expect(result.uploadStatus).toBe('completed');
      expect(result.processingTime).toBe(250);
      expect(result.metadata).toEqual({
        source: 'sdk',
        version: '1.0.0',
      });
    });
  });
});
