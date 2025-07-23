/**
 * Workout Manager Service Implementation
 * Individual function implementations that receive dependencies as parameters
 */

import type { WorkoutRepository } from '@/application/ports/workout';
import type {
  CreateStructuredWorkout,
  DeleteWorkout,
  GetWorkout,
  GetWorkoutRepository,
  GetWorkoutStats,
  ListWorkouts,
  ListWorkoutsParams,
  ListWorkoutsResponse,
  CreateStructuredWorkoutRequest as ManagerCreateStructuredWorkoutRequest,
  CreateStructuredWorkoutResponse as ManagerCreateStructuredWorkoutResponse,
  SearchWorkouts,
  SearchWorkoutsParams,
  SearchWorkoutsResponse,
  UploadWorkout,
  UploadWorkoutFromFile,
  UploadWorkoutFromFileRequest,
  UploadWorkoutFromFileResponse,
  WorkoutStats,
} from '@/application/services/workout-manager';
import type { CreateStructuredWorkoutRequest, WorkoutData } from '@/types';

export const uploadWorkout =
  (workoutRepository: WorkoutRepository): UploadWorkout =>
  async (
    request: UploadWorkoutFromFileRequest
  ): Promise<UploadWorkoutFromFileResponse> => {
    return { success: true, workoutId: 'placeholder' };
  };

export const uploadWorkoutFromFile =
  (workoutRepository: WorkoutRepository): UploadWorkoutFromFile =>
  async (
    request: UploadWorkoutFromFileRequest
  ): Promise<UploadWorkoutFromFileResponse> => {
    return { success: true, workoutId: 'placeholder' };
  };

export const getWorkout =
  (workoutRepository: WorkoutRepository): GetWorkout =>
  async (workoutId: string): Promise<WorkoutData | null> => {
    return {
      name: 'Placeholder Workout',
      description: 'Placeholder workout description',
      date: new Date().toISOString(),
      duration: 3600,
      distance: 10000,
    };
  };

export const listWorkouts =
  (workoutRepository: WorkoutRepository): ListWorkouts =>
  async (params: ListWorkoutsParams): Promise<ListWorkoutsResponse> => {
    return {
      workouts: [],
      total: 0,
      page: 1,
      limit: params.limit || 10,
      hasMore: false,
    };
  };

export const deleteWorkout =
  (workoutRepository: WorkoutRepository): DeleteWorkout =>
  async (workoutId: string): Promise<boolean> => {
    return true;
  };

export const createStructuredWorkout =
  (workoutRepository: WorkoutRepository): CreateStructuredWorkout =>
  async (
    request: ManagerCreateStructuredWorkoutRequest
  ): Promise<ManagerCreateStructuredWorkoutResponse> => {
    try {
      // Convert the request to the format expected by the TrainingPeaks API
      const apiRequest: CreateStructuredWorkoutRequest = {
        athleteId: 5818494, // Using the provided athlete ID
        title: request.name,
        workoutTypeValueId: 3, // Default workout type
        workoutDay:
          request.targetDate?.toISOString().split('T')[0] + 'T00:00:00',
        structure: request.structure,
        metadata: {
          description: request.description,
          userTags: '',
          publicSettingValue: 2,
          plannedMetrics: {
            totalTimePlanned: request.estimatedDuration
              ? request.estimatedDuration / 3600
              : 0.8333333333333334,
            tssPlanned: 72.8,
            ifPlanned: 0.89,
            velocityPlanned: 3.1783333333333332,
          },
        },
      };

      // Call the repository directly
      const result =
        await workoutRepository.createStructuredWorkout(apiRequest);

      // Convert the response back to the expected format
      return {
        workoutId: result.workoutId?.toString() || 'unknown',
        success: result.success,
        message: result.message || 'Workout created successfully',
      };
    } catch (error) {
      return {
        workoutId: 'error',
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  };

export const searchWorkouts =
  (workoutRepository: WorkoutRepository): SearchWorkouts =>
  async (params: SearchWorkoutsParams): Promise<SearchWorkoutsResponse> => {
    return {
      workouts: [],
      total: 0,
      page: 1,
      limit: params.limit || 10,
      hasMore: false,
      searchQuery: params.query || '',
    };
  };

export const getWorkoutStats =
  (workoutRepository: WorkoutRepository): GetWorkoutStats =>
  async (params?: {
    dateFrom?: Date;
    dateTo?: Date;
    activityType?: string;
  }): Promise<WorkoutStats> => {
    return {
      totalWorkouts: 0,
      totalDuration: 0,
      totalDistance: 0,
      totalCalories: 0,
      averageDuration: 0,
      averageDistance: 0,
      averageCalories: 0,
      byActivityType: {},
      byDifficulty: {},
      byMonth: {},
      recentActivity: {
        streakDays: 0,
        workoutsThisWeek: 0,
        workoutsThisMonth: 0,
      },
    };
  };

export const getWorkoutRepository =
  (workoutRepository: WorkoutRepository): GetWorkoutRepository =>
  (): WorkoutRepository => {
    return workoutRepository;
  };
