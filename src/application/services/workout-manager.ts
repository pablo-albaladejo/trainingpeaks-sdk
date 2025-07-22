/**
 * Workout Manager Service Contract
 * Defines the interface for complete workout management operations
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type { WorkoutFile, WorkoutStructure } from '@/domain';
import type { WorkoutData } from '@/types';

/**
 * Request parameters for uploading workout from file
 */
export type UploadWorkoutFromFileRequest = {
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
 * Response from uploading workout from file
 */
export type UploadWorkoutFromFileResponse = {
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
 * Request parameters for creating structured workout
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
 * Response from creating structured workout
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
 * Parameters for listing workouts
 */
export type ListWorkoutsParams = {
  limit?: number;
  offset?: number;
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  activityType?: string;
  difficulty?: string;
  sortBy?: 'date' | 'name' | 'duration' | 'distance';
  sortOrder?: 'asc' | 'desc';
};

/**
 * Response from listing workouts
 */
export type ListWorkoutsResponse = {
  workouts: WorkoutData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

/**
 * Parameters for searching workouts
 */
export type SearchWorkoutsParams = {
  query: string;
  limit?: number;
  offset?: number;
  filters?: {
    dateFrom?: Date;
    dateTo?: Date;
    tags?: string[];
    activityType?: string;
    difficulty?: string;
  };
};

/**
 * Response from searching workouts
 */
export type SearchWorkoutsResponse = {
  workouts: WorkoutData[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchQuery: string;
};

/**
 * Workout statistics summary
 */
export type WorkoutStats = {
  totalWorkouts: number;
  totalDuration: number;
  totalDistance: number;
  totalCalories: number;
  averageDuration: number;
  averageDistance: number;
  averageCalories: number;
  byActivityType: Record<
    string,
    {
      count: number;
      duration: number;
      distance: number;
      calories: number;
    }
  >;
  byDifficulty: Record<string, number>;
  byMonth: Record<string, number>;
  recentActivity: {
    lastWorkoutDate?: Date;
    streakDays: number;
    workoutsThisWeek: number;
    workoutsThisMonth: number;
  };
};

/**
 * Contract for workout manager operations
 * Defines comprehensive workout management capabilities
 */

/**
 * Upload workout from file
 * @param request - The workout upload request
 * @returns Promise resolving to upload response
 */
export type UploadWorkout = (
  request: UploadWorkoutFromFileRequest
) => Promise<UploadWorkoutFromFileResponse>;

/**
 * Upload workout from file (alias for uploadWorkout)
 * @param request - The workout upload request
 * @returns Promise resolving to upload response
 */
export type UploadWorkoutFromFile = (
  request: UploadWorkoutFromFileRequest
) => Promise<UploadWorkoutFromFileResponse>;

/**
 * Get workout by ID
 * @param workoutId - The ID of the workout to retrieve
 * @returns Promise resolving to workout data or null if not found
 */
export type GetWorkout = (workoutId: string) => Promise<WorkoutData | null>;

/**
 * List workouts with filters and pagination
 * @param params - The query parameters for listing workouts
 * @returns Promise resolving to list of workouts with pagination info
 */
export type ListWorkouts = (
  params: ListWorkoutsParams
) => Promise<ListWorkoutsResponse>;

/**
 * Delete workout by ID
 * @param workoutId - The ID of the workout to delete
 * @returns Promise resolving to boolean indicating success
 */
export type DeleteWorkout = (workoutId: string) => Promise<boolean>;

/**
 * Create structured workout
 * @param request - The structured workout creation request
 * @returns Promise resolving to workout creation response
 */
export type CreateStructuredWorkout = (
  request: CreateStructuredWorkoutRequest
) => Promise<CreateStructuredWorkoutResponse>;

/**
 * Search workouts by query
 * @param params - The search parameters
 * @returns Promise resolving to search results
 */
export type SearchWorkouts = (
  params: SearchWorkoutsParams
) => Promise<SearchWorkoutsResponse>;

/**
 * Get workout statistics
 * @param params - Optional parameters for statistics calculation
 * @returns Promise resolving to workout statistics
 */
export type GetWorkoutStats = (params?: {
  dateFrom?: Date;
  dateTo?: Date;
  activityType?: string;
}) => Promise<WorkoutStats>;

/**
 * Get workout repository instance
 * @returns The workout repository instance
 */
export type GetWorkoutRepository = () => WorkoutRepository;
