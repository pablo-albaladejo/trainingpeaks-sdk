/**
 * Workout Management Module
 *
 * This module provides a facade for workout operations:
 * - Domain: Workout entities and business rules
 * - Application: Use cases and ports
 * - Infrastructure: External adapters
 * - Adapters: Repository implementations
 */

import { TrainingPeaksWorkoutRepository } from '../adapters/training-peaks-workout-repository';
import {
  DeleteWorkoutRequest,
  DeleteWorkoutUseCase,
} from '../application/use-cases/delete-workout';
import {
  GetWorkoutRequest,
  GetWorkoutUseCase,
} from '../application/use-cases/get-workout';
import {
  ListWorkoutsRequest,
  ListWorkoutsUseCase,
} from '../application/use-cases/list-workouts';
import {
  UploadWorkoutFromFileRequest,
  UploadWorkoutRequest,
  UploadWorkoutUseCase,
} from '../application/use-cases/upload-workout';
import { getSDKConfig } from '../config';
import { Workout } from '../domain/entities/workout';
import { FileSystemAdapter } from '../infrastructure/filesystem/file-system-adapter';
import { TrainingPeaksWorkoutApiAdapter } from '../infrastructure/workout/trainingpeaks-api-adapter';
import { TrainingPeaksClientConfig } from '../types';

export interface WorkoutData {
  /** The workout file content (TCX, GPX, FIT, etc.) */
  fileContent: string;
  /** The workout file name */
  fileName: string;
  /** Optional workout metadata */
  metadata?: {
    title?: string;
    description?: string;
    tags?: string[];
    activityType?: string;
  };
}

export interface WorkoutUploadResponse {
  /** Success status */
  success: boolean;
  /** Workout ID assigned by TrainingPeaks */
  workoutId?: string;
  /** Upload status message */
  message: string;
  /** Any upload errors */
  errors?: string[];
}

export class WorkoutManager {
  private readonly sdkConfig = getSDKConfig();
  private readonly workoutRepository!: TrainingPeaksWorkoutRepository;
  private readonly uploadWorkoutUseCase!: UploadWorkoutUseCase;
  private readonly getWorkoutUseCase!: GetWorkoutUseCase;
  private readonly listWorkoutsUseCase!: ListWorkoutsUseCase;
  private readonly deleteWorkoutUseCase!: DeleteWorkoutUseCase;

  constructor(config: TrainingPeaksClientConfig = {}) {
    // Setup dependency injection following hexagonal architecture
    this.setupDependencies(config);
  }

  /**
   * Setup dependency injection for hexagonal architecture
   */
  private setupDependencies(config: TrainingPeaksClientConfig): void {
    // Create workout service configuration
    const workoutServiceConfig = {
      baseUrl: config.baseUrl || this.sdkConfig.urls.baseUrl,
      timeout: config.timeout || this.sdkConfig.timeouts.default,
      debug: config.debug ?? this.sdkConfig.debug.enabled,
      headers: config.headers || this.sdkConfig.requests.defaultHeaders,
    };

    // Infrastructure Layer - File system adapter
    const fileSystemAdapter = new FileSystemAdapter();

    // Adapters Layer - Repository implementation
    const workoutRepository = new TrainingPeaksWorkoutRepository(
      fileSystemAdapter,
      workoutServiceConfig
    );

    // Infrastructure Layer - Workout service adapters
    const trainingPeaksApiAdapter = new TrainingPeaksWorkoutApiAdapter();

    // Register adapters with the repository
    workoutRepository.registerWorkoutService(trainingPeaksApiAdapter);

    // Store repository reference
    (
      this as unknown as {
        workoutRepository: TrainingPeaksWorkoutRepository;
      }
    ).workoutRepository = workoutRepository;

    // Application Layer - Use Cases
    (
      this as unknown as {
        uploadWorkoutUseCase: UploadWorkoutUseCase;
      }
    ).uploadWorkoutUseCase = new UploadWorkoutUseCase(workoutRepository);
    (
      this as unknown as {
        getWorkoutUseCase: GetWorkoutUseCase;
      }
    ).getWorkoutUseCase = new GetWorkoutUseCase(workoutRepository);
    (
      this as unknown as {
        listWorkoutsUseCase: ListWorkoutsUseCase;
      }
    ).listWorkoutsUseCase = new ListWorkoutsUseCase(workoutRepository);
    (
      this as unknown as {
        deleteWorkoutUseCase: DeleteWorkoutUseCase;
      }
    ).deleteWorkoutUseCase = new DeleteWorkoutUseCase(workoutRepository);
  }

  /**
   * Upload a workout file to TrainingPeaks
   */
  public async uploadWorkout(
    workoutData: WorkoutData
  ): Promise<WorkoutUploadResponse> {
    try {
      const request: UploadWorkoutRequest = {
        fileContent: workoutData.fileContent,
        fileName: workoutData.fileName,
        metadata: workoutData.metadata
          ? {
              name: workoutData.metadata.title,
              description: workoutData.metadata.description,
              activityType: workoutData.metadata.activityType,
              tags: workoutData.metadata.tags,
            }
          : undefined,
      };

      const result = await this.uploadWorkoutUseCase.execute(request);

      return {
        success: result.success,
        workoutId: result.workoutId,
        message: result.message,
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Upload a workout file from disk
   */
  public async uploadWorkoutFromFile(
    filePath: string
  ): Promise<WorkoutUploadResponse> {
    try {
      const request: UploadWorkoutFromFileRequest = {
        filePath,
      };

      const result = await this.uploadWorkoutUseCase.executeFromFile(request);

      return {
        success: result.success,
        workoutId: result.workoutId,
        message: result.message,
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to read workout file',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Get workout details by ID
   */
  public async getWorkout(workoutId: string): Promise<Workout> {
    const request: GetWorkoutRequest = { workoutId };
    return await this.getWorkoutUseCase.execute(request);
  }

  /**
   * List user's workouts
   */
  public async listWorkouts(filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<Workout[]> {
    const request: ListWorkoutsRequest = filters || {};
    return await this.listWorkoutsUseCase.execute(request);
  }

  /**
   * Delete a workout by ID
   */
  public async deleteWorkout(workoutId: string): Promise<boolean> {
    const request: DeleteWorkoutRequest = { workoutId };
    return await this.deleteWorkoutUseCase.execute(request);
  }

  /**
   * Search workouts by criteria
   */
  public async searchWorkouts(query: {
    text?: string;
    activityType?: string;
    dateRange?: {
      start: Date;
      end: Date;
    };
    durationRange?: {
      min: number;
      max: number;
    };
    distanceRange?: {
      min: number;
      max: number;
    };
  }): Promise<Workout[]> {
    return await this.workoutRepository.searchWorkouts(query);
  }

  /**
   * Get workout statistics
   */
  public async getWorkoutStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    activityType?: string;
  }): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    totalDistance: number;
    averageDuration: number;
    averageDistance: number;
  }> {
    return await this.workoutRepository.getWorkoutStats(filters);
  }

  /**
   * Get workout repository for advanced operations
   */
  public getWorkoutRepository(): TrainingPeaksWorkoutRepository {
    return this.workoutRepository;
  }
}

// Export the WorkoutManager class as the default export
export default WorkoutManager;
