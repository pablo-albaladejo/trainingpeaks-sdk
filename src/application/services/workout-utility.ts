/**
 * Workout Utility Service Contract
 * Defines the interface for workout utility operations
 */

import type { WorkoutStructure } from '@/domain';
import {
  ActivityType as ActivityTypeEnum,
  SimpleWorkoutElementType,
  WorkoutTypeInternal,
} from '@/types';

/**
 * Simple workout element for utility operations
 */
export type SimpleWorkoutElement = {
  type: SimpleWorkoutElementType;
  duration: number;
  intensity: string;
  description?: string;
  repetitions?: number;
  restBetween?: number;
};

/**
 * Activity type mapping
 */
export type ActivityType = ActivityTypeEnum;

/**
 * Workout type for internal operations
 */
export type WorkoutType = WorkoutTypeInternal;

/**
 * Contract for workout utility operations
 * Defines what utility capabilities the system needs
 */

/**
 * Generate a unique workout ID
 * @returns String representing a unique workout identifier
 */
export type GenerateWorkoutId = () => string;

/**
 * Get MIME type from file name
 * @param fileName - The name of the file
 * @returns String representing the MIME type
 */
export type GetMimeTypeFromFileName = (fileName: string) => string;

/**
 * Map workout type to activity type
 * @param workoutType - The workout type to map
 * @returns Corresponding activity type
 */
export type MapWorkoutTypeToActivityType = (
  workoutType: WorkoutType
) => ActivityType;

/**
 * Build workout structure from simple elements
 * @param elements - Array of simple workout elements
 * @returns Built workout structure
 */
export type BuildStructureFromSimpleElements = (
  elements: SimpleWorkoutElement[]
) => WorkoutStructure;
