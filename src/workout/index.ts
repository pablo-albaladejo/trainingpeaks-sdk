/**
 * Workout Management
 * Handles all workout-related operations including upload, creation, and retrieval
 */

import type { WorkoutDomainService } from '@/application/services/workout-domain';
import {
  createCreateStructuredWorkoutUseCase,
  CreateStructuredWorkoutUseCase,
  CreateStructuredWorkoutUseCaseRequest,
} from '@/application/use-cases/create-structured-workout';
import {
  createDeleteWorkoutUseCase,
  DeleteWorkoutRequest,
  DeleteWorkoutUseCase,
} from '@/application/use-cases/delete-workout';
import {
  createGetWorkoutUseCase,
  GetWorkoutRequest,
  GetWorkoutUseCase,
} from '@/application/use-cases/get-workout';
import {
  createListWorkoutsUseCase,
  ListWorkoutsRequest,
  ListWorkoutsUseCase,
} from '@/application/use-cases/list-workouts';
import {
  createUploadWorkoutUseCase,
  UploadWorkoutFromFileRequest,
  UploadWorkoutRequest,
  UploadWorkoutUseCase,
} from '@/application/use-cases/upload-workout';
import { getSDKConfig } from '@/config';
import { Workout } from '@/domain/entities/workout';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import { FileSystemAdapter } from '@/infrastructure/filesystem/file-system-adapter';
import {
  createTrainingPeaksWorkoutRepository,
  TrainingPeaksWorkoutRepository,
} from '@/infrastructure/repositories/training-peaks-workout';
import { createWorkoutDomainService } from '@/infrastructure/services/workout-domain';
import { TrainingPeaksWorkoutApiAdapter } from '@/infrastructure/workout/trainingpeaks-api-adapter';
import {
  CreateStructuredWorkoutResponse,
  TrainingPeaksClientConfig,
} from '@/types';

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

export interface StructuredWorkoutData {
  /** Athlete ID */
  athleteId: number;
  /** Workout title */
  title: string;
  /** Workout type ID */
  workoutTypeValueId: number;
  /** Workout date */
  workoutDay: string;
  /** Workout structure */
  structure: WorkoutStructure;
  /** Optional workout metadata */
  metadata?: {
    code?: string;
    description?: string;
    userTags?: string;
    coachComments?: string;
    publicSettingValue?: number;
    plannedMetrics?: {
      totalTimePlanned?: number;
      tssPlanned?: number;
      ifPlanned?: number;
      velocityPlanned?: number;
      caloriesPlanned?: number;
      distancePlanned?: number;
      elevationGainPlanned?: number;
      energyPlanned?: number;
    };
    equipment?: {
      bikeId?: number;
      shoeId?: number;
    };
  };
}

export class WorkoutManager {
  private readonly sdkConfig = getSDKConfig();
  private readonly workoutRepository!: TrainingPeaksWorkoutRepository['repository'];
  private readonly workoutDomainService!: WorkoutDomainService;
  private readonly uploadWorkoutUseCase!: UploadWorkoutUseCase;
  private readonly getWorkoutUseCase!: GetWorkoutUseCase;
  private readonly listWorkoutsUseCase!: ListWorkoutsUseCase;
  private readonly deleteWorkoutUseCase!: DeleteWorkoutUseCase;
  private readonly createStructuredWorkoutUseCase!: CreateStructuredWorkoutUseCase;

  constructor(config: TrainingPeaksClientConfig = {}) {
    this.setupDependencies(config);
  }

  private setupDependencies(config: TrainingPeaksClientConfig): void {
    const workoutServiceConfig = {
      baseUrl: config.baseUrl || this.sdkConfig.urls.baseUrl,
      timeout: config.timeout || this.sdkConfig.timeouts.default,
      debug: config.debug ?? this.sdkConfig.debug.enabled,
      headers: config.headers || this.sdkConfig.requests.defaultHeaders,
    };

    // Infrastructure Layer - External adapters
    const fileSystemAdapter = new FileSystemAdapter();
    const workoutApiAdapter = new TrainingPeaksWorkoutApiAdapter();

    // Adapters Layer - Repository implementations
    const workoutRepositoryFactory = createTrainingPeaksWorkoutRepository(
      fileSystemAdapter,
      workoutServiceConfig
    );

    // Register adapters with the repository
    workoutRepositoryFactory.registerWorkoutService(workoutApiAdapter);

    // Domain Layer - Domain service
    const workoutDomainService = createWorkoutDomainService(
      workoutRepositoryFactory.repository
    );

    // Store references
    (
      this as unknown as {
        workoutRepository: TrainingPeaksWorkoutRepository['repository'];
      }
    ).workoutRepository = workoutRepositoryFactory.repository;
    (
      this as unknown as { workoutDomainService: WorkoutDomainService }
    ).workoutDomainService = workoutDomainService;

    // Application Layer - Use Cases
    (
      this as unknown as {
        uploadWorkoutUseCase: UploadWorkoutUseCase;
      }
    ).uploadWorkoutUseCase = createUploadWorkoutUseCase(workoutDomainService);
    (
      this as unknown as {
        getWorkoutUseCase: GetWorkoutUseCase;
      }
    ).getWorkoutUseCase = createGetWorkoutUseCase(workoutDomainService);
    (
      this as unknown as {
        listWorkoutsUseCase: ListWorkoutsUseCase;
      }
    ).listWorkoutsUseCase = createListWorkoutsUseCase(workoutDomainService);
    (
      this as unknown as {
        deleteWorkoutUseCase: DeleteWorkoutUseCase;
      }
    ).deleteWorkoutUseCase = createDeleteWorkoutUseCase(workoutDomainService);
    (
      this as unknown as {
        createStructuredWorkoutUseCase: CreateStructuredWorkoutUseCase;
      }
    ).createStructuredWorkoutUseCase =
      createCreateStructuredWorkoutUseCase(workoutDomainService);
  }

  public async uploadWorkout(
    workoutData: WorkoutData
  ): Promise<WorkoutUploadResponse> {
    const request: UploadWorkoutRequest = {
      fileContent: workoutData.fileContent,
      fileName: workoutData.fileName,
      metadata: workoutData.metadata
        ? {
            name: workoutData.metadata.title,
            description: workoutData.metadata.description,
            tags: workoutData.metadata.tags,
            activityType: workoutData.metadata.activityType,
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
  }

  public async uploadWorkoutFromFile(
    filePath: string
  ): Promise<WorkoutUploadResponse> {
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
  }

  public async createStructuredWorkout(
    workoutData: StructuredWorkoutData
  ): Promise<CreateStructuredWorkoutResponse> {
    const request: CreateStructuredWorkoutUseCaseRequest = {
      athleteId: workoutData.athleteId,
      title: workoutData.title,
      workoutTypeValueId: workoutData.workoutTypeValueId,
      workoutDay: workoutData.workoutDay,
      structure: workoutData.structure,
      metadata: workoutData.metadata,
    };

    return await this.createStructuredWorkoutUseCase.execute(request);
  }

  public async createStructuredWorkoutFromSimpleStructure(
    athleteId: number,
    title: string,
    workoutTypeValueId: number,
    workoutDay: string,
    elements: {
      type: 'step' | 'repetition';
      repetitions?: number;
      steps: {
        name: string;
        duration: number; // in seconds
        intensityMin: number;
        intensityMax: number;
        intensityClass: 'active' | 'rest' | 'warmUp' | 'coolDown';
      }[];
    }[]
  ): Promise<CreateStructuredWorkoutResponse> {
    return await this.createStructuredWorkoutUseCase.createFromSimpleStructure(
      athleteId,
      title,
      workoutTypeValueId,
      workoutDay,
      elements
    );
  }

  public async getWorkout(workoutId: string): Promise<Workout> {
    const request: GetWorkoutRequest = { workoutId };
    return await this.getWorkoutUseCase.execute(request);
  }

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

  public async deleteWorkout(workoutId: string): Promise<boolean> {
    const request: DeleteWorkoutRequest = { workoutId };
    return await this.deleteWorkoutUseCase.execute(request);
  }

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

  public getWorkoutRepository(): TrainingPeaksWorkoutRepository['repository'] {
    return this.workoutRepository;
  }
}
