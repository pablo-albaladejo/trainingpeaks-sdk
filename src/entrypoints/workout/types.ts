import { Logger } from '@/adapters';
import { TrainingPeaksRepository } from '@/application';

/**
 * Workout Entrypoint Dependencies
 */
export type WorkoutEntrypointDependencies = {
  tpRepository: TrainingPeaksRepository;
  logger: Logger;
};

/**
 * Get Workout Response
 */
export type GetWorkoutResponse = {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description: string;
    date: string; // ISO date string
    duration: number; // seconds
    distance?: number; // meters
    activityType?: string;
    tags?: readonly string[];
  };
  error?: {
    code: string;
    message: string;
  };
};

/**
 * Get Workouts List Response
 */
export type GetWorkoutsResponse = {
  success: boolean;
  data?: {
    workouts: readonly {
      id: string;
      name: string;
      description: string;
      date: string;
      duration: number;
      distance?: number;
      activityType?: string;
      tags?: readonly string[];
    }[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
  error?: {
    code: string;
    message: string;
  };
};

/**
 * Create Workout Command
 */
export type CreateWorkoutCommand = {
  name: string;
  description: string;
  date: string; // ISO date string
  duration: number;
  distance?: number;
  activityType?: string;
  tags?: readonly string[];
  fileContent?: string;
  fileName?: string;
};

/**
 * Create Workout Response
 */
export type CreateWorkoutResponse = {
  success: boolean;
  data?: {
    id: string;
    name: string;
    description: string;
    date: string;
    duration: number;
    distance?: number;
    activityType?: string;
    tags?: readonly string[];
  };
  error?: {
    code: string;
    message: string;
  };
};

/**
 * Update Workout Command
 */
export type UpdateWorkoutCommand = {
  id: string;
  name?: string;
  description?: string;
  date?: string;
  duration?: number;
  distance?: number;
  activityType?: string;
  tags?: readonly string[];
};

/**
 * Update Workout Response
 */
export type UpdateWorkoutResponse = CreateWorkoutResponse;

/**
 * Delete Workout Response
 */
export type DeleteWorkoutResponse = {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
};
