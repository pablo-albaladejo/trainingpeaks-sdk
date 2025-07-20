/**
 * TrainingPeaks Workout Repository Tests
 * Tests for the TrainingPeaks workout repository implementation
 */

import { beforeEach, describe, expect, it, vi, MockedFunction } from 'vitest';
import { createTrainingPeaksWorkoutRepository } from './training-peaks-workout';
import { FileSystemPort, WorkoutServiceConfig, WorkoutServicePort, UploadResult } from '@/application/ports/workout';
import { Workout } from '@/domain/entities/workout';
import { WorkoutNotFoundError, WorkoutServiceUnavailableError, WorkoutValidationError } from '@/domain/errors/workout-errors';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import { workoutLogger } from '@/infrastructure/logging/logger';
import { TrainingPeaksWorkoutApiAdapter } from '@/infrastructure/workout/trainingpeaks-api-adapter';
import { CreateStructuredWorkoutRequest, CreateStructuredWorkoutResponse, WorkoutData, WorkoutType } from '@/types';
import { WorkoutDataFixture } from '../../__fixtures__/workout-data.fixture';
import { StructuredWorkoutDataFixture } from '../../__fixtures__/structured-workout-data.fixture';

// Mock external dependencies
vi.mock('@/infrastructure/logging/logger');
vi.mock('@/infrastructure/workout/trainingpeaks-api-adapter');

describe('TrainingPeaks Workout Repository', () => {
  let mockFileSystemAdapter: FileSystemPort;
  let mockWorkoutServiceAdapter: MockedFunction<WorkoutServicePort>;
  let config: WorkoutServiceConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock file system adapter
    mockFileSystemAdapter = {
      readFile: vi.fn(),
      writeFile: vi.fn(),
      deleteFile: vi.fn(),
      exists: vi.fn(),
      fileExists: vi.fn(),
      createDirectory: vi.fn(),
      listFiles: vi.fn(),
      getFileStats: vi.fn(),
      moveFile: vi.fn(),
      copyFile: vi.fn(),
    } as FileSystemPort;

    // Mock workout service adapter
    mockWorkoutServiceAdapter = {
      uploadWorkout: vi.fn(),
      getWorkout: vi.fn(),
      listWorkouts: vi.fn(),
      deleteWorkout: vi.fn(),
      createStructuredWorkout: vi.fn(),
      canHandle: vi.fn().mockReturnValue(true),
    } as any;

    // Mock TrainingPeaksWorkoutApiAdapter constructor
    vi.mocked(TrainingPeaksWorkoutApiAdapter).mockImplementation(() => mockWorkoutServiceAdapter);

    config = {
      baseUrl: 'https://api.trainingpeaks.com',
      timeout: 5000,
      retries: 3,
      headers: {},
      debug: false,
    };
  });

  describe('factory creation', () => {
    it('should create repository with API adapter registered', () => {
      // Act
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Assert
      expect(repository).toBeDefined();
      expect(repository.getWorkout).toBeDefined();
      expect(repository.listWorkouts).toBeDefined();
      expect(repository.deleteWorkout).toBeDefined();
      expect(repository.createStructuredWorkout).toBeDefined();
      expect(repository.uploadWorkout).toBeDefined();
      expect(repository.uploadWorkoutFromFile).toBeDefined();
      expect(repository.updateWorkout).toBeDefined();
      expect(repository.searchWorkouts).toBeDefined();
      expect(repository.getWorkoutStats).toBeDefined();
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'TrainingPeaks workout repository created with API adapter',
        expect.objectContaining({
          baseUrl: config.baseUrl,
          timeout: config.timeout,
        })
      );
    });

    it('should register TrainingPeaks API adapter', () => {
      // Act
      createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Assert
      expect(TrainingPeaksWorkoutApiAdapter).toHaveBeenCalledTimes(1);
    });
  });

  describe('service selection', () => {
    it('should throw error when no suitable workout service found', async () => {
      // Arrange
      mockWorkoutServiceAdapter.canHandle.mockReturnValue(false);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act & Assert
      await expect(repository.getWorkout('test-id')).resolves.toBeNull();
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to get workout via repository',
        expect.objectContaining({
          error: "Workout service 'TrainingPeaks' is unavailable: No suitable workout service found for the current configuration",
          errorType: 'WorkoutServiceUnavailableError',
        })
      );
    });

    it('should use service that can handle configuration', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      mockWorkoutServiceAdapter.getWorkout.mockResolvedValue(workoutData);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      await repository.getWorkout('test-id');

      // Assert
      expect(mockWorkoutServiceAdapter.canHandle).toHaveBeenCalledWith(config);
      expect(mockWorkoutServiceAdapter.getWorkout).toHaveBeenCalledWith('test-id');
    });
  });

  describe('uploadWorkout', () => {
    it('should successfully upload workout without file', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const expectedResult: UploadResult = {
        success: true,
        workoutId: 'workout-123',
        message: 'Upload successful',
      };
      mockWorkoutServiceAdapter.uploadWorkout.mockResolvedValue(expectedResult);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.uploadWorkout(workoutData);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockWorkoutServiceAdapter.uploadWorkout).toHaveBeenCalledWith(workoutData, undefined);
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Uploading workout via repository',
        expect.objectContaining({
          workoutName: workoutData.name,
          hasFile: false,
        })
      );
    });

    it('should successfully upload workout with file', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const workoutFile = WorkoutFile.create('test.tcx', '<tcx>...</tcx>', 'application/tcx+xml');
      const expectedResult: UploadResult = {
        success: true,
        workoutId: 'workout-123',
        message: 'Upload successful',
      };
      mockWorkoutServiceAdapter.uploadWorkout.mockResolvedValue(expectedResult);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.uploadWorkout(workoutData, workoutFile);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockWorkoutServiceAdapter.uploadWorkout).toHaveBeenCalledWith(workoutData, workoutFile);
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Uploading workout via repository',
        expect.objectContaining({
          workoutName: workoutData.name,
          hasFile: true,
        })
      );
    });

    it('should handle upload error and return failure result', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      const error = new Error('Upload failed');
      mockWorkoutServiceAdapter.uploadWorkout.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.uploadWorkout(workoutData);

      // Assert
      expect(result).toEqual({
        success: false,
        workoutId: '',
        message: 'Failed to upload workout',
        errors: ['Upload failed'],
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to upload workout via repository',
        expect.objectContaining({
          workoutName: workoutData.name,
          error: 'Upload failed',
          errorType: 'Error',
        })
      );
    });

    it('should handle unknown error types', async () => {
      // Arrange
      const workoutData = WorkoutDataFixture.default();
      mockWorkoutServiceAdapter.uploadWorkout.mockRejectedValue('String error');
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.uploadWorkout(workoutData);

      // Assert
      expect(result).toEqual({
        success: false,
        workoutId: '',
        message: 'Failed to upload workout',
        errors: ['Unknown error'],
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to upload workout via repository',
        expect.objectContaining({
          error: 'Unknown error',
          errorType: 'Unknown',
        })
      );
    });
  });

  describe('uploadWorkoutFromFile', () => {
    it('should successfully upload workout from file', async () => {
      // Arrange
      const filename = 'test.tcx';
      const buffer = Buffer.from('<tcx>...</tcx>');
      const mimeType = 'application/tcx+xml';
      const expectedResult: UploadResult = {
        success: true,
        workoutId: 'workout-123',
        message: 'Upload successful',
      };
      mockWorkoutServiceAdapter.uploadWorkout.mockResolvedValue(expectedResult);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.uploadWorkoutFromFile(filename, buffer, mimeType);

      // Assert
      expect(result).toEqual(expectedResult);
      expect(mockWorkoutServiceAdapter.uploadWorkout).toHaveBeenCalledWith(
        expect.objectContaining({
          name: filename,
          description: `Uploaded from file: ${filename}`,
          fileData: expect.objectContaining({
            filename,
            content: buffer,
            mimeType,
          }),
        }),
        expect.any(Object) // WorkoutFile instance
      );
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Uploading workout from file via repository',
        expect.objectContaining({
          filename,
          fileSize: buffer.length,
          mimeType,
        })
      );
    });

    it('should handle file upload error', async () => {
      // Arrange
      const filename = 'test.tcx';
      const buffer = Buffer.from('<tcx>...</tcx>');
      const mimeType = 'application/tcx+xml';
      const error = new Error('File upload failed');
      mockWorkoutServiceAdapter.uploadWorkout.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.uploadWorkoutFromFile(filename, buffer, mimeType);

      // Assert
      expect(result).toEqual({
        success: false,
        workoutId: '',
        message: 'Failed to upload workout',
        errors: ['File upload failed'],
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to upload workout via repository',
        expect.objectContaining({
          workoutName: filename,
          error: 'File upload failed',
          errorType: 'Error',
        })
      );
    });

    it('should handle invalid file data', async () => {
      // Arrange
      const filename = 'test.invalid';
      const buffer = Buffer.from('invalid content');
      const mimeType = 'application/invalid';
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.uploadWorkoutFromFile(filename, buffer, mimeType);

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(workoutLogger.error).toHaveBeenCalled();
    });
  });

  describe('createStructuredWorkout', () => {
    it('should successfully create structured workout', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest = StructuredWorkoutDataFixture.defaultCreateRequest();
      const expectedResponse: CreateStructuredWorkoutResponse = {
        success: true,
        workoutId: 123,
        message: 'Structured workout created successfully',
      };
      mockWorkoutServiceAdapter.createStructuredWorkout.mockResolvedValue(expectedResponse);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.createStructuredWorkout(request);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockWorkoutServiceAdapter.createStructuredWorkout).toHaveBeenCalledWith(request);
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Creating structured workout via repository',
        expect.objectContaining({
          title: request.title,
          athleteId: request.athleteId,
        })
      );
    });

    it('should handle create structured workout error', async () => {
      // Arrange
      const request: CreateStructuredWorkoutRequest = StructuredWorkoutDataFixture.defaultCreateRequest();
      const error = new Error('Creation failed');
      mockWorkoutServiceAdapter.createStructuredWorkout.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.createStructuredWorkout(request);

      // Assert
      expect(result).toEqual({
        success: false,
        message: 'Failed to create structured workout',
        errors: ['Creation failed'],
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to create structured workout via repository',
        expect.objectContaining({
          title: request.title,
          athleteId: request.athleteId,
          error: 'Creation failed',
          errorType: 'Error',
        })
      );
    });
  });

  describe('getWorkout', () => {
    it('should successfully get workout and convert to entity', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const workoutData = WorkoutDataFixture.default();
      mockWorkoutServiceAdapter.getWorkout.mockResolvedValue(workoutData);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkout(workoutId);

      // Assert
      expect(result).toBeInstanceOf(Workout);
      expect(result?.id).toBe(workoutId);
      expect(result?.name).toBe(workoutData.name);
      expect(result?.description).toBe(workoutData.description);
      expect(mockWorkoutServiceAdapter.getWorkout).toHaveBeenCalledWith(workoutId);
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Getting workout via repository',
        expect.objectContaining({
          workoutId,
        })
      );
    });

    it('should return null when workout not found', async () => {
      // Arrange
      const workoutId = 'nonexistent-workout';
      mockWorkoutServiceAdapter.getWorkout.mockResolvedValue(null);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkout(workoutId);

      // Assert
      expect(result).toBeNull();
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Workout not found via repository',
        expect.objectContaining({
          workoutId,
        })
      );
    });

    it('should handle get workout error and return null', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const error = new Error('Get workout failed');
      mockWorkoutServiceAdapter.getWorkout.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkout(workoutId);

      // Assert
      expect(result).toBeNull();
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to get workout via repository',
        expect.objectContaining({
          workoutId,
          error: 'Get workout failed',
          errorType: 'Error',
        })
      );
    });

    it('should handle workout data with default values', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const workoutData: WorkoutData = {
        name: 'Test Workout',
        // Missing optional fields
      };
      mockWorkoutServiceAdapter.getWorkout.mockResolvedValue(workoutData);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkout(workoutId);

      // Assert
      expect(result).toBeInstanceOf(Workout);
      expect(result?.name).toBe('Test Workout');
      expect(result?.description).toBe('');
      expect(result?.duration).toBe(0);
      expect(result?.distance).toBe(0);
      expect(result?.activityType).toBe('OTHER');
      expect(result?.tags).toEqual([]);
    });
  });

  describe('listWorkouts', () => {
    it('should successfully list workouts without options', async () => {
      // Arrange
      const workoutDataList = [
        WorkoutDataFixture.default(),
        new WorkoutDataFixture().withName('Workout 2').build(),
      ];
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue(workoutDataList);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.listWorkouts();

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Workout);
      expect(result[1]).toBeInstanceOf(Workout);
      expect(result[0].id).toBe('workout_0');
      expect(result[1].id).toBe('workout_1');
      expect(mockWorkoutServiceAdapter.listWorkouts).toHaveBeenCalledWith(undefined);
    });

    it('should successfully list workouts with options', async () => {
      // Arrange
      const options = {
        limit: 10,
        offset: 0,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
      };
      const workoutDataList = [WorkoutDataFixture.default()];
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue(workoutDataList);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.listWorkouts(options);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockWorkoutServiceAdapter.listWorkouts).toHaveBeenCalledWith(options);
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Listing workouts via repository',
        expect.objectContaining({
          options,
        })
      );
    });

    it('should handle list workouts error and return empty array', async () => {
      // Arrange
      const error = new Error('List workouts failed');
      mockWorkoutServiceAdapter.listWorkouts.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.listWorkouts();

      // Assert
      expect(result).toEqual([]);
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to list workouts via repository',
        expect.objectContaining({
          error: 'List workouts failed',
          errorType: 'Error',
        })
      );
    });

    it('should convert all workout data to entities with generated IDs', async () => {
      // Arrange
      const workoutDataList = Array.from({ length: 5 }, (_, i) =>
        new WorkoutDataFixture().withName(`Workout ${i + 1}`).build()
      );
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue(workoutDataList);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.listWorkouts();

      // Assert
      expect(result).toHaveLength(5);
      result.forEach((workout, index) => {
        expect(workout.id).toBe(`workout_${index}`);
        expect(workout.name).toBe(`Workout ${index + 1}`);
      });
    });
  });

  describe('deleteWorkout', () => {
    it('should successfully delete workout', async () => {
      // Arrange
      const workoutId = 'workout-123';
      mockWorkoutServiceAdapter.deleteWorkout.mockResolvedValue(true);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(true);
      expect(mockWorkoutServiceAdapter.deleteWorkout).toHaveBeenCalledWith(workoutId);
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Deleting workout via repository',
        expect.objectContaining({
          workoutId,
        })
      );
    });

    it('should handle delete workout failure', async () => {
      // Arrange
      const workoutId = 'workout-123';
      mockWorkoutServiceAdapter.deleteWorkout.mockResolvedValue(false);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(false);
    });

    it('should handle delete workout error and return false', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const error = new Error('Delete workout failed');
      mockWorkoutServiceAdapter.deleteWorkout.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.deleteWorkout(workoutId);

      // Assert
      expect(result).toBe(false);
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to delete workout via repository',
        expect.objectContaining({
          workoutId,
          error: 'Delete workout failed',
          errorType: 'Error',
        })
      );
    });
  });

  describe('updateWorkout', () => {
    it('should successfully update workout', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const existingWorkoutData = WorkoutDataFixture.default();
      const updateData = {
        name: 'Updated Workout',
        description: 'Updated description',
        type: WorkoutType.BIKE,
      };
      
      mockWorkoutServiceAdapter.getWorkout.mockResolvedValue(existingWorkoutData);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.updateWorkout(workoutId, updateData);

      // Assert
      expect(result).toBeInstanceOf(Workout);
      expect(result.name).toBe('Updated Workout');
      expect(result.description).toBe('Updated description');
      expect(result.activityType).toBe('BIKE');
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Updating workout via repository',
        expect.objectContaining({
          workoutId,
          updateFields: ['name', 'description', 'type'],
        })
      );
    });

    it('should throw WorkoutNotFoundError when workout does not exist', async () => {
      // Arrange
      const workoutId = 'nonexistent-workout';
      const updateData = { name: 'Updated Workout' };
      
      mockWorkoutServiceAdapter.getWorkout.mockResolvedValue(null);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act & Assert
      await expect(repository.updateWorkout(workoutId, updateData)).rejects.toThrow(WorkoutValidationError);
      await expect(repository.updateWorkout(workoutId, updateData)).rejects.toThrow('Failed to update workout');
    });

    it('should handle update error and throw WorkoutValidationError', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const updateData = { name: 'Updated Workout' };
      const error = new WorkoutNotFoundError(workoutId);
      
      mockWorkoutServiceAdapter.getWorkout.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act & Assert
      await expect(repository.updateWorkout(workoutId, updateData)).rejects.toThrow(WorkoutValidationError);
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to update workout via repository',
        expect.objectContaining({
          workoutId,
          error: `Workout with ID '${workoutId}' not found`,
          errorType: 'WorkoutNotFoundError',
        })
      );
    });

    it('should handle unknown error types in update', async () => {
      // Arrange
      const workoutId = 'workout-123';
      const updateData = { name: 'Updated Workout' };
      
      mockWorkoutServiceAdapter.getWorkout.mockRejectedValue('String error');
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act & Assert
      await expect(repository.updateWorkout(workoutId, updateData)).rejects.toThrow(WorkoutValidationError);
      await expect(repository.updateWorkout(workoutId, updateData)).rejects.toThrow('Failed to update workout');
    });
  });

  describe('searchWorkouts', () => {
    it('should successfully search workouts', async () => {
      // Arrange
      const query = {
        name: 'test',
        type: 'RUN',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        limit: 10,
        offset: 0,
      };
      const workoutDataList = [WorkoutDataFixture.default()];
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue(workoutDataList);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.searchWorkouts(query);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(Workout);
      expect(mockWorkoutServiceAdapter.listWorkouts).toHaveBeenCalledWith({
        limit: query.limit,
        offset: query.offset,
        startDate: query.startDate,
        endDate: query.endDate,
      });
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Searching workouts via repository',
        expect.objectContaining({
          query,
        })
      );
    });

    it('should handle search error and return empty array', async () => {
      // Arrange
      const query = { name: 'test' };
      const error = new Error('Search failed');
      mockWorkoutServiceAdapter.listWorkouts.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.searchWorkouts(query);

      // Assert
      expect(result).toEqual([]);
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to list workouts via repository',
        expect.objectContaining({
          error: 'Search failed',
          errorType: 'Error',
        })
      );
    });

    it('should search with minimal query', async () => {
      // Arrange
      const query = { name: 'test' };
      const workoutDataList = [WorkoutDataFixture.default()];
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue(workoutDataList);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.searchWorkouts(query);

      // Assert
      expect(result).toHaveLength(1);
      expect(mockWorkoutServiceAdapter.listWorkouts).toHaveBeenCalledWith({
        limit: undefined,
        offset: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });
  });

  describe('getWorkoutStats', () => {
    it('should successfully calculate workout stats without filters', async () => {
      // Arrange
      const workoutDataList = [
        new WorkoutDataFixture().withDuration(3600).withDistance(10000).build(),
        new WorkoutDataFixture().withDuration(1800).withDistance(5000).build(),
        new WorkoutDataFixture().withDuration(2700).withDistance(null as any).build(),
      ];
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue(workoutDataList);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkoutStats();

      // Assert
      expect(result).toEqual({
        totalWorkouts: 3,
        totalDuration: 8100, // 3600 + 1800 + 2700
        totalDistance: 15000, // 10000 + 5000 + 0
        averageDuration: 2700, // 8100 / 3
        averageDistance: 5000, // 15000 / 3
      });
      expect(workoutLogger.info).toHaveBeenCalledWith(
        'Getting workout stats via repository',
        expect.objectContaining({
          filters: undefined,
        })
      );
    });

    it('should successfully calculate workout stats with filters', async () => {
      // Arrange
      const filters = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        workoutType: 'RUN',
      };
      const workoutDataList = [
        new WorkoutDataFixture().withDuration(3600).withDistance(10000).build(),
      ];
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue(workoutDataList);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkoutStats(filters);

      // Assert
      expect(result).toEqual({
        totalWorkouts: 1,
        totalDuration: 3600,
        totalDistance: 10000,
        averageDuration: 3600,
        averageDistance: 10000,
      });
      expect(mockWorkoutServiceAdapter.listWorkouts).toHaveBeenCalledWith({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    });

    it('should handle empty workout list', async () => {
      // Arrange
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue([]);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkoutStats();

      // Assert
      expect(result).toEqual({
        totalWorkouts: 0,
        totalDuration: 0,
        totalDistance: 0,
        averageDuration: 0,
        averageDistance: 0,
      });
    });

    it('should handle get stats error and return zero stats', async () => {
      // Arrange
      const error = new Error('Get stats failed');
      mockWorkoutServiceAdapter.listWorkouts.mockRejectedValue(error);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkoutStats();

      // Assert
      expect(result).toEqual({
        totalWorkouts: 0,
        totalDuration: 0,
        totalDistance: 0,
        averageDuration: 0,
        averageDistance: 0,
      });
      expect(workoutLogger.error).toHaveBeenCalledWith(
        'Failed to list workouts via repository',
        expect.objectContaining({
          error: 'Get stats failed',
          errorType: 'Error',
        })
      );
    });

    it('should handle workouts with undefined distance', async () => {
      // Arrange
      const workoutDataList = [
        new WorkoutDataFixture().withDuration(3600).build(), // No distance set
        new WorkoutDataFixture().withDuration(1800).withDistance(5000).build(),
      ];
      // Remove distance to test undefined handling
      delete (workoutDataList[0] as any).distance;
      
      mockWorkoutServiceAdapter.listWorkouts.mockResolvedValue(workoutDataList);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.getWorkoutStats();

      // Assert
      expect(result.totalDistance).toBe(5000); // Only the second workout's distance
      expect(result.averageDistance).toBe(2500); // 5000 / 2
    });
  });

  describe('error handling', () => {
    it('should handle service unavailable error', async () => {
      // Arrange
      mockWorkoutServiceAdapter.canHandle.mockReturnValue(false);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act
      const result = await repository.uploadWorkout(WorkoutDataFixture.default());

      // Assert
      expect(result.success).toBe(false);
      expect(result.errors).toContain("Workout service 'TrainingPeaks' is unavailable: No suitable workout service found for the current configuration");
    });

    it('should handle all operations with service unavailable', async () => {
      // Arrange
      mockWorkoutServiceAdapter.canHandle.mockReturnValue(false);
      const repository = createTrainingPeaksWorkoutRepository(mockFileSystemAdapter, config);

      // Act & Assert
      expect(await repository.getWorkout('test')).toBeNull();
      expect(await repository.listWorkouts()).toEqual([]);
      expect(await repository.deleteWorkout('test')).toBe(false);
      
      const createResult = await repository.createStructuredWorkout(
        StructuredWorkoutDataFixture.defaultCreateRequest()
      );
      expect(createResult.success).toBe(false);

      const uploadResult = await repository.uploadWorkout(WorkoutDataFixture.default());
      expect(uploadResult.success).toBe(false);

      const fileUploadResult = await repository.uploadWorkoutFromFile(
        'test.tcx', 
        Buffer.from('test'), 
        'application/tcx+xml'
      );
      expect(fileUploadResult.success).toBe(false);

      await expect(repository.updateWorkout('test', {})).rejects.toThrow();
      
      expect(await repository.searchWorkouts({})).toEqual([]);
      
      const statsResult = await repository.getWorkoutStats();
      expect(statsResult.totalWorkouts).toBe(0);
    });
  });
});