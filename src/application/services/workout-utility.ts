/**
 * Workout Utility Service Contract
 * Defines the interface for workout utility operations
 */

import { WorkoutStructure } from '@/domain/value-objects/workout-structure';

/**
 * Input parameters for building workout structure from simple elements
 */
export type SimpleWorkoutElement = {
  type: 'step' | 'repetition';
  repetitions?: number;
  steps: {
    name: string;
    duration: number;
    intensityMin: number;
    intensityMax: number;
    intensityClass: 'active' | 'rest' | 'warmUp' | 'coolDown';
  }[];
};

/**
 * Contract for workout utility operations
 * Defines what utility capabilities the system needs
 */
export type WorkoutUtilityService = {
  /**
   * Generate unique workout ID
   * @returns A unique workout identifier string
   */
  generateWorkoutId: () => string;

  /**
   * Map workout type ID to activity type
   * @param workoutTypeValueId - The workout type ID to map
   * @returns The corresponding activity type string
   */
  mapWorkoutTypeToActivityType: (workoutTypeValueId: number) => string;

  /**
   * Get MIME type from file name
   * @param fileName - The file name to analyze
   * @returns The corresponding MIME type string
   */
  getMimeTypeFromFileName: (fileName: string) => string;

  /**
   * Build structured workout from simple elements
   * @param elements - Array of simple workout elements
   * @returns A properly structured WorkoutStructure object
   */
  buildStructureFromSimpleElements: (
    elements: SimpleWorkoutElement[]
  ) => WorkoutStructure;
};

/**
 * Factory function signature for creating workout utility service
 * This defines the contract for how the service should be instantiated
 */
export type WorkoutUtilityServiceFactory = () => WorkoutUtilityService;
