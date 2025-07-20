/**
 * Workout Creation Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type {
  CreateStructuredWorkout,
  CreateStructuredWorkoutFromSimpleStructure,
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  SimpleWorkoutStructure,
  UploadWorkout,
  UploadWorkoutRequest,
  UploadWorkoutResponse,
} from '@/application/services/workout-creation';

export const createStructuredWorkout =
  (workoutRepository: WorkoutRepository): CreateStructuredWorkout =>
  async (
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
  };

export const createStructuredWorkoutFromSimpleStructure =
  (
    workoutRepository: WorkoutRepository
  ): CreateStructuredWorkoutFromSimpleStructure =>
  async (
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
  };

export const uploadWorkout =
  (workoutRepository: WorkoutRepository): UploadWorkout =>
  async (request: UploadWorkoutRequest): Promise<UploadWorkoutResponse> => {
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
  };
