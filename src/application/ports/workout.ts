/**
 * Workout Repository Interface
 * Defines the contract for workout repository implementations
 */

import { Workout } from '@/domain/entities/workout';
import { WorkoutFile } from '@/domain/value-objects/workout-file';
import {
  CreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse,
  WorkoutData,
} from '@/types';

export type UploadResult = {
  success: boolean;
  workoutId: string;
  message: string;
  errors?: string[];
};

export type WorkoutRepository = {
  getWorkout(id: string): Promise<Workout | null>;
  listWorkouts(options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Workout[]>;
  deleteWorkout(id: string): Promise<boolean>;
  createStructuredWorkout(
    request: CreateStructuredWorkoutRequest
  ): Promise<CreateStructuredWorkoutResponse>;
  uploadWorkout(
    workoutData: WorkoutData,
    file?: WorkoutFile
  ): Promise<UploadResult>;
  uploadWorkoutFromFile(
    filename: string,
    buffer: Buffer,
    mimeType: string
  ): Promise<UploadResult>;
  updateWorkout(id: string, data: Partial<WorkoutData>): Promise<Workout>;
  searchWorkouts(query: {
    name?: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Workout[]>;
  getWorkoutStats(filters?: {
    startDate?: Date;
    endDate?: Date;
    workoutType?: string;
  }): Promise<{
    totalWorkouts: number;
    totalDuration: number;
    totalDistance: number;
    averageDuration: number;
    averageDistance: number;
  }>;
};

export type FileSystemPort = {
  readFile(filePath: string): Promise<Buffer>;
  writeFile(filePath: string, data: Buffer): Promise<void>;
  deleteFile(filePath: string): Promise<void>;
  exists(filePath: string): Promise<boolean>;
  fileExists(filePath: string): Promise<boolean>;
  createDirectory(dirPath: string): Promise<void>;
  listFiles(dirPath: string): Promise<string[]>;
  getFileStats(filePath: string): Promise<{
    size: number;
    created: Date;
    modified: Date;
  }>;
  moveFile(sourcePath: string, destPath: string): Promise<void>;
  copyFile(sourcePath: string, destPath: string): Promise<void>;
};

export type WorkoutServiceConfig = {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  debug?: boolean;
};

export type WorkoutServicePort = {
  uploadWorkout(
    workoutData: WorkoutData,
    file?: WorkoutFile
  ): Promise<UploadResult>;
  getWorkout(id: string): Promise<WorkoutData | null>;
  listWorkouts(options?: {
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<WorkoutData[]>;
  deleteWorkout(id: string): Promise<boolean>;
  createStructuredWorkout(
    request: CreateStructuredWorkoutRequest
  ): Promise<CreateStructuredWorkoutResponse>;
  canHandle(config: WorkoutServiceConfig): boolean;
};
