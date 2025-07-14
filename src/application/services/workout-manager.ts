/**
 * Workout Manager Service Contract
 * Application Layer - ONLY TYPE DEFINITIONS & CONTRACTS
 *
 * This defines what the workout manager capabilities the system needs
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type {
  logDebug,
  logError,
  logInfo,
  logWarn,
  logWithLevel,
} from '@/application/services/logger';
import type { ListWorkoutsRequest } from '@/application/use-cases/list-workouts';
import type { Workout } from '@/domain/entities/workout';
import type { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import type { CreateStructuredWorkoutResponse } from '@/types';

/**
 * Workout data for uploading
 */
export type WorkoutData = {
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
};

/**
 * Response for workout upload operations
 */
export type WorkoutUploadResponse = {
  /** Success status */
  success: boolean;
  /** Workout ID assigned by TrainingPeaks */
  workoutId?: string;
  /** Upload status message */
  message: string;
  /** Any upload errors */
  errors?: string[];
};

/**
 * Structured workout data for creation
 */
export type StructuredWorkoutData = {
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
};

/**
 * Workout search criteria
 */
export type WorkoutSearchCriteria = {
  text?: string;
  activityType?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
};

/**
 * Workout statistics filters
 */
export type WorkoutStatsFilters = {
  activityType?: string;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
};

/**
 * Workout statistics response
 */
export type WorkoutStatsResponse = {
  totalWorkouts: number;
  avgDuration?: number;
  avgDistance?: number;
  totalDistance?: number;
  totalDuration?: number;
};

/**
 * Contract for WorkoutManager operations
 * This is a PORT - defines what the application needs
 */
/**
 * Upload workout from data
 */
export type uploadWorkout = (
  workoutData: WorkoutData
) => Promise<WorkoutUploadResponse>;

/**
 * Upload workout from file
 */
export type uploadWorkoutFromFile = (
  filePath: string
) => Promise<WorkoutUploadResponse>;

/**
 * Get workout by ID
 */
export type getWorkout = (workoutId: string) => Promise<Workout>;

/**
 * List workouts with optional filters
 */
export type listWorkouts = (
  filters?: ListWorkoutsRequest
) => Promise<Workout[]>;

/**
 * Delete workout by ID
 */
export type deleteWorkout = (
  workoutId: string
) => Promise<{ success: boolean; message: string }>;

/**
 * Create structured workout
 */
export type createStructuredWorkout = (
  workoutData: StructuredWorkoutData
) => Promise<CreateStructuredWorkoutResponse>;

/**
 * Search workouts by criteria
 */
export type searchWorkouts = (
  criteria: WorkoutSearchCriteria
) => Promise<Workout[]>;

/**
 * Get workout statistics
 */
export type getWorkoutStats = (
  filters?: WorkoutStatsFilters
) => Promise<WorkoutStatsResponse>;

/**
 * Get workout repository (for advanced operations)
 */
export type getWorkoutRepository = () => WorkoutRepository;

/**
 * Workout manager configuration
 */
export type WorkoutManagerConfig = {
  baseUrl?: string;
  timeout?: number;
  debug?: boolean;
  headers?: Record<string, string>;
};

/**
 * Factory function signature for creating workout manager service
 * This defines the contract for how the service should be instantiated
 */
export type WorkoutManagerServiceFactory = (
  config?: WorkoutManagerConfig,
  logger?: {
    info: logInfo;
    error: logError;
    warn: logWarn;
    debug: logDebug;
    log: logWithLevel;
  }
) => {
  uploadWorkout: uploadWorkout;
  uploadWorkoutFromFile: uploadWorkoutFromFile;
  getWorkout: getWorkout;
  listWorkouts: listWorkouts;
  deleteWorkout: deleteWorkout;
  createStructuredWorkout: createStructuredWorkout;
  searchWorkouts: searchWorkouts;
  getWorkoutStats: getWorkoutStats;
  getWorkoutRepository: getWorkoutRepository;
};
