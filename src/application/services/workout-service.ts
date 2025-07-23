/**
 * Workout Service Contracts
 * Individual function types for workout services
 * Includes both internal service contracts and external adapter ports
 */

import type { Workout, WorkoutFile, WorkoutStructure } from '@/domain';
import type {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  WorkoutData,
} from '@/types';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export type WorkoutServiceConfig = {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  debug?: boolean;
};

// ============================================================================
// UPLOAD RESULT TYPE
// ============================================================================

export type UploadResult = {
  success: boolean;
  workoutId: string;
  message: string;
  errors?: string[];
};

// ============================================================================
// INTERNAL WORKOUT SERVICE CONTRACTS
// ============================================================================

/**
 * Validate workout structure service contract
 */
export type ValidateWorkoutStructureService = (
  structure: WorkoutStructure
) => boolean;

/**
 * Create structured workout service contract
 */
export type CreateStructuredWorkoutService = (
  request: CreateStructuredWorkoutRequest
) => Promise<CreateStructuredWorkoutResponse>;

// ============================================================================
// EXTERNAL WORKOUT ADAPTER PORTS
// ============================================================================

/**
 * Upload workout data to external service
 */
export type UploadWorkoutToService = (
  workoutData: WorkoutData,
  file?: WorkoutFile
) => Promise<UploadResult>;

/**
 * Get workout data from external service
 */
export type GetWorkoutFromService = (id: string) => Promise<WorkoutData | null>;

/**
 * List workouts from external service
 */
export type ListWorkoutsFromService = (options?: {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}) => Promise<WorkoutData[]>;

/**
 * Delete workout from external service
 */
export type DeleteWorkoutFromService = (id: string) => Promise<boolean>;

/**
 * Create structured workout in external service
 */
export type CreateStructuredWorkoutInService = (
  request: CreateStructuredWorkoutRequest
) => Promise<CreateStructuredWorkoutResponse>;

/**
 * Upload workout from file to external service
 */
export type UploadWorkoutFileToService = (
  filename: string,
  buffer: Buffer,
  mimeType: string
) => Promise<UploadResult>;

/**
 * Update workout in external service
 */
export type UpdateWorkoutInService = (
  id: string,
  data: Partial<WorkoutData>
) => Promise<Workout>;

/**
 * Search workouts in external service
 */
export type SearchWorkoutsInService = (query: {
  name?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) => Promise<Workout[]>;

/**
 * Get workout statistics from external service
 */
export type GetWorkoutStatsFromService = (filters?: {
  startDate?: Date;
  endDate?: Date;
  workoutType?: string;
}) => Promise<{
  totalWorkouts: number;
  totalDuration: number;
  totalDistance: number;
  averageDuration: number;
  averageDistance: number;
}>;

/**
 * Validate if service can handle the given configuration
 */
export type CanHandleWorkoutServiceConfig = (
  config: WorkoutServiceConfig
) => boolean;
