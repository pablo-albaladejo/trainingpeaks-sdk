/**
 * Workout Management Service Tests
 * Tests for the workout management service implementation following @unit-test-rule.mdc
 */

import { faker } from '@faker-js/faker';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { randomNumber, randomString } from '../../__fixtures__/utils.fixture';
import { createWorkoutManagementService } from './workout-management';

describe('Workout Management Service', () => {
  let workoutManagementService: ReturnType<
    typeof createWorkoutManagementService
  >;
  let mockWorkoutRepository: any;
  let mockValidationService: any;

  beforeEach(() => {
    // Arrange - Setup mocks
    mockWorkoutRepository = {
      getWorkout: vi.fn(),
      deleteWorkout: vi.fn(),
      uploadWorkout: vi.fn(),
      listWorkouts: vi.fn(),
      createStructuredWorkout: vi.fn(),
    };

    mockValidationService = {
      validateWorkoutId: vi.fn(),
      validateWorkoutCanBeDeleted: vi.fn(),
    };

    // Create service instance with mocks
    workoutManagementService = createWorkoutManagementService(
      mockWorkoutRepository,
      mockValidationService
    );
  });

  describe('deleteWorkout', () => {
    it('should delete workout successfully', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const mockWorkout = { id: workoutId, name: faker.lorem.words() };

      mockWorkoutRepository.getWorkout.mockResolvedValue(mockWorkout);
      mockWorkoutRepository.deleteWorkout.mockResolvedValue(true);
      mockValidationService.validateWorkoutId.mockImplementation(() => {});
      mockValidationService.validateWorkoutCanBeDeleted.mockImplementation(
        () => {}
      );

      // Act
      const result = await workoutManagementService.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(true);
      expect(mockValidationService.validateWorkoutId).toHaveBeenCalledWith(
        workoutId
      );
      expect(mockWorkoutRepository.getWorkout).toHaveBeenCalledWith(workoutId);
      expect(
        mockValidationService.validateWorkoutCanBeDeleted
      ).toHaveBeenCalledWith(mockWorkout);
      expect(mockWorkoutRepository.deleteWorkout).toHaveBeenCalledWith(
        workoutId
      );
    });

    it('should handle workout not found', async () => {
      // Arrange
      const workoutId = faker.string.uuid();

      mockWorkoutRepository.getWorkout.mockResolvedValue(null);
      mockValidationService.validateWorkoutId.mockImplementation(() => {});

      // Act & Assert
      await expect(
        workoutManagementService.deleteWorkout(workoutId)
      ).rejects.toThrow();
      expect(mockValidationService.validateWorkoutId).toHaveBeenCalledWith(
        workoutId
      );
      expect(mockWorkoutRepository.getWorkout).toHaveBeenCalledWith(workoutId);
      expect(mockWorkoutRepository.deleteWorkout).not.toHaveBeenCalled();
    });

    it('should handle validation errors', async () => {
      // Arrange
      const workoutId = '';
      const validationError = new Error('Invalid workout ID');

      mockValidationService.validateWorkoutId.mockImplementation(() => {
        throw validationError;
      });

      // Act & Assert
      await expect(
        workoutManagementService.deleteWorkout(workoutId)
      ).rejects.toThrow('Invalid workout ID');
      expect(mockValidationService.validateWorkoutId).toHaveBeenCalledWith(
        workoutId
      );
      expect(mockWorkoutRepository.getWorkout).not.toHaveBeenCalled();
    });

    it('should handle workout deletion failure', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const mockWorkout = { id: workoutId, name: faker.lorem.words() };

      mockWorkoutRepository.getWorkout.mockResolvedValue(mockWorkout);
      mockWorkoutRepository.deleteWorkout.mockResolvedValue(false);
      mockValidationService.validateWorkoutId.mockImplementation(() => {});
      mockValidationService.validateWorkoutCanBeDeleted.mockImplementation(
        () => {}
      );

      // Act
      const result = await workoutManagementService.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(false);
      expect(mockWorkoutRepository.deleteWorkout).toHaveBeenCalledWith(
        workoutId
      );
    });

    it('should validate workout can be deleted', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const mockWorkout = { id: workoutId, name: faker.lorem.words() };
      const deletionError = new Error('Cannot delete workout');

      mockWorkoutRepository.getWorkout.mockResolvedValue(mockWorkout);
      mockValidationService.validateWorkoutId.mockImplementation(() => {});
      mockValidationService.validateWorkoutCanBeDeleted.mockImplementation(
        () => {
          throw deletionError;
        }
      );

      // Act & Assert
      await expect(
        workoutManagementService.deleteWorkout(workoutId)
      ).rejects.toThrow('Cannot delete workout');
      expect(
        mockValidationService.validateWorkoutCanBeDeleted
      ).toHaveBeenCalledWith(mockWorkout);
      expect(mockWorkoutRepository.deleteWorkout).not.toHaveBeenCalled();
    });

    it('should handle repository errors', async () => {
      // Arrange
      const workoutId = randomNumber(1, 1000).toString();
      const repositoryError = new Error('Database error');

      mockWorkoutRepository.getWorkout.mockRejectedValue(repositoryError);
      mockValidationService.validateWorkoutId.mockImplementation(() => {});

      // Act & Assert
      await expect(
        workoutManagementService.deleteWorkout(workoutId)
      ).rejects.toThrow('Database error');
      expect(mockWorkoutRepository.getWorkout).toHaveBeenCalledWith(workoutId);
    });

    it('should work with random workout IDs', async () => {
      // Arrange
      const workoutId = randomString(randomNumber(5, 20));
      const mockWorkout = { id: workoutId, name: randomString(10) };

      mockWorkoutRepository.getWorkout.mockResolvedValue(mockWorkout);
      mockWorkoutRepository.deleteWorkout.mockResolvedValue(true);
      mockValidationService.validateWorkoutId.mockImplementation(() => {});
      mockValidationService.validateWorkoutCanBeDeleted.mockImplementation(
        () => {}
      );

      // Act
      const result = await workoutManagementService.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(true);
      expect(typeof workoutId).toBe('string');
      expect(workoutId.length).toBeGreaterThan(0);
    });
  });

  describe('service creation', () => {
    it('should create service with required dependencies', () => {
      // Arrange & Act
      const service = createWorkoutManagementService(
        mockWorkoutRepository,
        mockValidationService
      );

      // Assert
      expect(service).toBeDefined();
      expect(typeof service.deleteWorkout).toBe('function');
    });

    it('should create unique service instances', () => {
      // Arrange & Act
      const service1 = createWorkoutManagementService(
        mockWorkoutRepository,
        mockValidationService
      );
      const service2 = createWorkoutManagementService(
        mockWorkoutRepository,
        mockValidationService
      );

      // Assert
      expect(service1).toBeDefined();
      expect(service2).toBeDefined();
      expect(service1).not.toBe(service2);
    });
  });
});
