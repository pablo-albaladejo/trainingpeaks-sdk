/**
 * Workout Creation Service Contract
 * Defines the interface for workout creation operations
 */

import type { WorkoutFile } from '@/domain/value-objects/workout-file';
import type { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import type { WorkoutData } from '@/types';

/**
 * Request parameters for creating a structured workout
 */
export type CreateStructuredWorkoutRequest = {
  name: string;
  description?: string;
  structure: WorkoutStructure;
  tags?: string[];
  notes?: string;
  targetDate?: Date;
  estimatedDuration?: number;
  estimatedDistance?: number;
  estimatedCalories?: number;
  difficulty?: 'easy' | 'moderate' | 'hard' | 'extreme';
  activityType?: 'run' | 'bike' | 'swim' | 'strength' | 'other';
  equipment?: string[];
  location?: string;
  weatherConditions?: string;
  personalBest?: boolean;
  coachNotes?: string;
  publiclyVisible?: boolean;
  allowComments?: boolean;
  category?: string;
  subcategory?: string;
  season?: string;
  trainingPhase?: string;
  intensityZone?: number;
  rpeScale?: number;
  heartRateZones?: number[];
  powerZones?: number[];
  paceZones?: number[];
  customFields?: Record<string, unknown>;
};

/**
 * Response from creating a structured workout
 */
export type CreateStructuredWorkoutResponse = {
  workoutId: string;
  success: boolean;
  message?: string;
  url?: string;
  createdAt?: Date;
  estimatedDuration?: number;
  estimatedDistance?: number;
  estimatedCalories?: number;
  structure?: WorkoutStructure;
  validationWarnings?: string[];
  uploadStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processingTime?: number;
  metadata?: Record<string, unknown>;
};

/**
 * Simple workout structure for basic workout creation
 */
export type SimpleWorkoutStructure = {
  warmup?: { duration: number; intensity: string };
  main: Array<{
    duration: number;
    intensity: string;
    description?: string;
    repetitions?: number;
    restBetween?: number;
  }>;
  cooldown?: { duration: number; intensity: string };
};

/**
 * Request parameters for uploading a workout file
 */
export type UploadWorkoutRequest = {
  file: WorkoutFile;
  name?: string;
  description?: string;
  tags?: string[];
  activityType?: string;
  plannedDate?: Date;
  notes?: string;
  isPrivate?: boolean;
  category?: string;
  subcategory?: string;
  equipment?: string[];
  location?: string;
  weatherConditions?: string;
  personalBest?: boolean;
  coachNotes?: string;
  customFields?: Record<string, unknown>;
};

/**
 * Response from uploading a workout file
 */
export type UploadWorkoutResponse = {
  workoutId: string;
  success: boolean;
  message?: string;
  url?: string;
  processedData?: WorkoutData;
  fileInfo?: {
    originalName: string;
    size: number;
    type: string;
    uploadedAt: Date;
  };
  validationErrors?: string[];
  validationWarnings?: string[];
  processingTime?: number;
  metadata?: Record<string, unknown>;
};

/**
 * Contract for workout creation operations
 * Defines what creation capabilities the system needs
 */

/**
 * Create a structured workout with detailed specification
 * @param request - The structured workout creation request
 * @returns Promise resolving to workout creation response
 */
export type CreateStructuredWorkout = (
  request: CreateStructuredWorkoutRequest
) => Promise<CreateStructuredWorkoutResponse>;

/**
 * Create a structured workout from simple structure
 * @param name - Workout name
 * @param structure - Simple workout structure
 * @returns Promise resolving to workout creation response
 */
export type CreateStructuredWorkoutFromSimpleStructure = (
  name: string,
  structure: SimpleWorkoutStructure
) => Promise<CreateStructuredWorkoutResponse>;

/**
 * Upload a workout from file
 * @param request - The workout upload request
 * @returns Promise resolving to upload response
 */
export type UploadWorkout = (
  request: UploadWorkoutRequest
) => Promise<UploadWorkoutResponse>;
