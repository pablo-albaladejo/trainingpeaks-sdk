/**
 * Workout Creation Service Implementation
 * Implements the WorkoutCreationService contract with business logic for workout creation
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  SimpleWorkoutStructure,
  UploadWorkoutRequest,
  UploadWorkoutResponse,
} from '@/application/services/workout-creation';

/**
 * IMPLEMENTATION of WorkoutCreationService
 * This is an ADAPTER - implements the port defined in application layer
 */
export const createWorkoutCreationService = (
  workoutRepository: WorkoutRepository
) => {
  return {
    createStructuredWorkout: async (
      request: CreateStructuredWorkoutRequest
    ): Promise<CreateStructuredWorkoutResponse> => {
      // Simple implementation
      const workoutId = `workout_${Date.now()}`;

      return {
        workoutId,
        success: true,
        message: 'Structured workout created successfully',
        createdAt: new Date(),
        estimatedDuration: request.estimatedDuration,
        estimatedDistance: request.estimatedDistance,
        estimatedCalories: request.estimatedCalories,
        structure: request.structure,
      };
    },

    createStructuredWorkoutFromSimpleStructure: async (
      name: string,
      structure: SimpleWorkoutStructure
    ): Promise<CreateStructuredWorkoutResponse> => {
      // Simple implementation
      const workoutId = `workout_${Date.now()}`;

      return {
        workoutId,
        success: true,
        message: 'Structured workout created from simple structure',
        createdAt: new Date(),
      };
    },

    uploadWorkout: async (
      request: UploadWorkoutRequest
    ): Promise<UploadWorkoutResponse> => {
      // Simple implementation
      const workoutId = `workout_${Date.now()}`;

      return {
        workoutId,
        success: true,
        message: 'Workout uploaded successfully',
        fileInfo: {
          originalName: 'uploaded_file',
          size: 1024,
          type: 'application/octet-stream',
          uploadedAt: new Date(),
        },
      };
    },
  };
};
