/**
 * Upload Workout Use Case
 * Handles workout upload operations
 */

import { WorkoutDomainService } from '@/application/services/workout-domain';
import { readFileSync } from 'fs';

export interface UploadWorkoutRequest {
  fileContent: string;
  fileName: string;
  metadata?: {
    name?: string;
    description?: string;
    activityType?: string;
    tags?: string[];
    date?: Date;
    duration?: number;
    distance?: number;
  };
}

export interface UploadWorkoutFromFileRequest {
  filePath: string;
  metadata?: {
    name?: string;
    description?: string;
    activityType?: string;
    tags?: string[];
  };
}

/**
 * Upload Workout Use Case Factory
 * Creates an upload workout use case with dependency injection
 */
export const createUploadWorkoutUseCase = (
  workoutDomainService: WorkoutDomainService
) => {
  /**
   * Upload workout from data
   */
  const execute = async (
    request: UploadWorkoutRequest
  ): Promise<{
    success: boolean;
    workoutId?: string;
    message: string;
    errors?: string[];
  }> => {
    try {
      // Delegate to domain service
      return await workoutDomainService.uploadWorkout(
        request.fileContent,
        request.fileName,
        request.metadata
      );
    } catch (error) {
      return {
        success: false,
        message: 'Upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  /**
   * Upload workout from file path
   */
  const executeFromFile = async (
    request: UploadWorkoutFromFileRequest
  ): Promise<{
    success: boolean;
    workoutId?: string;
    message: string;
    errors?: string[];
  }> => {
    try {
      // Read file content (this would be handled by infrastructure)
      const fileContent = readFileSync(request.filePath, 'utf8');
      const fileName = request.filePath.split('/').pop() || 'workout.tcx';

      // Delegate to domain service
      return await workoutDomainService.uploadWorkout(
        fileContent,
        fileName,
        request.metadata
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to read workout file',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  };

  return { execute, executeFromFile };
};

// Export the type for dependency injection
export type UploadWorkoutUseCase = ReturnType<
  typeof createUploadWorkoutUseCase
>;
