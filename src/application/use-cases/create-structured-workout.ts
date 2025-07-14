/**
 * Create Structured Workout Use Case
 * Handles structured workout creation operations
 */

import { WorkoutDomainService } from '@/application/services/workout-domain';
import { WorkoutStructure } from '@/domain/value-objects/workout-structure';
import { CreateStructuredWorkoutResponse } from '@/types';

export interface CreateStructuredWorkoutUseCaseRequest {
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
    /** Workout code */
    code?: string;
    /** Workout description */
    description?: string;
    /** User tags */
    userTags?: string;
    /** Coach comments */
    coachComments?: string;
    /** Public setting value */
    publicSettingValue?: number;
    /** Planned metrics */
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
    /** Equipment */
    equipment?: {
      bikeId?: number;
      shoeId?: number;
    };
  };
}

/**
 * Create Structured Workout Use Case Factory
 * Creates a create structured workout use case with dependency injection
 */
export const createCreateStructuredWorkoutUseCase = (
  workoutDomainService: WorkoutDomainService
) => {
  /**
   * Create a structured workout
   */
  const execute = async (
    request: CreateStructuredWorkoutUseCaseRequest
  ): Promise<CreateStructuredWorkoutResponse> => {
    try {
      // Delegate to domain service
      return await workoutDomainService.createStructuredWorkout(
        request.athleteId,
        request.title,
        request.workoutTypeValueId,
        request.workoutDay,
        request.structure,
        request.metadata
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create structured workout',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  /**
   * Create a structured workout from a simplified structure
   */
  const createFromSimpleStructure = async (
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
  ): Promise<CreateStructuredWorkoutResponse> => {
    try {
      // Delegate to domain service
      return await workoutDomainService.createStructuredWorkoutFromSimpleStructure(
        athleteId,
        title,
        workoutTypeValueId,
        workoutDay,
        elements
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to create structured workout from simple structure',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  return { execute, createFromSimpleStructure };
};

// Export the type for dependency injection
export type CreateStructuredWorkoutUseCase = ReturnType<
  typeof createCreateStructuredWorkoutUseCase
>;
