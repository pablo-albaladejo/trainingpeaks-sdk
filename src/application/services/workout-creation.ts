/**
 * Workout Creation Service Contract
 * Defines the interface for workout creation operations
 */

import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import { CreateStructuredWorkoutResponse } from '@/types';

/**
 * Metadata for workout creation
 */
export type WorkoutCreationMetadata = {
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

/**
 * Simple workout element for creating workouts from simple structures
 */
export type SimpleWorkoutElementForCreation = {
  type: 'step' | 'repetition';
  repetitions?: number;
  steps: {
    name: string;
    duration: number; // in seconds
    intensityMin: number;
    intensityMax: number;
    intensityClass: 'active' | 'rest' | 'warmUp' | 'coolDown';
  }[];
};

/**
 * Metadata for workout upload
 */
export type WorkoutUploadMetadata = {
  name?: string;
  description?: string;
  activityType?: string;
  tags?: string[];
  date?: Date;
  duration?: number;
  distance?: number;
};

/**
 * Response for workout upload operation
 */
export type WorkoutUploadResponse = {
  success: boolean;
  workoutId?: string;
  message: string;
  errors?: string[];
};

/**
 * Contract for workout creation operations
 * Defines what creation capabilities the system needs
 */
/**
 * Create a structured workout with business logic validation
 * @param athleteId - The athlete ID associated with the workout
 * @param title - The workout title
 * @param workoutTypeValueId - The workout type ID
 * @param workoutDay - The workout day
 * @param structure - The workout structure
 * @param metadata - Optional metadata for the workout
 * @returns Promise resolving to creation response
 */
export type createStructuredWorkout = (
  athleteId: number,
  title: string,
  workoutTypeValueId: number,
  workoutDay: string,
  structure: WorkoutStructure,
  metadata?: WorkoutCreationMetadata
) => Promise<CreateStructuredWorkoutResponse>;

/**
 * Create a structured workout from simple elements
 * @param athleteId - The athlete ID associated with the workout
 * @param title - The workout title
 * @param workoutTypeValueId - The workout type ID
 * @param workoutDay - The workout day
 * @param elements - Array of simple workout elements
 * @returns Promise resolving to creation response
 */
export type createStructuredWorkoutFromSimpleStructure = (
  athleteId: number,
  title: string,
  workoutTypeValueId: number,
  workoutDay: string,
  elements: SimpleWorkoutElementForCreation[]
) => Promise<CreateStructuredWorkoutResponse>;

/**
 * Upload a workout file with metadata
 * @param fileContent - The file content to upload
 * @param fileName - The name of the file
 * @param metadata - Optional metadata for the workout
 * @returns Promise resolving to upload response
 */
export type uploadWorkout = (
  fileContent: string,
  fileName: string,
  metadata?: WorkoutUploadMetadata
) => Promise<WorkoutUploadResponse>;

/**
 * Factory function signature for creating workout creation service
 * This defines the contract for how the service should be instantiated
 */
export type WorkoutCreationServiceFactory = (
  workoutRepository: unknown,
  validationService: unknown,
  utilityService: unknown
) => {
  createStructuredWorkout: createStructuredWorkout;
  createStructuredWorkoutFromSimpleStructure: createStructuredWorkoutFromSimpleStructure;
  uploadWorkout: uploadWorkout;
};
