/**
 * Workout Validation Service Types
 * Defines validation contracts for workout operations
 */

import type { WorkoutFile, WorkoutStructure } from '@/domain';
import type { CreateStructuredWorkoutRequest, WorkoutData } from '@/types';

export type ValidateWorkoutId = (id: string) => void;
export type ValidateWorkoutName = (name: string) => void;
export type ValidateWorkoutDate = (date: Date) => void;
export type ValidateWorkoutDuration = (duration: number) => void;
export type ValidateWorkoutDistance = (distance?: number) => void;
export type ValidateWorkoutStructure = (
  duration: number,
  structure?: WorkoutStructure
) => void;

/**
 * Validates workout file data
 */
export type ValidateWorkoutFile = (file: WorkoutFile) => void;

/**
 * Validates workout data structure
 */
export type ValidateWorkoutData = (workoutData: WorkoutData) => void;

/**
 * Validates list workouts filters
 */
export type ValidateListWorkoutsFilters = (filters?: {
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}) => void;

/**
 * Validates structured workout creation request
 */
export type ValidateStructuredWorkoutRequest = (
  request: CreateStructuredWorkoutRequest
) => void;

/**
 * Validates workout upload parameters
 */
export type ValidateWorkoutUpload = (
  workoutData: WorkoutData,
  file?: WorkoutFile
) => void;

/**
 * Validates workout search parameters
 */
export type ValidateWorkoutSearch = (query: {
  name?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) => void;

/**
 * Validates workout stats filters
 */
export type ValidateWorkoutStatsFilters = (filters?: {
  startDate?: Date;
  endDate?: Date;
  workoutType?: string;
}) => void;

/**
 * Validates file upload parameters
 */
export type ValidateFileUpload = (
  filename: string,
  buffer: Buffer,
  mimeType: string
) => void;

/**
 * Validates workout update data
 */
export type ValidateWorkoutUpdate = (
  workoutId: string,
  data: Partial<WorkoutData>
) => void;

/**
 * Validates athlete ID format
 */
export type ValidateAthleteId = (athleteId: string | number) => void;

/**
 * Validates workout type
 */
export type ValidateWorkoutType = (type: string) => void;

/**
 * Validates workout date range
 */
export type ValidateWorkoutDateRange = (startDate: Date, endDate: Date) => void;

/**
 * Validates pagination parameters
 */
export type ValidatePagination = (limit?: number, offset?: number) => void;

/**
 * Validates workout metadata
 */
export type ValidateWorkoutMetadata = (
  metadata: Record<string, unknown>
) => void;

/**
 * Validates workout targets
 */
export type ValidateWorkoutTargets = (
  targets: {
    minValue: number;
    maxValue: number;
    unit: string;
  }[]
) => void;

/**
 * Validates workout steps
 */
export type ValidateWorkoutSteps = (
  steps: {
    name: string;
    length: { value: number; unit: string };
    targets: { minValue: number; maxValue: number }[];
    intensityClass: string;
  }[]
) => void;

/**
 * Validates workout file size and type
 */
export type ValidateWorkoutFileConstraints = (
  filename: string,
  size: number,
  mimeType: string
) => void;

/**
 * Validates workout description
 */
export type ValidateWorkoutDescription = (description: string) => void;

/**
 * Validates workout tags
 */
export type ValidateWorkoutTags = (tags: string[]) => void;

/**
 * Validates workout equipment data
 */
export type ValidateWorkoutEquipment = (equipment: {
  bikeId?: string;
  shoeId?: string;
  [key: string]: unknown;
}) => void;

/**
 * Validates workout planned metrics
 */
export type ValidateWorkoutPlannedMetrics = (metrics: {
  distancePlanned?: number;
  totalTimePlanned?: number;
  caloriesPlanned?: number;
  tssPlanned?: number;
}) => void;

/**
 * Validates workout public settings
 */
export type ValidateWorkoutPublicSettings = (publicSetting: number) => void;

/**
 * Validates workout comments
 */
export type ValidateWorkoutComments = (comments: string[]) => void;

/**
 * Validates workout user tags
 */
export type ValidateWorkoutUserTags = (userTags: string) => void;

/**
 * Validates workout coach comments
 */
export type ValidateWorkoutCoachComments = (coachComments: string) => void;
