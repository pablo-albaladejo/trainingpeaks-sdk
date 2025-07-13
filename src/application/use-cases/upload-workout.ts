/**
 * Upload Workout Use Case
 * Handles workout upload operations
 */

import { Workout } from '../../domain/entities/workout';
import {
  UploadResult,
  WorkoutRepository,
} from '../../domain/repositories/workout';
import { WorkoutFile } from '../../domain/value-objects/workout-file';

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

export class UploadWorkoutUseCase {
  constructor(private readonly workoutRepository: WorkoutRepository) {}

  /**
   * Upload workout from data
   */
  public async execute(request: UploadWorkoutRequest): Promise<UploadResult> {
    try {
      // Create workout file value object
      const workoutFile = WorkoutFile.create(
        request.fileName,
        request.fileContent,
        this.getMimeTypeFromFileName(request.fileName)
      );

      // Generate unique ID for the workout
      const workoutId = this.generateWorkoutId();

      // Create workout entity
      const workout = Workout.fromFile(
        workoutId,
        request.fileName,
        request.fileContent,
        request.metadata
      );

      // Upload through repository
      return await this.workoutRepository.uploadWorkout(workout);
    } catch (error) {
      return {
        success: false,
        message: 'Upload failed',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Upload workout from file path
   */
  public async executeFromFile(
    request: UploadWorkoutFromFileRequest
  ): Promise<UploadResult> {
    try {
      // Read file content (this would be handled by infrastructure)
      const { readFileSync } = require('fs');
      const fileContent = readFileSync(request.filePath, 'utf8');
      const fileName = request.filePath.split('/').pop() || 'workout.tcx';

      // Create workout file value object
      const workoutFile = WorkoutFile.create(
        fileName,
        fileContent,
        this.getMimeTypeFromFileName(fileName)
      );

      // Upload through repository
      return await this.workoutRepository.uploadWorkoutFromFile(
        workoutFile,
        request.metadata
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to read workout file',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  private generateWorkoutId(): string {
    return `workout_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;
  }

  private getMimeTypeFromFileName(fileName: string): string {
    const extension = fileName.toLowerCase().split('.').pop();

    switch (extension) {
      case 'tcx':
        return 'application/tcx+xml';
      case 'gpx':
        return 'application/gpx+xml';
      case 'fit':
        return 'application/fit';
      case 'xml':
        return 'application/xml';
      default:
        return 'application/octet-stream';
    }
  }
}
