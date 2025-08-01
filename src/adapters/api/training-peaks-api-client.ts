/**
 * TrainingPeaks API Client
 * Main API client that composes all entity-specific API clients
 */

import { getSDKConfig } from '@/config';
import type {
  AuthToken,
  CreateWorkoutRequest,
  Credentials,
  UpdateWorkoutRequest,
  User,
  UserPreferences,
  WorkoutFilters,
  WorkoutResponse,
  WorkoutsListResponse,
  WorkoutStats,
} from '@/domain/schemas';
import { authenticateUser } from '@/infrastructure/services/authenticate-user';
import { createWorkout } from '@/infrastructure/services/create-workout';
import { deleteWorkout } from '@/infrastructure/services/delete-workout';
import { getCurrentUser } from '@/infrastructure/services/get-current-user';
import { getUserSettings } from '@/infrastructure/services/get-user-settings';
import { getWorkoutById } from '@/infrastructure/services/get-workout-by-id';
import { getWorkoutStats } from '@/infrastructure/services/get-workout-stats';
import { getWorkouts } from '@/infrastructure/services/get-workouts';
import { refreshUserToken } from '@/infrastructure/services/refresh-user-token';
import { updateUserPreferences } from '@/infrastructure/services/update-user-preferences';
import { updateWorkout } from '@/infrastructure/services/update-workout';
import { UsersApiClient } from './modules/users-api-client';
import { WorkoutsApiClient } from './modules/workouts-api-client';

export interface TrainingPeaksApiClientConfig {
  baseURL: string;
  timeout?: number;
  version?: string;
}

/**
 * Main API client for TrainingPeaks API
 * Provides high-level service methods and direct repository access
 */
export class TrainingPeaksApiClient {
  public readonly users: UsersApiClient;
  public readonly workouts: WorkoutsApiClient;

  private readonly sdkConfig = getSDKConfig();

  // Service implementations
  private readonly authenticateUserService: ReturnType<typeof authenticateUser>;
  private readonly getCurrentUserService: ReturnType<typeof getCurrentUser>;
  private readonly refreshUserTokenService: ReturnType<typeof refreshUserToken>;
  private readonly updateUserPreferencesService: ReturnType<
    typeof updateUserPreferences
  >;
  private readonly getUserSettingsService: ReturnType<typeof getUserSettings>;
  private readonly getWorkoutsService: ReturnType<typeof getWorkouts>;
  private readonly getWorkoutByIdService: ReturnType<typeof getWorkoutById>;
  private readonly createWorkoutService: ReturnType<typeof createWorkout>;
  private readonly updateWorkoutService: ReturnType<typeof updateWorkout>;
  private readonly deleteWorkoutService: ReturnType<typeof deleteWorkout>;
  private readonly getWorkoutStatsService: ReturnType<typeof getWorkoutStats>;

  constructor(config: TrainingPeaksApiClientConfig) {
    // Initialize API clients (repositories)
    this.users = new UsersApiClient({
      baseURL: config.baseURL,
      timeout: config.timeout || this.sdkConfig.timeouts.apiAuth,
      version: config.version || 'v3',
    });

    this.workouts = new WorkoutsApiClient({
      baseURL: config.baseURL,
      timeout: config.timeout || this.sdkConfig.timeouts.apiAuth,
      version: config.version || 'v1',
    });

    // Initialize service implementations with repositories
    this.authenticateUserService = authenticateUser(this.users);
    this.getCurrentUserService = getCurrentUser(this.users);
    this.refreshUserTokenService = refreshUserToken(this.users);
    this.updateUserPreferencesService = updateUserPreferences(this.users);
    this.getUserSettingsService = getUserSettings(this.users);
    this.getWorkoutsService = getWorkouts(this.workouts);
    this.getWorkoutByIdService = getWorkoutById(this.workouts);
    this.createWorkoutService = createWorkout(this.workouts);
    this.updateWorkoutService = updateWorkout(this.workouts);
    this.deleteWorkoutService = deleteWorkout(this.workouts);
    this.getWorkoutStatsService = getWorkoutStats(this.workouts);
  }

  // User Operations (High-level service methods)

  /**
   * Authenticate user with credentials
   */
  async authenticateUser(
    credentials: Credentials
  ): Promise<{ token: AuthToken; user: User }> {
    return this.authenticateUserService(credentials);
  }

  /**
   * Get current user information
   */
  async getCurrentUser(token: AuthToken): Promise<User> {
    return this.getCurrentUserService(token);
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<AuthToken> {
    return this.refreshUserTokenService(refreshToken);
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(
    token: AuthToken,
    preferences: UserPreferences
  ): Promise<void> {
    return this.updateUserPreferencesService(token, preferences);
  }

  /**
   * Get user settings
   */
  async getUserSettings(token: AuthToken): Promise<UserPreferences> {
    return this.getUserSettingsService(token);
  }

  // Workout Operations (High-level service methods)

  /**
   * Get list of workouts with optional filters
   */
  async getWorkouts(
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutsListResponse> {
    return this.getWorkoutsService(token, filters);
  }

  /**
   * Get workout by ID
   */
  async getWorkoutById(token: AuthToken, id: string): Promise<WorkoutResponse> {
    return this.getWorkoutByIdService(token, id);
  }

  /**
   * Create new workout
   */
  async createWorkout(
    token: AuthToken,
    workout: CreateWorkoutRequest
  ): Promise<WorkoutResponse> {
    return this.createWorkoutService(token, workout);
  }

  /**
   * Update existing workout
   */
  async updateWorkout(
    token: AuthToken,
    workout: UpdateWorkoutRequest
  ): Promise<WorkoutResponse> {
    return this.updateWorkoutService(token, workout);
  }

  /**
   * Delete workout
   */
  async deleteWorkout(token: AuthToken, id: string): Promise<void> {
    return this.deleteWorkoutService(token, id);
  }

  /**
   * Get workout statistics
   */
  async getWorkoutStats(
    token: AuthToken,
    filters?: WorkoutFilters
  ): Promise<WorkoutStats> {
    return this.getWorkoutStatsService(token, filters);
  }
}

/**
 * Factory function to create TrainingPeaks API client
 */
export const createTrainingPeaksApiClient = (
  config: TrainingPeaksApiClientConfig
): TrainingPeaksApiClient => {
  return new TrainingPeaksApiClient(config);
};
